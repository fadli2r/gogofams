"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Search, X, Loader2, Tags, Trash2 } from "lucide-react";
import { createCategory, deleteCategory } from "@/lib/actions";

interface Category {
  id: string;
  name: string;
  accountsCount: number;
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  
  // Dialog Open States
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // Search filter
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sync state if initial categories change
  if (JSON.stringify(categories) !== JSON.stringify(initialCategories)) {
    setCategories(initialCategories);
  }

  // Handle Add Category Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!categoryName.trim()) {
      setErrorMsg("Nama kategori tidak boleh kosong!");
      setIsLoading(false);
      return;
    }

    const res = await createCategory(categoryName.trim());
    if (res.success) {
      setIsAddOpen(false);
      setCategoryName("");
      // Refresh local state manually or wait for server component sync
      // To feel snappy, let's wait or manually append. Next.js action does revalidate, but we can also sync.
    } else {
      setErrorMsg(res.error || "Gagal membuat kategori.");
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Kategori Akun</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Kelola kategori untuk mengelompokkan akun utama langganan Anda (e.g. Adobe, Gemini, Grok).
          </p>
        </div>

        {/* Add Category Modal Button */}
        <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Dialog.Trigger asChild>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5" />
              Tambah Kategori
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <Dialog.Title className="text-lg font-bold text-foreground">Tambah Kategori Baru</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </Dialog.Close>
              </div>

              {errorMsg && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Adobe, Gemini, Grok"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Batal
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Simpan Kategori
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
      </div>

      {/* Grid of Category cards */}
      {filteredCategories.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 border border-border shadow-xl text-center text-muted-foreground">
          <Tags className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-base font-semibold">Tidak ada kategori ditemukan.</p>
          <p className="text-xs text-muted-foreground/80 mt-1">Buat kategori baru untuk mengelompokkan akun.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card rounded-2xl p-5 border border-border shadow-md hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {cat.accountsCount} Akun Utama
                  </p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary">
                  <Tags className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex justify-end">
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?\n\nAkun utama yang terhubung dengan kategori ini akan berubah menjadi "Tanpa Kategori" (tidak akan ikut terhapus).`
                      )
                    ) {
                      const res = await deleteCategory(cat.id);
                      if (res.success) {
                        setCategories(prev => prev.filter(item => item.id !== cat.id));
                      } else {
                        alert(res.error || "Gagal menghapus kategori.");
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
