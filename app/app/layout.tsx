import type { ReactNode } from "react";
import { FaGithub, FaUsers } from "react-icons/fa";
import { RiGitRepositoryCommitsFill } from "react-icons/ri";
import { MdMicExternalOn } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { getGitCommitFull } from "@/lib/version";

export default async function AppLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    const commitFull = await getGitCommitFull();
    const commitHash = commitFull?.slice(0, 8) ?? "unknown";
    return (
        <div className="h-[100dvh] antialiased bg-[#0f080f] text-white flex flex-col overflow-hidden">
            <header className="shrink-0 flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0f080f]">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#f425f4]/20 p-2 rounded-lg">
                            <MdMicExternalOn className="text-[#f425f4] text-2xl leading-none" />
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
                            ORCKS
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            websocket online
                        </div>
                        <button
                            type="button"
                            className="text-sm font-medium text-white/40 hover:text-[#f425f4] transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:border-[#f425f4]/20"
                            aria-label="Settings"
                        >
                            <FiSettings className="h-5 w-5" />
                        </button>
                    </div>
            </header>

            <main className="flex-1 min-h-0 overflow-auto">{children}</main>

            <footer className="shrink-0 px-6 md:px-10 py-4 border-t border-white/10 bg-[#0f080f]">
                    <div className="flex items-center justify-between gap-4 text-xs font-medium">
                        <div className="flex items-center gap-4 text-white/40">
                            <a
                                className="inline-flex items-center gap-2 hover:text-[#f425f4] transition-colors"
                                href="https://github.com/olliedean/orcks"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaGithub className="h-4 w-4" />
                                View on GitHub
                            </a>

                            <div className="inline-flex items-center gap-2">
                                <RiGitRepositoryCommitsFill className="h-4 w-4 text-[#f425f4]" />
                                <span className="uppercase tracking-widest">Commit</span>
                                <a href={`https://github.com/olliedean/orcks/commit/${commitFull}`} target="_blank" rel="noopener noreferrer">
                                    <code className="font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded text-white">
                                        {commitHash}
                                    </code>
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/5 text-white px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/10">
                                <FaUsers className="h-3 w-3 text-[#f425f4]" />
                                0 Connected
                            </div>
                        </div>
                    </div>
            </footer>
        </div>
    );
}