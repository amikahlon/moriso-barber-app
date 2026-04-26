import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { BlockedTimeRange, CustomDayHour, OpenDay } from "../../../api/schedule.api";
import { colors, spacing, typography } from "../../../constants";
import { getReadableDate, parseDateKey } from "../../../utils/calendar";
import { useDaySchedule } from "../hooks/useDaySchedule";

interface DayScheduleSheetProps {
  day: OpenDay | null;
  isDeletingDay?: boolean;
  onClose: () => void;
  onDeleteDay: (day: OpenDay) => void;
}

type TabType = "custom" | "blocked";
type TimeRange = CustomDayHour | BlockedTimeRange;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const QUICK_CUSTOM_RANGES = [
  { label: "בוקר", start: "09:00", end: "14:00" },
  { label: "יום מלא", start: "09:00", end: "19:00" },
  { label: "ערב", start: "16:00", end: "21:00" },
];

const QUICK_BLOCK_RANGES = [
  { label: "הפסקה", start: "13:00", end: "14:00" },
  { label: "סידור", start: "15:00", end: "16:00" },
  { label: "חצי יום", start: "09:00", end: "13:00" },
];

const getReadableDateLabel = (dateStr: string) =>
  getReadableDate(parseDateKey(dateStr));

const sortRanges = <T extends TimeRange>(ranges: T[]) =>
  ranges.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));

