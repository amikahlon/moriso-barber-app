import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert as RNAlert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Alert as AlertType } from "../../src/types";
import { colors, spacing, typography } from "../../src/constants";
import { useAlertsManager } from "../../src/features/admin/hooks/useAlertsManager";
import { ScreenHeader } from "../../src/features/navigation";

interface AlertFormState {
  title: string;
  body: string;
  isActive: boolean;
}

const emptyForm = (): AlertFormState => ({
  title: "",
  body: "",
  isActive: true,
});

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AdminAlertsScreen() {
  const { alerts, isLoading, createAlert, updateAlert, deleteAlert } =
    useAlertsManager();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertType | null>(null);
  const [form, setForm] = useState<AlertFormState>(emptyForm());

  const sortedAlerts = useMemo(
    () =>
      alerts
        .slice()
        .sort(
          (a, b) =>
            Number(b.isActive) - Number(a.isActive) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [alerts],
  );

  const activeCount = alerts.filter((alert) => alert.isActive).length;
  const isPending =
    createAlert.isPending || updateAlert.isPending || deleteAlert.isPending;

  const handleAdd = () => {
    setEditingAlert(null);
    setForm(emptyForm());
    setSheetVisible(true);
  };

  const handleEdit = (alert: AlertType) => {
    setEditingAlert(alert);
    setForm({
      title: alert.title,
      body: alert.body,
      isActive: alert.isActive,
    });
    setSheetVisible(true);
  };

  const handleDelete = (alert: AlertType) => {
    RNAlert.alert(
      "מחיקת הודעה",
      `למחוק את "${alert.title}"? לא ניתן לשחזר את הפעולה.`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => deleteAlert.mutate(alert.id),
        },
      ],
    );
  };

  const handleToggleActive = (alert: AlertType) => {
    updateAlert.mutate({
      id: alert.id,
      dto: { isActive: !alert.isActive },
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      RNAlert.alert("שגיאה", "יש להזין כותרת");
      return;
    }

    if (!form.body.trim()) {
      RNAlert.alert("שגיאה", "יש להזין תוכן הודעה");
      return;
    }

    const dto = {
      title: form.title.trim(),
      body: form.body.trim(),
      isActive: form.isActive,
    };

    if (editingAlert) {
      updateAlert.mutate(
        { id: editingAlert.id, dto },
        {
          onSuccess: () => setSheetVisible(false),
          onError: () => {
            RNAlert.alert("שגיאה", "לא ניתן לעדכן את ההודעה כרגע.");
          },
        },
      );
      return;
    }

    createAlert.mutate(dto, {
      onSuccess: () => setSheetVisible(false),
      onError: () => {
        RNAlert.alert("שגיאה", "לא ניתן ליצור את ההודעה כרגע.");
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="הודעות ועדכונים" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>הודעה חדשה</Text>
          </TouchableOpacity>

          <View style={styles.toolbarTitleWrap}>
            <Text style={styles.toolbarTitle}>מרכז הודעות</Text>
            <Text style={styles.toolbarSubtitle}>
              ניהול הודעות שמופיעות ללקוחות בעמוד הבית.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{alerts.length}</Text>
            <Text style={styles.statLabel}>סה"כ</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={[styles.statValue, styles.activeValue]}>
              {activeCount}
            </Text>
            <Text style={styles.statLabel}>פעילות</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={[styles.statValue, styles.inactiveValue]}>
              {alerts.length - activeCount}
            </Text>
            <Text style={styles.statLabel}>כבויות</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>טוען הודעות...</Text>
          </View>
        ) : sortedAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>אין הודעות עדיין</Text>
            <Text style={styles.emptyText}>
              צור הודעה ראשונה כדי לעדכן לקוחות על שעות פעילות, חופשות או
              מבצעים.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>צור הודעה ראשונה</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedAlerts.map((alert) => (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  !alert.isActive && styles.alertCardInactive,
                ]}
              >
                <View
                  style={[
                    styles.statusBadge,
                    !alert.isActive && styles.statusBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      !alert.isActive && styles.statusTextInactive,
                    ]}
                  >
                    {alert.isActive ? "פעיל" : "כבוי"}
                  </Text>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <Text numberOfLines={1} style={styles.alertTitle}>
                      {alert.title}
                    </Text>
                  </View>

                  <Text numberOfLines={2} style={styles.alertBody}>
                    {alert.body}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaValue}>
                        {formatDate(alert.createdAt)}
                      </Text>
                      <Text style={styles.metaLabel}>נוצרה</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Switch
                    value={alert.isActive}
                    onValueChange={() => handleToggleActive(alert)}
                    trackColor={{
                      false: colors.borderLight,
                      true: colors.gold,
                    }}
                    thumbColor={colors.backgroundCard}
                    style={styles.switch}
                  />
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(alert)}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.editButtonText}>ערוך</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(alert)}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.deleteButtonText}>מחק</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      )}

      <Modal
        visible={sheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.dismissArea}
            onPress={() => setSheetVisible(false)}
          />

          <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSheetVisible(false)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                <View style={styles.sheetTitleWrap}>
                  <Text style={styles.sheetTitle}>
                    {editingAlert ? "עריכת הודעה" : "הודעה חדשה"}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {editingAlert
                      ? "עדכן את ההודעה שמוצגת ללקוחות."
                      : "ההודעה תופיע ללקוחות בעמוד הבית."}
                  </Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={styles.sheetBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>כותרת *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={(value) =>
                      setForm((prev) => ({ ...prev, title: value }))
                    }
                    placeholder="לדוגמה: סגור מחר"
                    placeholderTextColor={colors.textLight}
                    textAlign="right"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>תוכן ההודעה *</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={form.body}
                    onChangeText={(value) =>
                      setForm((prev) => ({ ...prev, body: value }))
                    }
                    placeholder="פרטי ההודעה ללקוחות..."
                    placeholderTextColor={colors.textLight}
                    multiline
                    numberOfLines={4}
                    textAlign="right"
                    textAlignVertical="top"
                  />
                </View>


                <View style={styles.switchRow}>
                  <Switch
                    value={form.isActive}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, isActive: value }))
                    }
                    trackColor={{
                      false: colors.borderLight,
                      true: colors.gold,
                    }}
                    thumbColor={colors.backgroundCard}
                  />
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>
                      {form.isActive ? "הודעה פעילה" : "הודעה כבויה"}
                    </Text>
                    <Text style={styles.switchSubLabel}>
                      {form.isActive
                        ? "תוצג ללקוחות אחרי השמירה."
                        : "תישמר במערכת בלי להופיע ללקוחות."}
                    </Text>
                  </View>
                </View>

                {(form.title || form.body) && (
                  <View style={styles.previewBlock}>
                    <Text style={styles.previewLabel}>תצוגה מקדימה</Text>
                    <View style={styles.previewCard}>
                      <View style={styles.previewMarker} />
                      <View style={styles.previewContent}>
                        <Text numberOfLines={1} style={styles.previewTitle}>
                          {form.title || "כותרת ההודעה"}
                        </Text>
                        <Text numberOfLines={3} style={styles.previewBody}>
                          {form.body || "תוכן ההודעה יוצג כאן."}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={createAlert.isPending || updateAlert.isPending}
                  activeOpacity={0.85}
                >
                  {createAlert.isPending || updateAlert.isPending ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingAlert ? "שמור שינויים" : "פרסם הודעה"}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.sheetBottomSpacer} />
              </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  toolbarTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  toolbarTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  toolbarSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 19,
    marginTop: 2,
    textAlign: "right",
  },
  addButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  addButtonIcon: {
    color: colors.gold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    lineHeight: 20,
  },
  addButtonText: {
    color: colors.gold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statTile: {
    flex: 1,
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  statValue: {
    color: colors.textGold,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
  },
  activeValue: {
    color: colors.success,
  },
  inactiveValue: {
    color: colors.textLight,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  loadingState: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    minHeight: 240,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  emptyButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  list: {
    gap: spacing.md,
  },
  alertCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  alertCardInactive: {
    opacity: 0.72,
  },
  statusBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeInactive: {
    backgroundColor: colors.backgroundInput,
    borderColor: colors.border,
  },
  statusText: {
    color: colors.gold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  statusTextInactive: {
    color: colors.textLight,
  },
  cardInfo: {
    flex: 1,
    alignItems: "flex-end",
    minWidth: 0,
  },
  cardTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  alertTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  alertBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  metaChip: {
    minHeight: 30,
    borderRadius: 10,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  actions: {
    width: 64,
    gap: spacing.xs,
  },
  switch: {
    alignSelf: "center",
    transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }],
  },
  editButton: {
    minHeight: 34,
    borderRadius: 11,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: colors.textDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  deleteButton: {
    minHeight: 34,
    borderRadius: 11,
    backgroundColor: "rgba(224,92,92,0.06)",
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14,14,16,0.26)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(14,14,16,0.52)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
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
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: "#FFFCF4",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,164,42,0.12)",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: 20,
  },
  sheetTitleWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  sheetSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: "right",
  },
  sheetBody: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.textDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    textAlign: "right",
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1.2,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing.lg,
  },
  inputMultiline: {
    height: 104,
    paddingTop: spacing.md,
  },
  switchRow: {
    minHeight: 74,
    borderRadius: 16,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  switchInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  switchLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  switchSubLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 17,
    marginTop: 2,
    textAlign: "right",
  },
  previewBlock: {
    marginBottom: spacing.lg,
  },
  previewLabel: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    textAlign: "right",
  },
  previewCard: {
    borderRadius: 14,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    flexDirection: "row-reverse",
    overflow: "hidden",
  },
  previewMarker: {
    width: 5,
    backgroundColor: colors.gold,
  },
  previewContent: {
    flex: 1,
    padding: spacing.md,
    alignItems: "flex-end",
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  previewBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  sheetBottomSpacer: {
    height: spacing.xl,
  },
});
