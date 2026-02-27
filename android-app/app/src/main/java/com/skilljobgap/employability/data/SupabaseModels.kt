package com.skilljobgap.employability.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Kotlin data models aligned with Supabase table and JSON field names.
 * Used for PostgREST serialization and repository layer.
 */

// ─── users ─────────────────────────────────────────────────────────────
@Serializable
data class UserRow(
    val id: String,
    val email: String = "",
    @SerialName("full_name") val fullName: String = "",
    @SerialName("avatar_url") val avatarUrl: String = "",
    val bio: String = "",
    val role: String = "Frontend Developer",
    @SerialName("subscription_type") val subscriptionType: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null,
)

// ─── skills ────────────────────────────────────────────────────────────
@Serializable
data class SkillRow(
    val id: String,
    val name: String,
    val role: String,
    val difficulty: Int = 1,
    val weight: Float = 1f,
)

// ─── user_skills ───────────────────────────────────────────────────────
@Serializable
data class UserSkillRow(
    @SerialName("user_id") val userId: String,
    @SerialName("skill_id") val skillId: String,
    val proficiency: Int = 0,
    @SerialName("last_updated") val lastUpdated: String? = null,
)

// ─── projects ──────────────────────────────────────────────────────────
@Serializable
data class ProjectRow(
    val id: String,
    val title: String,
    val role: String,
    val difficulty: Int = 1,
    val description: String? = null,
    @SerialName("required_skills") val requiredSkills: List<String>? = null,
    @SerialName("evaluation_criteria") val evaluationCriteria: String? = null,
)

// ─── user_projects ─────────────────────────────────────────────────────
@Serializable
data class UserProjectRow(
    @SerialName("user_id") val userId: String,
    @SerialName("project_id") val projectId: String,
    val completed: Boolean = false,
    @SerialName("last_updated") val lastUpdated: String? = null,
)

// ─── scores ────────────────────────────────────────────────────────────
@Serializable
data class ScoreRow(
    @SerialName("user_id") val userId: String,
    val technical: Float = 0f,
    val projects: Float = 0f,
    val resume: Float = 0f,
    val practical: Float = 0f,
    val interview: Float = 0f,
    @SerialName("final_score") val finalScore: Float = 0f,
    @SerialName("last_calculated") val lastCalculated: String? = null,
)

// ─── resume_uploads ────────────────────────────────────────────────────
@Serializable
data class ResumeUploadRow(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    @SerialName("file_name") val fileName: String,
    @SerialName("file_path") val filePath: String,
    @SerialName("file_size") val fileSize: Long = 0,
    @SerialName("mime_type") val mimeType: String = "",
    @SerialName("analysis_result") val analysisResult: Map<String, kotlinx.serialization.json.JsonElement>? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

// ─── interview_questions ───────────────────────────────────────────────
@Serializable
data class InterviewQuestionRow(
    val id: String,
    @SerialName("question_text") val questionText: String,
    val role: String,
    @SerialName("difficulty_level") val difficultyLevel: String? = null,
    val category: String? = null,
    val hint: String? = null,
    val options: List<String>? = null,
    @SerialName("correct_answer") val correctAnswer: String? = null,
)

// ─── user_interview_progress ───────────────────────────────────────────
@Serializable
data class UserInterviewProgressRow(
    @SerialName("user_id") val userId: String,
    @SerialName("question_id") val questionId: String,
    @SerialName("answer_selected") val answerSelected: String = "",
    @SerialName("is_correct") val isCorrect: Boolean = false,
    @SerialName("time_spent_seconds") val timeSpentSeconds: Int = 0,
    @SerialName("practiced_at") val practicedAt: String? = null,
)

// ─── user_roadmap ──────────────────────────────────────────────────────
@Serializable
data class UserRoadmapRow(
    @SerialName("user_id") val userId: String,
    val role: String = "",
    @SerialName("roadmap_json") val roadmapJson: Map<String, kotlinx.serialization.json.JsonElement> = emptyMap(),
    @SerialName("progress_json") val progressJson: Map<String, String> = emptyMap(),
    @SerialName("last_updated") val lastUpdated: String? = null,
)

// ─── coding_challenges ──────────────────────────────────────────────────
@Serializable
data class CodingChallengeRow(
    val id: String,
    val title: String,
    val description: String,
    val difficulty: String = "Easy",
    val role: String,
    val category: String = "algorithm",
    @SerialName("starter_code") val starterCode: String = "",
    @SerialName("solution_code") val solutionCode: String = "",
    @SerialName("test_cases") val testCases: kotlinx.serialization.json.JsonElement? = null,
    val hints: kotlinx.serialization.json.JsonElement? = null,
    @SerialName("time_limit_minutes") val timeLimitMinutes: Int = 30,
    @SerialName("company_tags") val companyTags: List<String>? = null,
)

// ─── user_coding_attempts ────────────────────────────────────────────────
@Serializable
data class UserCodingAttemptRow(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    @SerialName("challenge_id") val challengeId: String,
    @SerialName("submitted_code") val submittedCode: String = "",
    val passed: Boolean = false,
    @SerialName("time_spent_seconds") val timeSpentSeconds: Int = 0,
    @SerialName("attempted_at") val attemptedAt: String? = null,
)

// ─── system_design_attempts ─────────────────────────────────────────────
@Serializable
data class SystemDesignAttemptRow(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    @SerialName("scenario_key") val scenarioKey: String,
    @SerialName("response_text") val responseText: String = "",
)
