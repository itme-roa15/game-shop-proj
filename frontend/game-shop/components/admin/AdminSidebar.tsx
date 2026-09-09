"use client";

import {
  Boxes,
  FolderTree,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  X,
} from "lucide-react";
import { useState } from "react";

import type { AdminSection } from "@/types/admin";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onLogout: () => void;
}

const navItems: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Boxes },
  { id: "orders", label: "Orders", icon: PackageCheck },
  { id: "categories", label: "Categories", icon: FolderTree },
];

export function AdminSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  const selectSection = (section: AdminSection) => {
    onSectionChange(section);
    setOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur lg:hidden">
        <span className="heading flex items-center gap-2 text-lg font-bold text-text-primary">
          <Gamepad2 className="size-6 text-accent" aria-hidden="true" />
          GameShop admin
        </span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-lg border border-border p-2 text-text-primary transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={open ? "Close admin menu" : "Open admin menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Close admin menu"
          className="fixed inset-0 z-30 bg-black/65 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-surface px-4 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="heading mb-10 flex items-center gap-3 px-2 text-xl font-bold text-text-primary">
          <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <Gamepad2 className="size-6" aria-hidden="true" />
          </span>
          GameShop
        </div>

        <nav className="space-y-1" aria-label="Admin navigation">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectSection(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? "bg-accent text-white shadow-[0_0_20px_var(--color-accent-glow)]" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          <LogOut className="size-5" aria-hidden="true" />
          Sign out
        </button>
      </aside>
    </>
  );
}
