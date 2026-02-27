package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.RoleDataRepository
import com.skilljobgap.employability.data.RoleStorage
import com.skilljobgap.employability.domain.RoadmapGenerator
import kotlinx.coroutines.launch

class RoadmapFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_roadmap, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<TextView>(R.id.roadmapRoleBadge).text = RoleStorage.getStoredRole(requireContext()).uppercase()
        view.findViewById<View>(R.id.roadmapBack).setOnClickListener {
            findNavController().navigate(R.id.dashboardFragment)
        }

        val skillsContent = view.findViewById<TextView>(R.id.roadmapSkillsContent)
        val projectsContent = view.findViewById<TextView>(R.id.roadmapProjectsContent)
        val errorView = view.findViewById<TextView>(R.id.roadmapError)

        viewLifecycleOwner.lifecycleScope.launch {
            val userId = AuthRepository().getCurrentUser().getOrNull()?.id
            val role = RoleStorage.getStoredRole(requireContext())
            val skillsResult = RoleDataRepository().getSkills(role)
            val projectsResult = RoleDataRepository().getProjects(role)
            if (skillsResult.isFailure || projectsResult.isFailure) {
                errorView.visibility = View.VISIBLE
                errorView.text = "Could not load roadmap."
                return@launch
            }
            val skills = skillsResult.getOrNull() ?: emptyList()
            val projects = projectsResult.getOrNull() ?: emptyList()
            val userSkills = userId?.let { RoleDataRepository().getUserSkills(it).getOrNull()?.map { u -> u.skillId to u.proficiency } } ?: emptyList()
            val userProjects = userId?.let { RoleDataRepository().getUserProjects(it).getOrNull()?.map { u -> u.projectId to u.completed } } ?: emptyList()
            val steps = RoadmapGenerator.computeSteps(role, skills, projects, userSkills, userProjects)
            skillsContent.text = steps.skillSteps.joinToString("\n") { "[${it.status.uppercase()}] ${it.name} (Difficulty ${it.difficulty})" }
            projectsContent.text = steps.projectSteps.joinToString("\n") { "[${it.status.uppercase()}] ${it.title} (Difficulty ${it.difficulty})" }
        }
    }
}
