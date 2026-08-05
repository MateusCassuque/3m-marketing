import { auth } from "@/auth";

/**
 * Confere a sessão dentro da própria Server Action — o middleware e o
 * layout protegido já bloqueiam a navegação, mas Server Actions podem ser
 * chamadas diretamente, então cada mutação confere de novo aqui.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autorizado.");
  }
  return session.user;
}
