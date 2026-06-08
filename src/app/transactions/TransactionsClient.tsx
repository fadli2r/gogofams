"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Search, X, Loader2, CreditCard, Calendar, Trash2 } from "lucide-react";
import { createTransaction, deleteTransaction } from "@/lib/actions";

interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  categoryName?: string | null;
  customerName: string;
  customerEmail?: string | null;
  orderNumber: string;
  startDate: string;
  duration: number;
  expiredDate: string;
}

interface MasterAccount {
  id: string;
  accountName: string;
}

interface TransactionsClientProps {
  initialTransactions: Transaction[];
  masterAccounts: MasterAccount[];
}

export default function TransactionsClient({
  initialTransactions,
  masterAccounts,
}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Dropdown states for searchable master account selection
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");

  const [form, setForm] = useState({
    accountId: "",
    customerName: "",
    customerEmail: "",
    orderNumber: "",
    startDate: new Date().toISOString().split("T")[0],
    duration: 30,
  });

  const filteredMasterAccounts = masterAccounts.filter(acc =>
    acc.accountName.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const selectedAccount = masterAccounts.find(acc => acc.id === form.accountId);

  if (JSON.stringify(transactions) !== JSON.stringify(initialTransactions)) {
    setTransactions(initialTransactions);
  }

  const filteredTransactions = transactions.filter(
    (t) =>
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.accountName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!form.accountId || !form.customerName || !form.orderNumber || !form.startDate) {
      setErrorMsg("Semua field wajib diisi!");
      setIsLoading(false);
      return;
    }

    const res = await createTransaction({
      accountId: form.accountId,
      customerName: form.customerName,
      customerEmail: form.customerEmail.trim() || undefined,
      orderNumber: form.orderNumber,
      startDate: form.startDate,
      duration: Number(form.duration),
    });

    if (res.success) {
      setIsAddOpen(false);
      setForm({
        accountId: "",
        customerName: "",
        customerEmail: "",
        orderNumber: "",
        startDate: new Date().toISOString().split("T")[0],
        duration: 30,
      });
      setIsAccountDropdownOpen(false);
      setAccountSearch("");
    } else {
      setErrorMsg(res.error || "Gagal membuat transaksi.");
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDurationBadge = (duration: number) => {
    let color = "bg-violet-500/10 text-violet-400 border-violet-500/20";
    if (duration === 7) color = "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (duration === 14) color = "bg-teal-500/10 text-teal-400 border-teal-500/20";
    return (
      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${color}`}>
        {duration} Hari
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Transaksi Sewa</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Catat dan monitor penyewaan akun utama oleh pelanggan beserta tanggal berakhirnya.
          </p>
        </div>

        {/* Add Transaction Modal Button */}
        <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Dialog.Trigger asChild>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5" />
              Catat Transaksi
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <Dialog.Title className="text-lg font-bold text-foreground">Catat Transaksi Baru</Dialog.Title>
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

              {masterAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-yellow-400 font-semibold mb-3">Tidak ada Master Akun yang terdaftar!</p>
                  <p className="text-xs text-muted-foreground mb-4">Anda harus membuat minimal satu Master Akun terlebih dahulu sebelum dapat mencatatkan transaksi.</p>
                  <Dialog.Close asChild>
                    <button className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                      Tutup
                    </button>
                  </Dialog.Close>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Master Account (Searchable Combobox) */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Pilih Akun Utama
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                      className="w-full text-left flex items-center justify-between rounded-xl border border-border bg-secondary/85 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer font-semibold"
                    >
                      <span className={selectedAccount ? "text-foreground" : "text-muted-foreground"}>
                        {selectedAccount ? selectedAccount.accountName : "-- Pilih Akun --"}
                      </span>
                      <span className="text-muted-foreground text-xs">▼</span>
                    </button>

                    {isAccountDropdownOpen && (
                      <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-card p-2.5 shadow-2xl space-y-2">
                        <input
                          type="text"
                          placeholder="Cari akun..."
                          value={accountSearch}
                          onChange={(e) => setAccountSearch(e.target.value)}
                          className="w-full rounded-lg border border-border bg-secondary/50 px-2.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                          autoFocus
                        />
                        <div className="max-h-40 overflow-y-auto divide-y divide-border/30">
                          {filteredMasterAccounts.length === 0 ? (
                            <p className="text-center py-3 text-xs text-muted-foreground">
                              Tidak ada akun ditemukan
                            </p>
                          ) : (
                            filteredMasterAccounts.map((acc) => (
                              <button
                                key={acc.id}
                                type="button"
                                onClick={() => {
                                  setForm({ ...form, accountId: acc.id });
                                  setIsAccountDropdownOpen(false);
                                  setAccountSearch("");
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                  form.accountId === acc.id
                                    ? "bg-primary text-primary-foreground font-bold"
                                    : "text-foreground hover:bg-muted"
                                }`}
                              >
                                {acc.accountName}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Nama Pelanggan
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pembeli"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Email Pelanggan (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: budi@gmail.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Order Number */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Nomor Order / Invoice
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: INV-2026-0001"
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Start Date & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Mulai Sewa
                      </label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Durasi Sewa
                      </label>
                      <select
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                        className="w-full rounded-xl border border-border bg-secondary/80 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
                      >
                        <option value={7}>7 Hari</option>
                        <option value={14}>14 Hari</option>
                        <option value={30}>30 Hari</option>
                      </select>
                    </div>
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
                      Simpan Transaksi
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari berdasarkan pelanggan, order, atau akun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-base font-semibold">Tidak ada data transaksi.</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Coba sesuaikan kata kunci pencarian atau catat transaksi baru.</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-3">Nama Pelanggan</th>
                <th className="py-3.5 px-3">No. Order</th>
                <th className="py-3.5 px-3">Akun Utama</th>
                <th className="py-3.5 px-3">Mulai Sewa</th>
                <th className="py-3.5 px-3">Durasi</th>
                <th className="py-3.5 px-3">Tanggal Expired</th>
                <th className="py-3.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="py-4 px-3 text-foreground transition-colors font-bold text-base">
                    <div className="flex flex-col">
                      <span className="group-hover:text-primary transition-colors">{tx.customerName}</span>
                      {tx.customerEmail && (
                        <span className="text-xs text-muted-foreground font-semibold mt-1">
                          {tx.customerEmail}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-muted-foreground font-semibold">
                    {tx.orderNumber}
                  </td>
                  <td className="py-4 px-3 text-secondary-foreground font-bold">
                    <div className="flex flex-col">
                      <span>{tx.accountName}</span>
                      {tx.categoryName ? (
                        <span className="inline-flex items-center w-fit mt-1 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                          {tx.categoryName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center w-fit mt-1 rounded-md border border-border bg-secondary/40 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Tanpa Kategori
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-muted-foreground">
                    {formatDate(tx.startDate)}
                  </td>
                  <td className="py-4 px-3">
                    {getDurationBadge(tx.duration)}
                  </td>
                  <td className="py-4 px-3 text-foreground font-bold">
                    {formatDate(tx.expiredDate)}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={async () => {
                        if (confirm(`Apakah Anda yakin ingin menghapus transaksi sewa untuk "${tx.customerName}"?`)) {
                          const res = await deleteTransaction(tx.id);
                          if (res.success) {
                            setTransactions(prev => prev.filter(item => item.id !== tx.id));
                          } else {
                            alert(res.error || "Gagal menghapus transaksi.");
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
