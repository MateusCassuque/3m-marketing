"use client";

import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Loader2, Plus, Repeat, Trash2 } from "lucide-react";
import type { Client } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  projectSchema,
  type ProjectValues,
  PROJECT_STATUS_VALUES,
  PRIORITY_VALUES,
  RECURRENCE_OPTIONS,
} from "@/lib/validations/project";
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/project-labels";
import { ACTIVE_SERVICES, SERVICE_LABELS } from "@/lib/lead-labels";
import {
  APPLICANT_NOUN,
  EMPTY_DETAILS,
  PASSPORT_KINDS,
  VISA_TYPES,
  hasServiceDetails,
  type ServiceDetails,
} from "@/lib/service-details";
import { cn } from "@/lib/utils";
import { createProject, updateProject } from "@/app/admin/(protected)/pedidos/actions";

export interface ProjectFormData {
  id: string;
  title: string;
  description: string | null;
  clientId: string;
  service: ProjectValues["service"];
  status: ProjectValues["status"];
  priority: ProjectValues["priority"];
  value: number;
  startDate: Date | null;
  dueDate: Date | null;
  billingType: ProjectValues["billingType"];
  recurrenceMonths: number | null;
  nextBillingDate: Date | null;
  recurrenceEndDate: Date | null;
  paymentTermDays: number;
  serviceDetails: ServiceDetails | null;
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectFormData | null;
  clients: Client[];
}

const EMPTY_VALUES: ProjectValues = {
  title: "",
  description: "",
  clientId: "",
  service: "WEBSITE",
  status: "BACKLOG",
  priority: "MEDIA",
  value: 0,
  startDate: "",
  dueDate: "",
  billingType: "UNICO",
  recurrenceMonths: 1,
  nextBillingDate: "",
  recurrenceEndDate: "",
  paymentTermDays: 5,
  serviceDetails: EMPTY_DETAILS,
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function Segmented<T extends string | boolean>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-xl bg-navy-50 p-1 sm:w-auto">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors sm:flex-none",
            value === option.value ? "bg-white text-navy-700 shadow-soft" : "text-navy-500 hover:text-navy-700",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}

