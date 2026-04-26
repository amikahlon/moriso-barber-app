import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";

import { colors, spacing, typography } from "../../../constants";
import { useAuth } from "../../../hooks";
import { useCurrentUserQuery } from "../../auth/hooks";
import { useSettingsQuery } from "../../settings/hooks/useSettingsQuery";
import {
  drawerItems,
  normalizeDrawerRoute,
  type DrawerItem,
} from "../config/drawerItems";
import { useDrawer } from "../hooks/useDrawer";

interface DrawerContentProps {
  items?: DrawerItem[];
  onClose?: () => void;
  sectionLabel?: string;
}

export function DrawerContent({
  items = drawerItems,
  onClose,
  sectionLabel = "תפריט",
}: DrawerContentProps) {
  const drawer = useDrawer();
  const { signOut } = useAuth();
  const { data: user } = useCurrentUserQuery();
  const { data: settings } = useSettingsQuery();
  const pathname = usePathname();

  const closeDrawer = onClose ?? drawer.close;
  const isAdmin = user?.role === "admin";

  const isActive = (route: string) =>
    normalizeDrawerRoute(pathname) === normalizeDrawerRoute(route);

  const handleNavigate = (route: string) => {
    if (route === "navigate") {
      if (settings?.googleMapsUrl) {
        void Linking.openURL(settings.googleMapsUrl);
      }
      closeDrawer();
      return;
    }

    closeDrawer();

    if (!isActive(route)) {
      router.replace(route as never);
    }
  };

  const handleSignOut = async () => {
    closeDrawer();
    await signOut();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0E0E10", "#1A1A1F", "#2C2418", "#B8871B"]}
        locations={[0, 0.25, 0.6, 1]}
        start={{ x: 0.05, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerGlow} />

        <View style={styles.userRow}>
          <View style={styles.userIcon}>
            <View style={styles.userIconHead} />
            <View style={styles.userIconBody} />
          </View>
          <View style={styles.userDetails}>
            <Text numberOfLines={1} style={styles.userName}>
              {user?.full_name ?? "..."}
            </Text>
            {isAdmin && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>מנהל</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerCurve} />
      </LinearGradient>

      <ScrollView
        style={styles.menu}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        <Text style={styles.sectionLabel}>{sectionLabel}</Text>

        {items.map((item) => {
          const active = item.route !== "navigate" && isActive(item.route);

          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.menuItem,
                active && styles.menuItemActive,
                pressed && styles.itemPressed,
              ]}
              onPress={() => handleNavigate(item.route)}
            >
              {active && <View style={styles.activeBar} />}
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.itemPressed,
          ]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutLabel}>התנתקות</Text>
        </Pressable>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: 32,
    overflow: "hidden",
    minHeight: 132,
  },
  headerGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,193,59,0.10)",
    top: -60,
    right: -60,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  userDetails: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  userIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  userIconHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
    marginBottom: 3,
  },
  userIconBody: {
    width: 22,
    height: 10,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: colors.gold,
    opacity: 0.9,
  },
  userName: {
    color: colors.textWhite,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.4)",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  roleText: {
    color: colors.gold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  headerCurve: {
    position: "absolute",
    left: -10,
    right: -10,
    bottom: -12,
    height: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  menu: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuContent: {
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xs,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  itemPressed: {
    opacity: 0.72,
  },
  activeBar: {
    position: "absolute",
    right: 0,
    top: "20%",
    bottom: "20%",
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  itemLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  itemLabelActive: {
    color: colors.textGold,
    fontWeight: typography.weights.bold,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    opacity: 0.5,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.error}28`,
    backgroundColor: `${colors.error}08`,
  },
  signOutLabel: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
