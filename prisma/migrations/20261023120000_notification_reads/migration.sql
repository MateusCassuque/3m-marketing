-- Notificações lidas por utilizador.
CREATE TABLE "NotificationRead" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationRead_adminId_idx" ON "NotificationRead"("adminId");
CREATE UNIQUE INDEX "NotificationRead_adminId_key_key" ON "NotificationRead"("adminId", "key");

ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
