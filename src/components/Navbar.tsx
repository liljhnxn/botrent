"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { 
  KeyRound, 
  Compass, 
  PlusCircle, 
  Layers, 
  Coins, 
  Menu, 
  X, 
  ExternalLink 
} from "lucide-react";
import { botchainTestnet } from "@/config/chains";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Explore Rentals", href: "/explore", icon: Compass },
    { name: "List NFT", href: "/create", icon: PlusCircle },
    { name: "My Rentals", href: "/dashboard/rentals", icon: Layers },
    { name: "Owner Dashboard", href: "/dashboard/owner", icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080a18]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet via-brand-purple to-brand-cyan p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300">
              <div className="w-full h-full bg-[#080a18] rounded-[10px] flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  Bot<span className="text-brand-cyan">Rent</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                  Testnet
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Decentralized NFT Rental Protocol
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-inner border border-white/10 text-brand-cyan"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-cyan" : "text-slate-400"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span>Botchain 968</span>
          </div>

          <WalletButton />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0c1024]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                  isActive
                    ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Network: Bohr Testnet (968)</span>
            <a
              href={botchainTestnet.blockExplorers.default.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-brand-cyan hover:underline"
            >
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
