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
    [
      "website",
      "webapp",
      "landing-page",
      "midias-sociais",
      "identidade-visual",
      "registo-empresa",
      "outro",
    ],
    { errorMap: () => ({ message: "Selecione um serviço." }) },
  ),
  message: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais sobre o seu projecto (mín. 10 caracteres).")
    .max(1000, "Mensagem muito longa."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const serviceOptions: { value: ContactFormValues["service"]; label: string }[] = [
  { value: "website", label: "Website institucional" },
  { value: "webapp", label: "Aplicação web + painel admin" },
  { value: "landing-page", label: "Landing page" },
  { value: "midias-sociais", label: "Gestão de redes sociais (3M)" },
  { value: "identidade-visual", label: "Identidade visual" },
  { value: "registo-empresa", label: "Criação e registo de empresa" },
  { value: "outro", label: "Outro / ainda não sei" },
];
