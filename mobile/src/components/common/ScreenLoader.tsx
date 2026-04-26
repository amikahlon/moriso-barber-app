import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "../../constants";

export const ScreenLoader: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
