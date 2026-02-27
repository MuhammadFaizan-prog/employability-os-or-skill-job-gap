package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.RoleStorage
import com.skilljobgap.employability.databinding.FragmentOnboardingBinding
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

class OnboardingFragment : Fragment() {

    private var _binding: FragmentOnboardingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: OnboardingViewModel by viewModels()
    private val authRepository = AuthRepository()

    private var selectedRoleLabel = "Frontend"
    private var currentUserId: String? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOnboardingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewLifecycleOwner.lifecycleScope.launch {
            currentUserId = authRepository.getCurrentUser().getOrNull()?.id
            if (currentUserId == null) {
                binding.onboardingError.text = "Not logged in."
                binding.onboardingError.visibility = View.VISIBLE
            }
        }

        val adapter = OnboardingSkillAdapter(
            items = emptyList(),
            getRating = { viewModel.getRating(it) },
            setRating = { id, value -> viewModel.setRating(id, value) }
        )
        binding.onboardingSkillsList.layoutManager = LinearLayoutManager(requireContext())
        binding.onboardingSkillsList.adapter = adapter

        binding.roleFrontend.setOnClickListener { selectRole("Frontend") }
        binding.roleBackend.setOnClickListener { selectRole("Backend") }
        binding.roleDataAnalyst.setOnClickListener { selectRole("Data Analyst") }
        binding.roleAiMl.setOnClickListener { selectRole("AI/ML") }
        binding.roleMobile.setOnClickListener { selectRole("Mobile") }
        selectRole("Frontend")

        binding.onboardingContinue.setOnClickListener {
            val uid = currentUserId
            if (uid == null) {
                binding.onboardingError.text = "Not logged in."
                binding.onboardingError.visibility = View.VISIBLE
                return@setOnClickListener
            }
            viewModel.continueToDashboard(uid, selectedRoleLabel) {
                RoleStorage.setStoredRole(requireContext(), ROLE_DB_MAP[selectedRoleLabel] ?: "Frontend Developer")
                findNavController().navigate(R.id.action_onboarding_to_dashboard)
            }
        }

        viewModel.skills.onEach { adapter.updateItems(it) }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.ratings.onEach { adapter.notifyDataSetChanged() }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.error.onEach { msg ->
            binding.onboardingError.text = msg
            binding.onboardingError.visibility = if (msg != null) View.VISIBLE else View.GONE
        }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.loading.onEach { binding.onboardingContinue.isEnabled = !it }.launchIn(viewLifecycleOwner.lifecycleScope)
    }

    private fun selectRole(role: String) {
        selectedRoleLabel = role
        val chipId = when (role) {
            "Frontend" -> R.id.roleFrontend
            "Backend" -> R.id.roleBackend
            "Data Analyst" -> R.id.roleDataAnalyst
            "AI/ML" -> R.id.roleAiMl
            "Mobile" -> R.id.roleMobile
            else -> R.id.roleFrontend
        }
        binding.onboardingRoleChips.check(chipId)
        viewModel.loadSkillsForRole(role)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
