package com.skilljobgap.employability.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromString
import kotlinx.serialization.json.put

/**
 * Profile repository: load/update users row, avatar upload, delete_user_data RPC.
 */
class ProfileRepository {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun getProfile(userId: String): Result<UserRow?> = withContext(Dispatchers.IO) {
        val res = SupabaseClient.restSelect("users", select = "*", eq = mapOf("id" to userId))
        res.mapCatching { body ->
            json.decodeFromString<List<UserRow>>(if (body.startsWith("[")) body else "[]").firstOrNull()
        }
    }

    suspend fun updateProfile(userId: String, fullName: String? = null, bio: String? = null, avatarUrl: String? = null, role: String? = null): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("updated_at", isoNow())
            fullName?.let { put("full_name", it) }
            bio?.let { put("bio", it) }
            avatarUrl?.let { put("avatar_url", it) }
            role?.let { put("role", it) }
        }
        val r = SupabaseClient.restUpdate("users", mapOf("id" to userId), body.toString())
        r.map { }
    }

    /** Upsert user row (id, email, full_name, avatar_url) for new sign-ups. */
    suspend fun upsertProfile(userId: String, email: String, fullName: String = "", avatarUrl: String = ""): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("id", userId)
            put("email", email)
            put("full_name", fullName)
            put("avatar_url", avatarUrl)
            put("updated_at", isoNow())
        }
        SupabaseClient.restUpsert("users", body.toString(), "id").map { }
    }

    suspend fun uploadAvatar(userId: String, bytes: ByteArray, contentType: String, fileName: String): Result<String> = withContext(Dispatchers.IO) {
        val ext = fileName.substringAfterLast('.', "jpg")
        val path = "$userId/avatar.$ext"
        SupabaseClient.storageUpload("avatars", path, bytes, contentType)
    }

    suspend fun deleteUserData(userId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject { put("target_user_id", userId) }
        SupabaseClient.restRpcBody("delete_user_data", body.toString()).map { }
    }

    private fun isoNow(): String = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(java.util.Date())
}
