"use client";

import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  /** Optional uppercase category tag (Journal). */
  tag?: string;
  title: string;
  /** Optional date (Journal). */
  date?: string;
  content: ReactNode;
};

/**
 * Shared expand/collapse list used by the FAQ and Journal sections. Items open
 * independently, matching the prototype behaviour.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const baseId = useId();

  return (
    <div className="acc">
      {items.map((item) => {
        const isOpen = Boolean(open[item.id]);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className={cn("j-item", isOpen && "open")}>
            <button
              className="j-head"
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
              }
            >
              {item.tag && <span className="j-tag">{item.tag}</span>}
              <span className="j-title">{item.title}</span>
              {item.date && <span className="j-date">{item.date}</span>}
              <span className="j-plus" aria-hidden="true">
                +
              </span>
            </button>
            {/* Panel stays mounted so the max-height CSS transition can run. */}
            <div className="j-panel" id={panelId} role="region">
              <div className="inner">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
