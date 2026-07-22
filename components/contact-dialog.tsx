"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact-form"
import { useUIStore } from "@/store/use-ui-store"

export function ContactDialog() {
  const isContactOpen = useUIStore((state) => state.isContactOpen)
  const closeContact = useUIStore((state) => state.closeContact)

  return (
    <Dialog open={isContactOpen} onOpenChange={(open) => !open && closeContact()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vamos conversar</DialogTitle>
          <DialogDescription>
            Conte um pouco sobre seu projeto e retornamos com uma proposta.
          </DialogDescription>
        </DialogHeader>
        <ContactForm className="mt-5" />
      </DialogContent>
    </Dialog>
  )
}
