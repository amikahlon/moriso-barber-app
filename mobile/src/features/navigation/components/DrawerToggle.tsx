import { Pressable, StyleSheet, View } from "react-native";

import { colors, spacing } from "../../../constants";
import { useDrawer } from "../hooks/useDrawer";

interface DrawerToggleProps {
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function DrawerToggle({
  onPress,
  accessibilityLabel = "פתח תפריט",
}: DrawerToggleProps) {
  const drawer = useDrawer();

  const handlePress = () => {
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }

    (onPress ?? drawer.toggle)();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.line} />
      <View style={[styles.line, styles.lineMid]} />
      <View style={[styles.line, styles.lineShort]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.4)",
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.65,
  },
  line: {
    height: 2,
    width: 18,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  lineMid: {
    width: 14,
  },
  lineShort: {
    width: 10,
  },
});
