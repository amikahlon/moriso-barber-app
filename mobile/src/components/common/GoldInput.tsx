import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors, typography, spacing } from "../../constants";

interface GoldInputProps extends TextInputProps {
  label: string;
  icon?: string;
  error?: string;
}

export const GoldInput: React.FC<GoldInputProps> = ({
  label,
  icon,
  error,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const {
    onBlur,
    onFocus,
    returnKeyType,
    blurOnSubmit,
    ...inputProps
  } = props;

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={focusInput}
        style={[
          styles.shell,
          isFocused && styles.shellFocused,
          error && styles.shellError,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={colors.textLight}
          textAlign="right"
          textAlignVertical="center"
          returnKeyType={returnKeyType ?? "done"}
          blurOnSubmit={blurOnSubmit ?? false}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />

        {icon && (
          <View
            pointerEvents="none"
            style={[
              styles.iconBox,
              isFocused && styles.iconBoxFocused,
              error && styles.iconBoxError,
            ]}
          >
            <Text
              style={[
                styles.icon,
                isFocused && styles.iconFocused,
                error && styles.iconError,
              ]}
            >
              {icon}
            </Text>
          </View>
        )}
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    textAlign: "right",
    marginBottom: spacing.sm,
    letterSpacing: 0.15,
  },

  shell: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.2,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },

  shellFocused: {
    backgroundColor: colors.backgroundInputFocused,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  shellError: {
    borderColor: colors.error,
  },

  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    minHeight: 48,
    paddingVertical: 0,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.goldMuted,
    justifyContent: "center",
    alignItems: "center",
  },

  iconBoxFocused: {
    backgroundColor: colors.gold,
  },

  iconBoxError: {
    backgroundColor: colors.error,
  },

  icon: {
    color: colors.textGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  iconFocused: {
    color: colors.textWhite,
  },

  iconError: {
    color: "#fff",
  },

  error: {
    marginTop: 6,
    color: colors.error,
    fontSize: 12,
    textAlign: "right",
  },
});
