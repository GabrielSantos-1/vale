import { MessageCircle } from "lucide-react";
import { whatsappSupportUrl } from "@/lib/constants/contact";

export function WhatsappFloat() {
  return (
    <a
      href={whatsappSupportUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com suporte no WhatsApp"
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/55 bg-[linear-gradient(145deg,rgba(16,185,129,0.96),rgba(5,150,105,0.96))] text-white shadow-[0_12px_30px_rgba(5,150,105,0.36)] transition-all duration-200 hover:scale-[1.04] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
    </a>
  );
}

export default WhatsappFloat;
