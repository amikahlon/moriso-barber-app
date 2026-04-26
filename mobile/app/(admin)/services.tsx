import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Service } from "../../src/types";
import { colors, spacing, typography } from "../../src/constants";
import { ServiceFormSheet } from "../../src/features/admin/components/ServiceFormSheet";
import { useServicesManager } from "../../src/features/admin/hooks/useServicesManager";
import { ScreenHeader } from "../../src/features/navigation";

export default function AdminServicesScreen() {
  const { services, isLoading, createService, updateService, deleteService } =
    useServicesManager();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const sortedServices = useMemo(
    () => services.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [services],
  );

  const handleAdd = () => {
    setEditingService(null);
    setSheetVisible(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setSheetVisible(true);
  };

  const handleDelete = (service: Service) => {
    Alert.alert(
      "מחיקת שירות",
      `למחוק את "${service.name}"? לא ניתן לשחזר את הפעולה.`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => deleteService.mutate(service.id),
        },
      ],
    );
  };

  const handleSave = (dto: Parameters<typeof createService.mutate>[0]) => {
    if (editingService) {
      updateService.mutate(
        { id: editingService.id, dto },
        {
          onSuccess: () => setSheetVisible(false),
          onError: () => {
            Alert.alert("שגיאה", "לא ניתן לעדכן את השירות כרגע.");
          },
        },
      );
      return;
    }

    createService.mutate(dto, {
      onSuccess: () => setSheetVisible(false),
      onError: () => {
        Alert.alert("שגיאה", "לא ניתן ליצור את השירות כרגע.");
      },
    });
  };

  const isPending =
    createService.isPending ||
    updateService.isPending ||
    deleteService.isPending;

  return (
    <View style={styles.container}>
      <ScreenHeader title="ניהול שירותים" />

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
            <Text style={styles.addButtonText}>שירות חדש</Text>
          </TouchableOpacity>

          <View style={styles.toolbarTitleWrap}>
            <Text style={styles.toolbarTitle}>קטלוג שירותים</Text>
            <Text style={styles.toolbarSubtitle}>
              עריכת מחיר, משך טיפול וסדר הצגה ללקוחות.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>טוען שירותים...</Text>
          </View>
        ) : sortedServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>אין שירותים עדיין</Text>
            <Text style={styles.emptyText}>
              הוסף את השירות הראשון כדי שלקוחות יוכלו לבחור תור.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>הוסף שירות ראשון</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedServices.map((service, index) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderText}>{index + 1}</Text>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>₪{service.price}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.serviceName}>
                      {service.name}
                    </Text>
                  </View>

                  {service.description ? (
                    <Text numberOfLines={2} style={styles.serviceDescription}>
                      {service.description}
                    </Text>
                  ) : (
                    <Text style={styles.serviceDescriptionMuted}>
                      אין תיאור לשירות
                    </Text>
                  )}

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaValue}>
                        {service.durationMinutes}
                      </Text>
                      <Text style={styles.metaLabel}>דקות</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaValue}>{service.sortOrder}</Text>
                      <Text style={styles.metaLabel}>סדר</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(service)}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.editButtonText}>ערוך</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(service)}
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

      <ServiceFormSheet
        visible={sheetVisible}
        service={editingService}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
        isPending={createService.isPending || updateService.isPending}
      />
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
  serviceCard: {
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
  orderBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  orderText: {
    color: colors.gold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
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
  serviceName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  priceBadge: {
    borderRadius: 999,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  priceText: {
    color: colors.textGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  serviceDescription: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  serviceDescriptionMuted: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
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
    fontSize: typography.sizes.sm,
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
});
