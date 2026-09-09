"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductSummary } from "@/types";

interface AdminDeleteProductDialogProps {
  product: ProductSummary;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}

export function AdminDeleteProductDialog({
  product,
  onClose,
  onDelete,
}: AdminDeleteProductDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(product.id);
      onClose();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to remove this product.");
      setDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border bg-surface-2 text-text-primary">
        <DialogHeader>
          <DialogTitle className="heading flex items-center gap-2">
            <Trash2 className="size-5 text-danger" aria-hidden="true" />
            Remove product?
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            “{product.name}” will be hidden from the storefront. Existing order records are not
            affected.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={deleting}>
            Keep product
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleting}>
            {deleting ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : null}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
