import { View, Text, StyleSheet } from "react-native";

import { colors, typography, spacing } from "../../../constants";
import { DrawerToggle } from "./DrawerToggle";

interface ScreenHeaderProps {
  title: string;
}

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <DrawerToggle />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
  },
  spacer: {
    width: 36,
  },
});
