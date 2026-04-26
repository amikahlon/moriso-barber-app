import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { bookingsApi } from "../../src/api";
import { colors, spacing, typography } from "../../src/constants";
import { useAdminStats } from "../../src/features/admin/hooks/useAdminStats";
import { useUsers } from "../../src/features/admin/hooks/useUsers";
import { useCurrentUserQuery } from "../../src/features/auth/hooks";
import { DrawerToggle } from "../../src/features/navigation";

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const getShortDayLabel = (date: Date) =>
  new Intl.DateTimeFormat("he-IL", { weekday: "short" }).format(date);

const getDayNumberLabel = (date: Date) =>
  new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" }).format(
    date,
  );

export default function AdminHomeScreen() {
  const { data: user } = useCurrentUserQuery();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(new Date(), index);

        return {
          date,
          key: getLocalDateKey(date),
          dayLabel: index === 0 ? "היום" : getShortDayLabel(date),
          dateLabel: getDayNumberLabel(date),
        };
      }),
    [],
  );

  const weeklyBookingsQueries = useQueries({
    queries: weekDays.map((day) => ({
      queryKey: ["admin-bookings", day.key],
      queryFn: () => bookingsApi.getAllByDate(day.key),
      staleTime: 60 * 1000,
    })),
  });

  const weekLoad = weekDays.map((day, index) => {
    const bookings = weeklyBookingsQueries[index]?.data ?? [];
    const activeCount = bookings.filter(
      (booking) => booking.status === "active",
    ).length;

    return {
      ...day,
      count: activeCount,
      total: bookings.length,
    };
  });

  const maxLoad = Math.max(...weekLoad.map((item) => item.count), 1);
  const today = weekLoad[0];
  const peakDay = weekLoad.reduce(
    (peak, item) => (item.count > peak.count ? item : peak),
    weekLoad[0],
  );
  const weeklyBookingsLoading = weeklyBookingsQueries.some(
    (query) => query.isLoading,
  );
  const isLoading = statsLoading || usersLoading || weeklyBookingsLoading;
  const now = new Date();
  const upcomingBookings = weekDays
    .flatMap((day, index) =>
      (weeklyBookingsQueries[index]?.data ?? [])
        .filter((booking) => booking.status === "active")
        .map((booking) => {
          const [hour = 0, minute = 0] = booking.startTime
            .split(":")
            .map(Number);
          const startsAt = new Date(day.date);
          startsAt.setHours(hour, minute, 0, 0);

          return { booking, day, startsAt };
        }),
    )
    .filter((item) => item.startsAt >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const nextBooking = upcomingBookings[0];

  const metricCards = [
    {
      label: "לקוחות היום",
      value: isLoading ? "..." : String(stats?.todayBookings ?? 0),
      tone: "gold" as const,
    },
    {
      label: "משתמשים",
      value: usersLoading ? "..." : String(users.length),
      tone: "dark" as const,
    },
    {
      label: "שירותים",
      value: statsLoading ? "..." : String(stats?.totalServices ?? 0),
      tone: "muted" as const,
    },
  ];

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

        <View style={styles.greetingContainer}>
          <View style={styles.panelTitleRow}>
            <View style={styles.panelIcon}>
              <View style={styles.panelIconBarTall} />
              <View style={styles.panelIconBarMid} />
              <View style={styles.panelIconBarShort} />
            </View>
            <Text style={styles.panelTitle}>פאנל ניהול</Text>
          </View>
          <Text style={styles.greeting}>
            שלום, {user?.full_name ?? "מנהל"}
          </Text>
        </View>

        <View style={styles.bottomSweep} />
      </LinearGradient>

      <View style={styles.metricsGrid}>
        {metricCards.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <Text
              style={[
                styles.metricValue,
                metric.tone === "gold" && styles.metricGold,
                metric.tone === "muted" && styles.metricMuted,
              ]}
            >
              {metric.value}
            </Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View style={styles.chartBadges}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeValue}>{today.count}</Text>
              <Text style={styles.todayBadgeLabel}>היום</Text>
            </View>

            <View style={styles.peakBadge}>
              <Text style={styles.peakValue}>
                {peakDay.count > 0 ? peakDay.dayLabel : "--"}
              </Text>
              <Text style={styles.peakLabel}>שיא</Text>
            </View>
          </View>

          <View style={styles.chartTitleWrap}>
            <Text style={styles.chartTitle}>עומס שבועי</Text>
            <Text style={styles.chartSubtitle}>תורים פעילים מהיום קדימה</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {weekLoad.map((item) => {
              const barHeight = Math.max(8, (item.count / maxLoad) * 118);
              const isPeak = item.count > 0 && item.key === peakDay.key;
              const isToday = item.key === today.key;

              return (
                <View
                  key={item.key}
                  style={[styles.barColumn, isToday && styles.barColumnToday]}
                >
                  <Text
                    style={[
                      styles.barValue,
                      isToday && styles.barValueToday,
                      isPeak && !isToday && styles.barValuePeak,
                    ]}
                  >
                    {item.count > 0 ? item.count : ""}
                  </Text>
                  <View style={[styles.barTrack, isToday && styles.barTrackToday]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: barHeight },
                        isPeak && styles.barFillPeak,
                        isToday && styles.barFillToday,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      isPeak && styles.barLabelPeak,
                      isToday && styles.barLabelToday,
                    ]}
                  >
                    {item.dayLabel}
                  </Text>
                  <Text style={styles.barDateLabel}>{item.dateLabel}</Text>
                  {isPeak && !isToday && <View style={styles.peakMarker} />}
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>היום</Text>
            <View style={styles.chartFooterLine} />
            <Text style={styles.chartFooterText}>7 ימים</Text>
          </View>
        </View>
      </View>

      <View style={styles.nextBookingPanel}>
        <View style={styles.nextBookingHeader}>
          <Text style={styles.nextBookingTitle}>התור הקרוב ביותר</Text>
          <Text style={styles.nextBookingSubtitle}>לפי השבוע הקרוב</Text>
        </View>

        {nextBooking ? (
          <View style={styles.nextBookingBody}>
            <View style={styles.nextBookingTimeBadge}>
              <Text style={styles.nextBookingTime}>
                {nextBooking.booking.startTime}
              </Text>
              <Text style={styles.nextBookingDay}>
                {nextBooking.day.dayLabel}
              </Text>
            </View>

            <View style={styles.nextBookingInfo}>
              <Text numberOfLines={1} style={styles.nextBookingName}>
                {nextBooking.booking.user?.fullName ?? "לקוח"}
              </Text>
              <Text numberOfLines={1} style={styles.nextBookingService}>
                {nextBooking.booking.service?.name ?? "שירות"}
              </Text>
              <Text style={styles.nextBookingDate}>
                {nextBooking.startsAt.toLocaleDateString("he-IL", {
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noNextBooking}>
            <Text style={styles.noNextBookingText}>אין תורים קרובים</Text>
          </View>
        )}
      </View>

      <View style={styles.appFooter}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerBeta}>גרסת בטא Beta</Text>
        <Text style={styles.footerCredit}>
          פותח על ידי עמי כחלון | 0525522227
        </Text>
      </View>
    </ScrollView>
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
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: 34,
    overflow: "hidden",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
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
  greetingContainer: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  panelTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  panelIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.42)",
    backgroundColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    paddingBottom: 8,
  },
  panelIconBarTall: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  panelIconBarMid: {
    width: 4,
    height: 11,
    borderRadius: 2,
    backgroundColor: colors.goldLight,
  },
  panelIconBarShort: {
    width: 4,
    height: 7,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  greeting: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    color: "rgba(255,255,255,0.76)",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  panelTitle: {
    color: colors.textWhite,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
    marginBottom: spacing.xs,
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
  metricsGrid: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: spacing.md,
  },
  metricCard: {
    width: 88,
    maxWidth: 88,
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  metricGold: {
    color: colors.textGold,
  },
  metricMuted: {
    color: colors.textSecondary,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "center",
  },
  chartSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  chartTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  chartTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  chartSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  chartBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  todayBadge: {
    minWidth: 76,
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  todayBadgeValue: {
    color: colors.gold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  todayBadgeLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  peakBadge: {
    minWidth: 58,
    minHeight: 42,
    borderRadius: 13,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  peakValue: {
    color: colors.textGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  peakLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  chartCard: {
    borderRadius: 22,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  chartBars: {
    height: 168,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    paddingTop: spacing.xs,
  },
  barColumnToday: {
    borderRadius: 14,
    backgroundColor: "rgba(14,14,16,0.035)",
  },
  barValue: {
    height: 16,
    color: colors.textLight,
    fontSize: 10,
    fontWeight: typography.weights.extraBold,
  },
  barValueToday: {
    color: colors.textPrimary,
  },
  barValuePeak: {
    color: colors.textGold,
  },
  barTrack: {
    width: "100%",
    maxWidth: 18,
    height: 122,
    borderRadius: 999,
    backgroundColor: colors.backgroundInput,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barTrackToday: {
    maxWidth: 24,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: "#EFE8DA",
  },
  barFill: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(154,144,130,0.34)",
  },
  barFillPeak: {
    backgroundColor: colors.goldLight,
  },
  barFillToday: {
    backgroundColor: colors.primary,
  },
  barLabel: {
    marginTop: spacing.xs,
    color: colors.textLight,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  barLabelPeak: {
    color: colors.textGold,
  },
  barLabelToday: {
    color: colors.textPrimary,
    fontWeight: typography.weights.extraBold,
  },
  barDateLabel: {
    color: colors.textLight,
    fontSize: 9,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  peakMarker: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.gold,
    marginTop: 3,
  },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chartFooterText: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  chartFooterLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },
  nextBookingPanel: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  nextBookingHeader: {
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  nextBookingTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  nextBookingSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  nextBookingBody: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
  nextBookingTimeBadge: {
    width: 82,
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBookingTime: {
    color: colors.gold,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  nextBookingDay: {
    color: "rgba(255,255,255,0.7)",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  nextBookingInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },
  nextBookingName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  nextBookingService: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  nextBookingDate: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  noNextBooking: {
    minHeight: 68,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  noNextBookingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  appFooter: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    alignItems: "center",
  },
  footerDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    opacity: 0.7,
    marginBottom: spacing.md,
  },
  footerBeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  footerCredit: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 3,
    textAlign: "center",
  },
});
