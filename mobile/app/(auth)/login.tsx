import React from "react";
import { StyleSheet, Text } from "react-native";
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
  const { control, handleSubmit, formState, onSubmit } = useLoginForm();
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

        <GoldButton
          title="התחבר"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          style={styles.submitButton}
        />

        <Text style={styles.footerLabel}>עדיין אין לך חשבון?</Text>

        <OutlineButton
          title="יצירת חשבון"
          onPress={() => router.push("/(auth)/register")}
        />
      </AuthCard>
    </>
  );
}

const styles = StyleSheet.create({
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
});
