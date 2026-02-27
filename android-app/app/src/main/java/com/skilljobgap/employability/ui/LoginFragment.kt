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
import com.skilljobgap.employability.databinding.FragmentLoginBinding
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: LoginViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.loginSubmit.setOnClickListener {
            viewModel.signIn(
                binding.loginEmail.text?.toString() ?: "",
                binding.loginPassword.text?.toString() ?: ""
            ) {
                findNavController().navigate(R.id.action_login_to_dashboard)
            }
        }
        binding.loginGoToSignup.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_signup)
        }
        viewModel.error.onEach { msg ->
            binding.loginError.text = msg
            binding.loginError.visibility = if (msg != null) View.VISIBLE else View.GONE
        }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.loading.onEach { loading ->
            binding.loginSubmit.isEnabled = !loading
            binding.loginSubmit.text = if (loading) "Logging in…" else "Log In"
        }.launchIn(viewLifecycleOwner.lifecycleScope)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

