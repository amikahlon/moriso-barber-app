import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing } from "../../constants";

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  arrow?: boolean;
  style?: ViewStyle;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  arrow = true,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={[colors.goldLight, colors.gold, colors.goldDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, (disabled || loading) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <>
            <Text style={styles.text}>{title}</Text>
            {arrow && <Text style={styles.arrow}>←</Text>}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    height: 58,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    letterSpacing: 0.3,
  },
  arrow: {
    color: colors.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    opacity: 0.7,
  },
});
