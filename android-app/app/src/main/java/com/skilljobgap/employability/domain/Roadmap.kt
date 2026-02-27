package com.skilljobgap.employability.domain

import com.skilljobgap.employability.data.ProjectRow
import com.skilljobgap.employability.data.SkillRow

/**
 * Roadmap summary and steps mirroring web lib/roadmap.ts.
 */
object RoadmapGenerator {

    private const val PROFICIENCY_DONE = 4

    data class RoadmapSummary(
        val role: String,
        val skillsDone: Int,
        val skillsNext: Int,
        val skillsUpcoming: Int,
        val projectsDone: Int,
        val projectsSuggested: Int,
        val projectsLocked: Int,
        val generatedAt: String
    )

    data class RoadmapSkillStep(
        val id: String,
        val name: String,
        val difficulty: Int,
        val weight: Float,
        val status: String,
        val userProficiency: Int?
    )

    data class RoadmapProjectStep(
        val id: String,
        val title: String,
        val difficulty: Int,
        val evaluationCriteria: String?,
        val requiredSkills: List<String>?,
        val status: String
    )

    data class RoadmapSteps(
        val role: String,
        val skillSteps: List<RoadmapSkillStep>,
        val projectSteps: List<RoadmapProjectStep>,
        val generatedAt: String
    )

    fun computeSummary(
        role: String,
        skills: List<SkillRow>,
        projects: List<ProjectRow>,
        userSkills: List<Pair<String, Int>>,
        userProjects: List<Pair<String, Boolean>>
    ): RoadmapSummary {
        val bySkillId = userSkills.associate { it.first to it.second }
        val byProjectId = userProjects.associate { it.first to it.second }
        val sortedSkills = skills.sortedBy { it.difficulty }
        var skillsDone = 0
        var skillsNext = 0
        var skillsUpcoming = 0
        var seenFirstIncomplete = false
        val skillProficiencyById = mutableMapOf<String, Int>()

        for (skill in sortedSkills) {
            val proficiency = bySkillId[skill.id] ?: 0
            skillProficiencyById[skill.id] = proficiency
            val isDone = proficiency >= PROFICIENCY_DONE
            when {
                isDone -> skillsDone++
                !seenFirstIncomplete -> { seenFirstIncomplete = true; skillsNext++ }
                else -> skillsUpcoming++
            }
        }

        var projectsDone = 0
        var projectsSuggested = 0
        var projectsLocked = 0
        for (project in projects) {
            if (byProjectId[project.id] == true) {
                projectsDone++
                continue
            }
            val requiredIds = project.requiredSkills ?: emptyList()
            val allRequiredDone = requiredIds.all { (skillProficiencyById[it] ?: 0) >= PROFICIENCY_DONE }
            if (allRequiredDone) projectsSuggested++ else projectsLocked++
        }

        return RoadmapSummary(
            role = role,
            skillsDone = skillsDone,
            skillsNext = skillsNext,
            skillsUpcoming = skillsUpcoming,
            projectsDone = projectsDone,
            projectsSuggested = projectsSuggested,
            projectsLocked = projectsLocked,
            generatedAt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(java.util.Date())
        )
    }

    fun computeSteps(
        role: String,
        skills: List<SkillRow>,
        projects: List<ProjectRow>,
        userSkills: List<Pair<String, Int>>,
        userProjects: List<Pair<String, Boolean>>
    ): RoadmapSteps {
        val bySkillId = userSkills.associate { it.first to it.second }
        val byProjectId = userProjects.associate { it.first to it.second }
        val sortedSkills = skills.sortedBy { it.difficulty }
        val skillSteps = mutableListOf<RoadmapSkillStep>()
        var seenFirstIncomplete = false
        val skillProficiencyById = mutableMapOf<String, Int>()

        for (skill in sortedSkills) {
            val proficiency = bySkillId[skill.id] ?: 0
            skillProficiencyById[skill.id] = proficiency
            val isDone = proficiency >= PROFICIENCY_DONE
            val status = when {
                isDone -> "done"
                !seenFirstIncomplete -> { seenFirstIncomplete = true; "next" }
                else -> "upcoming"
            }
            skillSteps.add(
                RoadmapSkillStep(
                    id = skill.id,
                    name = skill.name,
                    difficulty = skill.difficulty,
                    weight = skill.weight,
                    status = status,
                    userProficiency = if (proficiency > 0) proficiency else null
                )
            )
        }

        val projectSteps = projects.map { project ->
            val completed = byProjectId[project.id] == true
            val requiredIds = project.requiredSkills ?: emptyList()
            val allRequiredDone = requiredIds.all { (skillProficiencyById[it] ?: 0) >= PROFICIENCY_DONE }
            val status = when {
                completed -> "done"
                allRequiredDone -> "suggested"
                else -> "locked"
            }
            RoadmapProjectStep(
                id = project.id,
                title = project.title,
                difficulty = project.difficulty,
                evaluationCriteria = project.evaluationCriteria,
                requiredSkills = project.requiredSkills,
                status = status
            )
        }

        return RoadmapSteps(
            role = role,
            skillSteps = skillSteps,
            projectSteps = projectSteps,
            generatedAt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.format(java.util.Date())
        )
    }
}
