import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type FormSectionProps = {
  title: string;
  caption?: string;
  children: ReactNode;
  badge?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export function FormSection({ title, caption, children, badge, collapsible = false, defaultCollapsed = false }: FormSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const bodyVisible = !collapsible || !collapsed;
  const headerContent = (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {collapsible ? <Ionicons name={collapsed ? "chevron-down" : "chevron-up"} size={20} color={colors.textMuted} /> : null}
    </View>
  );

  return (
    <View style={styles.section}>
      {collapsible ? (
        <Pressable
          accessibilityLabel={`${title}${collapsed ? "を開く" : "を閉じる"}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: !collapsed }}
          onPress={() => setCollapsed((current) => !current)}
          style={({ pressed }) => [styles.headerButton, pressed ? styles.pressed : null]}
        >
          {headerContent}
        </Pressable>
      ) : (
        <View style={styles.header}>{headerContent}</View>
      )}
      {bodyVisible ? <View style={styles.fields}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  header: {
    gap: spacing.xs
  },
  headerButton: {
    borderRadius: radii.sm
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  badge: {
    backgroundColor: colors.successSoft,
    borderRadius: radii.sm,
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  caption: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  fields: {
    gap: spacing.lg
  },
  pressed: {
    opacity: 0.72
  }
});
