import { getDashboardData } from "@/lib/actions";

export const dynamic = "force-dynamic";
import { Users, KeyRound, AlertCircle, CalendarClock, ShieldAlert, BadgeAlert } from "lucide-react";

interface DashboardTransaction {
  id: string;
  accountId: string;
  accountName: string;
  categoryName: string | null;
  customerName: string;
  customerEmail: string | null;
  orderNumber: string;
  startDate: string;
  duration: number;
  expiredDate: string;
}

interface DashboardAccount {
  id: string;
  accountName: string;
  categoryName: string | null;
  registeredDate: string;
  expiredDate: string;
  lastPassword: string;
}

export default async function DashboardPage() {
  const result = await getDashboardData();
  
  if (!result.success) {
    return (
      <div className="p-8 text-center text-red-400">
        <h2 className="text-xl font-bold">Error loading dashboard</h2>
        <p>{result.error}</p>
      </div>
    );
  }

  const transactions = result.transactions as DashboardTransaction[];
  const accounts = result.accounts as DashboardAccount[];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getTransactionBadge = (dateStr: string) => {
    const expiredDate = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    if (expiredDate < startOfToday) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Expired
        </span>
      );
    } else if (expiredDate >= startOfToday && expiredDate <= endOfToday) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Habis Hari Ini
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Aktif
        </span>
      );
    }
  };

  const getAccountBadge = (dateStr: string) => {
    const expiredDate = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (expiredDate < startOfToday) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Expired
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Masa Aktif Kritis
        </span>
      );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Pemantauan akun utama dan status sewa pelanggan secara real-time.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="p-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Masa Sewa Habis</p>
            <h3 className="text-2xl font-bold mt-1 text-red-400">{transactions.length} <span className="text-sm font-medium text-muted-foreground">Pelanggan</span></h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Akun Utama Kritis</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-400">{accounts.length} <span className="text-sm font-medium text-muted-foreground">Akun</span></h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/10">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tanggal Hari Ini</p>
            <h3 className="text-lg font-bold mt-1 text-foreground">
              {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Section 1: Pembeli Habis Masa Sewa */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full border border-border shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <div>
                <h2 className="text-lg font-bold text-foreground">Pembeli Habis Masa Sewa</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar transaksi sewa yang telah berakhir atau habis hari ini.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
              {transactions.length} Total
            </span>
          </div>

          <div className="flex-1 overflow-x-auto mt-4">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium">Tidak ada pembeli dengan masa sewa habis.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Nama Pelanggan</th>
                    <th className="py-3 px-2">No. Order</th>
                    <th className="py-3 px-2">Akun Utama</th>
                    <th className="py-3 px-2">Tgl Expired</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3.5 px-2 text-foreground transition-colors">
                        <div className="flex flex-col">
                          <span className="group-hover:text-primary font-bold text-sm">{tx.customerName}</span>
                          {tx.customerEmail && (
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                              {tx.customerEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-muted-foreground">{tx.orderNumber}</td>
                      <td className="py-3.5 px-2 text-secondary-foreground font-semibold">
                        <div className="flex flex-col">
                          <span>{tx.accountName}</span>
                          {tx.categoryName && (
                            <span className="inline-flex items-center w-fit mt-0.5 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.2 text-[8px] font-bold text-primary uppercase tracking-wider">
                              {tx.categoryName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-muted-foreground">{formatDate(tx.expiredDate)}</td>
                      <td className="py-3.5 px-2 text-right">{getTransactionBadge(tx.expiredDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 2: Akun Utama Habis Masa Aktif */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full border border-border shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <div>
                <h2 className="text-lg font-bold text-foreground">Akun Utama Habis Masa Aktif</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar akun utama yang masa aktifnya habis dalam 2 hari atau kurang.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {accounts.length} Total
            </span>
          </div>

          <div className="flex-1 overflow-x-auto mt-4">
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <KeyRound className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium">Semua akun utama aman (tidak ada yang habis dalam 2 hari).</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Nama Akun</th>
                    <th className="py-3 px-2">Password Terakhir</th>
                    <th className="py-3 px-2">Tgl Expired</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3.5 px-2 text-foreground transition-colors">
                        <div className="flex flex-col">
                          <span className="group-hover:text-primary font-bold text-sm">{acc.accountName}</span>
                          {acc.categoryName && (
                            <span className="inline-flex items-center w-fit mt-0.5 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.2 text-[8px] font-bold text-primary uppercase tracking-wider">
                              {acc.categoryName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-muted-foreground">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border/50 text-foreground font-semibold">
                          {acc.lastPassword}
                        </code>
                      </td>
                      <td className="py-3.5 px-2 text-muted-foreground">{formatDate(acc.expiredDate)}</td>
                      <td className="py-3.5 px-2 text-right">{getAccountBadge(acc.expiredDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
