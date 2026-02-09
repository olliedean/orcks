import { FaArrowCircleRight, FaGithub } from "react-icons/fa";
import {
  MdMeetingRoom,
  MdMicExternalOn,
} from "react-icons/md";
import { RiGitRepositoryCommitsFill } from "react-icons/ri";
import { getGitCommitFull } from "../lib/version";

export default async function Home() {
  const commitFull = await getGitCommitFull()
  const commitHash = commitFull?.slice(0, 8) ?? "unknown";
  return (
    <div className="min-h-screen flex flex-col bg-[#0f080f] text-white">
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-[#f425f4]/20 p-2 rounded-lg">
            <MdMicExternalOn className="text-[#f425f4] text-2xl leading-none" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase">
            orcks
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            websocket online
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f425f4]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Ready to Sing?
            </h2>
            <p className="text-slate-400 font-medium">
              Create a room to start your private party.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-xl border border-white/10 space-y-6 shadow-[0_0_40px_0_rgba(244,37,244,0.15)]">
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold uppercase tracking-widest text-slate-400"
                htmlFor="room-name"
              >
                Set Room Name
              </label>
              <div className="relative">
                <MdMeetingRoom className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  id="room-name"
                  autoFocus
                  placeholder="e.g. ollie's private karaoke"
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-lg font-medium focus:ring-2 focus:ring-[#f425f4]/20 focus:border-[#f425f4] focus:shadow-[0_0_15px_0_rgba(244,37,244,0.3)] outline-none transition-all text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-[#f425f4] hover:bg-[#f425f4]/90 text-white py-4 px-6 rounded-lg text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#f425f4]/20 cursor-pointer"
            >
              Start Local Session
              <FaArrowCircleRight className="text-xl" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">
                  Latency
                </span>
                <span className="text-sm font-semibold text-emerald-500">2ms</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">
                  Peers
                </span>
                <span className="text-sm font-semibold text-white">
                  0 Connected
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">
                  Audio
                </span>
                <span className="text-sm font-semibold text-white">
                  Lossless
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center mt-auto">
        <a
          className="inline-flex items-center gap-2 text-white/30 hover:text-[#f425f4] transition-colors text-sm font-medium decoration-[#f425f4]/40 underline-offset-4"
          href="https://github.com/olliedean/orcks"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub className="h-4 w-4" />
          Open source on GitHub
        </a>
        <div className="mt-2 text-[10px] uppercase text-white/10 font-bold">
          <RiGitRepositoryCommitsFill className="inline-flex" /> Commit hash:{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/olliedean/orcks/commit/${commitFull}`}
          >
            <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">
              {commitHash}
            </code>
          </a>
        </div>
      </footer>
    </div>
  );
}
