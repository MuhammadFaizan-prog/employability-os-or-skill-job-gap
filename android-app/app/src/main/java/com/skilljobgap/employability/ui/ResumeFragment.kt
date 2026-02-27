package com.skilljobgap.employability.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.ResumeRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import java.io.ByteArrayOutputStream

class ResumeFragment : Fragment() {

    private val pickFile = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let { uploadFile(it) }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_resume, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<TextView>(R.id.resumeRoleBadge).text = RoleStorage.getStoredRole(requireContext()).uppercase()
        view.findViewById<View>(R.id.resumeBack).setOnClickListener {
            findNavController().navigate(R.id.dashboardFragment)
        }
        view.findViewById<View>(R.id.resumeUploadBtn).setOnClickListener {
            pickFile.launch("application/pdf")
        }

        viewLifecycleOwner.lifecycleScope.launch {
            val userId = AuthRepository().getCurrentUser().getOrNull()?.id
            if (userId != null) {
                ResumeRepository().getResumeHistory(userId, 5).getOrNull()?.let { list ->
                    view.findViewById<TextView>(R.id.resumeStatus).text =
                        list.joinToString("\n") { it.fileName ?: "Upload" }
                } ?: run { view.findViewById<TextView>(R.id.resumeStatus).text = "No uploads yet." }
            } else {
                view.findViewById<TextView>(R.id.resumeStatus).text = "Log in to upload."
            }
        }
    }

    private fun uploadFile(uri: Uri) {
        val view = view ?: return
        view.findViewById<View>(R.id.resumeUploadCard).visibility = View.GONE
        view.findViewById<View>(R.id.resumeLoading).visibility = View.VISIBLE
        view.findViewById<TextView>(R.id.resumeLoadingText).text = "Scanning resume…"
        view.findViewById<com.google.android.material.progressindicator.LinearProgressIndicator>(R.id.resumeProgress).progress = 30

        viewLifecycleOwner.lifecycleScope.launch {
            val userId = AuthRepository().getCurrentUser().getOrNull()?.id ?: run {
                view.findViewById<View>(R.id.resumeLoading).visibility = View.GONE
                view.findViewById<View>(R.id.resumeUploadCard).visibility = View.VISIBLE
                return@launch
            }
            val bytes = requireContext().contentResolver.openInputStream(uri)?.use { input ->
                ByteArrayOutputStream().use { output ->
                    input.copyTo(output)
                    output.toByteArray()
                }
            } ?: return@launch
            val fileName = uri.lastPathSegment ?: "resume.pdf"
            val mimeType = requireContext().contentResolver.getType(uri) ?: "application/pdf"
            val analysisResult = mapOf(
                "score" to 50,
                "suggestions" to "Add 2–3 projects relevant to your target role.\nQuantify achievements with numbers where possible.\nEnsure ATS-friendly formatting."
            )
            val result = ResumeRepository().uploadResume(userId, fileName, bytes, mimeType, analysisResult)
            view.findViewById<View>(R.id.resumeLoading).visibility = View.GONE
            view.findViewById<View>(R.id.resumeUploadCard).visibility = View.VISIBLE
            result.getOrNull()?.let { row ->
                view.findViewById<View>(R.id.resumeResultsCard).visibility = View.VISIBLE
                val score = (row.analysisResult?.get("score") as? JsonPrimitive)?.content?.toIntOrNull() ?: 50
                val suggestions = (row.analysisResult?.get("suggestions") as? JsonPrimitive)?.content
                    ?: "Add 2–3 projects. Quantify achievements. Ensure ATS-friendly formatting."
                view.findViewById<TextView>(R.id.resumeScore).text = "Score: $score"
                view.findViewById<TextView>(R.id.resumeSuggestions).text = suggestions
            }
            ResumeRepository().getResumeHistory(userId, 5).getOrNull()?.let { list ->
                view.findViewById<TextView>(R.id.resumeStatus).text = list.joinToString("\n") { it.fileName ?: "Upload" }
            }
        }
    }
}
