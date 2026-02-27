package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.InterviewRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.launch

class InterviewFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_interview, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<TextView>(R.id.interviewRoleBadge).text = RoleStorage.getStoredRole(requireContext()).uppercase()
        view.findViewById<View>(R.id.interviewBack).setOnClickListener {
            findNavController().navigate(R.id.dashboardFragment)
        }

        val container = view.findViewById<LinearLayout>(R.id.interviewCodingList)
        viewLifecycleOwner.lifecycleScope.launch {
            val role = RoleStorage.getStoredRole(requireContext())
            InterviewRepository().getCodingChallenges(role).getOrNull()?.let { challenges ->
                container.removeAllViews()
                for (c in challenges) {
                    val btn = Button(requireContext(), null, com.google.android.material.R.attr.materialButtonOutlinedStyle)
                    btn.text = "${c.title} (${c.difficulty})"
                    btn.setPadding(32, 24, 32, 24)
                    btn.setOnClickListener {
                        findNavController().navigate(
                            R.id.codingChallengeFragment,
                            Bundle().apply { putString("challengeId", c.id) }
                        )
                    }
                    container.addView(btn, LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { bottomMargin = 8 })
                }
                if (challenges.isEmpty()) {
                    val tv = TextView(requireContext())
                    tv.text = "No coding challenges for this role."
                    tv.setPadding(0, 16, 0, 0)
                    container.addView(tv)
                }
            } ?: run {
                val tv = TextView(requireContext())
                tv.text = "Could not load challenges."
                container.addView(tv)
            }
        }
    }
}
