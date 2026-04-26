import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenLoader } from "../../src/components/common";
import { colors, typography, spacing } from "../../src/constants";
import { CancelBookingDialog } from "../../src/features/booking/components";
import { useCancelBooking } from "../../src/features/booking/hooks";
import { useMyBooking } from "../../src/features/home/hooks";
import { formatBookingDate, sortBookingsByStart } from "../../src/features/home/utils/bookings";
import { ScreenHeader } from "../../src/features/navigation";

const text = {
  cancel: "\u05d1\u05d9\u05d8\u05d5\u05dc \u05ea\u05d5\u05e8",
  cancelling: "\u05de\u05d1\u05d8\u05dc...",
  emptySubtitle:
    "\u05db\u05e9\u05d9\u05d4\u05d9\u05d5 \u05dc\u05da \u05ea\u05d5\u05e8\u05d9\u05dd \u05e7\u05e8\u05d5\u05d1\u05d9\u05dd, \u05d4\u05dd \u05d9\u05d5\u05e4\u05d9\u05e2\u05d5 \u05db\u05d0\u05df.",
  emptyTitle: "\u05d0\u05d9\u05df \u05dc\u05da \u05ea\u05d5\u05e8\u05d9\u05dd \u05e7\u05e8\u05d5\u05d1\u05d9\u05dd",
  serviceUnavailable: "\u05e9\u05d9\u05e8\u05d5\u05ea \u05dc\u05d0 \u05d6\u05de\u05d9\u05df",
  subtitle: "\u05db\u05dc \u05d4\u05ea\u05d5\u05e8\u05d9\u05dd \u05d4\u05e7\u05e8\u05d5\u05d1\u05d9\u05dd \u05e9\u05dc\u05da",
  time: "\u05e9\u05e2\u05d4",
  title: "\u05d4\u05ea\u05d5\u05e8\u05d9\u05dd \u05e9\u05dc\u05d9",
  cancelErrorTitle: "\u05e9\u05d2\u05d9\u05d0\u05d4",
  cancelErrorMessage:
    "\u05dc\u05d0 \u05d4\u05e6\u05dc\u05d7\u05e0\u05d5 \u05dc\u05d1\u05d8\u05dc \u05d0\u05ea \u05d4\u05ea\u05d5\u05e8. \u05e0\u05e1\u05d4 \u05e9\u05d5\u05d1.",
} as const;

const formatTime = (value?: string) => value?.slice(0, 5) ?? "--:--";

export default function MyBookingsScreen() {
  const { bookings, isLoading } = useMyBooking();
  const cancelBooking = useCancelBooking();
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(
    null,
  );

  const sortedBookings = sortBookingsByStart(bookings);

  const handleCancelBooking = () => {
    if (!bookingToCancelId) {
      return;
    }

    cancelBooking.mutate(bookingToCancelId, {
      onSuccess: () => setBookingToCancelId(null),
      onError: () => {
        Alert.alert(text.cancelErrorTitle, text.cancelErrorMessage);
      },
    });
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={text.title} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{text.title}</Text>
          <Text style={styles.subtitle}>{text.subtitle}</Text>
        </View>

        {sortedBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>0</Text>
            </View>
            <Text style={styles.emptyTitle}>{text.emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{text.emptySubtitle}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingAccent} />

                <View style={styles.bookingTop}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingService}>
                      {booking.service?.name ?? text.serviceUnavailable}
                    </Text>

                    <Text style={styles.bookingDate}>
                      {formatBookingDate(booking.bookingDate)}
                    </Text>
                  </View>

                  <View style={styles.bookingTimeBadge}>
                    <Text style={styles.bookingTimeText}>
                      {formatTime(booking.startTime)}
                    </Text>
                    <Text style={styles.bookingTimeLabel}>{text.time}</Text>
                  </View>
                </View>

                <View style={styles.bookingDivider} />

                <View style={styles.bookingBottom}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      cancelBooking.isPending && styles.cancelButtonDisabled,
                    ]}
                    onPress={() => setBookingToCancelId(booking.id)}
                    disabled={cancelBooking.isPending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancelBooking.isPending ? text.cancelling : text.cancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CancelBookingDialog
        visible={!!bookingToCancelId}
        isLoading={cancelBooking.isPending}
        onCancel={() => setBookingToCancelId(null)}
        onConfirm={handleCancelBooking}
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
  header: {
    alignItems: "flex-end",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  emptyCard: {
    minHeight: 260,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyIconText: {
    color: colors.textGold,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 21,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  list: {
    gap: spacing.md,
  },
  bookingCard: {
    backgroundColor: "#FFFEFA",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(212,164,42,0.10)",
    overflow: "hidden",
    position: "relative",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  bookingAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "rgba(212,164,42,0.42)",
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingRight: spacing.xxl,
    gap: spacing.md,
  },
  bookingInfo: {
    alignItems: "flex-end",
    flex: 1,
  },
  bookingService: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  bookingDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    textAlign: "right",
  },
  bookingTimeBadge: {
    backgroundColor: "rgba(212,164,42,0.08)",
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.18)",
    alignItems: "center",
    minWidth: 86,
  },
  bookingTimeText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.textGold,
  },
  bookingTimeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xl,
  },
  bookingBottom: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.26)",
    backgroundColor: "rgba(224,92,92,0.04)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButtonDisabled: {
    opacity: 0.55,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
