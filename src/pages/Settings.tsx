import React from "react";
import { updateSetting, Setting } from "@/utils/data";

// Fix example for the Settings component
// When updating a setting, make sure to pass an object, not a string
const handleUpdateSetting = (settingId: string, newValue: string) => {
  // Correct way:
  updateSetting(settingId, { value: newValue });
  
  // Incorrect way (what's causing the error):
  // updateSetting(settingId, newValue);
};
