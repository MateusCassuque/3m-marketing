"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { clientSchema, type ClientValues } from "@/lib/validations/client";
import { createClient, updateClient } from "@/app/admin/(protected)/clientes/actions";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

const EMPTY_VALUES: ClientValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  taxId: "",
  address: "",
  notes: "",
};

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const isEditing = Boolean(client);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        client
          ? {
              name: client.name,
              email: client.email,
              phone: client.phone ?? "",
              company: client.company ?? "",
              taxId: client.taxId ?? "",
              address: client.address ?? "",
              notes: client.notes ?? "",
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, client, reset]);

  const onSubmit = async (values: ClientValues) => {
    if (isEditing && client) {
      await updateClient(client.id, values);
    } else {
      await createClient(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do cliente."
              : "Cadastre um novo cliente para vincular a pedidos e faturas."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" {...register("company")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="taxId">CNPJ / NIF</Label>
              <Input id="taxId" {...register("taxId")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" {...register("address")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <Button type="submit" variant="teal" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
