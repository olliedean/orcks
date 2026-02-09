"use client";

import { useSocket } from "@/lib/socket-context";

export function SocketStatus() {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-500/20">
        <span className="h-2 w-2 bg-red-500 rounded-full" />
        websocket offline
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
      websocket online
    </div>
  );
}
