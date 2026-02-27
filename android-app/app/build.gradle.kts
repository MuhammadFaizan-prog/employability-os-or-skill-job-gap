plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("plugin.serialization") version "1.9.23"
}

android {
    namespace = "com.skilljobgap.employability"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.skilljobgap.employability"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Prefer local.properties (gitignored), then gradle.properties — same env as frontend/.env
        val localProps = java.util.Properties()
        rootProject.file("local.properties").takeIf { it.exists() }?.reader(Charsets.UTF_8)?.use { localProps.load(it) }
        val supabaseUrl = (localProps.getProperty("supabase.url")?.takeIf { it.isNotBlank() }
            ?: project.findProperty("SUPABASE_URL") as? String) ?: ""
        val supabaseAnonKey = (localProps.getProperty("supabase.anonKey")?.takeIf { it.isNotBlank() }
            ?: project.findProperty("SUPABASE_ANON_KEY") as? String) ?: ""
        buildConfigField("String", "SUPABASE_URL", "\"${supabaseUrl.replace("\"", "\\\"")}\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"${supabaseAnonKey.replace("\"", "\\\"")}\"")
    }

    buildTypes {
        getByName("debug") {
            isMinifyEnabled = false
        }
        getByName("release") {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")

    implementation("androidx.navigation:navigation-fragment-ktx:2.8.0")
    implementation("androidx.navigation:navigation-ui-ktx:2.8.0")

    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.drawerlayout:drawerlayout:1.2.0")

    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.6")

    // Networking: OkHttp + Kotlin serialization for Supabase REST API
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}

