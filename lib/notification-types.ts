export type NotificationType = "invoice-overdue" | "invoice-pending" | "project-late";

export interface AppNotification {
  /** Estável e único por utilizador, ex.: "invoice-overdue:ck123". */
  key: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Para onde vai ao clicar. */
  href: string;
  /** Data do acontecimento (vencimento / entrega prevista), ISO. */
  at: string;
  /** Mais urgente = número maior (para ordenar). */
  severity: 1 | 2 | 3;
  read: boolean;
}

export interface NotificationsPayload {
  items: AppNotification[];
  unread: number;
}
