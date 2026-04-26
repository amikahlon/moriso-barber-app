import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  animated?: boolean;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  animated = true,
}) => {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.52, 200);
  const logoHeight = Math.min(76, logoWidth * 0.34);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoBreath = useRef(new Animated.Value(0)).current;
  const orbFloat1 = useRef(new Animated.Value(0)).current;
  const orbFloat2 = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      fadeAnim.setValue(1);
      logoScale.setValue(1);
      logoBreath.setValue(0);
      orbFloat1.setValue(0);
      orbFloat2.setValue(0);
      sparkle1.setValue(0.35);
      sparkle2.setValue(0.25);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 36,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoBreath, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoBreath, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const floatOrb = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    floatOrb(orbFloat1, 4500).start();
    floatOrb(orbFloat2, 5500).start();

    const twinkle = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    twinkle(sparkle1, 0).start();
    twinkle(sparkle2, 600).start();
  }, [
    animated,
    fadeAnim,
    logoScale,
    logoBreath,
    orbFloat1,
    orbFloat2,
    sparkle1,
    sparkle2,
  ]);

  const logoBreathScale = logoBreath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const orbTranslate1 = orbFloat1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const orbTranslate2 = orbFloat2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });

  return (
    <LinearGradient
      colors={["#0E0E10", "#1A1A1F", "#2C2418", "#B8871B"]}
      locations={[0, 0.25, 0.6, 1]}
      start={{ x: 0.05, y: 0.1 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <Animated.View
        style={[
          styles.orbTopRight,
          { transform: [{ translateY: orbTranslate1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orbBottomLeft,
          { transform: [{ translateY: orbTranslate2 }] },
        ]}
      />

      <Animated.View style={[styles.sparkle1, { opacity: sparkle1 }]} />
      <Animated.View style={[styles.sparkle2, { opacity: sparkle2 }]} />

      <View style={styles.gridLine1} />
      <View style={styles.gridLine2} />

      {showLogo && (
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: Animated.multiply(logoScale, logoBreathScale) }],
            },
          ]}
        >
          <Image
            source={require("../../../assets/images/logo.png")}
            style={{ width: logoWidth, height: logoHeight }}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.subtitleSpacer} />
        )}
      </Animated.View>

      <View style={styles.bottomSweep} />
      <View style={styles.goldRibbon} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 62,
    paddingHorizontal: 24,
    paddingBottom: 62,
    overflow: "hidden",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: "center",
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
  },
  sparkle2: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    top: 250,
    left: 38,
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
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 22,
  },
  subtitleSpacer: {
    height: 26,
  },
  bottomSweep: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: -14,
    height: 82,
    backgroundColor: "#F3F0EA",
    borderTopLeftRadius: 110,
    borderTopRightRadius: 28,
    transform: [{ rotate: "-3deg" }],
  },
  goldRibbon: {
    position: "absolute",
    left: 90,
    right: -30,
    bottom: 36,
    height: 24,
    backgroundColor: "rgba(237,194,78,0.8)",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 80,
    transform: [{ rotate: "-4deg" }],
  },
});
