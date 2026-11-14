"use client";
import { btnDanger } from "@/lib/admin/ui";

export function ConfirmDelete({ action, name }: { action: () => Promise<void>; name: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) e.preventDefault();
      }}
    >
      <button className={btnDanger}>Delete</button>
    </form>
  );
}
