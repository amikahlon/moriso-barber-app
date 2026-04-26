import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { OpenDay } from "../../src/api/schedule.api";
import { colors, spacing, typography } from "../../src/constants";
import { DayScheduleSheet } from "../../src/features/admin/components/DayScheduleSheet";
import { DefaultHoursSection } from "../../src/features/admin/components/DefaultHoursSection";
import { useOpenDaysManager } from "../../src/features/admin/hooks/useOpenDaysManager";
import { ScreenHeader } from "../../src/features/navigation";
import {
  buildFutureMonthSections,
  createCalendarRows,
  getMonthKey,
  getReadableDate,
  normalizeDateKey,
  parseDateKey,
} from "../../src/utils/calendar";

const WEEKDAY_LABELS = ["ש", "ו", "ה", "ד", "ג", "ב", "א"];
const MONTH_RANGE = 6;

export default function OpenDaysScreen() {
  const { openDays, isLoading, addDay, removeDay } = useOpenDaysManager();
  const [currentMonthIndex, setCurrentMonthIndex] = React.useState(0);
  const [selectedDayId, setSelectedDayId] = React.useState<string | null>(null);
  const monthSections = React.useMemo(
    () => buildFutureMonthSections(MONTH_RANGE),
    [],
  );
  const currentMonth = monthSections[currentMonthIndex];
  const todayKey = normalizeDateKey(new Date());
  const isPending = addDay.isPending || removeDay.isPending;

  const openDayByDate = React.useMemo(() => {
    return new Map(
      openDays.map((day) => [normalizeDateKey(parseDateKey(day.date)), day]),
    );
  }, [openDays]);

  const selectedDay = React.useMemo(() => {
    if (!selectedDayId) return null;
    return openDays.find((day) => day.id === selectedDayId) ?? null;
  }, [openDays, selectedDayId]);

  const calendarRows = React.useMemo(
    () => createCalendarRows(currentMonth.monthDate, { reverseWeeks: true }),
    [currentMonth.monthDate],
  );

  const customDaysCount = openDays.filter(
    (day) => day.customDayHours.length > 0,
  ).length;
  const blockedDaysCount = openDays.filter(
    (day) => day.blockedTimeRanges.length > 0,
  ).length;
  const currentMonthAttentionDays = React.useMemo(() => {
    const monthKey = getMonthKey(currentMonth.monthDate);

    return openDays
      .filter((day) => {
        const date = parseDateKey(day.date);
        const dayMonthKey = getMonthKey(date);
        const hasAttention =
          day.customDayHours.length > 0 || day.blockedTimeRanges.length > 0;

        return dayMonthKey === monthKey && hasAttention;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [currentMonth.monthDate, openDays]);

  const handleOpenClosedDay = (date: Date, dateKey: string) => {
    Alert.alert(
      "פתיחת יום",
      `לפתוח את ${getReadableDate(date)} לקבלת תורים?`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "פתח יום",
          onPress: () => addDay.mutate(dateKey),
        },
      ],
    );
  };

  const handleDayPress = (date: Date) => {
    const dateKey = normalizeDateKey(date);

    if (dateKey < todayKey) {
      Alert.alert("יום שעבר", "לא ניתן לפתוח או לערוך ימים שכבר עברו.");
      return;
    }

    const openDay = openDayByDate.get(dateKey);

    if (openDay) {
      setSelectedDayId(openDay.id);
      return;
    }

    handleOpenClosedDay(date, dateKey);
  };

  const handleDeleteDay = (day: OpenDay) => {
    Alert.alert(
      "סגירת יום",
      `לסגור את ${getReadableDate(parseDateKey(day.date))}? כל שעות היום והחסימות שהוגדרו עליו יימחקו.`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "סגור יום",
          style: "destructive",
          onPress: () =>
            removeDay.mutate(day.id, {
              onSuccess: () => setSelectedDayId(null),
            }),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="ניהול ימים פתוחים" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolbar}>
          <View style={styles.toolbarTitleWrap}>
            <Text style={styles.toolbarTitle}>ניהול זמינות</Text>
            <Text style={styles.toolbarSubtitle}>
              פתיחת ימים, חריגות ושעות עבודה קבועות.
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryTile}>
            <Text style={styles.summaryValue}>{openDays.length}</Text>
            <Text style={styles.summaryLabel}>ימים פתוחים</Text>
          </View>
          <View style={styles.summaryTile}>
            <Text style={styles.summaryValue}>{customDaysCount}</Text>
            <Text style={styles.summaryLabel}>מותאמים</Text>
          </View>
          <View style={styles.summaryTile}>
            <Text style={styles.summaryValue}>{blockedDaysCount}</Text>
            <Text style={styles.summaryLabel}>עם חסימה</Text>
          </View>
        </View>

        <View style={styles.sectionIntro}>
          <View style={styles.sectionAccent} />
          <View style={styles.sectionIntroText}>
            <Text style={styles.sectionTitle}>לוח שנה מרכזי</Text>
            <Text style={styles.sectionSubtitle}>פתיחת ימים ועריכת זמינות חודשית</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.monthButton,
                currentMonthIndex === monthSections.length - 1 &&
                  styles.monthButtonDisabled,
              ]}
              onPress={() =>
                setCurrentMonthIndex((prev) =>
                  Math.min(prev + 1, monthSections.length - 1),
                )
              }
              disabled={currentMonthIndex === monthSections.length - 1}
              activeOpacity={0.82}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.monthInfo}>
              <Text style={styles.monthTitle}>{currentMonth.label}</Text>
              <Text style={styles.monthHint}>
                יום פתוח נפתח לעריכה. יום סגור ייפתח בלחיצה.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.monthButton,
                currentMonthIndex === 0 && styles.monthButtonDisabled,
              ]}
              onPress={() => setCurrentMonthIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentMonthIndex === 0}
              activeOpacity={0.82}
            >
              <Text style={styles.monthButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthDotsRow}>
            {monthSections.map((section, index) => (
              <TouchableOpacity
                key={section.key}
                style={[
                  styles.monthDot,
                  index === currentMonthIndex && styles.monthDotActive,
                ]}
                onPress={() => setCurrentMonthIndex(index)}
                activeOpacity={0.8}
              />
            ))}
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <View key={label} style={styles.weekdaySlot}>
                <Text style={styles.weekdayLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>טוען ימים פתוחים...</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {calendarRows.map((row, rowIndex) => (
                <View key={`week-${rowIndex}`} style={styles.calendarRow}>
                  {row.map((cell, cellIndex) => {
                    if (!cell) {
                      return (
                        <View
                          key={`empty-${rowIndex}-${cellIndex}`}
                          style={styles.cellSlot}
                        >
                          <View style={styles.emptyCell} />
                        </View>
                      );
                    }

                    const dateKey = normalizeDateKey(cell);
                    const openDay = openDayByDate.get(dateKey);
                    const isOpen = !!openDay;
                    const isToday = dateKey === todayKey;
                    const isPast = dateKey < todayKey;
                    const hasCustomHours =
                      (openDay?.customDayHours.length ?? 0) > 0;
                    const hasBlockedTimes =
                      (openDay?.blockedTimeRanges.length ?? 0) > 0;

                    return (
                      <View key={dateKey} style={styles.cellSlot}>
                        <TouchableOpacity
                          style={[
                            styles.dayCell,
                            isOpen && styles.dayCellOpen,
                            hasCustomHours && styles.dayCellCustom,
                            hasBlockedTimes && styles.dayCellBlocked,
                            isToday && styles.dayCellToday,
                            isPast && styles.dayCellPast,
                          ]}
                          onPress={() => handleDayPress(cell)}
                          disabled={isPending}
                          activeOpacity={0.78}
                        >
                          <Text
                            style={[
                              styles.dayNumber,
                              isOpen && styles.dayNumberOpen,
                              isPast && styles.dayNumberPast,
                            ]}
                          >
                            {cell.getDate()}
                          </Text>

                          {isOpen ? (
                            <Text style={styles.dayStatus}>פתוח</Text>
                          ) : (
                            <Text style={styles.dayStatusClosed}>סגור</Text>
                          )}

                          {isOpen && (
                            <View style={styles.dayBands}>
                              {hasCustomHours || hasBlockedTimes ? (
                                <>
                                  {hasCustomHours && (
                                    <View style={styles.customBand}>
                                      <Text style={styles.customBandText}>שעות</Text>
                                    </View>
                                  )}
                                  {hasBlockedTimes && (
                                    <View style={styles.blockedBand}>
                                      <Text style={styles.blockedBandText}>
                                        חסימה
                                      </Text>
                                    </View>
                                  )}
                                </>
                              ) : (
                                <View style={styles.openBand}>
                                  <Text style={styles.openBandText}>פתוח</Text>
                                </View>
                              )}
                            </View>
                          )}

                          {isToday && !isOpen && <View style={styles.todayMarker} />}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.legendSwatchOpen]} />
              <Text style={styles.legendText}>פתוח</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.legendSwatchCustom]} />
              <Text style={styles.legendText}>שעות מותאמות</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.legendSwatchBlocked]} />
              <Text style={styles.legendText}>חסימת שעות</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.legendSwatchToday]} />
              <Text style={styles.legendText}>היום</Text>
            </View>
          </View>
        </View>

        <View style={styles.attentionPanel}>
          <View style={styles.attentionHeader}>
            <Text style={styles.attentionTitle}>ימים עם שינוי בחודש הזה</Text>
            <Text style={styles.attentionCount}>
              {currentMonthAttentionDays.length}
            </Text>
          </View>

          {currentMonthAttentionDays.length === 0 ? (
            <View style={styles.attentionEmpty}>
              <Text style={styles.attentionEmptyTitle}>אין ימים חריגים</Text>
              <Text style={styles.attentionEmptyText}>
                כל הימים הפתוחים בחודש הזה משתמשים בהגדרות הרגילות.
              </Text>
            </View>
          ) : (
            <View style={styles.attentionList}>
              {currentMonthAttentionDays.map((day) => {
                const date = parseDateKey(day.date);
                const customCount = day.customDayHours.length;
                const blockedCount = day.blockedTimeRanges.length;

                return (
                  <TouchableOpacity
                    key={day.id}
                    style={styles.attentionItem}
                    onPress={() => setSelectedDayId(day.id)}
                    activeOpacity={0.82}
                  >
                    <View style={styles.attentionDateBox}>
                      <Text style={styles.attentionDateDay}>
                        {date.getDate()}
                      </Text>
                      <Text style={styles.attentionDateMonth}>
                        {date.toLocaleDateString("he-IL", { month: "short" })}
                      </Text>
                    </View>

                    <View style={styles.attentionInfo}>
                      <Text style={styles.attentionDateText}>
                        {getReadableDate(date)}
                      </Text>
                      <View style={styles.attentionBadges}>
                        {customCount > 0 && (
                          <View style={styles.attentionCustomBadge}>
                            <Text style={styles.attentionCustomText}>
                              {customCount} טווחי שעות
                            </Text>
                          </View>
                        )}
                        {blockedCount > 0 && (
                          <View style={styles.attentionBlockedBadge}>
                            <Text style={styles.attentionBlockedText}>
                              {blockedCount} חסימות
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.defaultHoursWrap}>
          <DefaultHoursSection />
        </View>
      </ScrollView>

      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      )}

      <DayScheduleSheet
        day={selectedDay}
        isDeletingDay={removeDay.isPending}
        onClose={() => setSelectedDayId(null)}
        onDeleteDay={handleDeleteDay}
      />
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
  toolbarTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  toolbarTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  toolbarSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 19,
    marginTop: 2,
    textAlign: "right",
  },
  summaryRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  summaryTile: {
    flex: 1,
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
  summaryValue: {
    color: colors.textGold,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "center",
  },
  sectionIntro: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionIntroText: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionAccent: {
    width: 4,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  sectionDivider: {
    height: spacing.xl,
  },
  calendarCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonDisabled: {
    opacity: 0.3,
  },
  monthButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  monthInfo: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  monthTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  monthHint: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "center",
    lineHeight: 16,
  },
  monthDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  monthDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DDD6C8",
  },
  monthDotActive: {
    width: 18,
    backgroundColor: colors.gold,
  },
  weekdayRow: {
    flexDirection: "row",
    direction: "ltr",
    marginBottom: spacing.sm,
  },
  weekdaySlot: {
    width: "14.285714%",
    paddingHorizontal: 3,
  },
  weekdayLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  grid: {
    gap: 2,
  },
  calendarRow: {
    flexDirection: "row",
    direction: "ltr",
  },
  cellSlot: {
    width: "14.285714%",
    padding: 3,
  },
  emptyCell: {
    aspectRatio: 0.66,
  },
  dayCell: {
    aspectRatio: 0.66,
    borderRadius: 12,
    backgroundColor: "#F2EDE4",
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    paddingTop: 4,
    paddingBottom: 18,
    overflow: "hidden",
  },
  dayCellOpen: {
    backgroundColor: "#FFF9EE",
    borderColor: colors.goldBorder,
  },
  dayCellCustom: {
    borderColor: "rgba(14,14,16,0.28)",
    borderWidth: 1.4,
  },
  dayCellBlocked: {
    borderBottomColor: colors.error,
    borderBottomWidth: 3,
  },
  dayCellToday: {
    borderColor: colors.gold,
    borderWidth: 1.6,
  },
  dayCellPast: {
    opacity: 0.38,
  },
  dayNumber: {
    color: "#958B7E",
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  dayNumberOpen: {
    color: colors.textPrimary,
  },
  dayNumberPast: {
    color: colors.textLight,
  },
  dayStatus: {
    color: colors.textGold,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  dayStatusClosed: {
    color: colors.textLight,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  dayBands: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 4,
    gap: 2,
  },
  openBand: {
    minHeight: 12,
    borderRadius: 5,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  openBandText: {
    color: colors.textGold,
    fontSize: 7,
    fontWeight: typography.weights.extraBold,
    lineHeight: 9,
  },
  customBand: {
    minHeight: 11,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  customBandText: {
    color: colors.gold,
    fontSize: 7,
    fontWeight: typography.weights.extraBold,
    lineHeight: 9,
  },
  blockedBand: {
    minHeight: 11,
    borderRadius: 5,
    backgroundColor: "rgba(224,92,92,0.12)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.26)",
    alignItems: "center",
    justifyContent: "center",
  },
  blockedBandText: {
    color: colors.error,
    fontSize: 7,
    fontWeight: typography.weights.extraBold,
    lineHeight: 9,
  },
  todayMarker: {
    position: "absolute",
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  legendRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 11,
    height: 11,
    borderRadius: 999,
  },
  legendSwatchOpen: {
    backgroundColor: "#FFF9EE",
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  legendSwatchCustom: {
    backgroundColor: colors.primary,
  },
  legendSwatchBlocked: {
    backgroundColor: colors.error,
  },
  legendSwatchToday: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  loadingState: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14,14,16,0.26)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  attentionPanel: {
    marginTop: spacing.xxxl,
    borderRadius: 18,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.lg,
  },
  attentionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  attentionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  attentionCount: {
    minWidth: 30,
    borderRadius: 999,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    color: colors.textGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    textAlign: "center",
  },
  attentionEmpty: {
    minHeight: 92,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  attentionEmptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  attentionEmptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 3,
    textAlign: "center",
  },
  attentionList: {
    gap: spacing.sm,
  },
  attentionItem: {
    minHeight: 78,
    borderRadius: 14,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  defaultHoursWrap: {
    marginTop: spacing.xxxl,
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  attentionDateBox: {
    width: 48,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  attentionDateDay: {
    color: colors.gold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  attentionDateMonth: {
    color: "rgba(255,255,255,0.72)",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  attentionInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  attentionDateText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  attentionBadges: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  attentionCustomBadge: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.42)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  attentionCustomText: {
    color: colors.gold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  attentionBlockedBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(224,92,92,0.08)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.24)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  attentionBlockedText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
});
