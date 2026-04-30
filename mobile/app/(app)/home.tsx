import { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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

import { colors, typography, spacing } from "../../src/constants";
import { useCurrentUserQuery } from "../../src/features/auth/hooks";
import { CancelBookingDialog } from "../../src/features/booking/components";
import {
  useBookingServices,
  useCancelBooking,
} from "../../src/features/booking/hooks";
import { useHome, useMyBooking } from "../../src/features/home/hooks";
import {
  formatBookingDate,
  sortBookingsByStart,
} from "../../src/features/home/utils/bookings";
import { DrawerToggle } from "../../src/features/navigation";
import { useSettingsQuery } from "../../src/features/settings/hooks";
import { useAuth } from "../../src/hooks";

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const currentUserQuery = useCurrentUserQuery();
  const { alerts, isLoading: alertsLoading } = useHome();
  const { bookings } = useMyBooking();
  const cancelBooking = useCancelBooking();
  const servicesQuery = useBookingServices();
  const { data: settings } = useSettingsQuery();
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(
    null,
  );
  const sortedBookings = isAuthenticated ? sortBookingsByStart(bookings) : [];
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

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    router.push("/(app)/booking");
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

  const user = isAuthenticated ? currentUserQuery.data : null;

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
          <Text style={styles.greeting}>
            {isAuthenticated
              ? `שלום, ${user?.full_name ?? "..."}`
              : "שלום אורח"}
          </Text>

          {isAuthenticated && (
            <Text style={styles.subGreeting}>
              {user?.role === "admin"
                ? "ברוך הבא לממשק הניהול"
                : "במה נוכל לעזור היום?"}
            </Text>
          )}

          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.heroAuthButton}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroAuthText}>התחברות / הרשמה</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSweep} />
      </LinearGradient>

      <View style={styles.noticeBoardSection}>
        <View style={styles.noticeBoardHeader}>
          <View style={styles.noticeBoardPin} />
          <Text style={styles.noticeBoardTitle}>הודעות מערכת</Text>
        </View>

        <LinearGradient
          colors={["#FFFDF8", "#FFF6E1", "#FFEFC2"]}
          locations={[0, 0.62, 1]}
          start={{ x: 0.08, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.noticeBoard}
        >
          <View style={styles.noticeSoftWash} />
          <Image
            source={require("../../assets/moriso-c.png")}
            style={styles.noticeBoardCharacter}
            resizeMode="contain"
          />

          {alertsLoading ? (
            <View style={styles.noAlertsCard}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : activeAlert ? (
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
        </LinearGradient>

        <TouchableOpacity
          style={styles.noticeBookingButton}
          onPress={handleBookAppointment}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.goldLight, colors.gold, colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noticeBookingGradient}
          >
            <View style={styles.noticeBookingContent}>
              <Text style={styles.noticeBookingText}>קבעו תור</Text>
            </View>
          </LinearGradient>
          <View style={styles.noticeBookingFrame} pointerEvents="none" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>השירותים שלנו</Text>
        </View>

        {servicesQuery.isLoading ? (
          <View style={styles.servicesLoadingCard}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : servicesQuery.data?.length ? (
          <View style={styles.servicesList}>
            {servicesQuery.data.map((service, index) => (
              <LinearGradient
                key={service.id}
                colors={
                  index % 2 === 0
                    ? ["#FFFEFA", "#FFF8EA"]
                    : ["#FFFFFF", "#F8F3EA"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.homeServiceCard}
              >
                <View style={styles.serviceAccentLine} />
                <Text style={styles.servicePriceTag}>₪{service.price}</Text>
                <View style={styles.serviceContent}>
                  <View style={styles.serviceTitleRow}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </View>

                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description?.trim() ||
                      "טיפול מוקפד, נקי ומותאם בדיוק ללוק שלך."}
                  </Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        ) : (
          <View style={styles.servicesEmptyCard}>
            <Text style={styles.servicesEmptyText}>אין שירותים להצגה כרגע</Text>
          </View>
        )}
      </View>

      {isAuthenticated && (
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
              <Text style={styles.noBookingSubtitle}>
                אין תורים קרובים כרגע
              </Text>
            </View>
          )}
        </View>
      )}

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
              <View style={styles.contactIconWrap}>
                <FontAwesome name="phone" size={17} color={colors.textGold} />
              </View>
              <Text style={styles.contactButtonTitle}>חייגו אלינו</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactButton,
                !googleMapsUrl && styles.contactButtonDisabled,
              ]}
              onPress={handleNavigateToBarber}
              disabled={!googleMapsUrl}
              activeOpacity={0.85}
            >
              <View style={styles.contactIconWrap}>
                <FontAwesome
                  name="map-marker"
                  size={18}
                  color={colors.textGold}
                />
              </View>
              <Text style={styles.contactButtonTitle}>נווטו אלינו</Text>
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
  heroAuthButton: {
    marginTop: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(247,206,85,0.36)",
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  heroAuthText: {
    color: colors.goldLight,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.26,
    shadowRadius: 5,
    elevation: 3,
  },
  noticeBoardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    textAlign: "right",
  },
  noticeBoard: {
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "rgba(212,164,42,0.26)",
    minHeight: 156,
    padding: spacing.md,
    paddingLeft: 112,
    position: "relative",
    overflow: "hidden",
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  noticeSoftWash: {
    position: "absolute",
    top: -36,
    right: -28,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(212,164,42,0.13)",
  },
  noticeBoardCharacter: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 122,
    height: 142,
    zIndex: 3,
  },
  alertCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.18)",
    overflow: "hidden",
    padding: spacing.lg,
    paddingLeft: spacing.xl,
    alignItems: "flex-end",
    minHeight: 112,
    justifyContent: "center",
    marginLeft: -24,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  alertKicker: {
    fontSize: typography.sizes.xs,
    color: colors.textGold,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  alertBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: "right",
    lineHeight: 22,
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
    backgroundColor: "rgba(154,144,130,0.30)",
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
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.24)",
  },
  noticeControlText: {
    color: colors.textGold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  noAlertsCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.18)",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  noAlertsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  noticeBookingButton: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: spacing.md,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 7,
    backgroundColor: colors.gold,
  },
  noticeBookingFrame: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    zIndex: 2,
  },
  noticeBookingContent: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    position: "relative",
    zIndex: 2,
  },
  noticeBookingGradient: {
    minHeight: 56,
  },
  noticeBookingText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
  },
  servicesIntro: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 21,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    textAlign: "right",
  },
  servicesList: {
    gap: spacing.md,
  },
  homeServiceCard: {
    minHeight: 86,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.18)",
    overflow: "hidden",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    position: "relative",
  },
  serviceAccentLine: {
    position: "absolute",
    top: spacing.md,
    right: 0,
    bottom: spacing.md,
    width: 3,
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    backgroundColor: "rgba(212,164,42,0.45)",
  },
  servicePriceTag: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
    color: colors.textGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    textAlign: "left",
  },
  serviceContent: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: spacing.md,
    paddingLeft: 58,
  },
  serviceTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
    flex: 1,
  },
  serviceDescription: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 21,
    textAlign: "right",
    maxWidth: "92%",
  },
  servicesLoadingCard: {
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  servicesEmptyCard: {
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  servicesEmptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: "center",
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
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.24)",
    backgroundColor: "#FFFCF5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadowGold,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 2,
  },
  contactButtonDisabled: {
    opacity: 0.45,
  },
  contactIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,164,42,0.22)",
    backgroundColor: "rgba(212,164,42,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonTitle: {
    color: colors.textGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
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
