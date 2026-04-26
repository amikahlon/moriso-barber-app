import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography } from "../../constants";

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
  title,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: colors.goldBorder,
    backgroundColor: colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  text: {
    color: colors.textGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2,
  },
});
