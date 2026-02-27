package com.skilljobgap.employability.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.util.concurrent.TimeUnit

/**
 * Low-level Supabase REST client using OkHttp.
 * Mirrors the same backend (auth, PostgREST, storage) used by the web app.
 * Configure via gradle.properties (or local.properties: supabase.url, supabase.anonKey); same env as frontend/.env.
 */
object SupabaseClient {

    private const val TAG = "SupabaseClient"

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputs = true
        encodeDefaults = true
    }

    var baseUrl: String = ""
        private set
    var anonKey: String = ""
        private set

    private var accessToken: String? = null
    private var refreshToken: String? = null

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    fun configure(url: String, key: String) {
        baseUrl = url.trimEnd('/')
        anonKey = key
    }

    fun setSession(accessToken: String?, refreshToken: String?) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }

    fun isConfigured(): Boolean = baseUrl.isNotBlank() && anonKey.isNotBlank()
    fun hasSession(): Boolean = !accessToken.isNullOrBlank()

    private fun authHeaders(): Map<String, String> {
        val map = mutableMapOf(
            "apikey" to anonKey,
            "Content-Type" to "application/json",
            "Accept" to "application/json",
            "Prefer" to "return=representation"
        )
        accessToken?.let { map["Authorization"] = "Bearer $it" }
        return map
    }

    // ─── Auth ─────────────────────────────────────────────────────────────

    suspend fun authSignIn(email: String, password: String): Result<AuthSession> = withContext(Dispatchers.IO) {
        if (!isConfigured()) return@withContext Result.failure(Exception("Supabase not configured"))
        val body = buildJsonObject {
            put("grant_type", "password")
            put("email", email)
            put("password", password)
        }
        val res = post("$baseUrl/auth/v1/token?grant_type=password", body.toString(), useAuth = false)
        parseAuthResponse(res)
    }

    suspend fun authSignUp(email: String, password: String, fullName: String?): Result<AuthSignUpResult> = withContext(Dispatchers.IO) {
        if (!isConfigured()) return@withContext Result.failure(Exception("Supabase not configured"))
        val body = buildJsonObject {
            put("email", email)
            put("password", password)
            if (!fullName.isNullOrBlank()) putJsonObject("data") { put("full_name", fullName) }
        }
        val res = post("$baseUrl/auth/v1/signup", body.toString(), useAuth = false)
        parseSignUpResponse(res)
    }

    suspend fun authGetUser(): Result<JsonObject?> = withContext(Dispatchers.IO) {
        if (!hasSession()) return@withContext Result.success(null)
        val res = get("$baseUrl/auth/v1/user")
        if (!res.isSuccessful) return@withContext Result.success(null)
        val raw = res.body?.string() ?: return@withContext Result.success(null)
        runCatching { json.parseToJsonElement(raw) as? JsonObject }
    }

    suspend fun authSignOut(): Result<Unit> = withContext(Dispatchers.IO) {
        post("$baseUrl/auth/v1/logout", "{}")
        setSession(null, null)
        Result.success(Unit)
    }

    private fun parseAuthResponse(res: Response): Result<AuthSession> {
        val raw = res.body?.string() ?: ""
        if (!res.isSuccessful) {
            val err = runCatching { json.parseToJsonElement(raw) as? JsonObject }.getOrNull()
            val msg = err?.get("error_description")?.jsonPrimitive?.content ?: err?.get("msg")?.jsonPrimitive?.content ?: raw
            return Result.failure(Exception(msg))
        }
        val obj = runCatching { json.parseToJsonElement(raw) as? JsonObject }.getOrNull() ?: return Result.failure(Exception("Invalid response"))
        val accessToken = obj["access_token"]?.jsonPrimitive?.content
        val refreshToken = obj["refresh_token"]?.jsonPrimitive?.content
        val user = obj["user"] as? JsonObject
        if (accessToken == null) return Result.failure(Exception("No access_token in response"))
        setSession(accessToken, refreshToken)
        return Result.success(AuthSession(accessToken = accessToken, refreshToken = refreshToken, user = user))
    }

    data class AuthSignUpResult(val session: AuthSession?, val needsConfirmation: Boolean)

    private fun parseSignUpResponse(res: Response): Result<AuthSignUpResult> {
        val raw = res.body?.string() ?: ""
        if (!res.isSuccessful) {
            val err = runCatching { json.parseToJsonElement(raw) as? JsonObject }.getOrNull()
            val msg = err?.get("error_description")?.jsonPrimitive?.content ?: err?.get("msg")?.jsonPrimitive?.content ?: raw
            return Result.failure(Exception(msg))
        }
        val obj = runCatching { json.parseToJsonElement(raw) as? JsonObject }.getOrNull() ?: return Result.failure(Exception("Invalid response"))
        val accessToken = obj["access_token"]?.jsonPrimitive?.content
        val refreshToken = obj["refresh_token"]?.jsonPrimitive?.content
        val user = obj["user"] as? JsonObject
        val needsConfirmation = accessToken == null && user != null
        if (accessToken != null) {
            setSession(accessToken, refreshToken)
            return Result.success(AuthSignUpResult(AuthSession(accessToken, refreshToken, user), false))
        }
        return Result.success(AuthSignUpResult(null, needsConfirmation))
    }

    data class AuthSession(val accessToken: String, val refreshToken: String?, val user: JsonObject?)

    // ─── PostgREST ─────────────────────────────────────────────────────────

    fun restUrl(table: String, query: String = ""): String {
        val q = if (query.startsWith("?")) query else if (query.isBlank()) "" else "?$query"
        return "$baseUrl/rest/v1/$table$q"
    }

    suspend fun restSelect(table: String, select: String = "*", eq: Map<String, String> = emptyMap(), order: String? = null): Result<String> = withContext(Dispatchers.IO) {
        val params = mutableListOf("select=${java.net.URLEncoder.encode(select, "UTF-8")}")
        eq.forEach { (k, v) -> params.add("$k=eq.${java.net.URLEncoder.encode("\"$v\"", "UTF-8")}") }
        order?.let { params.add("order=${java.net.URLEncoder.encode(it, "UTF-8")}") }
        val q = params.joinToString("&")
        val res = get(restUrl(table, q))
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "Request failed"))
        else Result.success(res.body?.string() ?: "[]")
    }

    suspend fun restInsert(table: String, body: String): Result<String> = withContext(Dispatchers.IO) {
        val res = post(restUrl(table), body)
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "Insert failed"))
        else Result.success(res.body?.string() ?: "[]")
    }

    suspend fun restUpsert(table: String, body: String, onConflict: String): Result<String> = withContext(Dispatchers.IO) {
        val url = restUrl(table) + "&on_conflict=$onConflict"
        val res = post(url, body, headers = mapOf("Prefer" to "resolution=merge-duplicates,return=representation"))
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "Upsert failed"))
        else Result.success(res.body?.string() ?: "[]")
    }

    suspend fun restUpdate(table: String, eq: Map<String, String>, body: String): Result<String> = withContext(Dispatchers.IO) {
        val filter = eq.entries.joinToString("&") { (k, v) -> "$k=eq.${java.net.URLEncoder.encode("\"$v\"", "UTF-8")}" }
        val res = patch(restUrl(table, filter), body)
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "Update failed"))
        else Result.success(res.body?.string() ?: "[]")
    }

    suspend fun restRpc(name: String, params: Map<String, String>): Result<String> = withContext(Dispatchers.IO) {
        val body = buildJsonObject { params.forEach { put(it.key, it.value) } }
        val res = post("$baseUrl/rest/v1/rpc/$name", body.toString())
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "RPC failed"))
        else Result.success(res.body?.string() ?: "null")
    }

    /** Call RPC with a raw JSON body (e.g. for UUID parameters). */
    suspend fun restRpcBody(name: String, jsonBody: String): Result<String> = withContext(Dispatchers.IO) {
        val res = post("$baseUrl/rest/v1/rpc/$name", jsonBody)
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "RPC failed"))
        else Result.success(res.body?.string() ?: "null")
    }

    // ─── Storage ─────────────────────────────────────────────────────────

    suspend fun storageUpload(bucket: String, path: String, bytes: ByteArray, contentType: String): Result<String> = withContext(Dispatchers.IO) {
        val url = "$baseUrl/storage/v1/object/$bucket/$path"
        val body = bytes.toRequestBody((contentType.ifBlank { "application/octet-stream" }).toMediaType())
        val res = postStorage(url, body)
        if (!res.isSuccessful) Result.failure(Exception(res.body?.string() ?: "Upload failed"))
        else Result.success("$baseUrl/storage/v1/object/public/$bucket/$path")
    }

    // ─── HTTP ────────────────────────────────────────────────────────────

    private fun get(url: String): Response {
        val req = Request.Builder().url(url).apply {
            authHeaders().forEach { addHeader(it.key, it.value) }
        }.get().build()
        return client.newCall(req).execute()
    }

    private fun post(url: String, body: String, useAuth: Boolean = true, headers: Map<String, String> = emptyMap()): Response {
        val merged = authHeaders().toMutableMap()
        if (!useAuth) merged.remove("Authorization")
        merged.putAll(headers)
        val req = Request.Builder().url(url).apply {
            merged.forEach { addHeader(it.key, it.value) }
        }.post(body.toRequestBody("application/json".toMediaType())).build()
        return client.newCall(req).execute()
    }

    private fun postStorage(url: String, body: okhttp3.RequestBody): Response {
        val merged = mutableMapOf<String, String>(
            "apikey" to anonKey,
            "Authorization" to "Bearer ${accessToken ?: anonKey}"
        )
        val req = Request.Builder().url(url).apply {
            merged.forEach { addHeader(it.key, it.value) }
        }.post(body).build()
        return client.newCall(req).execute()
    }

    private fun patch(url: String, body: String): Response {
        val req = Request.Builder().url(url).apply {
            authHeaders().forEach { addHeader(it.key, it.value) }
        }.patch(body.toRequestBody("application/json".toMediaType())).build()
        return client.newCall(req).execute()
    }
}
