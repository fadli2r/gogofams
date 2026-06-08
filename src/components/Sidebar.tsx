"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KeyRound, Receipt, Menu, X, Tags, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/actions";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Kategori", href: "/categories", icon: Tags },
    { name: "Master Akun", href: "/accounts", icon: KeyRound },
    { name: "Transaksi", href: "/transactions", icon: Receipt },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <KeyRound className="h-5 w-5 animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-lg font-bold text-transparent">
            GOGOMI PANEL
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-foreground hover:bg-muted"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed bottom-0 top-16 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 md:top-0 md:h-screen md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Logo */}
        <div className="hidden h-20 items-center gap-3 px-6 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-lg shadow-primary/10">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-xl font-extrabold text-transparent">
              GOGOMI
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Internal Portal
            </span>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-secondary-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-105", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
                {isActive && (
                  <span className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 bg-muted/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary border border-border text-xs font-bold text-primary text-center">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">Admin Portal</span>
              <span className="text-[10px] text-muted-foreground truncate">admin@gogomipanel.com</span>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm("Apakah Anda yakin ingin keluar dari panel?")) {
                await logoutUser();
                window.location.href = "/login";
              }
            }}
            title="Keluar dari Panel"
            className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="h-5.5 w-5.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