export const DayScheduleSheet: React.FC<DayScheduleSheetProps> = ({
  day,
  isDeletingDay = false,
  onClose,
  onDeleteDay,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("custom");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { addCustomHour, removeCustomHour, addBlockedTime, removeBlockedTime } =
    useDaySchedule(day?.id ?? "");

  const customHours = useMemo(
    () => sortRanges(day?.customDayHours ?? []),
    [day?.customDayHours],
  );
  const blockedTimes = useMemo(
    () => sortRanges(day?.blockedTimeRanges ?? []),
    [day?.blockedTimeRanges],
  );

  const isPending =
    addCustomHour.isPending ||
    removeCustomHour.isPending ||
    addBlockedTime.isPending ||
    removeBlockedTime.isPending ||
    isDeletingDay;

  const activeItems = activeTab === "custom" ? customHours : blockedTimes;
  const quickRanges =
    activeTab === "custom" ? QUICK_CUSTOM_RANGES : QUICK_BLOCK_RANGES;

  useEffect(() => {
    if (!day) {
      setStartTime("");
      setEndTime("");
      setActiveTab("custom");
    }
  }, [day]);

  const resetInputs = () => {
    setStartTime("");
    setEndTime("");
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    resetInputs();
  };

  const handleQuickRange = (range: (typeof QUICK_CUSTOM_RANGES)[number]) => {
    setStartTime(range.start);
    setEndTime(range.end);
  };

  const validateRange = () => {
    if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
      Alert.alert("שעה לא תקינה", "יש להזין שעות בפורמט HH:MM, למשל 09:00.");
      return false;
    }

    if (startTime >= endTime) {
      Alert.alert("טווח לא תקין", "שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    if (!day || !validateRange()) return;

    const dto = { startTime, endTime };
    const mutation = activeTab === "custom" ? addCustomHour : addBlockedTime;

    mutation.mutate(dto, {
      onSuccess: resetInputs,
      onError: () => {
        Alert.alert("שגיאה", "הפעולה נכשלה. נסה שוב בעוד רגע.");
      },
    });
  };

  const handleRemoveCustom = (range: CustomDayHour) => {
    Alert.alert(
      "מחיקת שעות מותאמות",
      `למחוק את ${range.startTime}-${range.endTime}?`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => removeCustomHour.mutate(range.id),
        },
      ],
    );
  };

  const handleRemoveBlocked = (range: BlockedTimeRange) => {
    Alert.alert("ביטול חסימה", `לבטל את החסימה ${range.startTime}-${range.endTime}?`, [
      { text: "ביטול", style: "cancel" },
      {
        text: "בטל חסימה",
        style: "destructive",
        onPress: () => removeBlockedTime.mutate(range.id),
      },
    ]);
  };

  const renderRange = (range: TimeRange) => {
    const isBlocked = activeTab === "blocked";

    return (
      <View
        key={range.id}
        style={[styles.rangeRow, isBlocked && styles.rangeRowBlocked]}
      >
        <TouchableOpacity
          style={[styles.rangeDelete, isBlocked && styles.rangeDeleteBlocked]}
          onPress={() =>
            isBlocked
              ? handleRemoveBlocked(range as BlockedTimeRange)
              : handleRemoveCustom(range as CustomDayHour)
          }
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.rangeDeleteText,
              isBlocked && styles.rangeDeleteTextBlocked,
            ]}
          >
            מחק
          </Text>
        </TouchableOpacity>

        <View style={styles.rangeInfo}>
          <Text style={[styles.rangeTime, isBlocked && styles.rangeTimeBlocked]}>
            {range.startTime}-{range.endTime}
          </Text>
          <Text style={styles.rangeLabel}>
            {isBlocked ? "לקוחות לא יוכלו לקבוע בטווח הזה" : "מחליף את שעות ברירת המחדל"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={!!day}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <View style={styles.titleWrap}>
              <Text style={styles.title}>
                {day ? getReadableDateLabel(day.date) : ""}
              </Text>
              <Text style={styles.subtitle}>ניהול שעות וחסימות ליום הזה</Text>
            </View>
          </View>

          <View style={styles.overviewRow}>
            <View style={styles.overviewTile}>
              <Text style={styles.overviewValue}>{customHours.length}</Text>
              <Text style={styles.overviewLabel}>שעות מותאמות</Text>
            </View>
            <View style={[styles.overviewTile, styles.overviewTileBlocked]}>
              <Text style={[styles.overviewValue, styles.overviewValueBlocked]}>
                {blockedTimes.length}
              </Text>
              <Text style={styles.overviewLabel}>חסימות</Text>
            </View>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "custom" && styles.tabActive]}
              onPress={() => switchTab("custom")}
              activeOpacity={0.84}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "custom" && styles.tabTextActive,
                ]}
              >
                שעות מותאמות
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "blocked" && styles.tabActiveBlocked,
              ]}
              onPress={() => switchTab("blocked")}
              activeOpacity={0.84}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "blocked" && styles.tabTextBlockedActive,
                ]}
              >
                חסימות
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.explainBox}>
              <Text style={styles.explainTitle}>
                {activeTab === "custom" ? "מה זה שעות מותאמות?" : "מה זה חסימת שעות?"}
              </Text>
              <Text style={styles.explainText}>
                {activeTab === "custom"
                  ? "אם מוסיפים שעות מותאמות, היום הזה יעבוד לפי הטווחים כאן במקום שעות ברירת המחדל."
                  : "חסימה סוגרת חלק מהיום, גם אם היום פתוח ויש לו שעות עבודה."}
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === "custom" ? "טווחי עבודה ביום" : "חסימות ביום"}
              </Text>
              <Text style={styles.sectionCount}>{activeItems.length}</Text>
            </View>

            <View style={styles.rangesList}>
              {activeItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>
                    {activeTab === "custom"
                      ? "אין שעות מותאמות"
                      : "אין חסימות ביום הזה"}
                  </Text>
                  <Text style={styles.emptyText}>
                    {activeTab === "custom"
                      ? "היום משתמש בשעות ברירת המחדל."
                      : "כל שעות העבודה הזמינות נשארות פתוחות ללקוחות."}
                  </Text>
                </View>
              ) : (
                activeItems.map(renderRange)
              )}
            </View>

            <View style={styles.addPanel}>
              <Text style={styles.addTitle}>
                {activeTab === "custom" ? "הוספת טווח עבודה" : "הוספת חסימה"}
              </Text>

              <View style={styles.quickRanges}>
                {quickRanges.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={styles.quickRange}
                    onPress={() => handleQuickRange(range)}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.quickRangeLabel}>{range.label}</Text>
                    <Text style={styles.quickRangeTime}>
                      {range.start}-{range.end}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>סיום</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="18:00"
                    placeholderTextColor={colors.textLight}
                    value={endTime}
                    onChangeText={setEndTime}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    textAlign="center"
                  />
                </View>

                <Text style={styles.timeDash}>-</Text>

                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>התחלה</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    placeholderTextColor={colors.textLight}
                    value={startTime}
                    onChangeText={setStartTime}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    textAlign="center"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  activeTab === "blocked" && styles.addButtonBlocked,
                  isPending && styles.disabled,
                ]}
                onPress={handleAdd}
                disabled={isPending}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator
                    color={
                      activeTab === "custom" ? colors.primary : colors.textWhite
                    }
                    size="small"
                  />
                ) : (
                  <Text
                    style={[
                      styles.addButtonText,
                      activeTab === "blocked" && styles.addButtonTextBlocked,
                    ]}
                  >
                    {activeTab === "custom" ? "הוסף שעות" : "הוסף חסימה"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.dangerZone}>
              <View style={styles.dangerTextWrap}>
                <Text style={styles.dangerTitle}>סגירת היום כולו</Text>
                <Text style={styles.dangerText}>
                  הפעולה תסיר את היום מהיומן יחד עם השעות והחסימות שלו.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteDayButton, isDeletingDay && styles.disabled]}
                onPress={() => day && onDeleteDay(day)}
                disabled={!day || isDeletingDay}
                activeOpacity={0.82}
              >
                {isDeletingDay ? (
                  <ActivityIndicator color={colors.error} size="small" />
                ) : (
                  <Text style={styles.deleteDayButtonText}>סגור יום</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(14,14,16,0.52)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    maxHeight: "92%",
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: "#FFFCF4",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,164,42,0.12)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
  },
  titleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "right",
  },
  overviewRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  overviewTile: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  overviewTileBlocked: {
    backgroundColor: "rgba(224,92,92,0.06)",
    borderColor: "rgba(224,92,92,0.18)",
  },
  overviewValue: {
    color: colors.textGold,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  overviewValueBlocked: {
    color: colors.error,
  },
  overviewLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  tabs: {
    flexDirection: "row-reverse",
    backgroundColor: colors.backgroundInput,
    borderRadius: 14,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabActiveBlocked: {
    backgroundColor: colors.error,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  tabTextActive: {
    color: colors.gold,
  },
  tabTextBlockedActive: {
    color: colors.textWhite,
  },
  body: {
    marginTop: spacing.md,
  },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  explainBox: {
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "flex-end",
  },
  explainTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  explainText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
    marginTop: 3,
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  sectionCount: {
    minWidth: 28,
    borderRadius: 999,
    backgroundColor: colors.backgroundInput,
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    textAlign: "center",
    overflow: "hidden",
  },
  rangesList: {
    gap: spacing.sm,
  },
  emptyState: {
    minHeight: 82,
    borderRadius: 14,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "center",
  },
  rangeRow: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: "#FFF9EE",
    borderWidth: 1,
    borderColor: colors.goldBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  rangeRowBlocked: {
    backgroundColor: "rgba(224,92,92,0.06)",
    borderColor: "rgba(224,92,92,0.20)",
  },
  rangeDelete: {
    minWidth: 52,
    minHeight: 32,
    borderRadius: 10,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  rangeDeleteBlocked: {
    borderColor: "rgba(224,92,92,0.22)",
  },
  rangeDeleteText: {
    color: colors.textGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  rangeDeleteTextBlocked: {
    color: colors.error,
  },
  rangeInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  rangeTime: {
    color: colors.textGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  rangeTimeBlocked: {
    color: colors.error,
  },
  rangeLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  addPanel: {
    borderRadius: 16,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.12)",
    padding: spacing.md,
    gap: spacing.md,
  },
  addTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  quickRanges: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  quickRange: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  quickRangeLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  quickRangeTime: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  timeField: {
    flex: 1,
    gap: spacing.xs,
  },
  timeLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  timeInput: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  timeDash: {
    color: colors.textLight,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  addButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonBlocked: {
    backgroundColor: colors.error,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  addButtonTextBlocked: {
    color: colors.textWhite,
  },
  dangerZone: {
    borderRadius: 16,
    backgroundColor: "rgba(224,92,92,0.055)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.18)",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dangerTextWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  dangerTitle: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  dangerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 17,
    marginTop: 2,
    textAlign: "right",
  },
  deleteDayButton: {
    minWidth: 84,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.24)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  deleteDayButtonText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  disabled: {
    opacity: 0.62,
  },
});
