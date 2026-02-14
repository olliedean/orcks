"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MdMusicNote } from "react-icons/md";
import { FiChevronLeft } from "react-icons/fi";
import { useSocket } from "@/lib/socket-context";

type QueueItem = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  addedBy?: string;
  addedAt: number;
};

type QueueGetResponse =
  | { success: true; queue: QueueItem[] }
  | { success: false; error?: string };

export default function QueuePage() {
  const params = useParams();
  const roomCode = (params.code as string) || "";
  const { socket } = useSocket();

  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    function onQueueUpdate(payload: { queue: QueueItem[] }) {
      if (Array.isArray(payload?.queue)) {
        setQueue(payload.queue);
      }
    }

    socket.on("queue:update", onQueueUpdate);

    socket.emit("queue:get", roomCode, (response: QueueGetResponse) => {
      if (response.success) {
        setQueue(response.queue);
      }
    });

    return () => {
      socket.off("queue:update", onQueueUpdate);
    };
  }, [roomCode, socket]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 pt-4">
        <Link
          href={`/app/remote/${roomCode}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-[#f425f4] transition-colors"
        >
          <FiChevronLeft className="h-5 w-5" />
          Back
        </Link>
      </div>

      <main className="flex-1 min-h-0 overflow-auto px-2">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-tight px-4 pb-3 pt-5">
          Up Next
        </h2>

        <div className="flex flex-col">
          {queue.map((item, index) => (
            <div
              key={`${item.id}:${item.addedAt}:${index}`}
              className="flex items-center gap-4 px-4 min-h-[80px] py-3 justify-between hover:bg-white/5 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="size-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden grid place-items-center shrink-0">
                  {item.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <MdMusicNote className="text-[#f425f4] text-2xl" />
                  )}
                </div>

                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-white text-base font-bold leading-normal truncate">
                    {index + 1}. {item.title}
                  </p>
                  <p className="text-white/50 text-sm font-medium leading-normal truncate">
                    {item.artist}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {queue.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/40">No songs in the queue yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}
