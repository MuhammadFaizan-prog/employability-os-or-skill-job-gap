package com.skilljobgap.employability.data

import android.content.Context
import android.content.SharedPreferences

/**
 * Mirrors web roleStorage: getStoredRole / setStoredRole.
 * Role is read from users.role (ProfileRepository) and cached here
 * so all role-dependent screens use the same value.
 */
object RoleStorage {

    private const val PREFS_NAME = "employabilityos_prefs"
    private const val KEY_ROLE = "employabilityos_role"
    private const val DEFAULT_ROLE = "Frontend Developer"

    private fun prefs(context: Context): SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getStoredRole(context: Context): String =
        prefs(context).getString(KEY_ROLE, DEFAULT_ROLE) ?: DEFAULT_ROLE

    fun setStoredRole(context: Context, role: String) {
        val dbRole = ROLE_MAP[role] ?: role
        prefs(context).edit().putString(KEY_ROLE, dbRole).apply()
    }

    /** Map UI/alias role labels to Supabase users.role value. */
    private val ROLE_MAP = mapOf(
        "Frontend" to "Frontend Developer",
        "Backend" to "Backend Developer",
        "Data Analyst" to "Data Analyst",
        "AI/ML" to "AI/ML Engineer",
        "Mobile" to "Mobile Developer",
        "frontend" to "Frontend Developer",
        "backend" to "Backend Developer",
        "data-analyst" to "Data Analyst",
        "ai-ml" to "AI/ML Engineer",
        "mobile" to "Mobile Developer"
    )
}
