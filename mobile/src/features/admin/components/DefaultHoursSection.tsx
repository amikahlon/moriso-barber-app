import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, spacing, typography } from "../../../constants";
import type { DefaultHour } from "../../../api/schedule.api";
import { useDefaultHours } from "../hooks/useDefaultHours";

const DAYS = [
  { value: 1, label: "ראשון", shortLabel: "א" },
  { value: 2, label: "שני", shortLabel: "ב" },
  { value: 3, label: "שלישי", shortLabel: "ג" },
  { value: 4, label: "רביעי", shortLabel: "ד" },
  { value: 5, label: "חמישי", shortLabel: "ה" },
  { value: 6, label: "שישי", shortLabel: "ו" },
  { value: 7, label: "שבת", shortLabel: "ש" },
];

const QUICK_RANGES = [
  { label: "בוקר", start: "09:00", end: "14:00" },
  { label: "צהריים", start: "12:00", end: "18:00" },
  { label: "יום מלא", start: "09:00", end: "19:00" },
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DefaultHoursSection: React.FC = () => {
  const { defaultHours, isLoading, addHour, removeHour } = useDefaultHours();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const hoursByDay = useMemo(() => {
    const map = new Map<number, DefaultHour[]>();
    DAYS.forEach((day) => map.set(day.value, []));

    defaultHours.forEach((hour) => {
      map.get(hour.dayOfWeek)?.push(hour);
    });

    map.forEach((hours) => {
      hours.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return map;
  }, [defaultHours]);

  const openDaysCount = DAYS.filter(
    (day) => (hoursByDay.get(day.value)?.length ?? 0) > 0,
  ).length;

  const selectedDayName =
    DAYS.find((day) => day.value === selectedDay)?.label ?? "";

  const openModal = (day: number) => {
    setSelectedDay(day);
    setStartTime("");
    setEndTime("");
    setModalVisible(true);
  };

  const closeModal = () => {
    if (addHour.isPending) return;
    setModalVisible(false);
  };

  const handleDelete = (hour: DefaultHour) => {
    const dayName = DAYS.find((day) => day.value === hour.dayOfWeek)?.label;

    Alert.alert(
      "מחיקת שעות",
      `למחוק את ${hour.startTime}-${hour.endTime} מיום ${dayName}?`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => removeHour.mutate(hour.id),
        },
      ],
    );
  };

  const handleQuickRange = (range: (typeof QUICK_RANGES)[number]) => {
    setStartTime(range.start);
    setEndTime(range.end);
  };

  const handleSave = () => {
    if (!selectedDay) return;

    if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
      Alert.alert("שעה לא תקינה", "יש להזין שעות בפורמט HH:MM, למשל 09:00.");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("טווח לא תקין", "שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
      return;
    }

    addHour.mutate(
      { dayOfWeek: selectedDay, startTime, endTime },
      {
        onSuccess: () => {
          setModalVisible(false);
        },
        onError: () => {
          Alert.alert("שגיאה", "לא ניתן להוסיף את שעות העבודה כרגע.");
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>שעות עבודה קבועות</Text>
          <Text style={styles.subtitle}>ברירת מחדל לפתיחת ימים ביומן</Text>
        </View>
      </View>

      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>{openDaysCount} ימים פעילים</Text>
        <View style={styles.summaryDot} />
        <Text style={styles.summaryText}>{defaultHours.length} טווחי שעות</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.loadingText}>טוען שעות קבועות...</Text>
        </View>
      ) : (
        <View style={styles.daysList}>
          {DAYS.map((day) => {
            const hours = hoursByDay.get(day.value) ?? [];
            const isOpen = hours.length > 0;

            return (
              <View key={day.value} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View
                    style={[
                      styles.dayBadge,
                      isOpen ? styles.dayBadgeOpen : styles.dayBadgeClosed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayBadgeText,
                        isOpen
                          ? styles.dayBadgeTextOpen
                          : styles.dayBadgeTextClosed,
                      ]}
                    >
                      {day.shortLabel}
                    </Text>
                  </View>

                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{day.label}</Text>
                    <Text style={styles.dayStatusText}>
                      {isOpen ? `${hours.length} טווחי עבודה` : "סגור כברירת מחדל"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => openModal(day.value)}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.addButtonText}>הוסף</Text>
                    <Text style={styles.addButtonIcon}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.hoursArea}>
                  {isOpen ? (
                    hours.map((hour) => (
                      <TouchableOpacity
                        key={hour.id}
                        style={styles.hourChip}
                        onPress={() => handleDelete(hour)}
                        activeOpacity={0.78}
                      >
                        <Text style={styles.hourChipDelete}>×</Text>
                        <Text style={styles.hourChipText}>
                          {hour.startTime}-{hour.endTime}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.closedPill}>
                      <Text style={styles.closedPillText}>אין שעות מוגדרות</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>הוספת שעות</Text>
              <Text style={styles.modalSubtitle}>יום {selectedDayName}</Text>
            </View>

            <View style={styles.quickRanges}>
              {QUICK_RANGES.map((range) => (
                <TouchableOpacity
                  key={range.label}
                  style={styles.quickRangeButton}
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
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>שעת סיום</Text>
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

              <Text style={styles.timeSeparator}>-</Text>

              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>שעת התחלה</Text>
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

            <Text style={styles.modalHint}>אפשר להקליד ידנית או לבחור טווח מוכן.</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, addHour.isPending && styles.disabled]}
                onPress={handleSave}
                disabled={addHour.isPending}
              >
                {addHour.isPending ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>שמירה</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: spacing.md,
  },
  headerText: {
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
    fontWeight: typography.weights.medium,
    textAlign: "right",
    marginTop: 3,
  },
  summaryStrip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 34,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    opacity: 0.6,
  },
  loadingState: {
    minHeight: 120,
    borderRadius: 14,
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
  daysList: {
    gap: spacing.xs,
  },
  dayCard: {
    backgroundColor: "#FFFEFA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  dayBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dayBadgeOpen: {
    backgroundColor: colors.goldMuted,
    borderColor: colors.goldBorder,
  },
  dayBadgeClosed: {
    backgroundColor: colors.backgroundInput,
    borderColor: colors.border,
  },
  dayBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  dayBadgeTextOpen: {
    color: colors.textGold,
  },
  dayBadgeTextClosed: {
    color: colors.textSecondary,
  },
  dayInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  dayName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  dayStatusText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "right",
  },
  addButton: {
    minWidth: 60,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addButtonText: {
    color: colors.textGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  addButtonIcon: {
    color: colors.textGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    lineHeight: 18,
  },
  hoursArea: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  hourChip: {
    minHeight: 28,
    borderRadius: 999,
    backgroundColor: "#FFF9EE",
    borderWidth: 1,
    borderColor: colors.goldBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  hourChipText: {
    color: colors.textGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  hourChipDelete: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  closedPill: {
    minHeight: 28,
    borderRadius: 999,
    backgroundColor: colors.backgroundInput,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  closedPillText: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(14,14,16,0.52)",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  modalCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 22,
    padding: spacing.xxl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeader: {
    alignItems: "flex-end",
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "right",
  },
  quickRanges: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  quickRangeButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
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
    justifyContent: "center",
    gap: spacing.md,
  },
  timeInputContainer: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  timeLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  timeInput: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  timeSeparator: {
    color: colors.textLight,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  modalHint: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  disabled: {
    opacity: 0.6,
  },
});
