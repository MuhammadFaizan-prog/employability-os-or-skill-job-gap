package com.skilljobgap.employability.domain

import com.skilljobgap.employability.data.SkillRow

/**
 * Skill gap analysis mirroring web lib/skillGap.ts.
 */
object SkillGapAnalyzer {

    private const val MIN_PROFICIENCY_STRENGTH = 4
    private const val MIN_PROFICIENCY_ACCEPTABLE = 3

    data class SkillGapStrength(val skill: SkillRow, val proficiency: Int)
    data class SkillGapGap(val skill: SkillRow, val currentProficiency: Int, val recommendedMin: Int)
    data class SkillGapPriority(val skill: SkillRow, val weight: Float, val gapSeverity: Float)
    data class SkillGapResult(
        val role: String,
        val strengths: List<SkillGapStrength>,
        val gaps: List<SkillGapGap>,
        val priorityFocus: List<SkillGapPriority>,
        val suggestedNextSkill: SkillRow?
    )

    fun analyze(
        role: String,
        allSkills: List<SkillRow>,
        userSkills: List<Pair<String, Int>>
    ): SkillGapResult {
        val bySkillId = userSkills.associate { it.first to it.second }
        val strengths = mutableListOf<SkillGapStrength>()
        val gaps = mutableListOf<SkillGapGap>()
        val priorityFocus = mutableListOf<SkillGapPriority>()

        for (skill in allSkills) {
            val proficiency = bySkillId[skill.id] ?: 0
            val recommendedMin = MIN_PROFICIENCY_ACCEPTABLE
            if (proficiency >= MIN_PROFICIENCY_STRENGTH) {
                strengths.add(SkillGapStrength(skill, proficiency))
            } else if (proficiency < recommendedMin || !bySkillId.containsKey(skill.id)) {
                gaps.add(SkillGapGap(skill, proficiency, recommendedMin))
                val weight = skill.weight.coerceAtLeast(1f)
                val gapSeverity = weight * (recommendedMin - proficiency)
                priorityFocus.add(SkillGapPriority(skill, weight, gapSeverity))
            }
        }
        priorityFocus.sortByDescending { it.gapSeverity }
        val suggestedNextSkill = priorityFocus.firstOrNull()?.skill ?: gaps.firstOrNull()?.skill
        return SkillGapResult(role, strengths, gaps, priorityFocus, suggestedNextSkill)
    }
}
