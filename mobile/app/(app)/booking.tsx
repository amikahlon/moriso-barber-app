import React from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  type LayoutChangeEvent,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenHeader } from "../../src/features/navigation";
import {
  ServiceCard,
  DatePicker,
  TimeSlotGrid,
} from "../../src/features/booking/components";
import {
  useBookingServices,
  useOpenDays,
  useAvailableSlots,
  useCreateBooking,
} from "../../src/features/booking/hooks";
import { useBookingStore } from "../../src/store/booking.store";
import { colors, typography, spacing } from "../../src/constants";
import { normalizeDateKey, parseDateKey } from "../../src/utils/calendar";

const text = {
  missingSelectionTitle: "חסרים פרטים",
  missingSelectionMessage: "בחר שירות, תאריך ושעה לפני קביעת תור.",
  pastDateTitle: "התאריך כבר עבר",
  pastDateMessage: "בחר תאריך פנוי חדש.",
  pastTimeTitle: "השעה כבר לא זמינה",
  pastTimeMessage: "בחר שעה אחרת להזמנה.",
  bookingErrorTitle: "שגיאה בקביעת התור",
  genericBookingError: "לא הצלחנו לקבוע את התור. נסה שוב.",
  conflictBookingError: "השעה הזו כבר נתפסה. בחר שעה אחרת.",
  invalidResponseError:
    "התור נשמר, אבל לא הצלחנו לקבל אישור תקין. בדוק את מסך התורים שלך.",
} as const;

const getBookingErrorMessage = (error: unknown) => {
  const maybeError = error as {
    message?: unknown;
    response?: { status?: number; data?: { message?: unknown } };
  };

  if (maybeError.message === "BOOKING_RESPONSE_INVALID") {
    return text.invalidResponseError;
  }

  if (maybeError.response?.status === 409) {
    return text.conflictBookingError;
  }

  const serverMessage = maybeError.response?.data?.message;

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  if (Array.isArray(serverMessage)) {
    return serverMessage.filter(Boolean).join("\n");
  }

  return text.genericBookingError;
};

const isPastDate = (date: string) =>
  normalizeDateKey(parseDateKey(date)) < normalizeDateKey(new Date());

const isPastSlot = (date: string, time: string) => {
  const slotDate = parseDateKey(date);
  const [hours = 0, minutes = 0] = time.slice(0, 5).split(":").map(Number);

  slotDate.setHours(hours || 0, minutes || 0, 0, 0);

  return slotDate.getTime() < Date.now();
};

