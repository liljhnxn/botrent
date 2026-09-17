"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface CountdownProps {
  expiresAt: bigint | number;
  onExpire?: () => void;
  compact?: boolean;
}

export function Countdown({ expiresAt, onExpire, compact = false }: CountdownProps) {
  const targetTimestamp = typeof expiresAt === "bigint" ? Number(expiresAt) : expiresAt;
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isExpiringSoon: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isExpiringSoon: false,
  });

  useEffect(() => {
    function calculateTime() {
      const now = Math.floor(Date.now() / 1000);
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isExpiringSoon: false,
        });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      const isExpiringSoon = diff < 24 * 3600; // less than 24 hours

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isExpiringSoon,
      });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-rose/15 border border-brand-rose/30 text-brand-rose text-xs font-semibold">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Rental expired</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 font-mono text-xs font-medium ${
          timeLeft.isExpiringSoon ? "text-brand-amber animate-pulse" : "text-brand-cyan"
        }`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium font-mono ${
          timeLeft.isExpiringSoon
            ? "bg-brand-amber/10 border-brand-amber/30 text-brand-amber animate-pulse"
            : "bg-surface-200/80 border-white/10 text-slate-200"
        }`}
      >
        <Clock className={`w-3.5 h-3.5 shrink-0 ${timeLeft.isExpiringSoon ? "text-brand-amber" : "text-brand-cyan"}`} />
        <span>
          {timeLeft.days > 0 && <span><strong>{timeLeft.days}</strong>d </span>}
          <span><strong>{timeLeft.hours}</strong>h </span>
          <span><strong>{timeLeft.minutes}</strong>m </span>
          <span><strong>{timeLeft.seconds}</strong>s remaining</span>
        </span>
      </div>
      <p className="text-[10px] text-slate-400 italic">
        * Smart contract block.timestamp is authoritative
      </p>
    </div>
  );
}
