import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(80, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone válido.")
    .max(20, "Telefone muito longo.")
    .optional()
    .or(z.literal("")),
  service: z.enum(
    ["estrategia", "criatividade", "trafego", "midias-sociais", "branding", "outro"],
    { errorMap: () => ({ message: "Selecione um serviço." }) },
  ),
  message: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais sobre o seu projeto (mín. 10 caracteres).")
    .max(1000, "Mensagem muito longa."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const serviceOptions: { value: ContactFormValues["service"]; label: string }[] = [
  { value: "estrategia", label: "Estratégia" },
  { value: "criatividade", label: "Criatividade" },
  { value: "trafego", label: "Gestão de Tráfego" },
  { value: "midias-sociais", label: "Mídias Sociais" },
  { value: "branding", label: "Branding" },
  { value: "outro", label: "Outro / não sei ainda" },
];
