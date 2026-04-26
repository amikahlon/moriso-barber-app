import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, spacing, typography } from "../../src/constants";
import { BookingRow } from "../../src/features/admin/components/BookingRow";
import { useAdminOpenDays } from "../../src/features/admin/hooks/useAdminOpenDays";
import { useBookingsByDate } from "../../src/features/admin/hooks/useBookingsByDate";
import { useBookingsForOpenDays } from "../../src/features/admin/hooks/useBookingsForOpenDays";
import { useCancelBooking } from "../../src/features/admin/hooks/useCancelBooking";
import { DrawerToggle } from "../../src/features/navigation";

type ViewMode = "today" | "all";

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseOpenDayDate = (date: string) => {
  const [year, month, day] = date.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const formatFullDate = (date: Date) =>
  date.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export default function AdminScheduleScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const todayKey = toLocalDateKey(new Date());
  const openDaysQuery = useAdminOpenDays();
  const todayBookingsQuery = useBookingsByDate(todayKey);
  const cancelMutation = useCancelBooking();

  const openDays = useMemo(() => {
    return (openDaysQuery.data ?? [])
      .map((day) => {
        const date = parseOpenDayDate(day.date);
        return { id: day.id, date, dateKey: toLocalDateKey(date) };
      })
      .filter((day) => day.dateKey >= todayKey)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [openDaysQuery.data, todayKey]);

  const bookingsForOpenDays = useBookingsForOpenDays(
    openDays.map((day) => day.dateKey),
  );

  const todayBookings = useMemo(
    () =>
      [...(todayBookingsQuery.data ?? [])].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    [todayBookingsQuery.data],
  );

  const openDayGroups = useMemo(() => {
    return openDays.map((day) => {
      const group = bookingsForOpenDays.groups.find(
        (item) => item.dateKey === day.dateKey,
      );
      const bookings = [...(group?.bookings ?? [])].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );

      return {
        ...day,
        bookings,
        isLoading: group?.isLoading ?? false,
      };
    });
  }, [bookingsForOpenDays.groups, openDays]);

  const groupsWithBookings = openDayGroups.filter(
    (group) => group.bookings.length > 0,
  );
  const allBookings = openDayGroups.flatMap((group) => group.bookings);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#0E0E10", "#1A1A1F", "#2B2418", "#A97819"]}
        locations={[0, 0.32, 0.72, 1]}
        start={{ x: 0.04, y: 0.08 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroOrb} />
        <View style={styles.heroLine} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroSpacer} />
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.menuButtonWrap}>
            <DrawerToggle />
          </View>
        </View>

        <View style={styles.heroBody}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>יומן תורים</Text>
          </View>
        </View>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{todayBookings.length}</Text>
            <Text style={styles.heroStatLabel}>תורים היום</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{allBookings.length}</Text>
            <Text style={styles.heroStatLabel}>תורים בכל הימים</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{openDays.length}</Text>
            <Text style={styles.heroStatLabel}>ימים פתוחים</Text>
          </View>
        </View>

        <View style={styles.bottomSweep} />
      </LinearGradient>

      <View style={styles.modeSection}>
        <View style={styles.modeControl}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              viewMode === "all" && styles.modeButtonActive,
            ]}
            onPress={() => setViewMode("all")}
            activeOpacity={0.84}
          >
            <Text
              style={[
                styles.modeButtonText,
                viewMode === "all" && styles.modeButtonTextActive,
              ]}
            >
              כל הימים
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              viewMode === "today" && styles.modeButtonActive,
            ]}
            onPress={() => setViewMode("today")}
            activeOpacity={0.84}
          >
            <Text
              style={[
                styles.modeButtonText,
                viewMode === "today" && styles.modeButtonTextActive,
              ]}
            >
              היום
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={styles.panelTitleWrap}>
            <Text style={styles.panelTitle}>
              {viewMode === "today" ? "התורים של היום" : "כל ימי העבודה"}
            </Text>
          </View>
        </View>

        {viewMode === "today" ? (
          todayBookingsQuery.isLoading ? (
            <LoadingState label="טוען תורי היום..." />
          ) : todayBookings.length === 0 ? (
            <EmptyState
              title="אין תורים היום"
              text="אם היום פתוח ונקבעו תורים, הם יופיעו כאן."
            />
          ) : (
            <View style={styles.bookingsList}>
              {todayBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  isCancelling={cancelMutation.isPending}
                />
              ))}
            </View>
          )
        ) : openDaysQuery.isLoading || bookingsForOpenDays.isLoading ? (
          <LoadingState label="טוען את כל ימי העבודה..." />
        ) : openDays.length === 0 ? (
          <EmptyState
            title="אין ימים פתוחים קרובים"
            text="כשהספר יפתח ימים ביומן, התורים שלהם יופיעו כאן."
          />
        ) : allBookings.length === 0 ? (
          <EmptyState
            title="אין תורים בימים הפתוחים"
            text="יש ימים פתוחים, אבל עדיין לא נקבעו אליהם תורים."
          />
        ) : (
          <View style={styles.groupList}>
            {groupsWithBookings.map((group) => {
              const isToday = group.dateKey === todayKey;

              return (
                <View key={group.id} style={styles.dayGroup}>
                  <View style={styles.dayGroupHeader}>
                    <View style={styles.dayDateBox}>
                      <Text style={styles.dayDateNumber}>
                        {group.date.getDate()}
                      </Text>
                      <Text style={styles.dayDateMonth}>
                        {group.date.toLocaleDateString("he-IL", {
                          month: "short",
                        })}
                      </Text>
                    </View>

                    <View style={styles.dayGroupTitleWrap}>
                      <View style={styles.dayGroupTitleRow}>
                        {isToday && (
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>היום</Text>
                          </View>
                        )}
                        <Text style={styles.dayGroupTitle}>
                          {formatFullDate(group.date)}
                        </Text>
                      </View>

                      <Text style={styles.dayMetaText}>
                        {group.bookings.length} תורים
                      </Text>
                    </View>
                  </View>

                  <View style={styles.daySummaryRow}>
                    <View style={styles.summaryChip}>
                      <Text style={styles.summaryChipValue}>
                        {group.bookings[0]?.startTime ?? "--:--"}
                      </Text>
                      <Text style={styles.summaryChipLabel}>תור ראשון</Text>
                    </View>

                    <View style={styles.summaryChip}>
                      <Text style={styles.summaryChipValue}>
                        {group.bookings[group.bookings.length - 1]?.startTime ??
                          "--:--"}
                      </Text>
                      <Text style={styles.summaryChipLabel}>תור אחרון</Text>
                    </View>
                  </View>

                  <View style={styles.bookingsList}>
                    {group.bookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        onCancel={(id) => cancelMutation.mutate(id)}
                        isCancelling={cancelMutation.isPending}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  hero: {
    paddingTop: 50,
    paddingHorizontal: spacing.xl,
    paddingBottom: 24,
    overflow: "hidden",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,193,59,0.10)",
    top: -48,
    right: -40,
  },
  heroLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: "22%",
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  heroSpacer: {
    width: 48,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  logo: {
    width: 164,
    height: 54,
  },
  menuButtonWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroBody: {
    alignItems: "flex-end",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.40)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  roleBadgeText: {
    color: colors.gold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroStat: {
    flex: 1,
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
  heroStatValue: {
    color: colors.gold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    marginBottom: 2,
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  bottomSweep: {
    position: "absolute",
    left: -12,
    right: -12,
    bottom: -10,
    height: 26,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modeSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  modeControl: {
    flexDirection: "row",
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  modeButtonTextActive: {
    color: colors.gold,
  },
  panel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: "transparent",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  panelTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  loadingState: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 21,
    textAlign: "center",
  },
  groupList: {
    gap: spacing.xl,
  },
  dayGroup: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.16)",
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  dayGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dayDateBox: {
    width: 56,
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  dayDateNumber: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  dayDateMonth: {
    color: "rgba(14,14,16,0.72)",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  dayGroupTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },
  dayGroupTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  dayGroupTitle: {
    color: colors.textWhite,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  dayMetaText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  daySummaryRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    backgroundColor: "#FFFCF4",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,164,42,0.12)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.16)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  summaryChipValue: {
    color: colors.textGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  summaryChipLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  todayBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(212,164,42,0.18)",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.42)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  todayBadgeText: {
    color: colors.gold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  bookingsList: {
    gap: spacing.sm,
    padding: spacing.md,
  },
});
