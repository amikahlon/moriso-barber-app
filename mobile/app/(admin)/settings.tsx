import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, spacing, typography } from "../../src/constants";
import { useUpdateSettings } from "../../src/features/admin/hooks/useUpdateSettings";
import { useSettingsQuery } from "../../src/features/settings/hooks/useSettingsQuery";
import { ScreenHeader } from "../../src/features/navigation";
import type { BusinessSettings } from "../../src/types";

type TextFieldKey =
  | "businessName"
  | "phone"
  | "address"
  | "googleMapsUrl"
  | "instagramUrl"
  | "facebookUrl"
  | "logoUrl";

interface FieldConfig {
  key: TextFieldKey;
  label: string;
  placeholder: string;
  keyboardType?: TextInput["props"]["keyboardType"];
  multiline?: boolean;
}

interface SectionConfig {
  title: string;
  subtitle: string;
  fields: FieldConfig[];
}

const sections: SectionConfig[] = [
  {
    title: "פרטי העסק",
    subtitle: "המידע שהלקוחות רואים באפליקציה ובתפריט.",
    fields: [
      {
        key: "businessName",
        label: "שם העסק",
        placeholder: "מספרת מוריסו",
      },
      {
        key: "phone",
        label: "טלפון",
        placeholder: "050-000-0000",
        keyboardType: "phone-pad",
      },
      {
        key: "address",
        label: "כתובת",
        placeholder: "רוטשילד 12, תל אביב",
      },
      {
        key: "googleMapsUrl",
        label: "קישור ניווט",
        placeholder: "https://maps.google.com/...",
        multiline: true,
      },
    ],
  },
  {
    title: "קישורים ונראות",
    subtitle: "קישורים חברתיים ולוגו שמופיעים ללקוחות.",
    fields: [
      {
        key: "instagramUrl",
        label: "Instagram",
        placeholder: "https://instagram.com/...",
      },
      {
        key: "facebookUrl",
        label: "Facebook",
        placeholder: "https://facebook.com/...",
      },
      {
        key: "logoUrl",
        label: "קישור לוגו",
        placeholder: "https://example.com/logo.png",
        multiline: true,
      },
    ],
  },
];

export default function AdminSettingsScreen() {
  const { data: settings, isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<Partial<BusinessSettings>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
      setIsDirty(false);
    }
  }, [settings]);

  const handleChange = (key: keyof BusinessSettings, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleIntervalStep = (direction: 1 | -1) => {
    const current = Number(form.slotIntervalMinutes ?? 30);
    const normalized = Math.max(15, Math.round(current / 15) * 15);
    const next = Math.max(15, normalized + direction * 15);
    handleChange("slotIntervalMinutes", next);
  };

  const handleSave = () => {
    if (!isDirty) return;

    const dto: Partial<Omit<BusinessSettings, "id">> = {
      businessName: form.businessName,
      phone: form.phone,
      address: form.address,
      googleMapsUrl: form.googleMapsUrl,
      instagramUrl: form.instagramUrl,
      facebookUrl: form.facebookUrl,
      logoUrl: form.logoUrl,
      slotIntervalMinutes: form.slotIntervalMinutes,
    };

    updateMutation.mutate(dto, {
      onSuccess: () => {
        setIsDirty(false);
        Alert.alert("נשמר", "הגדרות העסק עודכנו בהצלחה.");
      },
      onError: () => {
        Alert.alert("שגיאה", "לא ניתן לשמור את ההגדרות כרגע.");
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="הגדרות עסק" />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loaderText}>טוען הגדרות...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="הגדרות עסק" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {sections.map((section) => (
            <View key={section.title} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                  <Text style={styles.cardSubtitle}>{section.subtitle}</Text>
                </View>
                <View style={styles.cardAccent} />
              </View>

              <View style={styles.fieldsList}>
                {section.fields.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        field.multiline && styles.inputMultiline,
                      ]}
                      value={String(form[field.key] ?? "")}
                      onChangeText={(value) => handleChange(field.key, value)}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textLight}
                      keyboardType={field.keyboardType ?? "default"}
                      multiline={field.multiline}
                      numberOfLines={field.multiline ? 3 : 1}
                      textAlign="right"
                      textAlignVertical={field.multiline ? "top" : "center"}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTitle}>זמני תורים</Text>
                <Text style={styles.cardSubtitle}>
                  קובע את המרווח בין השעות שמוצגות ללקוחות.
                </Text>
              </View>
              <View style={styles.cardAccent} />
            </View>

            <View style={styles.intervalBox}>
              <View style={styles.intervalInfo}>
                <Text style={styles.intervalTitle}>אינטרוול תורים</Text>
                <Text style={styles.intervalText}>
                  לדוגמה: 30 יציג תורים ב־09:00, 09:30, 10:00.
                </Text>
              </View>

              <View style={styles.numberInputWrap}>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => handleIntervalStep(1)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.stepButtonText}>+</Text>
                </TouchableOpacity>
                <View style={styles.intervalValueBox}>
                  <Text style={styles.intervalValue}>
                    {form.slotIntervalMinutes ?? 30}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => handleIntervalStep(-1)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.stepButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.numberSuffix}>דקות</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isDirty || updateMutation.isPending}
            activeOpacity={0.85}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  !isDirty && styles.saveButtonTextDisabled,
                ]}
              >
                {isDirty ? "שמור שינויים" : "אין שינויים לשמירה"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loaderText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  cardAccent: {
    width: 4,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 20,
    marginTop: 2,
    textAlign: "right",
  },
  fieldsList: {
    gap: spacing.md,
  },
  fieldContainer: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.4,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing.lg,
  },
  inputMultiline: {
    minHeight: 86,
    paddingTop: spacing.md,
    lineHeight: 21,
  },
  intervalBox: {
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  intervalInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  intervalTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  intervalText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
    marginTop: 3,
    textAlign: "right",
  },
  numberInputWrap: {
    width: 96,
    alignItems: "center",
    gap: spacing.xs,
  },
  intervalValueBox: {
    width: "100%",
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.4,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  intervalValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  stepButton: {
    width: "100%",
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonText: {
    color: colors.gold,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    lineHeight: 24,
  },
  numberSuffix: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 7,
  },
  saveButtonDisabled: {
    backgroundColor: colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
