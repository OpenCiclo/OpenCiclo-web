// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The Maven libraries inside the Android app, for /licenses in the Android build.
// A reviewed, hand-kept list: Gradle is not part of the web build.
//
// Regenerate it whenever apps/mobile/android/variables.gradle, app/build.gradle
// or Capacitor changes (android-maven.test.ts checks the versions declared there):
//
//   cd apps/mobile && npm ci && npx cap sync android
//   cd android && JAVA_HOME=<JDK 21> ANDROID_HOME=<Android SDK> \
//     ./gradlew :app:dependencies --configuration releaseRuntimeClasspath
//
// Take every resolved `group:artifact:version` (the version after "->" when
// there is one; skip "(c)" constraints, `project :…` lines and BOMs, which ship
// no code). For each new artifact, read the license in its POM and look inside
// the jar/aar for NOTICE files: an Apache-2.0 NOTICE must be reproduced here.
// Last generated 2026-11-19 (Capacitor 8.6.2, cordova-android 14.0.1).

export type MavenLibrary = {
  /** What the page shows. */
  name: string;
  /** Copyright holder. */
  holder: string;
  /** SPDX identifier. Every library here is Apache-2.0 today. */
  license: "Apache-2.0";
  url: string;
  /** group:artifact:version, as resolved for release. */
  artifacts: string[];
  /** A NOTICE file the license asks us to reproduce. */
  notice?: string;
};

export const ANDROID_MAVEN_LIBRARIES: MavenLibrary[] = [
  {
    name: "AndroidX (Android Jetpack)",
    holder: "The Android Open Source Project",
    license: "Apache-2.0",
    url: "https://developer.android.com/jetpack/androidx",
    artifacts: [
      "androidx.activity:activity:1.11.0",
      "androidx.annotation:annotation:1.8.1",
      "androidx.annotation:annotation-experimental:1.4.1",
      "androidx.annotation:annotation-jvm:1.8.1",
      "androidx.appcompat:appcompat:1.7.1",
      "androidx.appcompat:appcompat-resources:1.7.1",
      "androidx.arch.core:core-common:2.2.0",
      "androidx.arch.core:core-runtime:2.2.0",
      "androidx.biometric:biometric:1.1.0",
      "androidx.collection:collection:1.4.2",
      "androidx.collection:collection-jvm:1.4.2",
      "androidx.concurrent:concurrent-futures:1.1.0",
      "androidx.coordinatorlayout:coordinatorlayout:1.3.0",
      "androidx.core:core:1.17.0",
      "androidx.core:core-ktx:1.17.0",
      "androidx.core:core-splashscreen:1.2.0",
      "androidx.core:core-viewtree:1.0.0",
      "androidx.cursoradapter:cursoradapter:1.0.0",
      "androidx.customview:customview:1.0.0",
      "androidx.drawerlayout:drawerlayout:1.0.0",
      "androidx.emoji2:emoji2:1.3.0",
      "androidx.emoji2:emoji2-views-helper:1.3.0",
      "androidx.fragment:fragment:1.8.9",
      "androidx.interpolator:interpolator:1.0.0",
      "androidx.lifecycle:lifecycle-common:2.6.2",
      "androidx.lifecycle:lifecycle-livedata:2.6.2",
      "androidx.lifecycle:lifecycle-livedata-core:2.6.2",
      "androidx.lifecycle:lifecycle-process:2.6.2",
      "androidx.lifecycle:lifecycle-runtime:2.6.2",
      "androidx.lifecycle:lifecycle-viewmodel:2.6.2",
      "androidx.lifecycle:lifecycle-viewmodel-savedstate:2.6.2",
      "androidx.loader:loader:1.0.0",
      "androidx.profileinstaller:profileinstaller:1.4.0",
      "androidx.resourceinspection:resourceinspection-annotation:1.0.1",
      "androidx.savedstate:savedstate:1.2.1",
      "androidx.startup:startup-runtime:1.1.1",
      "androidx.tracing:tracing:1.2.0",
      "androidx.vectordrawable:vectordrawable:1.1.0",
      "androidx.vectordrawable:vectordrawable-animated:1.1.0",
      "androidx.versionedparcelable:versionedparcelable:1.1.1",
      "androidx.viewpager:viewpager:1.0.0",
      "androidx.webkit:webkit:1.14.0",
    ],
  },
  {
    name: "Apache Cordova Android framework",
    holder: "The Apache Software Foundation",
    license: "Apache-2.0",
    url: "https://github.com/apache/cordova-android",
    artifacts: ["org.apache.cordova:framework:14.0.1"],
    // NOTICE of cordova-android 14.0.1 (the artifact itself ships none).
    notice: [
      "Apache Cordova",
      "Copyright 2015-2020 The Apache Software Foundation",
      "",
      "This product includes software developed at",
      "The Apache Software Foundation (http://www.apache.org/).",
    ].join("\n"),
  },
  {
    name: "Guava ListenableFuture",
    holder: "The Guava Authors",
    license: "Apache-2.0",
    url: "https://github.com/google/guava",
    artifacts: ["com.google.guava:listenablefuture:1.0"],
  },
  {
    name: "JetBrains Java Annotations",
    holder: "JetBrains s.r.o.",
    license: "Apache-2.0",
    url: "https://github.com/JetBrains/java-annotations",
    artifacts: ["org.jetbrains:annotations:23.0.0"],
  },
  {
    name: "JSpecify",
    holder: "The JSpecify Authors",
    license: "Apache-2.0",
    url: "https://jspecify.dev",
    artifacts: ["org.jspecify:jspecify:1.0.0"],
  },
  {
    name: "Kotlin Standard Library",
    holder: "JetBrains s.r.o. and Kotlin Programming Language contributors",
    license: "Apache-2.0",
    url: "https://github.com/JetBrains/kotlin",
    artifacts: ["org.jetbrains.kotlin:kotlin-stdlib:2.0.21"],
  },
  {
    name: "kotlinx.coroutines",
    holder: "JetBrains s.r.o. and Kotlin Programming Language contributors",
    license: "Apache-2.0",
    url: "https://github.com/Kotlin/kotlinx.coroutines",
    artifacts: [
      "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1",
      "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1",
      "org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.8.1",
    ],
  },
];
