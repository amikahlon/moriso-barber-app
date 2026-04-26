import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Service } from "../../../types";
import { colors, spacing, typography } from "../../../constants";

interface ServiceFormSheetProps {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onSave: (dto: {
    name: string;
    price: number;
    durationMinutes: number;
    description?: string;
    sortOrder?: number;
  }) => void;
  isPending: boolean;
}

export const ServiceFormSheet: React.FC<ServiceFormSheetProps> = ({
  visible,
  service,
  onClose,
  onSave,
  isPending,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const isEditing = !!service;

  useEffect(() => {
    if (visible) {
      setName(service?.name ?? "");
      setPrice(service ? String(service.price) : "");
      setDuration(service ? String(service.durationMinutes) : "");
      setDescription(service?.description ?? "");
      setSortOrder(service ? String(service.sortOrder) : "0");
    }
  }, [visible, service]);

  const handleSave = () => {
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const priceValue = Number(price);
    const durationValue = Number(duration);

    if (!normalizedName) {
      Alert.alert("שם חסר", "יש להזין שם שירות.");
      return;
    }

    if (!price || Number.isNaN(priceValue) || priceValue <= 0) {
      Alert.alert("מחיר לא תקין", "יש להזין מחיר גדול מ־0.");
      return;
    }

    if (!duration || Number.isNaN(durationValue) || durationValue <= 0) {
      Alert.alert("משך לא תקין", "יש להזין משך טיפול בדקות.");
      return;
    }

    onSave({
      name: normalizedName,
      price: priceValue,
      durationMinutes: durationValue,
      description: normalizedDescription || undefined,
      sortOrder: Number(sortOrder) || 0,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <View style={styles.titleWrap}>
              <Text style={styles.title}>
                {isEditing ? "עריכת שירות" : "שירות חדש"}
              </Text>
              <Text style={styles.subtitle}>
                {isEditing ? service.name : "הגדר שם, מחיר ומשך טיפול"}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <Text style={styles.label}>שם השירות</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="לדוגמה: תספורת קלאסית"
                placeholderTextColor={colors.textLight}
                textAlign="right"
              />
            </View>

            <View style={styles.doubleRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>משך בדקות</Text>
                <TextInput
                  style={[styles.input, styles.centerInput]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="30"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  textAlign="center"
                  maxLength={3}
                />
              </View>

              <View style={styles.fieldHalf}>
                <Text style={styles.label}>מחיר</Text>
                <TextInput
                  style={[styles.input, styles.centerInput]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="80"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  textAlign="center"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>תיאור</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="תיאור קצר שיופיע ללקוחות"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
                textAlign="right"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.orderPanel}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>סדר הצגה</Text>
                <Text style={styles.orderText}>
                  מספר נמוך יותר יופיע גבוה יותר ברשימת השירותים.
                </Text>
              </View>
              <TextInput
                style={styles.orderInput}
                value={sortOrder}
                onChangeText={setSortOrder}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={2}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isPending && styles.disabled]}
              onPress={handleSave}
              disabled={isPending}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? "שמור שינויים" : "צור שירות"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(14,14,16,0.52)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    maxHeight: "92%",
    borderRadius: 24,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: "#FFFCF4",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,164,42,0.12)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
  },
  titleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
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
  centerInput: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  inputMultiline: {
    minHeight: 86,
    paddingTop: spacing.md,
    lineHeight: 21,
  },
  doubleRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  fieldHalf: {
    flex: 1,
    gap: spacing.xs,
  },
  orderPanel: {
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  orderInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  orderTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  orderText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
    marginTop: 2,
    textAlign: "right",
  },
  orderInput: {
    width: 70,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.4,
    borderColor: colors.goldBorder,
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
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
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 7,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  disabled: {
    opacity: 0.62,
  },
});
