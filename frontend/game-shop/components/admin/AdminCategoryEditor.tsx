"use client";

import { Check, LoaderCircle, Pencil, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types";

interface AdminCategoryEditorProps {
  category: Category;
  onRename: (id: number, name: string) => Promise<void>;
}

export function AdminCategoryEditor({ category, onRename }: AdminCategoryEditorProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setName(category.name);
    setEditing(false);
    setError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onRename(category.id, name.trim());
      setEditing(false);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to rename this category.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="font-medium text-text-primary">{category.name}</p>
          <p className="text-xs text-text-muted">Category #{category.id}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label={`Rename ${category.name}`}>
          <Pencil />
        </Button>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-accent bg-surface px-4 py-3 shadow-[0_0_20px_var(--color-accent-glow)]">
      <form onSubmit={submit} className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
            autoFocus
            aria-label={`New name for ${category.name}`}
          />
          {error ? <p className="mt-2 text-xs text-danger" role="alert">{error}</p> : null}
        </div>
        <Button type="submit" size="icon" disabled={saving || name.trim() === category.name} aria-label="Save category name">
          {saving ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Check />}
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={cancel} disabled={saving} aria-label="Cancel category rename">
          <X />
        </Button>
      </form>
    </li>
  );
}
