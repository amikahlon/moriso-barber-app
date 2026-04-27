import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "../../../api";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { completeAuthSession } from "../utils/completeAuthSession";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";

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

      await completeAuthSession(response, queryClient);
    } catch (error) {
      Alert.alert("שגיאה", getAuthErrorMessage(error, "login"));
    }
  };

  return {
    ...form,
    onSubmit,
  };
};
