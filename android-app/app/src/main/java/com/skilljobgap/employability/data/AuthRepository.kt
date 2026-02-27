package com.skilljobgap.employability.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * Auth repository mirroring web AuthContext: sign in, sign up, sign out, current user.
 */
class AuthRepository {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun signIn(email: String, password: String): Result<Unit> = withContext(Dispatchers.IO) {
        SupabaseClient.authSignIn(email, password).map { }
    }

    suspend fun signUp(email: String, password: String, fullName: String?): Result<SignUpResult> = withContext(Dispatchers.IO) {
        val res = SupabaseClient.authSignUp(email, password, fullName)
        res.map { r -> SignUpResult(needsConfirmation = r.needsConfirmation) }
    }

    data class SignUpResult(val needsConfirmation: Boolean)

    suspend fun signOut(): Result<Unit> = withContext(Dispatchers.IO) {
        SupabaseClient.authSignOut()
    }

    suspend fun getCurrentUser(): Result<UserInfo?> = withContext(Dispatchers.IO) {
        if (!SupabaseClient.hasSession()) return@withContext Result.success(null)
        val res = SupabaseClient.authGetUser()
        res.map { obj ->
            obj?.let { o ->
                UserInfo(
                    id = o["id"]?.jsonPrimitive?.content ?: return@let null,
                    email = o["email"]?.jsonPrimitive?.content ?: "",
                    fullName = (o["user_metadata"]?.jsonObject?.get("full_name") ?: o["user_metadata"]?.jsonObject?.get("name"))?.jsonPrimitive?.content ?: ""
                )
            }
        }
    }

    fun hasSession(): Boolean = SupabaseClient.hasSession()

    data class UserInfo(val id: String, val email: String, val fullName: String)
}
