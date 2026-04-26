import { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

import { ScreenLoader } from "../../src/components/common";
import { colors, typography, spacing } from "../../src/constants";
import { useCurrentUserQuery } from "../../src/features/auth/hooks";
import { CancelBookingDialog } from "../../src/features/booking/components";
import { useCancelBooking } from "../../src/features/booking/hooks";
import { useHome, useMyBooking } from "../../src/features/home/hooks";
import {
  formatBookingDate,
  sortBookingsByStart,
} from "../../src/features/home/utils/bookings";
import { DrawerToggle } from "../../src/features/navigation";
import { useSettingsQuery } from "../../src/features/settings/hooks";

export default function HomeScreen() {
  const currentUserQuery = useCurrentUserQuery();
  const { alerts, isLoading } = useHome();
  const { bookings } = useMyBooking();
  const cancelBooking = useCancelBooking();
  const { data: settings } = useSettingsQuery();
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(
    null,
  );
  const sortedBookings = sortBookingsByStart(bookings);
  const activeAlert =
    alerts.length > 0 ? alerts[activeAlertIndex % alerts.length] : null;
  const googleMapsUrl = settings?.googleMapsUrl;
  const instagramUrl = settings?.instagramUrl;

  const handleNavigateToBarber = () => {
    if (googleMapsUrl) {
      void Linking.openURL(googleMapsUrl);
    }
  };

  const handleCallBarber = () => {
    if (settings?.phone) {
      void Linking.openURL(`tel:${settings.phone}`);
    }
  };

  const handleOpenInstagram = () => {
    if (instagramUrl) {
      void Linking.openURL(instagramUrl);
    }
  };

  const handleCancelBooking = () => {
    if (!bookingToCancelId) {
      return;
    }

    cancelBooking.mutate(bookingToCancelId, {
      onSuccess: () => {
        setBookingToCancelId(null);
      },
      onError: () => {
        Alert.alert("שגיאה", "לא הצלחנו לבטל את התור. נסה שוב.");
      },
    });
  };

  useEffect(() => {
    setActiveAlertIndex(0);
  }, [alerts.length]);

  useEffect(() => {
    if (alerts.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveAlertIndex((current) => (current + 1) % alerts.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, [alerts.length]);

  if (currentUserQuery.isLoading || isLoading) {
    return <ScreenLoader />;
  }

  const user = currentUserQuery.data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#0E0E10", "#1A1A1F", "#2B2418", "#A97819"]}
        locations={[0, 0.32, 0.72, 1]}
        start={{ x: 0.04, y: 0.08 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroOrb} />
        <View style={styles.heroOrbSecondary} />
        <View style={styles.heroLine} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroSpacer} />
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.menuButtonWrap}>
            <DrawerToggle />
          </View>
        </View>

        <View style={styles.greetingContainer}>
          {user?.role === "admin" && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>מנהל</Text>
            </View>
          )}

          <Text style={styles.greeting}>שלום, {user?.full_name ?? "..."}</Text>

          <Text style={styles.subGreeting}>
            {user?.role === "admin"
              ? "ברוך הבא לממשק הניהול"
              : "במה נוכל לעזור היום?"}
          </Text>
        </View>

        <View style={styles.bottomSweep} />
      </LinearGradient>

      <View style={styles.noticeBoardSection}>
        <View style={styles.noticeBoardHeader}>
          <View style={styles.noticeBoardPin} />
          <Text style={styles.noticeBoardTitle}>הודעות מערכת</Text>
        </View>

        <View style={styles.noticeBoard}>
          <Image
            source={require("../../assets/moriso-c.png")}
            style={styles.noticeBoardCharacter}
            resizeMode="contain"
          />

          {activeAlert ? (
            <>
              <View style={styles.alertCard}>
                <Text style={styles.alertKicker}>עדכון מהספר</Text>
                <Text style={styles.alertTitle}>{activeAlert.title}</Text>
                <Text style={styles.alertBody}>{activeAlert.body}</Text>
              </View>

              {alerts.length > 1 && (
                <View style={styles.noticeBoardFooter}>
                  <View style={styles.noticeDots}>
                    {alerts.map((alert, index) => (
                      <TouchableOpacity
                        key={alert.id}
                        style={[
                          styles.noticeDot,
                          index === activeAlertIndex && styles.noticeDotActive,
                        ]}
                        onPress={() => setActiveAlertIndex(index)}
                        activeOpacity={0.85}
                      />
                    ))}
                  </View>

                  <View style={styles.noticeControls}>
                    <TouchableOpacity
                      style={styles.noticeControlButton}
                      onPress={() =>
                        setActiveAlertIndex(
                          (current) =>
                            (current - 1 + alerts.length) % alerts.length,
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.noticeControlText}>‹</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.noticeControlButton}
                      onPress={() =>
                        setActiveAlertIndex(
                          (current) => (current + 1) % alerts.length,
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.noticeControlText}>›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noAlertsCard}>
              <Text style={styles.noAlertsText}>אין הודעות חדשות</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.noticeBookingButton}
          onPress={() => router.push("/(app)/booking")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.goldLight, colors.gold, colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noticeBookingGradient}
          >
            <Text style={styles.noticeBookingText}>קבעו תור</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>התורים שלי</Text>
          {sortedBookings.length > 0 && (
            <View style={styles.bookingCountBadge}>
              <Text style={styles.bookingCountText}>
                {sortedBookings.length}
              </Text>
            </View>
          )}
        </View>

        {sortedBookings.length > 0 ? (
          <View style={styles.bookingsList}>
            {sortedBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingAccent} />
                <View style={styles.bookingTop}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingService}>
                      {booking.service?.name ?? "שירות לא זמין"}
                    </Text>

                    <Text style={styles.bookingDate}>
                      {formatBookingDate(booking.bookingDate)}
                    </Text>
                  </View>

                  <View style={styles.bookingTimeBadge}>
                    <Text style={styles.bookingTimeText}>
                      {booking.startTime?.slice(0, 5) ?? "--:--"}
                    </Text>
                    <Text style={styles.bookingTimeLabel}>שעה</Text>
                  </View>
                </View>

                <View style={styles.bookingDivider} />

                <View style={styles.bookingBottom}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      cancelBooking.isPending && styles.cancelButtonDisabled,
                    ]}
                    onPress={() => setBookingToCancelId(booking.id)}
                    disabled={cancelBooking.isPending}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancelBooking.isPending ? "מבטל..." : "ביטול תור"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noBookingCard}>
            <Text style={styles.noBookingTitle}>אין תורים</Text>
            <Text style={styles.noBookingSubtitle}>אין תורים קרובים כרגע</Text>
          </View>
        )}
      </View>

      <View style={styles.contactSection}>
        <View style={styles.contactCard}>
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={[
                styles.contactButton,
                !settings?.phone && styles.contactButtonDisabled,
              ]}
              onPress={handleCallBarber}
              disabled={!settings?.phone}
              activeOpacity={0.85}
            >
              <Text style={styles.contactButtonTitle}>חייגו אלינו</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactButton,
                styles.contactButtonDark,
                !googleMapsUrl && styles.contactButtonDisabled,
              ]}
              onPress={handleNavigateToBarber}
              disabled={!googleMapsUrl}
              activeOpacity={0.85}
            >
              <Text style={styles.contactButtonTitleDark}>נווטו אלינו</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.instagramButton,
              !instagramUrl && styles.contactButtonDisabled,
            ]}
            onPress={handleOpenInstagram}
            disabled={!instagramUrl}
            activeOpacity={0.85}
          >
            <FontAwesome name="instagram" size={30} color={colors.textGold} />

            <View style={styles.instagramTextWrap}>
              <Text style={styles.instagramTitle}>עקבו אחרינו</Text>
              <Text style={styles.instagramSubtitle}>Instagram</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.appFooter}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerBeta}>גרסת בטא Beta</Text>
        <Text style={styles.footerCredit}>
          פותח על ידי עמי כחלון | 0525522227
        </Text>
      </View>

      <CancelBookingDialog
        visible={!!bookingToCancelId}
        isLoading={cancelBooking.isPending}
        onCancel={() => setBookingToCancelId(null)}
        onConfirm={handleCancelBooking}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  hero: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: 34,
    overflow: "hidden",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,193,59,0.10)",
    top: -48,
    right: -40,
  },
  heroOrbSecondary: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: 36,
    left: -44,
  },
  heroLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: "22%",
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  menuButtonWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  logo: {
    width: 164,
    height: 54,
  },
  heroSpacer: {
    width: 48,
  },
  greetingContainer: {
    alignItems: "flex-end",
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.40)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  roleBadgeText: {
    color: colors.gold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  greeting: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
    color: colors.textWhite,
    textAlign: "right",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: typography.sizes.md,
    color: "rgba(255,255,255,0.72)",
    textAlign: "right",
    maxWidth: "82%",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  bottomSweep: {
    position: "absolute",
    left: -12,
    right: -12,
    bottom: -10,
    height: 26,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: "right",
  },
  noticeBoardSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  noticeBoardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  noticeBoardPin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeBoardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    textAlign: "right",
  },
  noticeBoard: {
    backgroundColor: "#FFF7E7",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.goldBorder,
    minHeight: 148,
    padding: spacing.md,
    paddingLeft: 112,
    position: "relative",
    overflow: "hidden",
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  noticeBoardCharacter: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 116,
    height: 135,
    zIndex: 3,
  },
  alertCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.16)",
    overflow: "hidden",
    padding: spacing.lg,
    paddingLeft: spacing.xl,
    alignItems: "flex-end",
    minHeight: 112,
    justifyContent: "center",
    marginLeft: -24,
  },
  alertKicker: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.textGold,
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  alertBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: "right",
    lineHeight: 21,
  },
  noticeBoardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  noticeDots: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
  },
  noticeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(154,144,130,0.34)",
  },
  noticeDotActive: {
    width: 18,
    backgroundColor: colors.gold,
  },
  noticeControls: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  noticeControlButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  noticeControlText: {
    color: colors.textGold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  noAlertsCard: {
    backgroundColor: "rgba(255,253,248,0.72)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.12)",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  noAlertsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  noticeBookingButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: spacing.md,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  noticeBookingGradient: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  noticeBookingText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  bookingsList: {
    gap: spacing.md,
  },
  bookingCountBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.sm,
  },
  bookingCountText: {
    color: colors.gold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
  },
  bookingCard: {
    backgroundColor: "#FFFEFA",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(212,164,42,0.10)",
    overflow: "hidden",
    position: "relative",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  bookingAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "rgba(212,164,42,0.42)",
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingRight: spacing.xxl,
    gap: spacing.md,
  },
  bookingTimeBadge: {
    backgroundColor: "rgba(212,164,42,0.08)",
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.18)",
    alignItems: "center",
    minWidth: 86,
  },
  bookingTimeText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.textGold,
  },
  bookingTimeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingInfo: {
    alignItems: "flex-end",
    flex: 1,
  },
  bookingService: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bookingDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xl,
  },
  bookingBottom: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "rgba(224,92,92,0.26)",
    backgroundColor: "rgba(224,92,92,0.04)",
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButtonDisabled: {
    opacity: 0.55,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  noBookingCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: spacing.xxxl,
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  noBookingTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  noBookingSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  contactSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  contactCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.2,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    gap: spacing.md,
  },
  contactActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  contactButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  contactButtonDark: {
    backgroundColor: colors.primary,
    borderColor: colors.gold,
  },
  contactButtonDisabled: {
    opacity: 0.45,
  },
  contactButtonTitle: {
    color: colors.textGold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  contactButtonTitleDark: {
    color: colors.gold,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  instagramButton: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: "#FFFEFA",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  instagramTextWrap: {
    alignItems: "flex-end",
  },
  instagramTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
  },
  instagramSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  appFooter: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: "center",
  },
  footerDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    opacity: 0.7,
    marginBottom: spacing.md,
  },
  footerBeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  footerCredit: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 3,
    textAlign: "center",
  },
});
