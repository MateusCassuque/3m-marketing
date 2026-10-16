"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/contact-form";
import { useUIStore } from "@/store/use-ui-store";

export function ContactDialog() {
  const isContactOpen = useUIStore((state) => state.isContactOpen);
  const closeContact = useUIStore((state) => state.closeContact);

  return (
    <Dialog open={isContactOpen} onOpenChange={(open) => !open && closeContact()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Peça a sua proposta</DialogTitle>
          <DialogDescription>
            Conte-nos o que precisa e respondemos em até 24 horas úteis, com preço em Kwanzas.
          </DialogDescription>
        </DialogHeader>
        <ContactForm className="mt-2" onSuccess={() => {}} />
      </DialogContent>
    </Dialog>
  );
}
