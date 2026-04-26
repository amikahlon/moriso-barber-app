import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";

import { colors, typography, spacing } from "../../constants";

interface AuthCardProps {
  title: string;
  subtitle: string;
  icon?: string;
  animated?: boolean;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  icon,
  animated = true,
  children,
}) => {
  const { width } = useWindowDimensions();
  const cardSlide = useRef(new Animated.Value(50)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      cardSlide.setValue(0);
      cardFade.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, cardFade, cardSlide]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          marginTop: -Math.max(48, width * 0.11),
          opacity: cardFade,
          transform: [{ translateY: cardSlide }],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLine} />
          <View style={styles.titleRow}>
            {icon && <Text style={styles.iconText}>{icon}</Text>}
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>

        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    borderWidth: 1.2,
    borderColor: colors.border,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 14,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  headerLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    textAlign: "right",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "right",
    fontWeight: typography.weights.medium,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.gold,
    transform: [{ rotate: "45deg" }],
    opacity: 0.35,
  },
});
