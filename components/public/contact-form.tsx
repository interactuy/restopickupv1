import { createSupportTicketAction } from "@/lib/support-actions";

type ContactFormProps = {
  error?: string;
  success?: string;
  ticket?: string;
};

function getFeedback(error?: string, success?: string, ticket?: string) {
  if (success === "ticket-created") {
    return {
      tone: "success" as const,
      message: ticket
        ? `Ya recibimos tu consulta. Número de seguimiento: #${ticket}.`
        : "Ya recibimos tu consulta correctamente.",
    };
  }

  if (error === "required") {
    return {
      tone: "error" as const,
      message: "Completá nombre, email, asunto y mensaje.",
    };
  }

  if (error === "save") {
    return {
      tone: "error" as const,
      message: "No pudimos registrar tu consulta. Intentá nuevamente.",
    };
  }

  return null;
}

export function ContactForm({
  error,
  success,
  ticket,
}: ContactFormProps) {
  const feedback = getFeedback(error, success, ticket);

  return (
    <form action={createSupportTicketAction} className="space-y-5">
      {feedback ? (
        <div
          className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <input type="hidden" name="source" value="support" />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="requesterBusinessName" className="mb-2 block text-sm font-medium">
            Local o empresa
          </label>
          <input
            id="requesterBusinessName"
            name="requesterBusinessName"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="requesterName" className="mb-2 block text-sm font-medium">
            Nombre y apellido
          </label>
          <input
            id="requesterName"
            name="requesterName"
            required
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label htmlFor="requesterEmail" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="requesterEmail"
            name="requesterEmail"
            type="email"
            required
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="issueType" className="mb-2 block text-sm font-medium">
            Tema
          </label>
          <select
            id="issueType"
            name="issueType"
            defaultValue="other"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="orders">Pedidos</option>
            <option value="payments">Pagos</option>
            <option value="menu">Menú o productos</option>
            <option value="hours">Horarios o disponibilidad</option>
            <option value="account">Cuenta o acceso</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label htmlFor="severity" className="mb-2 block text-sm font-medium">
            Prioridad
          </label>
          <select
            id="severity"
            name="severity"
            defaultValue="normal"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="requesterPhone" className="mb-2 block text-sm font-medium">
            Celular
          </label>
          <input
            id="requesterPhone"
            name="requesterPhone"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Asunto
          </label>
          <input
            id="subject"
            name="subject"
            required
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
      >
        Enviar consulta
      </button>
    </form>
  );
}
