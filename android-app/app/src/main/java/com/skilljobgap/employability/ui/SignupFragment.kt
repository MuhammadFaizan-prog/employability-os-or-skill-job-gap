package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R
import com.skilljobgap.employability.databinding.FragmentSignupBinding
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class SignupFragment : Fragment() {

    private var _binding: FragmentSignupBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SignupViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.signupSubmit.setOnClickListener {
            viewModel.signUp(
                binding.signupName.text?.toString() ?: "",
                binding.signupEmail.text?.toString() ?: "",
                binding.signupPassword.text?.toString() ?: "",
                binding.signupConfirm.text?.toString() ?: ""
            ) {
                findNavController().navigate(R.id.action_signup_to_onboarding)
            }
        }
        binding.signupGoToLogin.setOnClickListener {
            findNavController().navigate(R.id.action_signup_to_login)
        }
        viewModel.error.onEach { msg ->
            binding.signupError.text = msg
            binding.signupError.visibility = if (msg != null) View.VISIBLE else View.GONE
        }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.loading.onEach { loading ->
            binding.signupSubmit.isEnabled = !loading
            binding.signupSubmit.text = if (loading) "Creating account…" else "Create Account"
        }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.showConfirmation.onEach { show ->
            if (show) findNavController().navigate(R.id.action_signup_to_login)
        }.launchIn(viewLifecycleOwner.lifecycleScope)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
