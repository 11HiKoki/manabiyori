import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radii, spacing } from "../theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type PrimaryButtonProps = {
  label: string;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, icon, variant = "primary", onPress, disabled = false, style }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        void onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={variant === "primary" ? colors.white : colors.accentDark} /> : null}
      <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderWidth: 1
  },
  secondary: {
    backgroundColor: colors.successSoft,
    borderColor: colors.accent,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  primaryLabel: {
    color: colors.white
  },
  secondaryLabel: {
    color: colors.accentDark
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.56
  }
});
