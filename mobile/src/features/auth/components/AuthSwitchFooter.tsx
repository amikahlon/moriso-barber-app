import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { OutlineButton } from "../../../components/common";
import { colors, spacing, typography } from "../../../constants";

interface AuthSwitchFooterProps {
  question: string;
  buttonTitle: string;
  onPress: () => void;
}

export const AuthSwitchFooter: React.FC<AuthSwitchFooterProps> = ({
  question,
  buttonTitle,
  onPress,
}) => {
  return (
    <View style={styles.footer}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>או</Text>
        <View style={styles.line} />
      </View>

      <Text style={styles.footerLabel}>{question}</Text>

      <OutlineButton title={buttonTitle} onPress={onPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
  },
  footerLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    textAlign: "center",
  },
});
