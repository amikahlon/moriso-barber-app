import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, spacing, typography } from "../../../constants";

const text = {
  back: "\u05d7\u05d6\u05e8\u05d4",
  confirm: "\u05db\u05df, \u05d1\u05d8\u05dc",
  loading: "\u05de\u05d1\u05d8\u05dc...",
  message:
    "\u05d4\u05d0\u05dd \u05d0\u05ea\u05d4 \u05d1\u05d8\u05d5\u05d7 \u05e9\u05d1\u05e8\u05e6\u05d5\u05e0\u05da \u05dc\u05d1\u05d8\u05dc \u05d0\u05ea \u05d4\u05ea\u05d5\u05e8?",
  title: "\u05d1\u05d9\u05d8\u05d5\u05dc \u05ea\u05d5\u05e8",
} as const;

interface CancelBookingDialogProps {
  visible: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CancelBookingDialog = ({
  visible,
  isLoading = false,
  onCancel,
  onConfirm,
}: CancelBookingDialogProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={styles.dialog}>
          <View style={styles.topAccent} />

          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <Text style={styles.title}>{text.title}</Text>
          <Text style={styles.message}>{text.message}</Text>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>{text.back}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#F06F6F", colors.error]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? text.loading : text.confirm}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(14,14,16,0.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.gold,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(224,92,92,0.10)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  iconText: {
    color: colors.error,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundInput,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textDark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.62,
  },
});
