import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../../../constants";
import type { Service } from "../../../types";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onPress: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  onPress,
}) => {
  const description =
    service.description?.trim() ||
    "טיפול מוקפד עם התאמה אישית למבנה הפנים, לשיער ולסגנון שלך.";

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onPress(service)}
      activeOpacity={0.9}
    >
      <View style={styles.glowOrb} />
      <View style={styles.glowOrbSecondary} />
      <View style={[styles.accentLine, isSelected && styles.accentLineSelected]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.selectCircle, isSelected && styles.selectCircleSelected]}>
            {isSelected && <View style={styles.selectCircleInner} />}
          </View>

          <View style={styles.titleBlock}>
            <Text style={[styles.name, isSelected && styles.nameSelected]}>
              {service.name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, isSelected && styles.metaTextSelected]}>
              {service.durationMinutes} דקות
            </Text>
          </View>

          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            ₪{service.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFDF9",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.10)",
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: "#FFF9EF",
    borderColor: "rgba(212,164,42,0.38)",
    shadowColor: colors.shadowGold,
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 6,
  },
  glowOrb: {
    position: "absolute",
    top: -30,
    right: -22,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(247,206,85,0.16)",
  },
  glowOrbSecondary: {
    position: "absolute",
    bottom: -26,
    left: -20,
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "rgba(212,164,42,0.08)",
  },
  accentLine: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  accentLineSelected: {
    height: 4,
    backgroundColor: colors.gold,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(154,144,130,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: "rgba(255,255,255,0.66)",
  },
  selectCircleSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(212,164,42,0.14)",
  },
  selectCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  titleBlock: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    textAlign: "right",
    lineHeight: 30,
  },
  nameSelected: {
    color: colors.textGold,
  },
  description: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "right",
    maxWidth: "95%",
  },
  bottomRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(212,164,42,0.10)",
  },
  price: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  priceSelected: {
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontWeight: typography.weights.medium,
  },
  metaTextSelected: {
    color: colors.textSecondary,
  },
});
