"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/lib/socket-context";
import { MdMicExternalOn } from "react-icons/md";
import Link from "next/link";
import { SocketStatus } from "@/app/app/components/SocketStatus";
import { FaArrowCircleRight, FaCheck, FaTimes } from "react-icons/fa";
import ReactEasyCrop, { Area } from "react-easy-crop";
import { CgSpinner } from "react-icons/cg";

/* eslint-disable @next/next/no-img-element */

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { socket } = useSocket();
  const code = params.code as string | undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    code: code || "",
    name: "",
    image: null as string | null,
  });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingRoom, setCheckingRoom] = useState(code ? true : false);

  useEffect(() => {
    if (!code || !socket) return;

    socket.emit("room:info", code, (response: { success: boolean }) => {
      setCheckingRoom(false);
      if (!response.success) {
        setError("Room not found");
      }
    });
  }, [code, socket]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!code) {
      const newCode = e.target.value;
      setFormData((prev) => ({ ...prev, code: newCode }));

      if (newCode.trim()) {
        socket.emit("room:info", newCode.trim(), (response: { success: boolean }) => {
          if (!response.success) {
            setError("Room not found");
          } else {
            setError(null);
          }
        });
      } else {
        setError(null);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const canvas = document.createElement("canvas");
    const image = new Image();
    image.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cropX = Math.round(croppedAreaPixels.x);
      const cropY = Math.round(croppedAreaPixels.y);
      const cropWidth = Math.round(croppedAreaPixels.width);
      const cropHeight = Math.round(croppedAreaPixels.height);

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const croppedImage = canvas.toDataURL("image/jpeg", 0.8);
      setFormData((prev) => ({ ...prev, image: croppedImage }));
      setImageSrc(null);
    };
    image.src = imageSrc;
  };

  const handleCropCancel = () => {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (!formData.code || !formData.name) {
      setError("Code and name are required");
      return;
    }

    setLoading(true);
    setError(null);

    socket.emit(
      "room:join",
      {
        code: formData.code.trim(),
        name: formData.name.trim(),
        image: formData.image,
      },
      (response: { success: boolean; error?: string }) => {
        setLoading(false);
        if (response.success) {
          router.push(`/app/remote/${formData.code.trim()}`);
        } else {
          setError(response.error || "Failed to join room");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f080f] text-white">
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-[#f425f4]/20 p-2 rounded-lg">
            <MdMicExternalOn className="text-[#f425f4] text-2xl leading-none" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase">
            orcks
          </h1>
        </Link>
        <SocketStatus />
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f425f4]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Ready to Join?
            </h2>
            <p className="text-slate-400 font-medium">
              Enter a room code to start singing.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-[0_0_40px_0_rgba(244,37,244,0.15)]">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="shrink-0 w-full max-w-[160px]">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="relative w-full aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-[#f425f4]/40 transition-colors overflow-hidden group cursor-pointer bg-white/5"
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 group-hover:text-[#f425f4]/60 transition-colors">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs font-semibold">Add Photo</span>
                      <span className="text-xs text-slate-500">Optional</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </button>
              </div>

              <div className="w-full flex-1 space-y-6">
                <div className="space-y-2">
                <label
                  className="block text-sm font-semibold uppercase tracking-widest text-slate-400"
                  htmlFor="code"
                >
                  Room Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={handleCodeChange}
                  disabled={!!code || checkingRoom}
                  placeholder="e.g. ABC123"
                  autoFocus={!code}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-4 px-4 text-lg font-medium focus:ring-2 focus:ring-[#f425f4]/20 focus:border-[#f425f4] focus:shadow-[0_0_15px_0_rgba(244,37,244,0.3)] outline-none transition-all text-white placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="absolute right-0 top-1/2 -translate-y-10 pr-14">
                    {checkingRoom ? (
                    <div className="text-sm text-slate-400">
                        <CgSpinner className="animate-spin" />
                    </div>
                    ) : error ? (
                        <div className="text-sm text-red-400 font-medium border rounded-lg p-3">
                            <FaTimes />
                        </div>
                    ) : formData.code.trim() ? (
                        <div className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                            <FaCheck />
                        </div>
                    ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold uppercase tracking-widest text-slate-400"
                  htmlFor="name"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="What should we call you?"
                  autoFocus={!!code}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-4 px-4 text-lg font-medium focus:ring-2 focus:ring-[#f425f4]/20 focus:border-[#f425f4] focus:shadow-[0_0_15px_0_rgba(244,37,244,0.3)] outline-none transition-all text-white placeholder:text-slate-400"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 font-medium border rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                onClick={() => handleSubmit()}
                disabled={!formData.code || !formData.name || loading || checkingRoom}
                className="w-full bg-[#f425f4] hover:bg-[#f425f4]/90 text-white py-4 px-6 rounded-lg text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#f425f4]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Joining..." : "Join Session"}
                <FaArrowCircleRight className="text-xl" />
              </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {imageSrc && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Crop Your Photo</h3>

            <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden mb-4">
              <ReactEasyCrop
                image={imageSrc ?? undefined}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-400 block mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 modal-action">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  className="btn bg-[#f425f4] text-white hover:bg-[#f425f4]/90"
                >
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCropCancel} />
        </div>
      )}
    </div>
  );
}
