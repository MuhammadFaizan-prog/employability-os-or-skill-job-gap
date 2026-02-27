package com.skilljobgap.employability.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromString
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject

/**
 * Fetches skills, projects, interview questions, user_skills, user_projects,
 * resume score, interview score, roadmap progress; upserts user_skills, user_projects, scores, user_roadmap.
 * Mirrors web useRoleData / useSupabaseData behavior.
 */
class RoleDataRepository {

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun getSkills(role: String): Result<List<SkillRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("skills", select = "id,name,role,difficulty,weight", eq = mapOf("role" to role), order = "difficulty").mapCatching { body ->
            json.decodeFromString<List<SkillRow>>(if (body.startsWith("[")) body else "[]")
        }
    }

    suspend fun getProjects(role: String): Result<List<ProjectRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("projects", select = "id,title,role,difficulty,description,required_skills,evaluation_criteria", eq = mapOf("role" to role), order = "difficulty").mapCatching { body ->
            json.decodeFromString<List<ProjectRow>>(if (body.startsWith("[")) body else "[]")
        }
    }

    suspend fun getInterviewQuestions(role: String): Result<List<InterviewQuestionRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("interview_questions", select = "id,question_text,role,difficulty_level,category,hint,options,correct_answer", eq = mapOf("role" to role)).mapCatching { body ->
            json.decodeFromString<List<InterviewQuestionRow>>(if (body.startsWith("[")) body else "[]")
        }
    }

    suspend fun getUserSkills(userId: String): Result<List<UserSkillRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("user_skills", select = "user_id,skill_id,proficiency", eq = mapOf("user_id" to userId)).mapCatching { body ->
            json.decodeFromString<List<UserSkillRow>>(if (body.startsWith("[")) body else "[]")
        }
    }

    suspend fun getUserProjects(userId: String): Result<List<UserProjectRow>> = withContext(Dispatchers.IO) {
        SupabaseClient.restSelect("user_projects", select = "user_id,project_id,completed", eq = mapOf("user_id" to userId)).mapCatching { body ->
            json.decodeFromString<List<UserProjectRow>>(if (body.startsWith("[")) body else "[]")
        }
    }

    suspend fun getResumeScore(userId: String): Result<Int> = withContext(Dispatchers.IO) {
        val res = SupabaseClient.restSelect("resume_uploads", select = "analysis_result", eq = mapOf("user_id" to userId), order = "created_at.desc")
        res.mapCatching { body ->
            val list = json.decodeFromString<List<ResumeUploadRow>>(if (body.startsWith("[")) body else "[]")
            val first = list.firstOrNull()?.analysisResult
            val score = (first?.get("score") as? kotlinx.serialization.json.JsonPrimitive)?.content?.toIntOrNull() ?: 0
            score
        }
    }

    suspend fun getInterviewScore(userId: String): Result<Int> = withContext(Dispatchers.IO) {
        val res = SupabaseClient.restSelect("user_interview_progress", select = "is_correct", eq = mapOf("user_id" to userId))
        res.mapCatching { body ->
            val list = json.decodeFromString<List<UserInterviewProgressRow>>(if (body.startsWith("[")) body else "[]")
            val total = list.size
            val correct = list.count { it.isCorrect }
            if (total > 0) (correct * 100 / total) else 0
        }
    }

    suspend fun getRoadmapProgress(userId: String): Result<Map<String, String>> = withContext(Dispatchers.IO) {
        val res = SupabaseClient.restSelect("user_roadmap", select = "progress_json", eq = mapOf("user_id" to userId))
        res.mapCatching { body ->
            val list = json.decodeFromString<List<UserRoadmapRow>>(if (body.startsWith("[")) body else "[]")
            list.firstOrNull()?.progressJson ?: emptyMap()
        }
    }

    suspend fun upsertUserSkill(userId: String, skillId: String, proficiency: Int): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("user_id", userId)
            put("skill_id", skillId)
            put("proficiency", proficiency)
            put("last_updated", isoNow())
        }
        SupabaseClient.restUpsert("user_skills", body.toString(), "user_id,skill_id").map { }
    }

    suspend fun upsertUserProject(userId: String, projectId: String, completed: Boolean): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("user_id", userId)
            put("project_id", projectId)
            put("completed", completed)
            put("last_updated", isoNow())
        }
        SupabaseClient.restUpsert("user_projects", body.toString(), "user_id,project_id").map { }
    }

    suspend fun upsertScore(userId: String, technical: Int, projects: Int, resume: Int, practical: Int, interview: Int, finalScore: Int): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("user_id", userId)
            put("technical", technical)
            put("projects", projects)
            put("resume", resume)
            put("practical", practical)
            put("interview", interview)
            put("final_score", finalScore)
            put("last_calculated", isoNow())
        }
        SupabaseClient.restUpsert("scores", body.toString(), "user_id").map { }
    }

    suspend fun upsertUserRoadmap(userId: String, role: String, progressJson: Map<String, String>, roadmapJson: Map<String, kotlinx.serialization.json.JsonElement> = emptyMap()): Result<Unit> = withContext(Dispatchers.IO) {
        val body = buildJsonObject {
            put("user_id", userId)
            put("role", role)
            putJsonObject("progress_json") { progressJson.forEach { put(it.key, it.value) } }
            putJsonObject("roadmap_json") { roadmapJson.forEach { put(it.key, it.value) } }
            put("last_updated", isoNow())
        }
        SupabaseClient.restUpsert("user_roadmap", body.toString(), "user_id").map { }
    }

    private fun isoNow(): String = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(java.util.Date())
}
