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
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.ProfileRepository
import com.skilljobgap.employability.data.RoleStorage
import com.skilljobgap.employability.databinding.FragmentDashboardBinding
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DashboardViewModel by viewModels()
    private val authRepository = AuthRepository()
    private val profileRepository = ProfileRepository()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.dashboardRoleBadge.text = RoleStorage.getStoredRole(requireContext()).uppercase()

        viewLifecycleOwner.lifecycleScope.launch {
            val user = authRepository.getCurrentUser().getOrNull()
            user?.id?.let { uid ->
                profileRepository.getProfile(uid).getOrNull()?.role?.let { r ->
                    RoleStorage.setStoredRole(requireContext(), r)
                }
            }
            val role = RoleStorage.getStoredRole(requireContext())
            binding.dashboardRoleBadge.text = role.uppercase()
            viewModel.load(user?.id, role)
        }

        binding.dashboardRetakeAssessment.setOnClickListener {
            findNavController().navigate(R.id.onboardingFragment)
        }
        binding.dashboardViewAllSkills.setOnClickListener {
            findNavController().navigate(R.id.skillsFragment)
        }
        binding.dashboardViewRoadmap.setOnClickListener {
            findNavController().navigate(R.id.roadmapFragment)
        }
        binding.dashboardViewProjects.setOnClickListener {
            findNavController().navigate(R.id.projectsFragment)
        }
        binding.dashboardQuickOnboarding.setOnClickListener {
            findNavController().navigate(R.id.onboardingFragment)
        }
        binding.dashboardQuickResume.setOnClickListener {
            findNavController().navigate(R.id.resumeFragment)
        }
        binding.dashboardQuickInterview.setOnClickListener {
            findNavController().navigate(R.id.interviewFragment)
        }
        binding.dashboardQuickProfile.setOnClickListener {
            findNavController().navigate(R.id.profileFragment)
        }
        binding.dashboardSuggestedStart.setOnClickListener {
            findNavController().navigate(R.id.roadmapFragment)
        }

        viewModel.scoreBreakdown.onEach { breakdown ->
            val score = breakdown?.finalScore?.toInt() ?: 0
            binding.dashboardScoreValue.text = if (breakdown != null) score.toString() else "—"
            binding.dashboardScoreGauge.max = 100
            binding.dashboardScoreGauge.progress = score
            binding.dashboardBreakdown.text = breakdown?.let {
                "Technical (40%): ${it.technical.toInt()}\nProjects (20%): ${it.projects.toInt()}\nResume (15%): ${it.resume.toInt()}\nPractical (15%): ${it.practical.toInt()}\nInterview (10%): ${it.interview.toInt()}"
            } ?: ""
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.skillGapResult.onEach { result ->
            binding.dashboardStrengthsCount.text = (result?.strengths?.size ?: 0).toString()
            binding.dashboardGapsCount.text = (result?.gaps?.size ?: 0).toString()
            binding.dashboardPriorityCount.text = (result?.priorityFocus?.size ?: 0).toString()
            result?.suggestedNextSkill?.let { skill ->
                binding.dashboardSuggestedCard.visibility = View.VISIBLE
                binding.dashboardSuggestedSkill.text = "Focus on ${skill.name} to close your top skill gap."
            } ?: run { binding.dashboardSuggestedCard.visibility = View.GONE }
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.roadmapSteps.onEach { steps ->
            binding.dashboardRoadmapPreview.text = steps?.skillSteps?.take(3)?.joinToString("\n") { "[${it.status.uppercase()}] ${it.name}" }
                ?: "Complete onboarding to generate your roadmap."
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.projectsCompletedTotal.onEach { (completed, total) ->
            binding.dashboardProjectCount.text = getString(R.string.dashboard_projects_count, completed, total)
            binding.dashboardProjectProgress.max = 100
            binding.dashboardProjectProgress.progress = if (total > 0) (completed * 100 / total) else 0
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.error.onEach { msg ->
            binding.dashboardError.text = msg
            binding.dashboardError.visibility = if (msg != null) View.VISIBLE else View.GONE
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.loading.onEach { loading ->
            binding.dashboardScoreValue.text = if (loading) "…" else (viewModel.scoreBreakdown.value?.finalScore?.toInt()?.toString() ?: "—")
        }.launchIn(viewLifecycleOwner.lifecycleScope)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
