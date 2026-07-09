import { StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "../theme";
import type { AutoSaveStatus } from "../hooks/useAutoSavedDraft";

type AutoSaveStatusTextProps = {
  status: AutoSaveStatus;
};

export function AutoSaveStatusText({ status }: AutoSaveStatusTextProps) {
  const label = getLabel(status);

  if (!label) {
    return null;
  }

  return <Text style={status === "error" ? styles.error : styles.text}>{label}</Text>;
}

function getLabel(status: AutoSaveStatus) {
  switch (status) {
    case "restored":
      return "下書きを復元しました";
    case "saving":
      return "下書きを自動保存中...";
    case "saved":
      return "下書き保存済み";
    case "error":
      return "下書きの自動保存に失敗しました";
    case "idle":
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  text: {
    alignSelf: "flex-start",
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  error: {
    alignSelf: "flex-start",
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    color: colors.coral,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  }
});
