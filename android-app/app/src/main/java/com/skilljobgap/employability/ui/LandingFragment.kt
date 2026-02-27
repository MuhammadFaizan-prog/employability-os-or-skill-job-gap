package com.skilljobgap.employability.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.skilljobgap.employability.R

class LandingFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_landing, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<View>(R.id.landingStartAssessment).setOnClickListener {
            findNavController().navigate(R.id.action_landing_to_onboarding)
        }
        view.findViewById<View>(R.id.landingViewSample).setOnClickListener {
            findNavController().navigate(R.id.action_landing_to_dashboard)
        }
        view.findViewById<View>(R.id.landingLogin).setOnClickListener {
            findNavController().navigate(R.id.action_landing_to_login)
        }
        view.findViewById<View>(R.id.landingSignup).setOnClickListener {
            findNavController().navigate(R.id.action_landing_to_signup)
        }
        view.findViewById<View>(R.id.landingCta).setOnClickListener {
            findNavController().navigate(R.id.action_landing_to_onboarding)
        }
    }
}
