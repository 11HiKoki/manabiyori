import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type SearchFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchField({ label, placeholder, value, onChangeText }: SearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputFrame, focused ? styles.inputFrameFocused : null]}>
        <Ionicons name="search-outline" size={19} color={focused ? colors.accentDark : colors.textMuted} />
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
        {value ? (
          <Pressable
            accessibilityLabel={`${label}をクリア`}
            accessibilityRole="button"
            hitSlop={4}
            onPress={() => onChangeText("")}
            style={({ pressed }) => [styles.clearButton, pressed ? styles.pressed : null]}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  inputFrame: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs
  },
  inputFrameFocused: {
    borderColor: colors.accentDark,
    borderWidth: 2,
    paddingLeft: spacing.lg - 1,
    paddingRight: spacing.xs - 1
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.sm
  },
  clearButton: {
    alignItems: "center",
    borderRadius: radii.sm,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  pressed: {
    opacity: 0.64
  }
});
