import React from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, spacing, typography } from "../../constants";

interface ScreenLoaderProps {
  label?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  label = "טוען",
}) => {
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const logoScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const accentOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.34, 0.72],
  });
  const progressScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.26, 1],
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundCard, "#FFF4D6"]}
      locations={[0, 0.68, 1]}
      start={{ x: 0.08, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.topWash} />
      <View style={styles.bottomWash} />

      <View style={styles.frame}>
        <Animated.View style={[styles.goldAccent, { opacity: accentOpacity }]} />

        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.loadingBlock}>
          <ActivityIndicator color={colors.gold} size="small" />
          <Text style={styles.label}>{label}</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { transform: [{ scaleX: progressScale }] },
            ]}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    overflow: "hidden",
  },
  topWash: {
    position: "absolute",
    top: -58,
    left: -24,
    right: -24,
    height: 172,
    backgroundColor: "rgba(212,164,42,0.10)",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    transform: [{ rotate: "-4deg" }],
  },
  bottomWash: {
    position: "absolute",
    left: -24,
    right: -24,
    bottom: -76,
    height: 168,
    backgroundColor: "rgba(255,255,255,0.56)",
    borderTopLeftRadius: 88,
    borderTopRightRadius: 88,
    transform: [{ rotate: "3deg" }],
  },
  frame: {
    width: "100%",
    maxWidth: 340,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  goldAccent: {
    position: "absolute",
    top: 98,
    width: 182,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  logo: {
    width: 206,
    height: 82,
    tintColor: colors.primary,
  },
  loadingBlock: {
    marginTop: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    color: colors.textGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  progressTrack: {
    width: 146,
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(212,164,42,0.14)",
    marginTop: spacing.md,
  },
  progressFill: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
});
