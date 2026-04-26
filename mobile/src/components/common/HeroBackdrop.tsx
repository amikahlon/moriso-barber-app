import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../constants";

interface HeroBackdropProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const HeroBackdrop: React.FC<HeroBackdropProps> = ({
  style,
  children,
}) => {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight, "#2C2418", colors.goldDark]}
      locations={[0, 0.25, 0.6, 1]}
      start={{ x: 0.05, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />
      <View style={styles.sparkle1} />
      <View style={styles.sparkle2} />
      <View style={styles.gridLine1} />
      <View style={styles.gridLine2} />
      <View style={styles.bottomSweep} />
      <View style={styles.goldRibbon} />
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    overflow: "hidden",
  },
  orbTopRight: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(255,193,59,0.15)",
    top: -70,
    right: -80,
  },
  orbBottomLeft: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(227,176,40,0.1)",
    bottom: -30,
    left: -100,
  },
  sparkle1: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(212,164,42,0.8)",
    top: 130,
    right: 48,
    opacity: 0.35,
  },
  sparkle2: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    top: 250,
    left: 38,
    opacity: 0.25,
  },
  gridLine1: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "25%",
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  gridLine2: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: "25%",
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  bottomSweep: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: -14,
    height: 108,
    backgroundColor: colors.background,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 28,
    transform: [{ rotate: "-3deg" }],
  },
  goldRibbon: {
    position: "absolute",
    left: 90,
    right: -30,
    bottom: 48,
    height: 30,
    backgroundColor: "rgba(237,194,78,0.8)",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 80,
    transform: [{ rotate: "-4deg" }],
  },
});
