import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { colors, spacing, typography } from "../../../constants";
import type { Booking } from "../../../types";

interface BookingRowProps {
  booking: Booking;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

const cancelledStatuses: Booking["status"][] = [
  "cancelled_by_admin",
  "cancelled_by_customer",
];

const CancelIcon = () => (
  <View style={styles.cancelIcon}>
    <View style={[styles.cancelIconLine, styles.cancelIconLineOne]} />
    <View style={[styles.cancelIconLine, styles.cancelIconLineTwo]} />
  </View>
);

export const BookingRow = ({
  booking,
  onCancel,
  isCancelling,
}: BookingRowProps) => {
  const isActive = booking.status === "active";
  const isCancelled = cancelledStatuses.includes(booking.status);
  const customerName = booking.user?.fullName ?? "לקוח";
  const phone = booking.user?.phone;

  const handleCallCustomer = () => {
    if (phone) {
      void Linking.openURL(`tel:${phone}`);
    }
  };

  const handleCancel = () => {
    Alert.alert("ביטול תור", `לבטל את התור של ${customerName}?`, [
      { text: "חזרה", style: "cancel" },
      {
        text: "כן, בטל",
        style: "destructive",
        onPress: () => onCancel(booking.id),
      },
    ]);
  };

  return (
    <View style={[styles.row, isCancelled && styles.rowMuted]}>
      <View style={styles.timeBox}>
        <Text style={styles.time}>{booking.startTime}</Text>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.serviceName}>
          {booking.service?.name ?? "שירות"}
        </Text>

        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.customerName}>
            {customerName}
          </Text>
          {phone && <Text style={styles.phone}>{phone}</Text>}
        </View>

        {booking.notes && (
          <Text numberOfLines={1} style={styles.notes}>
            {booking.notes}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCallCustomer}
            activeOpacity={0.82}
          >
            <FontAwesome name="phone" size={13} color={colors.textDark} />
            <Text style={styles.actionButtonText}>חייג</Text>
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.disabled]}
            onPress={handleCancel}
            disabled={isCancelling}
            activeOpacity={0.82}
          >
            {!isCancelling && <CancelIcon />}
            <Text style={styles.cancelButtonText}>
              {isCancelling ? "..." : "בטל"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFEFA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.10)",
    padding: spacing.md,
    gap: spacing.md,
  },
  rowMuted: {
    opacity: 0.48,
  },
  timeBox: {
    width: 58,
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: "rgba(212,164,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    color: colors.textGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  content: {
    flex: 1,
    alignItems: "flex-end",
    minWidth: 0,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
    marginBottom: 2,
  },
  metaRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  customerName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: "right",
    maxWidth: 156,
  },
  phone: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  notes: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    textAlign: "right",
    marginTop: 2,
  },
  actions: {
    width: 74,
    alignItems: "stretch",
    gap: spacing.xs,
  },
  actionButton: {
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row-reverse",
    gap: 4,
  },
  actionButtonText: {
    color: colors.textDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  cancelButton: {
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: "rgba(224,92,92,0.06)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.24)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row-reverse",
    gap: 4,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  cancelIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.6,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelIconLine: {
    position: "absolute",
    width: 7,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: colors.error,
  },
  cancelIconLineOne: {
    transform: [{ rotate: "45deg" }],
  },
  cancelIconLineTwo: {
    transform: [{ rotate: "-45deg" }],
  },
  disabled: {
    opacity: 0.55,
  },
});
