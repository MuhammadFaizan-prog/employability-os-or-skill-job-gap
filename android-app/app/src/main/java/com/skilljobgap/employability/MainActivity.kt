package com.skilljobgap.employability

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.NavDestination
import androidx.navigation.findNavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.navigation.NavigationView

class MainActivity : AppCompatActivity() {

    private lateinit var drawerLayout: DrawerLayout
    private lateinit var appBarConfiguration: AppBarConfiguration

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        drawerLayout = findViewById(R.id.drawer_layout)
        val navView: NavigationView = findViewById(R.id.nav_view)
        val navHostFragment =
            supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        // Top-level destinations: show drawer (hamburger) for these; back for others
        val topLevelIds = setOf(
            R.id.dashboardFragment,
            R.id.skillsFragment,
            R.id.roadmapFragment,
            R.id.projectsFragment,
            R.id.resumeFragment,
            R.id.interviewFragment,
            R.id.profileFragment,
            R.id.verifyFragment
        )
        appBarConfiguration = AppBarConfiguration(topLevelIds, drawerLayout)

        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)

        // Lock drawer on landing/login/signup; unlock on app destinations
        navController.addOnDestinationChangedListener { _, destination, _ ->
            updateDrawerLock(destination)
        }
        updateDrawerLock(navController.currentDestination)
    }

    private fun updateDrawerLock(destination: NavDestination?) {
        val noDrawer = destination?.id == R.id.landingFragment ||
            destination?.id == R.id.loginFragment ||
            destination?.id == R.id.signupFragment
        if (noDrawer) {
            drawerLayout.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED)
        } else {
            drawerLayout.setDrawerLockMode(DrawerLayout.LOCK_MODE_UNLOCKED)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment)
        return navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()
    }

    override fun onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START)
        } else {
            super.onBackPressed()
        }
    }
}
