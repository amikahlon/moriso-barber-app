import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { authApi } from "../../../api";
import { supabase } from "../../../lib/supabase";
import { authQueryKeys } from "../constants/queryKeys";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";
import { getHomeRouteForRole } from "../utils/getHomeRouteForRole";

export const useLoginForm = () => {
  const queryClient = useQueryClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login({
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
      Alert.alert("שגיאה", getAuthErrorMessage(error, "login"));
    }
  };

  return {
    ...form,
    onSubmit,
  };
};
