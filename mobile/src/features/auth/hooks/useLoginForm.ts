import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "../../../api";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { completeAuthSession } from "../utils/completeAuthSession";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";

export const useLoginForm = () => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setAuthError(null);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);

      const response = await authApi.login({
        email: data.email.trim(),
        password: data.password,
      });

      await completeAuthSession(response, queryClient);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error, "login"));
    }
  };

  return {
    ...form,
    authError,
    onSubmit,
  };
};
