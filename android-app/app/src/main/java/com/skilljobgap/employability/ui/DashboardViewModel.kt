package com.skilljobgap.employability.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skilljobgap.employability.data.RoleDataRepository
import com.skilljobgap.employability.domain.ScoreBreakdown
import com.skilljobgap.employability.domain.ScoreCalculator
import com.skilljobgap.employability.domain.SkillGapAnalyzer
import com.skilljobgap.employability.domain.SkillScoreInput
import com.skilljobgap.employability.domain.ProjectScoreInput
import com.skilljobgap.employability.domain.RoadmapGenerator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val roleDataRepository: RoleDataRepository = RoleDataRepository()
) : ViewModel() {

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _scoreBreakdown = MutableStateFlow<ScoreBreakdown?>(null)
    val scoreBreakdown: StateFlow<ScoreBreakdown?> = _scoreBreakdown.asStateFlow()

    private val _skillGapResult = MutableStateFlow<SkillGapAnalyzer.SkillGapResult?>(null)
    val skillGapResult: StateFlow<SkillGapAnalyzer.SkillGapResult?> = _skillGapResult.asStateFlow()

    private val _roadmapSteps = MutableStateFlow<RoadmapGenerator.RoadmapSteps?>(null)
    val roadmapSteps: StateFlow<RoadmapGenerator.RoadmapSteps?> = _roadmapSteps.asStateFlow()

    private val _projectsCompletedTotal = MutableStateFlow<Pair<Int, Int>>(0 to 0)
    val projectsCompletedTotal: StateFlow<Pair<Int, Int>> = _projectsCompletedTotal.asStateFlow()

    fun load(userId: String?, role: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            val skillsResult = roleDataRepository.getSkills(role)
            val projectsResult = roleDataRepository.getProjects(role)
            if (skillsResult.isFailure || projectsResult.isFailure) {
                _error.value = skillsResult.exceptionOrNull()?.message ?: projectsResult.exceptionOrNull()?.message
                _loading.value = false
                return@launch
            }
            val skills = skillsResult.getOrNull() ?: emptyList()
            val projects = projectsResult.getOrNull() ?: emptyList()
            var resumeScore = 0
            var interviewScore = 0
            var userSkillRatings = listOf<Pair<String, Int>>()
            var userProjectStatuses = listOf<Pair<String, Boolean>>()

            if (userId != null) {
                roleDataRepository.getUserSkills(userId).getOrNull()?.let { list ->
                    userSkillRatings = list.map { it.skillId to it.proficiency }
                }
                roleDataRepository.getUserProjects(userId).getOrNull()?.let { list ->
                    userProjectStatuses = list.map { it.projectId to it.completed }
                }
                roleDataRepository.getResumeScore(userId).getOrNull()?.let { resumeScore = it }
                roleDataRepository.getInterviewScore(userId).getOrNull()?.let { interviewScore = it }
            }

            val skillInputs = skills.map { s ->
                val prof = userSkillRatings.find { it.first == s.id }?.second ?: 0
                SkillScoreInput(prof, s.weight)
            }
            val projectInputs = projects.map { p ->
                val completed = userProjectStatuses.any { it.first == p.id && it.second }
                ProjectScoreInput(completed, p.difficulty)
            }
            val breakdown = ScoreCalculator.calculate(
                skillInputs,
                projectInputs,
                resumeScore.toFloat(),
                0f,
                interviewScore.toFloat()
            )
            _scoreBreakdown.value = breakdown
            _skillGapResult.value = SkillGapAnalyzer.analyze(role, skills, userSkillRatings)
            _roadmapSteps.value = RoadmapGenerator.computeSteps(role, skills, projects, userSkillRatings, userProjectStatuses)
            val completed = userProjectStatuses.count { it.second }
            _projectsCompletedTotal.value = completed to projects.size

            if (userId != null) {
                roleDataRepository.upsertScore(
                    userId,
                    breakdown.technical.toInt(),
                    breakdown.projects.toInt(),
                    breakdown.resume.toInt(),
                    breakdown.practical.toInt(),
                    breakdown.interview.toInt(),
                    breakdown.finalScore.toInt()
                )
            }
            _loading.value = false
        }
    }
}
