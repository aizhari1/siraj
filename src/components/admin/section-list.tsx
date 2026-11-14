"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { btnDanger, btnGhost } from "@/lib/admin/ui";
import { deleteSection, duplicateSection, reorderSections, toggleSection } from "@/app/admin/(dashboard)/sections/actions";

export type SectionRow = { id: string; title: string; typeLabel: string; enabled: boolean; published: boolean; hasDraft: boolean };

function Row({ s }: { s: SectionRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center gap-3 border-b border-white/5 bg-card px-4 py-3 last:border-b-0 ${isDragging ? "relative z-10 shadow-xl ring-1 ring-brand" : ""}`}>
      <button type="button" className="cursor-grab touch-none px-1 text-lg text-muted hover:text-white active:cursor-grabbing" aria-label={`Drag to reorder ${s.title}`} {...attributes} {...listeners}>⠿</button>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/sections/${s.id}`} className="block truncate font-medium hover:text-brand-light">{s.title || s.typeLabel}</Link>
        <p className="text-xs text-muted">{s.typeLabel}</p>
      </div>
      {s.hasDraft && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Unpublished changes</span>}
      <span className={`rounded-full px-2 py-0.5 text-xs ${!s.published ? "bg-white/10 text-muted" : s.enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-muted"}`}>
        {!s.published ? "Not published" : s.enabled ? "Live" : "Hidden"}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {s.published && <form action={toggleSection.bind(null, s.id, !s.enabled)}><button className={btnGhost}>{s.enabled ? "Disable" : "Enable"}</button></form>}
        <Link href={`/admin/sections/${s.id}`} className={btnGhost}>Edit</Link>
        <form action={duplicateSection.bind(null, s.id)}><button className={btnGhost}>Duplicate</button></form>
        <form action={deleteSection.bind(null, s.id)} onSubmit={(e) => { if (!confirm(`Delete "${s.title || s.typeLabel}"?`)) e.preventDefault(); }}>
          <button className={btnDanger}>Delete</button>
        </form>
      </div>
    </li>
  );
}

export function SectionList({ initial }: { initial: SectionRow[] }) {
  const [items, setItems] = useState(initial);
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const key = initial.map((i) => `${i.id}${i.enabled}${i.hasDraft}${i.published}${i.title}`).join("|");
  const [seen, setSeen] = useState(key);
  if (seen !== key) { setSeen(key); setItems(initial); }

  const onEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    const next = arrayMove(items, from, to);
    setItems(next);
    start(() => { void reorderSections(next.map((i) => i.id)); });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="overflow-hidden rounded-xl border border-white/10">{items.map((s) => <Row key={s.id} s={s} />)}</ul>
      </SortableContext>
    </DndContext>
  );
}
