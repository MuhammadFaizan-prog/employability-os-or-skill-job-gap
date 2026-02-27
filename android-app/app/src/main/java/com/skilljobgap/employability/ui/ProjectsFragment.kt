package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.RoleDataRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.launch

class ProjectsFragment : Fragment() {

    private lateinit var adapter: ProjectsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_projects, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<TextView>(R.id.projectsRoleBadge).text = RoleStorage.getStoredRole(requireContext()).uppercase()
        view.findViewById<View>(R.id.projectsBack).setOnClickListener {
            findNavController().navigate(R.id.dashboardFragment)
        }

        adapter = ProjectsAdapter(emptyList()) { projectId, completed ->
            viewLifecycleOwner.lifecycleScope.launch {
                val userId = AuthRepository().getCurrentUser().getOrNull()?.id ?: return@launch
                RoleDataRepository().upsertUserProject(userId, projectId, completed)
                loadProjects(view)
            }
        }
        view.findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.projectsRecycler).apply {
            layoutManager = LinearLayoutManager(requireContext())
            setAdapter(this@ProjectsFragment.adapter)
        }

        loadProjects(view)
    }

    private fun loadProjects(view: View) {
        viewLifecycleOwner.lifecycleScope.launch {
            val userId = AuthRepository().getCurrentUser().getOrNull()?.id
            val role = RoleStorage.getStoredRole(requireContext())
            val result = RoleDataRepository().getProjects(role)
            result.getOrNull()?.let { projects ->
                val userResult = userId?.let { RoleDataRepository().getUserProjects(it) }?.getOrNull()
                val completedSet = userResult?.filter { it.completed }?.map { it.projectId }?.toSet() ?: emptySet()
                val items = projects.map { p ->
                    val completed = p.id in completedSet
                    val status = if (completed) "COMPLETED" else "AVAILABLE"
                    ProjectWithStatus(p, completed, status)
                }
                adapter.updateItems(items)
                val completed = items.count { it.completed }
                view.findViewById<TextView>(R.id.projectsProgress).text = getString(R.string.dashboard_projects_count, completed, projects.size)
                view.findViewById<com.google.android.material.progressindicator.LinearProgressIndicator>(R.id.projectsProgressBar).apply {
                    max = 100
                    progress = if (projects.isNotEmpty()) (completed * 100 / projects.size) else 0
                }
            } ?: run {
                view.findViewById<TextView>(R.id.projectsError).apply {
                    visibility = View.VISIBLE
                    text = "Could not load projects."
                }
            }
        }
    }
}
