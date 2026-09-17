"use client";

import React from "react";
import { TxStatus } from "@/types";
import { botchainTestnet } from "@/config/chains";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";

interface TransactionModalProps {
  status: TxStatus;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ status, isOpen, onClose }: TransactionModalProps) {
  if (!isOpen || status.step === "idle") return null;

  const isPending = status.step === "preparing" || status.step === "confirming" || status.step === "pending";
  const isConfirmed = status.step === "confirmed";
  const isFailed = status.step === "failed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-surface-100 border border-white/10 p-6 shadow-2xl space-y-6">
        {/* Close Button */}
        {!isPending && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* State Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          {isPending && (
            <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
            </div>
          )}

          {isConfirmed && (
            <div className="w-16 h-16 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-9 h-9 text-brand-emerald" />
            </div>
          )}

          {isFailed && (
            <div className="w-16 h-16 rounded-2xl bg-brand-rose/15 border border-brand-rose/40 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <XCircle className="w-9 h-9 text-brand-rose" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{status.title}</h3>
            {status.message && (
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                {status.message}
              </p>
            )}
          </div>
        </div>

        {/* Transaction Flow Steps */}
        <div className="bg-surface-200/50 rounded-xl p-3 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Step Status:</span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-brand-cyan">
              {status.step.replace("_", " ")}
            </span>
          </div>

          {status.txHash && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className="text-slate-400">Transaction:</span>
              <a
                href={`${botchainTestnet.blockExplorers.default.url}/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-brand-cyan hover:underline"
              >
                {status.txHash.slice(0, 8)}...{status.txHash.slice(-6)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {status.error && (
            <div className="text-xs text-brand-rose bg-brand-rose/10 border border-brand-rose/20 rounded-lg p-2.5 mt-2 break-all leading-relaxed">
              {status.error}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          {isConfirmed ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-lg active:scale-95"
            >
              Done
            </button>
          ) : isFailed ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/15 transition-all border border-white/10"
            >
              Dismiss
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-cyan" />
              <span>Please confirm action in your Web3 wallet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
