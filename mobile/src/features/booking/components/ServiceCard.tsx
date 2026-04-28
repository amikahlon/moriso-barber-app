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
          <View style={[styles.pricePill, isSelected && styles.pricePillSelected]}>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              ₪{service.price}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFEFA",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.16)",
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: "#FFF7EA",
    borderColor: "rgba(212,164,42,0.48)",
    shadowColor: colors.shadowGold,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  accentLine: {
    height: 3,
    backgroundColor: "rgba(212,164,42,0.12)",
  },
  accentLineSelected: {
    height: 4,
    backgroundColor: colors.gold,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    textAlign: "right",
    lineHeight: 27,
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(212,164,42,0.10)",
  },
  pricePill: {
    minWidth: 82,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.24)",
    backgroundColor: "rgba(212,164,42,0.08)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  pricePillSelected: {
    borderColor: "rgba(212,164,42,0.44)",
    backgroundColor: "rgba(212,164,42,0.16)",
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.textGold,
  },
  priceSelected: {
    color: colors.textGold,
  },
});
