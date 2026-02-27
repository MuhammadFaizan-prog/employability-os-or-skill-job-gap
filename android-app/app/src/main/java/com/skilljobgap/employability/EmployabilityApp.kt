package com.skilljobgap.employability

import android.app.Application
import com.skilljobgap.employability.data.SupabaseClient

class EmployabilityApp : Application() {

    override fun onCreate() {
        super.onCreate()
        val url = BuildConfig.SUPABASE_URL
        val key = BuildConfig.SUPABASE_ANON_KEY
        if (url.isNotBlank() && key.isNotBlank()) {
            SupabaseClient.configure(url, key)
        }
    }
}

