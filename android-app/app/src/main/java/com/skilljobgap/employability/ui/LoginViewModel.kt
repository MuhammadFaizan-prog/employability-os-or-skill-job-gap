package com.skilljobgap.employability.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skilljobgap.employability.data.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun signIn(email: String, password: String, onSuccess: () -> Unit) {
        if (email.isBlank() || password.isBlank()) {
            _error.value = "Please enter email and password."
            return
        }
        val emailTrimmed = email.trim()
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(emailTrimmed).matches()) {
            _error.value = "Please enter a valid email address."
            return
        }
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            val result = authRepository.signIn(emailTrimmed, password)
            _loading.value = false
            result.fold(
                onSuccess = { onSuccess() },
                onFailure = { _error.value = it.message ?: "Login failed" }
            )
        }
    }

    fun clearError() {
        _error.value = null
    }
}
