"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MdMicExternalOn } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { useSocket } from "@/lib/socket-context";

type JoinResponse =
  | {
      success: true;
      room: { name: string; guestCount: number };
    }
  | {
      success: false;
      error?: string;
    };

export default function RemoteAppLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const roomCode = (params.code as string) || "";
  const { socket, isConnected } = useSocket();

  const [roomName, setRoomName] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    socket.emit("room:join", { code: roomCode }, (response: JoinResponse) => {
      if (!response.success) {
        setRoomError(response.error || "Room not found");
        return;
      }

      setRoomError(null);
      setRoomName(response.room.name);
    });

    function onRoomClosed(payload: { reason?: string }) {
      setRoomError(payload?.reason === "host_disconnected" ? "Room closed" : "Room unavailable");
    }

    socket.on("room:closed", onRoomClosed);
    return () => {
      socket.off("room:closed", onRoomClosed);
    };
  }, [roomCode, socket]);

  return (
    <div className="w-full min-h-[100dvh]">
      <div className="mx-auto w-full max-w-[480px] h-[100dvh] bg-[#0f080f] border border-white/10 shadow-[0_0_40px_0_rgba(244,37,244,0.08)] overflow-hidden flex flex-col">
        <header className="shrink-0 sticky top-0 z-20 bg-[#0f080f]/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#f425f4]/20 p-2 rounded-lg">
                <MdMicExternalOn className="text-[#f425f4] text-2xl leading-none" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight text-white">Karaoke Remote</h1>
                <p className="text-xs text-white/40 font-medium">
                  {roomName ? roomName : roomCode ? `Room: ${roomCode}` : ""}
                  {isConnected ? "" : " · offline"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#f425f4]/20 hover:text-[#f425f4] transition-colors"
              aria-label="Profile"
            >
              <FiUser className="h-5 w-5" />
            </button>
          </div>
        </header>

        {roomError ? (
          <div className="flex-1 px-6 py-10 grid place-items-center">
            <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
              <p className="text-sm font-semibold text-red-400">{roomError}</p>
              <p className="mt-2 text-xs text-white/50">Ask the host for a new link.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">{children}</div>
        )}
      </div>
    </div>
  );
}
