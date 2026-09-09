"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types";

import { AdminCategoryEditor } from "./AdminCategoryEditor";
import { AdminPanelState } from "./AdminPanelState";

interface AdminCategoriesPanelProps {
  categories: Category[] | undefined;
  loading: boolean;
  error: Error | undefined;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
}

export function AdminCategoriesPanel({
  categories,
  loading,
  error,
  onCreate,
  onRename,
}: AdminCategoriesPanelProps) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await onCreate(name.trim());
      setName("");
    } catch (reason: unknown) {
      setCreateError(reason instanceof Error ? reason.message : "Unable to create this category.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-6">
        <h1 id="categories-heading" className="heading text-3xl font-bold text-text-primary">
          Categories
        </h1>
        <p className="mt-2 text-text-secondary">Keep the storefront navigation organized.</p>
      </div>

      <form onSubmit={submit} className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-[0_4px_24px_rgba(0,0,0,.4)]">
        <Label htmlFor="new-category">New category</Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id="new-category"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
            placeholder="Category name"
            className="sm:max-w-md"
          />
          <Button type="submit" disabled={creating || name.trim().length < 2}>
            {creating ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Plus />}
            Add category
          </Button>
        </div>
        {createError ? <p className="mt-2 text-sm text-danger" role="alert">{createError}</p> : null}
      </form>

      {loading ? <AdminPanelState kind="loading" message="Loading categories…" /> : null}
      {error ? <AdminPanelState kind="error" message={error.message} /> : null}
      {!loading && !error && categories?.length === 0 ? (
        <AdminPanelState kind="empty" message="No categories have been created." />
      ) : null}
      {!loading && !error && categories && categories.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <AdminCategoryEditor key={category.id} category={category} onRename={onRename} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
