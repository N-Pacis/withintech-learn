"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ReorderItem {
  id: string;
  orderIndex: number;
}

interface ReorderableListProps<T extends ReorderItem> {
  items: T[];
  onReorder: (items: { id: string; orderIndex: number }[]) => void;
  renderItem: (
    item: T,
    state: { isDragging: boolean; isDragOver: boolean },
  ) => React.ReactNode;
  className?: string;
  itemClassName?:
    | string
    | ((
        item: T,
        state: { isDragging: boolean; isDragOver: boolean },
      ) => string);
}

export function ReorderableList<T extends ReorderItem>({
  items,
  onReorder,
  renderItem,
  className,
  itemClassName,
}: ReorderableListProps<T>) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const drag = items.find((i) => i.id === dragId);
    const target = items.find((i) => i.id === targetId);
    if (!drag || !target) return;
    onReorder(
      items.map((i) => {
        if (i.id === dragId) return { id: i.id, orderIndex: target.orderIndex };
        if (i.id === targetId) return { id: i.id, orderIndex: drag.orderIndex };
        return { id: i.id, orderIndex: i.orderIndex };
      }),
    );
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const isDragging = dragId === item.id;
        const isDragOver = dragOverId === item.id && dragId !== item.id;
        const state = { isDragging, isDragOver };
        const resolvedItemClass =
          typeof itemClassName === "function"
            ? itemClassName(item, state)
            : itemClassName;

        return (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragOverId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverId(item.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={() => handleDrop(item.id)}
            className={cn(isDragging && "opacity-40", resolvedItemClass)}
          >
            {renderItem(item, state)}
          </div>
        );
      })}
    </div>
  );
}
