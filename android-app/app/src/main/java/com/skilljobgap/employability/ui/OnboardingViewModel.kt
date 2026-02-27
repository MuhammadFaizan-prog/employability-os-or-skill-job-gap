package com.skilljobgap.employability.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skilljobgap.employability.data.ProfileRepository
import com.skilljobgap.employability.data.RoleDataRepository
import com.skilljobgap.employability.data.SkillRow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

val ROLE_DB_MAP = mapOf(
    "Frontend" to "Frontend Developer",
    "Backend" to "Backend Developer",
    "Data Analyst" to "Data Analyst",
    "AI/ML" to "AI/ML Engineer",
    "Mobile" to "Mobile Developer"
)

class OnboardingViewModel(
    private val roleDataRepository: RoleDataRepository = RoleDataRepository(),
    private val profileRepository: ProfileRepository = ProfileRepository()
) : ViewModel() {

    private val _skills = MutableStateFlow<List<SkillRow>>(emptyList())
    val skills: StateFlow<List<SkillRow>> = _skills.asStateFlow()

    private val _ratings = MutableStateFlow<Map<String, Int>>(emptyMap())
    val ratings: StateFlow<Map<String, Int>> = _ratings.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadSkillsForRole(roleLabel: String) {
        val dbRole = ROLE_DB_MAP[roleLabel] ?: "Frontend Developer"
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            roleDataRepository.getSkills(dbRole).fold(
                onSuccess = { _skills.value = it; _ratings.value = emptyMap() },
                onFailure = { _error.value = it.message; _skills.value = emptyList() }
            )
            _loading.value = false
        }
    }

    fun setRating(skillId: String, value: Int) {
        _ratings.value = _ratings.value + (skillId to value.coerceIn(1, 5))
    }

    fun getRating(skillId: String): Int = _ratings.value[skillId] ?: 3

    fun continueToDashboard(userId: String, roleLabel: String, onSuccess: () -> Unit) {
        val dbRole = ROLE_DB_MAP[roleLabel] ?: "Frontend Developer"
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            profileRepository.updateProfile(userId, role = dbRole)
            val skillList = _skills.value
            val ratingMap = _ratings.value
            for (skill in skillList) {
                val prof = ratingMap[skill.id] ?: 3
                roleDataRepository.upsertUserSkill(userId, skill.id, prof)
            }
            _loading.value = false
            onSuccess()
        }
    }
}
