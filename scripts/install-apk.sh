#!/usr/bin/env bash
set -e

export JAVA_HOME=$HOME/.jdk21
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
  echo "❌ APK not found at $APK_PATH."
  echo "Building APK now..."
  cd android && ./gradlew assembleDebug && cd ..
fi

echo "🔍 Checking for connected Android devices..."
adb devices

echo "📱 Installing Biology AR APK to connected device..."
adb install -r -g "$APK_PATH"

echo "✅ App successfully installed on your Android smartphone!"
