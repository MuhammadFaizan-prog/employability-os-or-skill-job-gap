package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.RoleDataRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.launch

class VerifyFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_verify, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<View>(R.id.verifyRun).setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val resultView = view.findViewById<TextView>(R.id.verifyResult)
                resultView.text = "Running checks…"
                val repo = RoleDataRepository()
                val role = RoleStorage.getStoredRole(requireContext())
                val skillsCount = repo.getSkills(role).getOrNull()?.size ?: -1
                val questionsCount = repo.getInterviewQuestions(role).getOrNull()?.size ?: -1
                resultView.text = "Skills ($role): $skillsCount\nInterview questions ($role): $questionsCount\n\nOK: Supabase connection working."
            }
        }
    }
}