export function ProjectFormDialog({ open, onOpenChange, project, clients }: ProjectFormDialogProps) {
  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "serviceDetails.applicants" });

  const service = watch("service");
  const clientId = watch("clientId");
  const billingType = watch("billingType");
  const forClient = watch("serviceDetails.forClient");
  const clientName = clients.find((c) => c.id === clientId)?.name ?? "";
  const detailService = hasServiceDetails(service) ? service : null;
  const recurring = billingType === "RECORRENTE";

  useEffect(() => {
    if (open) {
      reset(
        project
          ? {
              title: project.title,
              description: project.description ?? "",
              clientId: project.clientId,
              service: project.service,
              status: project.status,
              priority: project.priority,
              value: project.value,
              startDate: toDateInputValue(project.startDate),
              dueDate: toDateInputValue(project.dueDate),
              billingType: project.billingType,
              recurrenceMonths: project.recurrenceMonths ?? 1,
              nextBillingDate: toDateInputValue(project.nextBillingDate),
              recurrenceEndDate: toDateInputValue(project.recurrenceEndDate),
              paymentTermDays: project.paymentTermDays,
              serviceDetails: project.serviceDetails ?? EMPTY_DETAILS,
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, project, reset]);

  // "Para o cliente" → uma só linha com o nome do cliente; "outras pessoas" → linhas editáveis.
  const previousForClient = useRef<boolean | null>(null);
  useEffect(() => {
    if (!detailService) {
      previousForClient.current = null;
      return;
    }
    const current = getValues("serviceDetails.applicants") ?? [];
    if (forClient) {
      replace([{ name: clientName, passportNumber: current[0]?.passportNumber ?? "" }]);
    } else if (previousForClient.current === true || current.length === 0) {
      replace([{ name: "", passportNumber: "" }]);
    }
    previousForClient.current = forClient;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forClient, clientName, detailService]);

  // Gestão de redes sociais costuma ser mensal: sugere cobrança recorrente nos pedidos novos.
  useEffect(() => {
    if (!isEditing && service === "MIDIAS_SOCIAIS") setValue("billingType", "RECORRENTE");
  }, [service, isEditing, setValue]);

  const onSubmit = async (values: ProjectValues) => {
    if (isEditing && project) {
      await updateProject(project.id, values);
    } else {
      await createProject(values);
    }
    onOpenChange(false);
  };

  const noun = detailService ? APPLICANT_NOUN[detailService] : APPLICANT_NOUN.ASSESSORIA_VISTO;
  const detailErrors = errors.serviceDetails;
  const applicantsError = (detailErrors?.applicants as { message?: string } | undefined)?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar pedido" : "Novo pedido"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do pedido/projeto."
              : "Cadastre um novo pedido vinculado a um cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex.: Visto de turismo para Portugal" {...register("title")} />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clientId">Cliente</Label>
              <Select id="clientId" {...register("clientId")}>
                <option value="">Selecione…</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.clientId?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service">Serviço</Label>
              <Select id="service" {...register("service")}>
                {[...ACTIVE_SERVICES, ...(project && !ACTIVE_SERVICES.includes(project.service) ? [project.service] : [])].map((value) => (
                  <option key={value} value={value}>
                    {SERVICE_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* ---------- Detalhes específicos: visto, passaporte, bilhetes ---------- */}
          {detailService && (
            <fieldset className="space-y-4 rounded-xl border border-primary-200 bg-primary-50/40 p-4">
              <legend className="px-2 text-sm font-semibold text-primary-700">
                Detalhes — {SERVICE_LABELS[detailService].toLowerCase()}
              </legend>

              {detailService === "ASSESSORIA_VISTO" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="country">País de destino</Label>
                    <Input id="country" placeholder="Ex.: Portugal" {...register("serviceDetails.country")} />
                    <FieldError message={detailErrors?.country?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="visaType">Tipo de visto</Label>
                    <Select id="visaType" {...register("serviceDetails.visaType")}>
                      {VISA_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}

              {detailService === "ASSESSORIA_PASSAPORTE" && (
                <div className="space-y-1.5">
                  <Label htmlFor="passportKind">Tipo de pedido</Label>
                  <Select id="passportKind" {...register("serviceDetails.passportKind")}>
                    {PASSPORT_KINDS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {detailService === "BILHETES" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="origin">Origem</Label>
                    <Input id="origin" placeholder="Ex.: Luanda" {...register("serviceDetails.origin")} />
                    <FieldError message={detailErrors?.origin?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="destination">Destino</Label>
                    <Input id="destination" placeholder="Ex.: Lisboa" {...register("serviceDetails.destination")} />
                    <FieldError message={detailErrors?.destination?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="departDate">Data de ida</Label>
                    <Input id="departDate" type="date" {...register("serviceDetails.departDate")} />
                    <FieldError message={detailErrors?.departDate?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="returnDate">Data de volta (opcional)</Label>
                    <Input id="returnDate" type="date" {...register("serviceDetails.returnDate")} />
                  </div>
                </div>
              )}

              {/* Para quem é? */}
              <div className="space-y-2">
                <Label>Para quem é este pedido?</Label>
                <Segmented
                  label="Para quem é o pedido"
                  value={forClient}
                  onChange={(v) => setValue("serviceDetails.forClient", v, { shouldDirty: true })}
                  options={[
                    { value: true, label: clientName ? `Para ${clientName}` : "Para o cliente selecionado" },
                    { value: false, label: "Para outras pessoas" },
                  ]}
                />
              </div>

              {forClient ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nome do {noun.one}</Label>
                    <Input value={clientName || "Selecione o cliente acima"} readOnly className="bg-white/70" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="passport-0">Nº do passaporte</Label>
                    <Input id="passport-0" placeholder="Ex.: N1234567" {...register("serviceDetails.applicants.0.passportNumber")} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 gap-3 rounded-lg bg-white p-3 sm:grid-cols-[1fr_1fr_auto]">
                      <div className="space-y-1.5">
                        <Label htmlFor={`name-${index}`}>Nome do {noun.one} {fields.length > 1 ? index + 1 : ""}</Label>
                        <Input id={`name-${index}`} placeholder="Nome completo" {...register(`serviceDetails.applicants.${index}.name` as const)} />
                        <FieldError message={detailErrors?.applicants?.[index]?.name?.message} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`passport-${index}`}>Nº do passaporte</Label>
                        <Input id={`passport-${index}`} placeholder="Ex.: N1234567" {...register(`serviceDetails.applicants.${index}.passportNumber` as const)} />
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          aria-label={`Remover ${noun.one} ${index + 1}`}
                          className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <FieldError message={applicantsError} />
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", passportNumber: "" })}>
                    <Plus className="h-4 w-4" />
                    Adicionar {noun.one}
                  </Button>
                </div>
              )}
            </fieldset>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                {PROJECT_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PROJECT_STATUS_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Prioridade</Label>
              <Select id="priority" {...register("priority")}>
                {PRIORITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">{recurring ? "Valor de cada cobrança (Kz)" : "Valor (Kz)"}</Label>
              <Input id="value" type="number" step="0.01" min="0" {...register("value")} />
              <FieldError message={errors.value?.message} />
            </div>
          </div>

          {/* ---------- Cobrança: única ou recorrente ---------- */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary-600" />
                Tipo de cobrança
              </Label>
              <Segmented
                label="Tipo de cobrança"
                value={billingType}
                onChange={(v) => setValue("billingType", v, { shouldDirty: true })}
                options={[
                  { value: "UNICO", label: "Única" },
                  { value: "RECORRENTE", label: "Recorrente" },
                ]}
              />
            </div>

            {recurring && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="recurrenceMonths">Repetir</Label>
                    <Select id="recurrenceMonths" {...register("recurrenceMonths")}>
                      {RECURRENCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nextBillingDate">{isEditing ? "Próxima cobrança" : "Primeira cobrança"}</Label>
                    <Input id="nextBillingDate" type="date" {...register("nextBillingDate")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentTermDays">Prazo de pagamento (dias)</Label>
                    <Input id="paymentTermDays" type="number" min="0" max="120" {...register("paymentTermDays")} />
                    <FieldError message={errors.paymentTermDays?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recurrenceEndDate">Termina em (opcional)</Label>
                    <Input id="recurrenceEndDate" type="date" {...register("recurrenceEndDate")} />
                  </div>
                </div>
                <p className="flex items-start gap-2 rounded-lg bg-primary-50 px-3 py-2.5 text-[13px] leading-snug text-primary-800">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                  Em cada data de cobrança o sistema emite sozinho uma factura nova para este pedido. Se deixar a data em
                  branco, a primeira cobrança é hoje. Pára quando o pedido for concluído ou cancelado.
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Início</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Prazo</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar pedido"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
