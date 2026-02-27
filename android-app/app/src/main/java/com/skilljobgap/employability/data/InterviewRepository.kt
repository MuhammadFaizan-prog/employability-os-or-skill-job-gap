package com.skilljobgap.employability.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromString
import kotlinx.serialization.json.put

/**
 * Interview persistence: MCQ progress to user_interview_progress,
 * coding attempts to user_coding_attempts, system design to system_design_attempts.
 */
class InterviewRepository {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun upsertQuizResults(userId: String, rows: List<UserInterviewProgressRow>): Result<Unit> = withContext(Dispatchers.IO) {
        if (rows.isEmpty()) return@withContext Result.success(Unit)
        val body = json.encodeToString(rows)
        SupabaseClient.restUpsert("user_interview_progress", body, "user_id,question_id").map { }
    }

    suspend fun insertCodingAttempt(userId: String, challengeId: String, submittedCode: String, timeSpentSeconds: Int): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("user_id", userId)
            put("challenge_id", challengeId)
            put("submitted_code", submittedCode)
            put("passed", false)
            put("time_spent_seconds", timeSpentSeconds)
        }
        SupabaseClient.restInsert("user_coding_attempts", body.toString()).map { }
    }

    suspend fun insertSystemDesignAttempt(userId: String, scenarioKey: String, responseText: String): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("user_id", userId)
            put("scenario_key", scenarioKey)
            put("response_text", responseText)
        }
        SupabaseClient.restInsert("system_design_attempts", body.toString()).map { }
    }

    suspend fun getCodingChallenges(role: String): Result<List<CodingChallengeRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("coding_challenges", select = "*", eq = mapOf("role" to role), order = "difficulty").mapCatching { body ->
            json.decodeFromString<List<CodingChallengeRow>>(if (body.startsWith("[")) body else "[]")
        }
    }

    suspend fun getUserCodingAttempts(userId: String): Result<List<UserCodingAttemptRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("user_coding_attempts", select = "id,challenge_id,submitted_code,passed,time_spent_seconds,attempted_at", eq = mapOf("user_id" to userId)).mapCatching { body ->
            json.decodeFromString<List<UserCodingAttemptRow>>(if (body.startsWith("[")) body else "[]")
        }
    }
}
