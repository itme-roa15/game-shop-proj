"use client";

import { LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product, ProductInput } from "@/types";

interface AdminProductFormDialogProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<void>;
}

export function AdminProductFormDialog({
  product,
  categories,
  onClose,
  onSave,
}: AdminProductFormDialogProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId.toString() ?? categories[0]?.id.toString() ?? "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price.toString() ?? "");
  const [stock, setStock] = useState(product?.stock.toString() ?? "0");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSave({
        categoryId: Number(categoryId),
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
      });
      onClose();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to save this product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface-2 text-text-primary sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="heading text-xl">
            {product ? "Edit product" : "Add product"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            {product
              ? "Update the catalog details shown to shoppers."
              : "Create a new product in the public catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => value !== null && setCategoryId(value)}
              required
            >
              <SelectTrigger id="product-category" className="w-full">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Image URL</Label>
            <Input
              id="product-image"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              maxLength={500}
              placeholder="https://…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Price (USD)</Label>
            <Input
              id="product-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-stock">Stock</Label>
            <Input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={10000}
              rows={5}
            />
          </div>

          {error ? (
            <p className="text-sm text-danger sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || categories.length === 0}>
              {submitting ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : null}
              {product ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
