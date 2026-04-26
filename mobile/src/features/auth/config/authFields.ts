import type { TextInputProps } from "react-native";

type AuthFieldConfig<FieldName extends string> = {
  name: FieldName;
  label: string;
  placeholder: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
};

export const loginFields: AuthFieldConfig<"email" | "password">[] = [
  {
    name: "email",
    label: "אימייל",
    placeholder: "your@email.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
    textContentType: "emailAddress",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "סיסמה",
    placeholder: "הקלד את הסיסמה שלך",
    secureTextEntry: true,
    textContentType: "password",
    autoComplete: "password",
  },
];

export const registerFields: AuthFieldConfig<
  "fullName" | "phone" | "birthDate" | "email" | "password"
>[] = [
  {
    name: "fullName",
    label: "שם מלא",
    placeholder: "איך קוראים לך?",
    textContentType: "name",
    autoComplete: "name",
  },
  {
    name: "phone",
    label: "טלפון",
    placeholder: "050-000-0000",
    keyboardType: "phone-pad",
    textContentType: "telephoneNumber",
    autoComplete: "tel",
  },
  {
    name: "birthDate",
    label: "תאריך לידה",
    placeholder: "1995-06-15",
    keyboardType: "numbers-and-punctuation",
  },
  {
    name: "email",
    label: "אימייל",
    placeholder: "your@email.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
    textContentType: "emailAddress",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "סיסמה",
    placeholder: "לפחות 8 תווים",
    secureTextEntry: true,
    textContentType: "newPassword",
    autoComplete: "new-password",
  },
];
