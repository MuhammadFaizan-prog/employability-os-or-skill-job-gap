package com.skilljobgap.employability.domain

/**
 * Kotlin domain models and score calculator that mirror the existing
 * EmployabilityOS score engine used in the web app.
 *
 * This is the analogue of the TypeScript score engine:
 * - Technical 40%
 * - Projects 20%
 * - Resume 15%
 * - Practical 15%
 * - Interview 10%
 */

data class SkillScoreInput(
    val proficiency: Int,   // 0–5
    val weight: Float       // importance weight for this skill
)

data class ProjectScoreInput(
    val completed: Boolean,
    val difficulty: Int     // 1 = Beginner, 2 = Intermediate, 3 = Advanced
)

data class ScoreBreakdown(
    val technical: Float,
    val projects: Float,
    val resume: Float,
    val practical: Float,
    val interview: Float,
    val finalScore: Float
)

object ScoreCalculator {

    // Weights must stay in sync with the web implementation
    private const val TECHNICAL_WEIGHT = 0.40f
    private const val PROJECTS_WEIGHT = 0.20f
    private const val RESUME_WEIGHT = 0.15f
    private const val PRACTICAL_WEIGHT = 0.15f
    private const val INTERVIEW_WEIGHT = 0.10f

    /**
     * Calculate the full score breakdown, given:
     * - user skills with weights and proficiencies
     * - projects with difficulty and completion flag
     * - resume / practical / interview scores already normalized 0–100
     */
    fun calculate(
        skills: List<SkillScoreInput>,
        projects: List<ProjectScoreInput>,
        resumeScore: Float,
        practicalScore: Float,
        interviewScore: Float
    ): ScoreBreakdown {
        val technicalScore = calculateTechnical(skills)
        val projectsScore = calculateProjects(projects)

        val resumeClamped = resumeScore.coerceIn(0f, 100f)
        val practicalClamped = practicalScore.coerceIn(0f, 100f)
        val interviewClamped = interviewScore.coerceIn(0f, 100f)

        val final =
            technicalScore * TECHNICAL_WEIGHT +
                projectsScore * PROJECTS_WEIGHT +
                resumeClamped * RESUME_WEIGHT +
                practicalClamped * PRACTICAL_WEIGHT +
                interviewClamped * INTERVIEW_WEIGHT

        return ScoreBreakdown(
            technical = round1(technicalScore),
            projects = round1(projectsScore),
            resume = round1(resumeClamped),
            practical = round1(practicalClamped),
            interview = round1(interviewClamped),
            finalScore = round1(final)
        )
    }

    /**
     * Technical score:
     *   sum(proficiency * weight) / (maxProficiency * sum(weight)) * 100
     * where maxProficiency = 5.
     */
    private fun calculateTechnical(skills: List<SkillScoreInput>): Float {
        if (skills.isEmpty()) return 0f
        val maxProficiency = 5f

        var weightedSum = 0f
        var weightTotal = 0f
        for (s in skills) {
            val prof = s.proficiency.coerceIn(0, 5)
            val w = if (s.weight <= 0f) 1f else s.weight
            weightedSum += prof * w
            weightTotal += w
        }
        if (weightTotal <= 0f) return 0f
        val maxPossible = maxProficiency * weightTotal
        return if (maxPossible <= 0f) 0f else (weightedSum / maxPossible) * 100f
    }

    /**
     * Projects score:
     *  - Beginner: 5 points
     *  - Intermediate: 10 points
     *  - Advanced: 20 points
     * Score is (earned / max) * 100.
     */
    private fun calculateProjects(projects: List<ProjectScoreInput>): Float {
        if (projects.isEmpty()) return 0f

        var earned = 0f
        var max = 0f
        for (p in projects) {
            val base = when (p.difficulty.coerceIn(1, 3)) {
                1 -> 5f
                2 -> 10f
                else -> 20f
            }
            max += base
            if (p.completed) {
                earned += base
            }
        }
        if (max <= 0f) return 0f
        return (earned / max) * 100f
    }

    private fun round1(value: Float): Float {
        return ((value * 10f).toInt() / 10f)
    }
}

