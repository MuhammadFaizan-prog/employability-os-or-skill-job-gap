package com.skilljobgap.employability.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromString
import kotlinx.serialization.json.put

/**
 * Resume uploads: upload file to documents bucket and insert resume_uploads row with analysis_result.
 * Mirrors web useResumeUpload / useSupabaseData resume flow.
 */
class ResumeRepository {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun uploadResume(userId: String, fileName: String, bytes: ByteArray, mimeType: String, analysisResult: Map<String, Any>): Result<ResumeUploadRow> = withContext(Dispatchers.IO) {
        val ext = fileName.substringAfterLast('.', "pdf")
        val path = "resumes/$userId/${System.currentTimeMillis()}_${java.util.UUID.randomUUID().toString().take(8)}.$ext"
        val uploadRes = SupabaseClient.storageUpload("documents", path, bytes, mimeType)
        uploadRes.fold(
            onFailure = { Result.failure(it) },
            onSuccess = { _ ->
                val body = buildJsonObject {
                    put("user_id", userId)
                    put("file_name", fileName)
                    put("file_path", path)
                    put("file_size", bytes.size.toLong())
                    put("mime_type", mimeType)
                    put("analysis_result", buildAnalysisResult(analysisResult))
                }
                val insertRes = SupabaseClient.restInsert("resume_uploads", body.toString())
                insertRes.mapCatching { response ->
                    val list = json.decodeFromString<List<ResumeUploadRow>>(if (response.startsWith("[")) response else "[$response]")
                    list.first()
                }
            }
        )
    }

    suspend fun getResumeHistory(userId: String, limit: Int = 10): Result<List<ResumeUploadRow>> = withContext(Dispatchers.IO) {
        val res = SupabaseClient.restSelect("resume_uploads", select = "*", eq = mapOf("user_id" to userId), order = "created_at.desc")
        res.mapCatching { body ->
            val list = json.decodeFromString<List<ResumeUploadRow>>(if (body.startsWith("[")) body else "[]")
            list.take(limit)
        }
    }

    private fun buildAnalysisResult(map: Map<String, Any>): kotlinx.serialization.json.JsonObject {
        return buildJsonObject {
            map.forEach { (k, v) ->
                when (v) {
                    is Int -> put(k, v)
                    is Long -> put(k, v)
                    is Double -> put(k, v)
                    is Float -> put(k, v)
                    is String -> put(k, v)
                    is Boolean -> put(k, v)
                    else -> put(k, v.toString())
                }
            }
        }
    }
}
