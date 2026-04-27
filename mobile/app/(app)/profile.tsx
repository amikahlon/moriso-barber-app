import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenLoader } from "../../src/components/common";
import { colors, typography, spacing } from "../../src/constants";
import {
  useCurrentUserQuery,
  useDeleteAccount,
} from "../../src/features/auth/hooks";
import { ScreenHeader } from "../../src/features/navigation";

const PRIVACY_POLICY_URL = "https://amikahlon.github.io/privacy-policy";

const profileText = {
  accountDetails: "פרטי החשבון שלך",
  birthDate: "תאריך לידה",
  cancel: "ביטול",
  deleteAccount: "מחיקת החשבון",
  deleteAccountConfirm:
    "הפעולה תמחק את החשבון שלך לצמיתות. להמשיך?",
  deleteAccountError:
    "לא ניתן למחוק את החשבון כרגע. נסה שוב.",
  deleteAccountTitle: "למחוק את החשבון?",
  deletingAccount: "מוחק...",
  email: "אימייל",
  errorTitle: "שגיאה",
  fullName: "שם מלא",
  personalDetails: "פרטים אישיים",
  phone: "טלפון",
  privacy: "פרטיות",
  privacyPolicy: "מדיניות פרטיות",
  settings: "הגדרות",
  unavailable: "לא זמין",
  user: "משתמש",
} as const;

const formatBirthDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoValue}>{value || profileText.unavailable}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const currentUserQuery = useCurrentUserQuery();
  const deleteAccount = useDeleteAccount();
  const user = currentUserQuery.data;
  const birthDate = formatBirthDate(user?.birthDate ?? user?.birth_date);

  const handleOpenPrivacyPolicy = () => {
    void Linking.openURL(PRIVACY_POLICY_URL);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      profileText.deleteAccountTitle,
      profileText.deleteAccountConfirm,
      [
        {
          text: profileText.cancel,
          style: "cancel",
        },
        {
          text: profileText.deleteAccount,
          style: "destructive",
          onPress: () => {
            deleteAccount.mutate(undefined, {
              onError: () => {
                Alert.alert(
                  profileText.errorTitle,
                  profileText.deleteAccountError,
                );
              },
            });
          },
        },
      ],
    );
  };

  if (currentUserQuery.isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={profileText.settings} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.full_name?.trim()?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>

          <Text style={styles.title}>{user?.full_name ?? profileText.user}</Text>
          <Text style={styles.subtitle}>{profileText.accountDetails}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardAccent} />
            <Text style={styles.cardTitle}>{profileText.personalDetails}</Text>
          </View>

          <InfoRow label={profileText.fullName} value={user?.full_name} />
          <InfoRow label={profileText.email} value={user?.email} />
          <InfoRow label={profileText.phone} value={user?.phone} />
          {birthDate && (
            <InfoRow
              label={profileText.birthDate}
              value={birthDate}
            />
          )}
        </View>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            style={[
              styles.deleteAccountButton,
              deleteAccount.isPending && styles.deleteAccountButtonDisabled,
            ]}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
            disabled={deleteAccount.isPending}
          >
            <Text style={styles.deleteAccountText}>
              {deleteAccount.isPending
                ? profileText.deletingAccount
                : profileText.deleteAccount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.privacyLink}
            onPress={handleOpenPrivacyPolicy}
            activeOpacity={0.85}
          >
            <Text style={styles.privacyLinkText}>
              {profileText.privacyPolicy}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerBlock: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.gold,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extraBold,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    textAlign: "right",
  },
  infoRow: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "flex-end",
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textAlign: "right",
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    textAlign: "right",
  },
  footerLinks: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  deleteAccountButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.error}55`,
    backgroundColor: `${colors.error}10`,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  deleteAccountButtonDisabled: {
    opacity: 0.6,
  },
  deleteAccountText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  privacyLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  privacyLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    textDecorationLine: "underline",
  },
});
