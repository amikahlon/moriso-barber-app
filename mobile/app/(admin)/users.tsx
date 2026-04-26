import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { AdminUser } from "../../src/api/users.api";
import { colors, spacing, typography } from "../../src/constants";
import { useUsers } from "../../src/features/admin/hooks/useUsers";
import { ScreenHeader } from "../../src/features/navigation";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getInitial = (name: string) => name.trim().charAt(0) || "?";

export default function AdminUsersScreen() {
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (!normalizedSearch) {
          return true;
        }

        return [user.fullName, user.phone, user.email]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort(
        (a, b) =>
          Number(b.role === "admin") - Number(a.role === "admin") ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [normalizedSearch, users]);

  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  const renderUser = (user: AdminUser) => {
    const isAdmin = user.role === "admin";

    return (
      <View
        key={user.id}
        style={[styles.userCard, isAdmin && styles.userCardAdmin]}
      >
        {isAdmin && <View style={styles.adminAccent} />}

        <View style={[styles.avatar, isAdmin && styles.avatarAdmin]}>
          <Text style={[styles.avatarText, isAdmin && styles.avatarTextAdmin]}>
            {getInitial(user.fullName)}
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            {isAdmin && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>מנהל</Text>
              </View>
            )}

            <Text numberOfLines={1} style={styles.userName}>
              {user.fullName}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.userContact}>
            {user.phone}
          </Text>

          <Text numberOfLines={1} style={styles.userEmail}>
            {user.email}
          </Text>

          <View style={styles.detailsRow}>
            {user.birthDate && (
              <Text style={styles.detailText}>
                לידה: {formatDate(user.birthDate)}
              </Text>
            )}
            <Text style={styles.detailText}>
              הצטרף: {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="ניהול משתמשים" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="חיפוש"
              placeholderTextColor={colors.textLight}
              textAlign="right"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>סה"כ</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{customerCount}</Text>
            <Text style={styles.statLabel}>לקוחות</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={[styles.statValue, styles.adminValue]}>
              {adminCount}
            </Text>
            <Text style={styles.statLabel}>מנהלים</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>טוען משתמשים...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>לא נמצאו משתמשים</Text>
            <Text style={styles.emptyText}>
              נסה לחפש לפי שם, מספר טלפון או כתובת מייל אחרת.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>{filteredUsers.map(renderUser)}</View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  searchBox: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  searchInput: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  adminValue: {
    color: colors.textGold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  loadingState: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    minHeight: 240,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  list: {
    gap: spacing.md,
  },
  userCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  userCardAdmin: {
    borderColor: colors.goldBorder,
    backgroundColor: "#FFFEFA",
  },
  adminAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.gold,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarAdmin: {
    backgroundColor: colors.goldMuted,
    borderColor: colors.goldBorder,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  avatarTextAdmin: {
    color: colors.textGold,
  },
  cardInfo: {
    flex: 1,
    alignItems: "flex-end",
    minWidth: 0,
  },
  cardTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  userName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: colors.textGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  userContact: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  userEmail: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  detailsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    textAlign: "right",
  },
});
