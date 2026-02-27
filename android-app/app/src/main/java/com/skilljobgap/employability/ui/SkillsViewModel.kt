package com.skilljobgap.employability.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skilljobgap.employability.data.RoleDataRepository
import com.skilljobgap.employability.data.SkillRow
import com.skilljobgap.employability.domain.SkillGapAnalyzer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SkillWithStatus(
    val skill: SkillRow,
    val proficiency: Int,
    val target: Int,
    val status: String
)

class SkillsViewModel(
    private val roleDataRepository: RoleDataRepository = RoleDataRepository()
) : ViewModel() {

    private val targetProficiency = 4

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _skillsWithStatus = MutableStateFlow<List<SkillWithStatus>>(emptyList())
    val skillsWithStatus: StateFlow<List<SkillWithStatus>> = _skillsWithStatus.asStateFlow()

    private val _filter = MutableStateFlow("all")
    val filter: StateFlow<String> = _filter.asStateFlow()

    private val _sort = MutableStateFlow("default")
    val sort: StateFlow<String> = _sort.asStateFlow()

    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess: StateFlow<Boolean> = _saveSuccess.asStateFlow()

    private var userId: String? = null
    private val _ratings = MutableStateFlow<Map<String, Int>>(emptyMap())

    private val _filteredAndSorted = MutableStateFlow<List<SkillWithStatus>>(emptyList())
    val filteredAndSorted: StateFlow<List<SkillWithStatus>> = _filteredAndSorted.asStateFlow()

    init {
        viewModelScope.launch {
            combine(
                _skillsWithStatus,
                _filter,
                _sort
            ) { list, f, s ->
                var data = when (f) {
                    "gap" -> list.filter { it.status == "gap" }
                    "strength" -> list.filter { it.status == "strength" }
                    "priority" -> list.filter { it.status == "priority" }
                    else -> list
                }
                data = when (s) {
                    "weight-desc" -> data.sortedByDescending { it.skill.weight }
                    "proficiency-asc" -> data.sortedBy { it.proficiency }
                    "difficulty-asc" -> data.sortedBy { it.skill.difficulty }
                    "gap-desc" -> data.sortedByDescending { (it.target - it.proficiency) }
                    else -> data
                }
                data
            }.collect { _filteredAndSorted.value = it }
        }
    }

    fun load(userId: String?, role: String) {
        this.userId = userId
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            val skillsResult = roleDataRepository.getSkills(role)
            val userSkillsResult = if (userId != null) roleDataRepository.getUserSkills(userId) else Result.success(emptyList())
            if (skillsResult.isFailure) {
                _error.value = skillsResult.exceptionOrNull()?.message
                _loading.value = false
                return@launch
            }
            val skills = skillsResult.getOrNull() ?: emptyList()
            val userSkills = userSkillsResult.getOrNull()?.map { it.skillId to it.proficiency } ?: emptyList()
            _ratings.value = userSkills.toMap()
            val gapResult = SkillGapAnalyzer.analyze(role, skills, userSkills)
            _skillGapResult = gapResult
            val list = skills.map { skill ->
                val proficiency = _ratings.value[skill.id] ?: 0
                val status = when {
                    proficiency >= targetProficiency -> "strength"
                    skill.weight >= 85 && (targetProficiency - proficiency) >= 2 -> "priority"
                    else -> "gap"
                }
                SkillWithStatus(skill, proficiency, targetProficiency, status)
            }
            _skillsWithStatus.value = list
            _loading.value = false
        }
    }

    fun setFilter(f: String) { _filter.value = f }
    fun setSort(s: String) { _sort.value = s }

    fun setUserSkillRating(skillId: String, value: Int) {
        _ratings.update { it + (skillId to value.coerceIn(0, 5)) }
        _skillsWithStatus.update { list ->
            list.map { item ->
                if (item.skill.id == skillId) {
                    val prof = value.coerceIn(0, 5)
                    val status = when {
                        prof >= targetProficiency -> "strength"
                        item.skill.weight >= 85 && (targetProficiency - prof) >= 2 -> "priority"
                        else -> "gap"
                    }
                    item.copy(proficiency = prof, status = status)
                } else item
            }
        }
    }

    fun save() {
        val uid = userId ?: return
        viewModelScope.launch {
            _saveSuccess.value = false
            for ((skillId, proficiency) in _ratings.value) {
                roleDataRepository.upsertUserSkill(uid, skillId, proficiency)
            }
            _saveSuccess.value = true
        }
    }

    fun suggestedNextSkill(): SkillWithStatus? =
        _skillGapResult?.suggestedNextSkill?.let { suggested ->
            _skillsWithStatus.value.find { it.skill.id == suggested.id }
        }

    fun priorityFocus(): List<SkillWithStatus> =
        _skillsWithStatus.value
            .filter { it.status == "priority" || it.status == "gap" }
            .sortedWith(compareByDescending<SkillWithStatus> { (it.target - it.proficiency) }.thenByDescending { it.skill.weight })
            .take(3)

    private var _skillGapResult: SkillGapAnalyzer.SkillGapResult? = null
}
