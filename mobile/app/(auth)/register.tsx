import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Controller } from "react-hook-form";
import { router } from "expo-router";

import { GoldButton, GoldInput } from "../../src/components/common";
import { colors, spacing, typography } from "../../src/constants";
import {
  AuthFormLayout,
  AuthSwitchFooter,
} from "../../src/features/auth/components";
import { registerFields } from "../../src/features/auth/config/authFields";
import { useRegisterForm } from "../../src/features/auth/hooks";

type BirthDatePart = "day" | "month" | "year";

const getBirthDateParts = (value?: string) => {
  const [year = "", month = "", day = ""] = (value ?? "").split("-");

  return { day, month, year };
};

const formatBirthDateParts = (parts: Record<BirthDatePart, string>) =>
  `${parts.year}-${parts.month}-${parts.day}`;

type BirthDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
};

const BirthDateInput = ({
  value,
  onChange,
  onBlur,
  error,
}: BirthDateInputProps) => {
  const parts = getBirthDateParts(value);

  const handlePartChange = (part: BirthDatePart, nextValue: string) => {
    const maxLength = part === "year" ? 4 : 2;
    const nextParts = {
      ...parts,
      [part]: nextValue.replace(/\D/g, "").slice(0, maxLength),
    };

    onChange(formatBirthDateParts(nextParts));
  };

  const handlePartBlur = (part: BirthDatePart) => {
    if (part !== "year" && parts[part].length === 1) {
      onChange(
        formatBirthDateParts({
          ...parts,
          [part]: parts[part].padStart(2, "0"),
        })
      );
    }

    onBlur();
  };

  return (
    <View style={styles.birthDateContainer}>
      <Text style={styles.label}>תאריך לידה</Text>

      <View style={styles.birthDateRow}>
        <View style={styles.birthDateField}>
          <Text style={styles.birthDateLabel}>יום</Text>
          <TextInput
            value={parts.day}
            onChangeText={(text) => handlePartChange("day", text)}
            onBlur={() => handlePartBlur("day")}
            placeholder="DD"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            maxLength={2}
            style={[styles.birthDateInput, error && styles.birthDateInputError]}
            textAlign="center"
          />
        </View>

        <View style={styles.birthDateField}>
          <Text style={styles.birthDateLabel}>חודש</Text>
          <TextInput
            value={parts.month}
            onChangeText={(text) => handlePartChange("month", text)}
            onBlur={() => handlePartBlur("month")}
            placeholder="MM"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            maxLength={2}
            style={[styles.birthDateInput, error && styles.birthDateInputError]}
            textAlign="center"
          />
        </View>

        <View style={[styles.birthDateField, styles.birthDateYearField]}>
          <Text style={styles.birthDateLabel}>שנה</Text>
          <TextInput
            value={parts.year}
            onChangeText={(text) => handlePartChange("year", text)}
            onBlur={onBlur}
            placeholder="YYYY"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
            maxLength={4}
            style={[styles.birthDateInput, error && styles.birthDateInputError]}
            textAlign="center"
          />
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default function RegisterScreen() {
  const { control, handleSubmit, formState, onSubmit } = useRegisterForm();
  const { errors, isSubmitting } = formState;

  return (
    <AuthFormLayout
      heroTitle="יצירת חשבון"
      cardTitle="פרטים אישיים"
      cardSubtitle="מלא את הפרטים כדי ליצור חשבון חדש"
    >
      <View style={styles.formSection}>
        {registerFields.map((input) => (
          <Controller
            key={input.name}
            control={control}
            name={input.name}
            render={({ field }) =>
              input.name === "birthDate" ? (
                <BirthDateInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.birthDate?.message}
                />
              ) : (
                <View>
                  <GoldInput
                  label={input.label}
                  placeholder={input.placeholder}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType={input.keyboardType}
                  autoCapitalize={input.autoCapitalize}
                  autoCorrect={input.autoCorrect}
                  secureTextEntry={input.secureTextEntry}
                  textContentType={input.textContentType}
                  autoComplete={input.autoComplete}
                  returnKeyType={input.name === "password" ? "done" : "next"}
                  error={errors[input.name]?.message}
                />

                {false && (
                  <Text style={styles.fieldHint}>לדוגמה: 1995-06-15</Text>
                )}
              </View>
            )}
          />
        ))}
      </View>

      <GoldButton
        title="צור חשבון"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submitButton}
      />

      <AuthSwitchFooter
        question="כבר יש לך חשבון?"
        buttonTitle="להתחברות"
        onPress={() => router.push("/(auth)/login")}
      />
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  formSection: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    textAlign: "right",
    marginBottom: spacing.sm,
    letterSpacing: 0.15,
  },
  birthDateContainer: {
    marginBottom: spacing.lg,
  },
  birthDateRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  birthDateField: {
    flex: 1,
  },
  birthDateYearField: {
    flex: 1.25,
  },
  birthDateLabel: {
    marginBottom: spacing.xs,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    textAlign: "center",
  },
  birthDateInput: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.2,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing.sm,
  },
  birthDateInputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: 6,
    color: colors.error,
    fontSize: 12,
    textAlign: "right",
  },
  fieldHint: {
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: "right",
  },
  submitButton: {
    marginTop: spacing.xs,
  },
});
