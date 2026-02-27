package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.InterviewRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.launch

class CodingChallengeFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_coding_challenge, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val challengeId = requireArguments().getString("challengeId") ?: run {
            findNavController().navigateUp()
            return
        }

        viewLifecycleOwner.lifecycleScope.launch {
            val role = RoleStorage.getStoredRole(requireContext())
            val challenges = InterviewRepository().getCodingChallenges(role).getOrNull() ?: emptyList()
            val challenge = challenges.find { it.id == challengeId }
            if (challenge == null) {
                view.findViewById<TextView>(R.id.codingTitle).text = "Challenge not found"
                return@launch
            }
            view.findViewById<TextView>(R.id.codingTitle).text = challenge.title
            view.findViewById<TextView>(R.id.codingDifficulty).text = "Difficulty: ${challenge.difficulty}"
            view.findViewById<TextView>(R.id.codingDescription).text = challenge.description
            view.findViewById<EditText>(R.id.codingEditor).setText(challenge.starterCode)

            view.findViewById<View>(R.id.codingSubmit).setOnClickListener {
                viewLifecycleOwner.lifecycleScope.launch {
                    val userId = AuthRepository().getCurrentUser().getOrNull()?.id ?: return@launch
                    val code = view.findViewById<EditText>(R.id.codingEditor).text.toString()
                    InterviewRepository().insertCodingAttempt(userId, challengeId, code, 0)
                    view.findViewById<TextView>(R.id.codingResult).apply {
                        visibility = View.VISIBLE
                        text = "Submitted. (Run tests on server for pass/fail.)"
                    }
                }
            }
        }
    }
}
