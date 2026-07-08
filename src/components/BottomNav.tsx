import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";
import type { AppRoute } from "../types";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type NavItem = {
  route: AppRoute;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

const items: NavItem[] = [
  { route: "home", label: "ホーム", icon: "home-outline", activeIcon: "home" },
  { route: "create", label: "登録", icon: "add-circle-outline", activeIcon: "add-circle" },
  { route: "list", label: "一覧", icon: "list-outline", activeIcon: "list" },
  { route: "reflection", label: "振り返り", icon: "analytics-outline", activeIcon: "analytics" },
  { route: "people", label: "人", icon: "people-outline", activeIcon: "people" },
  { route: "settings", label: "設定", icon: "settings-outline", activeIcon: "settings" }
];

type BottomNavProps = {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = item.route === activeRoute;

        return (
          <Pressable
            accessibilityRole="button"
            key={item.route}
            onPress={() => onNavigate(item.route)}
            style={({ pressed }) => [styles.item, active ? styles.activeItem : null, pressed ? styles.pressed : null]}
          >
            <Ionicons name={active ? item.activeIcon : item.icon} size={22} color={active ? colors.accentDark : colors.textMuted} />
            <Text style={[styles.label, active ? styles.activeLabel : null]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-around",
    left: 0,
    minHeight: 76,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    position: "absolute",
    right: 0
  },
  item: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    gap: 2,
    minHeight: 54,
    justifyContent: "center"
  },
  activeItem: {
    backgroundColor: colors.successSoft
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800"
  },
  activeLabel: {
    color: colors.accentDark
  },
  pressed: {
    opacity: 0.72
  }
});
