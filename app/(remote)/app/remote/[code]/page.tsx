"use client";

import { MdMusicNote } from "react-icons/md";
import { FiChevronRight, FiPauseCircle, FiPlus, FiSearch } from "react-icons/fi";


export default function RemotePage() {

  return (
    <>
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="px-4 py-4">
          <label className="flex flex-col w-full h-14">
            <div className="flex w-full h-full items-stretch rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <div className="text-white/40 flex items-center justify-center pl-4 pr-2">
                <FiSearch className="h-5 w-5" />
              </div>
              <input
                className="w-full bg-transparent px-3 text-base font-medium text-white placeholder:text-white/30 outline-none"
                placeholder="Search songs, artists, or genres"
              />
            </div>
          </label>
        </div>

        <div className="px-2">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-tight px-4 pb-3 pt-5">
            Popular &amp; Trending
          </h2>

          <div className="flex flex-col">
              <div
                key="drag-path"
                className="flex items-center gap-4 px-4 min-h-[80px] py-3 justify-between hover:bg-white/5 transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-16 rounded-lg bg-white/5 border border-white/10 grid place-items-center shrink-0">
                    <MdMusicNote className="text-[#f425f4] text-2xl" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-white text-base font-bold leading-normal truncate">
                      Drag Path
                    </p>
                    <p className="text-white/50 text-sm font-medium leading-normal truncate">
                      Twenty One Pilots
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    className="flex min-w-[100px] h-10 px-4 items-center justify-center rounded-full bg-[#f425f4] text-white text-sm font-bold shadow-lg shadow-[#f425f4]/15 active:scale-95 transition-transform"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiPlus className="h-4 w-4" />
                      Add
                    </span>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 sticky bottom-0 z-30 bg-[#0f080f] border-t border-white/10 px-4 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="relative size-12 flex-shrink-0">
              <div className="absolute inset-0 bg-[#f425f4]/20 animate-pulse rounded-lg" />
              <div className="relative z-10 size-12 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
                <MdMusicNote className="text-[#f425f4] text-2xl" />
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-[#f425f4] mb-0.5">Now Playing</p>
              <p className="text-white text-sm font-bold truncate">Drag Path</p>
              <p className="text-white/50 text-xs truncate">Twenty One Pilots — Sung by: Guest</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-white/80 hover:text-[#f425f4] transition-colors"
                aria-label="Pause"
              >
                <FiPauseCircle className="text-3xl" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10"
            aria-label="View Queue"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f425f4]/10 text-[#f425f4]">
                <MdMusicNote className="h-5 w-5" />
              </span>
              <span className="font-bold text-white">
                Up Next: 0 Songs
              </span>
            </div>
            <div className="flex items-center gap-1 font-bold text-sm text-[#f425f4]">
              View Queue
              <FiChevronRight className="h-5 w-5" />
            </div>
          </button>
        </div>
      </footer>
    </>
  );
}
