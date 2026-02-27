package com.skilljobgap.employability.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.ProfileRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SignupViewModel(
    private val authRepository: AuthRepository = AuthRepository(),
    private val profileRepository: ProfileRepository = ProfileRepository()
) : ViewModel() {

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _showConfirmation = MutableStateFlow(false)
    val showConfirmation: StateFlow<Boolean> = _showConfirmation.asStateFlow()

    fun signUp(name: String, email: String, password: String, confirm: String, onSuccess: () -> Unit) {
        val nameTrimmed = name.trim()
        val emailTrimmed = email.trim()
        when {
            nameTrimmed.isBlank() -> { _error.value = "Full name is required."; return }
            emailTrimmed.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(emailTrimmed).matches() ->
                { _error.value = "Please enter a valid email address."; return }
            password.length < 8 -> { _error.value = "Password must be at least 8 characters."; return }
            password != confirm -> { _error.value = "Passwords do not match."; return }
        }
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            val result = authRepository.signUp(emailTrimmed, password, nameTrimmed)
            _loading.value = false
            result.fold(
                onSuccess = { signUpResult ->
                    if (signUpResult.needsConfirmation) {
                        _showConfirmation.value = true
                    } else {
                        val user = authRepository.getCurrentUser().getOrNull()
                        user?.let { profileRepository.upsertProfile(it.id, emailTrimmed, nameTrimmed, "") }
                        onSuccess()
                    }
                },
                onFailure = { _error.value = it.message ?: "Sign up failed" }
            )
        }
    }

    fun clearError() { _error.value = null }
}
