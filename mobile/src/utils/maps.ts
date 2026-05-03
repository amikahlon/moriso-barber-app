import { Alert, Linking, Platform } from "react-native";

interface BusinessLocation {
  address?: string | null;
  businessName?: string | null;
  googleMapsUrl?: string | null;
}

const getTrimmedValue = (value?: string | null) => value?.trim() ?? "";

export const getAppleMapsUrl = ({
  address,
  businessName,
}: BusinessLocation) => {
  const destination = getTrimmedValue(address) || getTrimmedValue(businessName);

  if (!destination) {
    return null;
  }

  return `https://maps.apple.com/?daddr=${encodeURIComponent(
    destination,
  )}&dirflg=d`;
};

export const hasBusinessLocation = (location?: BusinessLocation | null) =>
  Boolean(
    getTrimmedValue(location?.address) ||
      getTrimmedValue(location?.googleMapsUrl),
  );

export const openBusinessLocation = (location: BusinessLocation) => {
  const appleMapsUrl = getAppleMapsUrl(location);
  const googleMapsUrl = getTrimmedValue(location.googleMapsUrl);

  if (Platform.OS === "ios" && appleMapsUrl) {
    Alert.alert("ניווט לעסק", "בחר אפליקציית מפות", [
      {
        text: "Apple Maps",
        onPress: () => {
          void Linking.openURL(appleMapsUrl);
        },
      },
      ...(googleMapsUrl
        ? [
            {
              text: "Google Maps",
              onPress: () => {
                void Linking.openURL(googleMapsUrl);
              },
            },
          ]
        : []),
      { text: "ביטול", style: "cancel" },
    ]);
    return;
  }

  const fallbackUrl = googleMapsUrl || appleMapsUrl;

  if (fallbackUrl) {
    void Linking.openURL(fallbackUrl);
  }
};
