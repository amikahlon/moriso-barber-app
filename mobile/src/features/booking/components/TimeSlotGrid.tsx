import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../../../constants";
import type { TimeSlot } from "../../../types";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedTime,
  onSelect,
}) => {
  const availableSlots = slots.filter((slot) => slot.isAvailable);

  if (availableSlots.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>אין שעות פנויות ביום זה</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.startTime;
          const isAvailable = slot.isAvailable;

          return (
            <TouchableOpacity
              key={slot.startTime}
              style={[
                styles.slot,
                isSelected && styles.slotSelected,
                !isAvailable && styles.slotUnavailable,
              ]}
              onPress={() => isAvailable && onSelect(slot.startTime)}
              disabled={!isAvailable}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.slotTime,
                  isSelected && styles.slotTimeSelected,
                  !isAvailable && styles.slotTimeUnavailable,
                ]}
              >
                {slot.startTime}
              </Text>
              {isSelected && <Text style={styles.slotTag}>נבחרה</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  slot: {
    width: "22.8%",
    minHeight: 64,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 1,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.gold,
    shadowColor: colors.shadowGold,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  slotUnavailable: {
    backgroundColor: "#EEE7DB",
    borderColor: "#EEE7DB",
    opacity: 0.58,
    shadowOpacity: 0,
  },
  slotTime: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  slotTimeSelected: {
    color: colors.textWhite,
    fontWeight: typography.weights.bold,
  },
  slotTimeUnavailable: {
    color: colors.textLight,
  },
  slotTag: {
    marginTop: 4,
    fontSize: 10,
    color: colors.goldLight,
    fontWeight: typography.weights.bold,
  },
  empty: {
    padding: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
