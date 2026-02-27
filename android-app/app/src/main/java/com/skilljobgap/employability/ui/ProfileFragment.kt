package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.AuthRepository
import com.skilljobgap.employability.data.ProfileRepository
import com.skilljobgap.employability.data.RoleStorage
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_profile, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewLifecycleOwner.lifecycleScope.launch {
            val user = AuthRepository().getCurrentUser().getOrNull()
            if (user == null) {
                findNavController().navigate(R.id.landingFragment)
                return@launch
            }
            val profile = ProfileRepository().getProfile(user.id).getOrNull()
            view.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.profileName).setText(profile?.fullName?.ifBlank { null } ?: user.email)
            view.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.profileEmail).setText(user.email)
            view.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.profileBio).setText(profile?.bio ?: "")
            view.findViewById<TextView>(R.id.profileRole).text = "Role: ${profile?.role ?: RoleStorage.getStoredRole(requireContext())}"
        }

        view.findViewById<View>(R.id.profileSave).setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val user = AuthRepository().getCurrentUser().getOrNull() ?: return@launch
                val name = view.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.profileName).text?.toString()?.trim() ?: ""
                val bio = view.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.profileBio).text?.toString()?.trim() ?: ""
                val result = ProfileRepository().updateProfile(user.id, fullName = name, bio = bio)
                view.findViewById<TextView>(R.id.profileError).apply {
                    if (result.isFailure) {
                        visibility = View.VISIBLE
                        text = result.exceptionOrNull()?.message ?: "Save failed"
                    } else visibility = View.GONE
                }
            }
        }

        view.findViewById<View>(R.id.profileSignOut).setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                AuthRepository().signOut()
                findNavController().navigate(R.id.landingFragment)
            }
        }

        view.findViewById<View>(R.id.profileDeleteAccount).setOnClickListener {
            AlertDialog.Builder(requireContext())
                .setTitle("Delete account")
                .setMessage("Delete all your data and sign out? This cannot be undone.")
                .setPositiveButton("Delete") { _, _ ->
                    viewLifecycleOwner.lifecycleScope.launch {
                        val user = AuthRepository().getCurrentUser().getOrNull() ?: return@launch
                        ProfileRepository().deleteUserData(user.id)
                        AuthRepository().signOut()
                        findNavController().navigate(R.id.landingFragment)
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }
}
