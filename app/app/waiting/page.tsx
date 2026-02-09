"use client";

import { useMemo, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { IoMdPhonePortrait } from "react-icons/io";
import { MdMicExternalOn } from "react-icons/md";

/* eslint-disable @next/next/no-img-element */

function makeRoomCode() {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function WaitingRoom() {
    const roomCode = useMemo(() => makeRoomCode(), []);
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const joinUrl = `${origin}/join/${roomCode}`;
    const prettyLink = joinUrl.replace(/^https?:\/\//, "");

    const qrUrl = useMemo(() => {
        if (!origin) return "";
        const data = encodeURIComponent(joinUrl);
        return `https://api.qrserver.com/v1/create-qr-code/?size=768x768&format=svg&margin=0&data=${data}`;
    }, [origin, joinUrl]);

    const [copied, setCopied] = useState(false);

    async function onCopy() {
        if (!origin) return;
        try {
            await navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            console.error("Failed to copy join URL to clipboard");
        }
    }

    return (
        <div className="w-full h-full">
            <main className="min-h-full flex flex-col items-center justify-center px-4 py-10 max-w-6xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                    <div className="flex flex-col gap-8 order-2 lg:order-1 text-center lg:text-left">
                        <div className="space-y-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f425f4]/10 text-[#f425f4] text-xs font-bold uppercase tracking-wider">
                                Live Room
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                                Waiting for songs
                            </h1>
                            <p className="text-white/60 text-lg max-w-md mx-auto lg:mx-0">
                                Share the QR code or link. As guests add songs, they&apos;ll show up
                                here automatically.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                        Room Link
                                    </label>
                                    <div className="flex items-center justify-center lg:justify-start gap-3">
                                        <span className="text-3xl font-mono font-bold text-[#f425f4] tracking-tight break-all">
                                            {origin ? prettyLink : "loading…"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={onCopy}
                                        className="flex-1 flex min-w-[140px] items-center justify-center gap-2 rounded-lg h-12 px-4 bg-[#f425f4] text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!origin}
                                    >
                                        <FiCopy />
                                        {copied ? "Copied" : "Copy Link"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f425f4] opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f425f4]" />
                                    </div>
                                    <span className="font-semibold text-white/80">3 Guests Connected</span>
                                </div>

                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-white/15 border-2 border-[#0f080f] flex items-center justify-center text-[10px] font-bold text-white/80">
                                        OD
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#f425f4]/40 border-2 border-[#0f080f] flex items-center justify-center text-[10px] font-bold text-white">
                                        AW
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-400/80 border-2 border-[#0f080f] flex items-center justify-center text-[10px] font-bold text-white">
                                        DP
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 flex flex-col items-center justify-center">
                        <div className="relative p-8 bg-white rounded-2xl shadow-[0_0_50px_-18px_rgba(244,37,244,0.55)]">
                            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-[#f425f4] rounded-tl-xl" />
                            <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-[#f425f4] rounded-tr-xl" />
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-[#f425f4] rounded-bl-xl" />
                            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-[#f425f4] rounded-br-xl" />

                            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl bg-white grid place-items-center relative overflow-hidden">
                                <div
                                    className="absolute inset-0 opacity-[0.06]"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px)",
                                        backgroundSize: "22px 22px",
                                    }}
                                />

                                {qrUrl ? (
                                    <img
                                        src={qrUrl}
                                        alt="Join room QR code"
                                        className="relative w-[92%] h-[92%] object-contain"
                                    />
                                ) : (
                                    <div className="relative text-black/60 font-mono text-sm">
                                        Generating…
                                    </div>
                                )}

                                <div className="absolute inset-0 pointer-events-none grid place-items-center">
                                    <div className="h-12 w-12 rounded-full bg-white shadow-lg ring-2 ring-[#f425f4]/60 grid place-items-center">
                                        <MdMicExternalOn className="text-[#f425f4] text-2xl" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <p className="mt-8 text-sm font-mono text-white/50 flex items-center gap-2">
                            <IoMdPhonePortrait className="text-sm" />
                            Scan with your phone to join the party
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}