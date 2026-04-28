import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Controller } from "react-hook-form";
import { router } from "expo-router";

import {
  AuthCard,
  GoldButton,
  GoldInput,
  HeroHeader,
  OutlineButton,
} from "../../src/components/common";
import { colors, spacing, typography } from "../../src/constants";
import { useLoginForm } from "../../src/features/auth/hooks";

export default function LoginScreen() {
  const { authError, control, handleSubmit, formState, onSubmit } =
    useLoginForm();
  const { errors, isSubmitting } = formState;

  return (
    <>
      <HeroHeader
        title="ברוך שובך"
        animated={false}
      />

      <AuthCard
        title="התחברות"
        subtitle="הזן אימייל וסיסמה כדי להיכנס למערכת"
        animated={false}
      >
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <GoldInput
              label="אימייל"
              placeholder="your@email.com"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <GoldInput
              label="סיסמה"
              placeholder="הקלד את הסיסמה שלך"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              error={errors.password?.message}
            />
          )}
        />

        {!!authError && (
          <View style={styles.errorBanner}>
            <View style={styles.errorAccent} />
            <View style={styles.errorTextWrap}>
              <Text style={styles.errorTitle}>לא הצלחנו להתחבר</Text>
              <Text style={styles.errorMessage}>{authError}</Text>
            </View>
          </View>
        )}

        <GoldButton
          title="התחבר"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          style={styles.submitButton}
        />

        <Text style={styles.footerLabel}>עדיין אין לך חשבון?</Text>

        <OutlineButton
          title="יצירת חשבון"
          onPress={() => router.replace("/(auth)/register")}
        />

        <Text style={styles.guestLabel}>רוצה רק לעיין?</Text>

        <OutlineButton
          title="המשך כאורח"
          onPress={() => router.replace("/(app)/home")}
        />
      </AuthCard>
    </>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.error}2E`,
    backgroundColor: `${colors.error}0D`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  errorAccent: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 999,
    backgroundColor: colors.error,
  },
  errorTextWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
    marginBottom: 2,
  },
  errorMessage: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 20,
    textAlign: "right",
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footerLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    textAlign: "center",
    fontWeight: typography.weights.medium,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  guestLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    fontWeight: typography.weights.medium,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
