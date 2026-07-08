import AsyncStorage from "@react-native-async-storage/async-storage";

import type { WeekStart } from "../types";

const weekStartKey = "settings.weekStart";

export async function loadWeekStart(): Promise<WeekStart> {
  try {
    const value = await AsyncStorage.getItem(weekStartKey);
    return value === "sunday" ? "sunday" : "monday";
  } catch {
    return "monday";
  }
}

export async function saveWeekStart(weekStart: WeekStart) {
  await AsyncStorage.setItem(weekStartKey, weekStart);
}
