import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { authApi } from "../../../api";
import { supabase } from "../../../lib/supabase";
import { authQueryKeys } from "../constants/queryKeys";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/register.schema";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";
import { getHomeRouteForRole } from "../utils/getHomeRouteForRole";

export const useRegisterForm = () => {
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      birthDate: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const phone = data.phone.replace(/\D/g, "");

      const response = await authApi.register({
        fullName: data.fullName.trim(),
        phone,
        birthDate: data.birthDate.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: response.accessToken,
        refresh_token: response.refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }

      queryClient.setQueryData(authQueryKeys.currentUser, response.user);
      router.replace(getHomeRouteForRole(response.user.role));
    } catch (error) {
      Alert.alert("שגיאה", getAuthErrorMessage(error, "register"));
    }
  };

  return {
    ...form,
    onSubmit,
  };
};
