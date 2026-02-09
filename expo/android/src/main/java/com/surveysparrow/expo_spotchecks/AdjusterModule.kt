package com.surveysparrow.expo_spotchecks

import android.app.Activity
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AdjusterModule : Module() {
  private var savedMode: Int? = null

  override fun definition() = ModuleDefinition {
    Name("Adjuster")

    Function("saveCurrentMode") {
      val activity: Activity? = appContext.currentActivity
      savedMode = activity?.window?.attributes?.softInputMode
    }

    Function("restoreSavedMode") {
      val activity: Activity? = appContext.currentActivity
      savedMode?.let { mode ->
        activity?.runOnUiThread {
          activity.window.setSoftInputMode(mode)
        }
      }
    }

    Function("setAdjustNothing") {
      val activity: Activity? = appContext.currentActivity
      activity?.runOnUiThread {
        activity.window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING)
      }
    }
  }
}
