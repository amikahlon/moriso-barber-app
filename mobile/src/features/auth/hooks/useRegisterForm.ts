import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "../../../api";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/register.schema";
import { completeAuthSession } from "../utils/completeAuthSession";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";

export const useRegisterForm = () => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

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

  useEffect(() => {
    const subscription = form.watch(() => {
      setAuthError(null);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setAuthError(null);

      const phone = data.phone.replace(/\D/g, "");
      const birthDate = data.birthDate.trim();

      const response = await authApi.register({
        fullName: data.fullName.trim(),
        phone: phone || undefined,
        birthDate: birthDate || undefined,
        email: data.email.trim(),
        password: data.password,
      });

      await completeAuthSession(response, queryClient);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error, "register"));
    }
  };

  return {
    ...form,
    authError,
    onSubmit,
  };
};
