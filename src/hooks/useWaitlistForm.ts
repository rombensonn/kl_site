import { useState } from "react";
import type { WaitlistFormData, FormStatus } from "@/types";

export function useWaitlistForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submitForm = async (data: WaitlistFormData): Promise<boolean> => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/functions/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Не удалось сохранить заявку");
      }

      setStatus("success");
      return true;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Произошла ошибка. Пожалуйста, попробуйте ещё раз.");
      return false;
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  return { status, error, submitForm, reset };
}
