"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  contactFormSchema,
  serviceOptions,
  type ContactFormValues,
} from "@/lib/validations/contact";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  className?: string;
  onSuccess?: () => void;
}

/**
 * Formulário de contato (Zod + React Hook Form) usado tanto no
 * ContactDialog (modal global) quanto na página /contato.
 */
export function ContactForm({ className, onSuccess }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "estrategia",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null);
    setStatus("idle");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Não foi possível enviar sua mensagem.");
      }

      setSubmitted(true);
      reset();
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      setServerError(
        error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
      );
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex flex-col items-center gap-3 py-10 text-center", className)}
      >
        <CheckCircle2 className="h-12 w-12 text-primary-500" />
        <h3 className="font-display text-xl font-bold text-navy-700">Mensagem enviada!</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Obrigado pelo contato. Nosso time vai retornar em breve.
        </p>
        <Button variant="teal" className="mt-2" onClick={() => setSubmitted(false)}>
          Enviar nova mensagem
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Seu nome" {...register("name")} />
          {errors.name && (
            <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="voce@empresa.com" {...register("email")} />
          {errors.email && (
            <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone (opcional)</Label>
          <Input id="phone" placeholder="(+244) 900 000 000" {...register("phone")} />
          {errors.phone && (
            <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="service">Serviço de interesse</Label>
          <Select id="service" {...register("service")}>
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.service && (
            <p className="text-xs font-medium text-destructive">{errors.service.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          placeholder="Conte um pouco sobre o seu projeto…"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs font-medium text-destructive">{errors.message.message}</p>
        )}
      </div>

      {status === "error" && serverError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            Enviar mensagem
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
