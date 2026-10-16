"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatDateNotTime } from "@/lib/utils";
import {
  createUser,
  deleteUser,
  resetUserPassword,
} from "@/app/admin/(protected)/utilizadores/actions";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  createdAt: string;
}

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" as "ADMIN" | "EDITOR" });

  const run = async (task: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await task();
      setOk(success);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a acção.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border border-border bg-white shadow-soft">
        <h2 className="border-b border-border px-6 py-4 font-display text-base font-bold text-navy-700">
          Contas com acesso ao painel
        </h2>
        <ul className="divide-y divide-border">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-navy-700">
                  {user.name}
                  {user.id === currentUserId && <span className="text-xs font-medium text-muted-foreground">(você)</span>}
                </p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">Criada a {formatDateNotTime(user.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "ADMIN" ? "accent" : "navy"}>
                  {user.role === "ADMIN" && <ShieldCheck className="h-3 w-3" />}
                  {user.role === "ADMIN" ? "Administrador" : "Editor (só leitura)"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label={`Redefinir senha de ${user.name}`}
                  disabled={busy}
                  onClick={() => {
                    const next = window.prompt(`Nova senha para ${user.name} (mínimo 10 caracteres):`);
                    if (next) run(() => resetUserPassword(user.id, next), "Senha actualizada.");
                  }}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
                {user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:bg-red-50"
                    aria-label={`Eliminar ${user.name}`}
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Eliminar a conta de ${user.name}?`)) run(() => deleteUser(user.id), "Conta eliminada.");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="h-fit rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-display text-base font-bold text-navy-700">Nova conta</h2>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await createUser(form);
              setForm({ name: "", email: "", password: "", role: "EDITOR" });
            }, "Conta criada.");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="u-name">Nome</Label>
            <Input id="u-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-email">E-mail</Label>
            <Input id="u-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-pass">Senha inicial</Label>
            <Input
              id="u-pass"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              placeholder="Mínimo 10 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-role">Perfil</Label>
            <Select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "EDITOR" })}>
              <option value="EDITOR">Editor — só consulta</option>
              <option value="ADMIN">Administrador — acesso total</option>
            </Select>
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Criar conta
          </Button>
          {ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{ok}</p>}
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
        </form>
      </section>
    </div>
  );
}
