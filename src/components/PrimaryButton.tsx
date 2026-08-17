import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radii, spacing } from "../theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type PrimaryButtonProps = {
  label: string;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, icon, variant = "primary", onPress, disabled = false, loading = false, style }: PrimaryButtonProps) {
  const unavailable = disabled || loading;
  const contentColor = variant === "primary" ? colors.white : colors.accentDark;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: unavailable }}
      disabled={unavailable}
      onPress={() => {
        void onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !unavailable ? styles.pressed : null,
        unavailable ? styles.disabled : null,
        style
      ]}
    >
      {loading ? <ActivityIndicator color={contentColor} size="small" /> : icon ? <Ionicons name={icon} size={18} color={contentColor} /> : null}
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