export default function BookingScreen() {
  const {
    selectedService,
    selectedDate,
    selectedTimeSlot,
    setSelectedService,
    setSelectedDate,
    setSelectedTimeSlot,
    resetBookingFlow,
  } = useBookingStore();

  const [notes, setNotes] = React.useState("");
  const [showSuccessOverlay, setShowSuccessOverlay] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const successTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const sectionPositionsRef = React.useRef<Record<string, number>>({});

  const servicesQuery = useBookingServices();
  const openDaysQuery = useOpenDays();
  const slotsQuery = useAvailableSlots({
    date: selectedDate,
    durationMinutes: selectedService?.durationMinutes ?? null,
  });
  const createBooking = useCreateBooking();

  const canSubmit = !!selectedService && !!selectedDate && !!selectedTimeSlot;
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const scrollToSection = React.useCallback((sectionKey: string) => {
    const y = sectionPositionsRef.current[sectionKey];

    if (typeof y !== "number") {
      return;
    }

    scrollViewRef.current?.scrollTo({
      y: Math.max(y - spacing.lg, 0),
      animated: true,
    });
  }, []);

  const handleSectionLayout = React.useCallback(
    (sectionKey: string) => (event: LayoutChangeEvent) => {
      sectionPositionsRef.current[sectionKey] = event.nativeEvent.layout.y;

      if (sectionKey === "time" && selectedDate) {
        requestAnimationFrame(() => {
          scrollToSection("time");
        });
      }

      if (sectionKey === "notes" && selectedTimeSlot) {
        requestAnimationFrame(() => {
          scrollToSection("notes");
        });
      }
    },
    [scrollToSection, selectedDate, selectedTimeSlot],
  );

  useFocusEffect(
    React.useCallback(() => {
      resetBookingFlow();
      setNotes("");
      setShowSuccessOverlay(false);

      return () => {
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
          successTimeoutRef.current = null;
        }
      };
    }, [resetBookingFlow]),
  );

  React.useEffect(() => {
    if (!selectedService) {
      return;
    }

    const timeoutId = setTimeout(() => {
      scrollToSection("date");
    }, 120);

    return () => clearTimeout(timeoutId);
  }, [selectedService, scrollToSection]);

  React.useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const timeoutId = setTimeout(() => {
      scrollToSection("time");
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [selectedDate, scrollToSection]);

  React.useEffect(() => {
    if (!selectedTimeSlot) {
      return;
    }

    const timeoutId = setTimeout(() => {
      scrollToSection("notes");
    }, 120);

    return () => clearTimeout(timeoutId);
  }, [selectedTimeSlot, scrollToSection]);

  const handleSubmit = async () => {
    if (createBooking.isPending) {
      return;
    }

    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      Alert.alert(text.missingSelectionTitle, text.missingSelectionMessage);
      return;
    }

    if (isPastDate(selectedDate)) {
      setSelectedDate("");
      setSelectedTimeSlot("");
      void openDaysQuery.refetch();
      Alert.alert(text.pastDateTitle, text.pastDateMessage);
      return;
    }

    if (isPastSlot(selectedDate, selectedTimeSlot)) {
      setSelectedTimeSlot("");
      void slotsQuery.refetch();
      Alert.alert(text.pastTimeTitle, text.pastTimeMessage);
      return;
    }

    try {
      await createBooking.mutateAsync({
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedTimeSlot,
        notes: notes.trim() || undefined,
      });
      setShowSuccessOverlay(true);
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccessOverlay(false);
        successTimeoutRef.current = null;
        router.replace("/(app)/home");
      }, 1600);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 409) {
        setSelectedTimeSlot("");
        void slotsQuery.refetch();
      }

      Alert.alert(text.bookingErrorTitle, getBookingErrorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="הזמנת תור" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section} onLayout={handleSectionLayout("service")}>
          <View style={styles.sectionCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <Text style={styles.stepTitle}>בחר שירות</Text>
            </View>

            {servicesQuery.isLoading ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <View style={styles.servicesGrid}>
                {servicesQuery.data?.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onPress={(nextService) => {
                      setSelectedService(nextService);
                      setSelectedDate("");
                      setSelectedTimeSlot("");
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {selectedService && (
          <View style={styles.section} onLayout={handleSectionLayout("date")}>
            <View style={styles.sectionCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>2</Text>
                </View>
                <Text style={styles.stepTitle}>בחר תאריך</Text>
              </View>

              {openDaysQuery.isLoading ? (
                <ActivityIndicator color={colors.gold} />
              ) : openDaysQuery.data?.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>אין ימים פתוחים כרגע</Text>
                </View>
              ) : (
                <DatePicker
                  openDays={openDaysQuery.data ?? []}
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTimeSlot("");
                  }}
                />
              )}
            </View>
          </View>
        )}

        {selectedDate && selectedService && (
          <View style={styles.section} onLayout={handleSectionLayout("time")}>
            <View style={styles.sectionCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>3</Text>
                </View>
                <Text style={styles.stepTitle}>בחר שעה</Text>
              </View>

              <Text style={styles.sectionHint}>
                {selectedDateLabel
                  ? `השעות של ${selectedDateLabel} מוצגות כאן לבחירה.`
                  : "בחר שעה מתאימה להשלמת ההזמנה."}
              </Text>

              {slotsQuery.isLoading ? (
                <ActivityIndicator color={colors.gold} />
              ) : (
                <TimeSlotGrid
                  slots={slotsQuery.data ?? []}
                  selectedTime={selectedTimeSlot}
                  onSelect={setSelectedTimeSlot}
                />
              )}
            </View>
          </View>
        )}

        {selectedTimeSlot && (
          <View style={styles.section} onLayout={handleSectionLayout("notes")}>
            <View style={styles.sectionCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>4</Text>
                </View>
                <Text style={styles.stepTitle}>הערות (אופציונלי)</Text>
              </View>

              <Text style={styles.sectionHint}>
                אם יש משהו שחשוב שנדע מראש, אפשר לרשום כאן הערה קצרה.
              </Text>

              <View style={styles.notesWrapper}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="למשל: מעדיף תספורת קצרה בצדדים..."
                  placeholderTextColor={colors.textLight}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        )}

        {canSubmit && (
          <View style={styles.summary}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryGlow} />

              <View style={styles.summaryHeader}>
                <Text style={styles.summaryHeaderTitle}>סיכום התור</Text>
                <Text style={styles.summaryHeaderText}>
                  רגע לפני אישור, הכל כבר מסודר.
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{selectedService.name}</Text>
                <Text style={styles.summaryLabel}>שירות</Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{selectedDateLabel}</Text>
                <Text style={styles.summaryLabel}>תאריך</Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
                <Text style={styles.summaryLabel}>שעה</Text>
              </View>
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryValue, styles.summaryPrice]}>
                  ₪{selectedService.price}
                </Text>
                <Text style={styles.summaryLabel}>מחיר</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={createBooking.isPending}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.goldLight, colors.gold, colors.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {createBooking.isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.submitText}>קבע תור</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.huge }} />
      </ScrollView>

      {showSuccessOverlay && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>תודה רבה</Text>
            <Text style={styles.successSubtitle}>
              התור נקבע בהצלחה, נתראה בקרוב
            </Text>
          </View>
        </View>
      )}
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
    paddingBottom: spacing.huge,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionCard: {
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderRadius: 26,
    backgroundColor: "rgba(255,253,248,0.74)",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.10)",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNum: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    color: colors.gold,
  },
  stepTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  servicesGrid: {
    flexDirection: "column",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: "right",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 20,
    maxWidth: "92%",
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  notesWrapper: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 2,
  },
  notesInput: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    minHeight: 96,
    lineHeight: 22,
  },
  summary: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: colors.border,
    padding: spacing.xl,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
    overflow: "hidden",
  },
  summaryGlow: {
    position: "absolute",
    top: -34,
    right: -20,
    width: 132,
    height: 132,
    borderRadius: 999,
    backgroundColor: "rgba(212,164,42,0.10)",
  },
  summaryHeader: {
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  summaryHeaderTitle: {
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
    fontWeight: typography.weights.extraBold,
    marginBottom: 2,
  },
  summaryHeaderText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: "right",
    maxWidth: "72%",
  },
  summaryPrice: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  submitButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitGradient: {
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14,14,16,0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  successCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.gold,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  successTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
    color: colors.gold,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
  },
});
