/** Foca o primeiro campo com erro (ids gerados por `FormField` com `name`). */
export function focusFirstError(errors: Record<string, string>, order: string[]) {
  const first = order.find((k) => errors[k]);
  if (!first || typeof document === "undefined") return;
  requestAnimationFrame(() => document.getElementById(`campo-${first}`)?.focus());
}
