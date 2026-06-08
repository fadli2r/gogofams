"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Edit3, KeyRound, Search, X, Loader2, Calendar, Trash2 } from "lucide-react";
import { createMasterAccount, updateMasterAccountPassword, deleteMasterAccount } from "@/lib/actions";

interface Category {
  id: string;
  name: string;
}

interface MasterAccount {
  id: string;
  accountName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  registeredDate: string;
  expiredDate: string;
  lastPassword: string;
}

interface AccountsClientProps {
  initialAccounts: MasterAccount[];
  categories: Category[];
}

export default function AccountsClient({ initialAccounts, categories }: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [search, setSearch] = useState("");
  
  // Dialog Open States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form Submission states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit target state
  const [editTarget, setEditTarget] = useState<MasterAccount | null>(null);

  // Helper to get default dates (today and 1 month later)
  const getDefaultDates = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    const nextMonthYyyy = nextMonth.getFullYear();
    const nextMonthMm = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const nextMonthDd = String(nextMonth.getDate()).padStart(2, '0');

    return {
      registeredDate: `${yyyy}-${mm}-${dd}`,
      expiredDate: `${nextMonthYyyy}-${nextMonthMm}-${nextMonthDd}`,
    };
  };

  // Form Field States
  const [addForm, setAddForm] = useState(() => {
    const dates = getDefaultDates();
    return {
      accountName: "",
      categoryId: "",
      registeredDate: dates.registeredDate,
      expiredDate: dates.expiredDate,
      lastPassword: "",
    };
  });
  
  const [editPasswordValue, setEditPasswordValue] = useState("");

  // Search filter
  const filteredAccounts = accounts.filter(acc =>
    acc.accountName.toLowerCase().includes(search.toLowerCase())
  );

  // Sync state if initial accounts change
  if (JSON.stringify(accounts) !== JSON.stringify(initialAccounts)) {
    setAccounts(initialAccounts);
  }

  // Handle Add Account Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!addForm.accountName || !addForm.registeredDate || !addForm.expiredDate || !addForm.lastPassword) {
      setErrorMsg("Semua field harus diisi!");
      setIsLoading(false);
      return;
    }

    const res = await createMasterAccount(addForm);
    if (res.success) {
      setIsAddOpen(false);
      // Reset form
      const dates = getDefaultDates();
      setAddForm({
        accountName: "",
        categoryId: "",
        registeredDate: dates.registeredDate,
        expiredDate: dates.expiredDate,
        lastPassword: "",
      });
    } else {
      setErrorMsg(res.error || "Gagal membuat akun.");
    }
    setIsLoading(false);
  };

  // Handle Edit Password Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsLoading(true);
    setErrorMsg("");

    if (!editPasswordValue) {
      setErrorMsg("Password baru tidak boleh kosong!");
      setIsLoading(false);
      return;
    }

    const res = await updateMasterAccountPassword(editTarget.id, editPasswordValue);
    if (res.success) {
      setIsEditOpen(false);
      setEditPasswordValue("");
      setEditTarget(null);
    } else {
      setErrorMsg(res.error || "Gagal mengubah password.");
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Master Akun</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Kelola data akun utama langganan dan perbarui kata sandi secara berkala.
          </p>
        </div>

        {/* Add Account Modal Button */}
        <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Dialog.Trigger asChild>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5" />
              Tambah Akun
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <Dialog.Title className="text-lg font-bold text-foreground">Tambah Akun Baru</Dialog.Title>
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
                    Nama Akun
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Netflix Premium 4K"
                    value={addForm.accountName}
                    onChange={(e) => setAddForm({ ...addForm, accountName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Kategori Akun (Opsional)
                  </label>
                  <select
                    value={addForm.categoryId}
                    onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary/80 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer font-semibold"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Tanggal Registrasi
                    </label>
                    <input
                      type="date"
                      value={addForm.registeredDate}
                      disabled
                      className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground cursor-not-allowed transition-all opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Tanggal Expired (1 Bulan)
                    </label>
                    <input
                      type="date"
                      value={addForm.expiredDate}
                      disabled
                      className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground cursor-not-allowed transition-all opacity-80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Password Terakhir
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan password akun"
                    value={addForm.lastPassword}
                    onChange={(e) => setAddForm({ ...addForm, lastPassword: e.target.value })}
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
                    Simpan Akun
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
          placeholder="Cari berdasarkan nama akun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl overflow-x-auto">
        {filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <KeyRound className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-base font-semibold">Tidak ada data akun utama.</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Coba sesuaikan kata kunci pencarian atau tambah akun baru.</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-3">Nama Akun</th>
                <th className="py-3.5 px-3">Tanggal Registrasi</th>
                <th className="py-3.5 px-3">Tanggal Expired</th>
                <th className="py-3.5 px-3">Password Terakhir</th>
                <th className="py-3.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="py-4 px-3 text-foreground transition-colors font-bold text-base">
                    <div className="flex flex-col">
                      <span className="group-hover:text-primary transition-colors">{acc.accountName}</span>
                      {acc.categoryName ? (
                        <span className="inline-flex items-center w-fit mt-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary shadow-sm uppercase tracking-wider">
                          {acc.categoryName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center w-fit mt-1.5 rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground shadow-sm uppercase tracking-wider">
                          Tanpa Kategori
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-muted-foreground">
                    {formatDate(acc.registeredDate)}
                  </td>
                  <td className="py-4 px-3 text-muted-foreground">
                    {formatDate(acc.expiredDate)}
                  </td>
                  <td className="py-4 px-3">
                    <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono border border-border/50 text-foreground font-semibold">
                      {acc.lastPassword}
                    </code>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditTarget(acc);
                          setEditPasswordValue(acc.lastPassword);
                          setIsEditOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Ubah Password
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Apakah Anda yakin ingin menghapus akun "${acc.accountName}"?\n\nSemua data transaksi sewa yang terhubung dengan akun ini juga akan terhapus.`)) {
                            const res = await deleteMasterAccount(acc.id);
                            if (res.success) {
                              setAccounts(prev => prev.filter(item => item.id !== acc.id));
                            } else {
                              alert(res.error || "Gagal menghapus akun.");
                            }
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Password Modal */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <Dialog.Title className="text-lg font-bold text-foreground">Perbarui Password Akun</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  onClick={() => {
                    setEditTarget(null);
                    setEditPasswordValue("");
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </Dialog.Close>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Nama Akun
                </label>
                <p className="text-sm font-bold text-foreground bg-secondary/30 px-3 py-2.5 rounded-xl border border-border/50">
                  {editTarget?.accountName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Password Baru
                </label>
                <input
                  type="text"
                  placeholder="Masukkan password baru"
                  value={editPasswordValue}
                  onChange={(e) => setEditPasswordValue(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTarget(null);
                      setEditPasswordValue("");
                    }}
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
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
