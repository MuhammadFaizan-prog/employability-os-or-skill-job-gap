package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

class SkillsFragment : Fragment() {

    private val viewModel: SkillsViewModel by viewModels()
    private lateinit var adapter: SkillsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_skills, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<TextView>(R.id.skillsRoleBadge).text =
            RoleStorage.getStoredRole(requireContext()).uppercase()

        viewLifecycleOwner.lifecycleScope.launch {
            val userId = AuthRepository().getCurrentUser().getOrNull()?.id
            val role = RoleStorage.getStoredRole(requireContext())
            viewModel.load(userId, role)
        }

        view.findViewById<View>(R.id.skillsBackToDashboard).setOnClickListener {
            findNavController().navigate(R.id.dashboardFragment)
        }
        view.findViewById<View>(R.id.skillsBackToDashboard2).setOnClickListener {
            findNavController().navigate(R.id.dashboardFragment)
        }
        view.findViewById<View>(R.id.skillsSave).setOnClickListener {
            viewModel.save()
        }
        view.findViewById<View>(R.id.skillsFocusThis).setOnClickListener {
            viewModel.suggestedNextSkill()?.skill?.id?.let { id ->
                // Scroll to skill could be done by finding position
            }
        }

        adapter = SkillsAdapter(emptyList()) { skillId, value ->
            viewModel.setUserSkillRating(skillId, value)
        }
        view.findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.skillsRecycler).apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@SkillsFragment.adapter
        }

        val filterContainer = view.findViewById<LinearLayout>(R.id.skillsFilterChips)
        listOf("All" to "all", "Gaps" to "gap", "Strengths" to "strength", "Priority" to "priority").forEach { (label, value) ->
            val btn = Button(requireContext(), null, com.google.android.material.R.attr.materialButtonOutlinedStyle)
            btn.text = label
            btn.setPadding(32, 12, 32, 12)
            btn.setOnClickListener { viewModel.setFilter(value) }
            filterContainer.addView(btn, LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply { marginEnd = 8 })
        }

        val sortSpinner = view.findViewById<android.widget.Spinner>(R.id.skillsSortSpinner)
        val sortOptions = listOf(
            "Default" to "default",
            "Weight High→Low" to "weight-desc",
            "Proficiency Low→High" to "proficiency-asc",
            "Difficulty Easy→Hard" to "difficulty-asc",
            "Biggest Gap First" to "gap-desc"
        )
        sortSpinner.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, sortOptions.map { it.first })
        sortSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, v: View?, position: Int, id: Long) {
                viewModel.setSort(sortOptions[position].second)
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }

        viewModel.filteredAndSorted.onEach { adapter.updateItems(it) }.launchIn(viewLifecycleOwner.lifecycleScope)
        viewModel.skillsWithStatus.onEach { list ->
            view.findViewById<TextView>(R.id.skillsStrengthsCount).text = list.count { it.status == "strength" }.toString()
            view.findViewById<TextView>(R.id.skillsGapsCount).text = list.count { it.status == "gap" }.toString()
            view.findViewById<TextView>(R.id.skillsPriorityCount).text = list.count { it.status == "priority" }.toString()
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.filteredAndSorted.onEach { list ->
            viewModel.suggestedNextSkill()?.let { suggested ->
                view.findViewById<View>(R.id.skillsSuggestedCard).visibility = View.VISIBLE
                view.findViewById<TextView>(R.id.skillsSuggestedName).text = suggested.skill.name
                view.findViewById<TextView>(R.id.skillsSuggestedMeta).text = "Weight ${suggested.skill.weight} · Your proficiency ${suggested.proficiency}/5 vs target ${suggested.target}/5"
            } ?: run { view.findViewById<View>(R.id.skillsSuggestedCard).visibility = View.GONE }
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.skillsWithStatus.onEach { list ->
            val focus = viewModel.priorityFocus()
            view.findViewById<TextView>(R.id.skillsPriorityFocus).text =
                focus.joinToString("\n") { "${it.skill.name}: ${it.proficiency}/5 → ${it.target}/5" }.ifEmpty { "None" }
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.error.onEach { msg ->
            view.findViewById<TextView>(R.id.skillsError).apply {
                text = msg?.let { "Note: $it" }
                visibility = if (msg != null) View.VISIBLE else View.GONE
            }
        }.launchIn(viewLifecycleOwner.lifecycleScope)

        viewModel.saveSuccess.onEach { success ->
            if (success) view.findViewById<Button>(R.id.skillsSave).text = "Saved ✓"
        }.launchIn(viewLifecycleOwner.lifecycleScope)
    }
}
