import { NextResponse } from "next/server";

type DeezerArtist = {
  id: number;
  name: string;
};

type DeezerAlbum = {
  id: number;
  title: string;
  cover?: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
};

type DeezerTrack = {
  id: number;
  title: string;
  link?: string;
  preview?: string;
  artist: DeezerArtist;
  album?: DeezerAlbum;
};

type DeezerSearchResponse = {
  data: DeezerTrack[];
  total?: number;
  next?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limitParam = url.searchParams.get("limit");
  const limit = Math.max(1, Math.min(25, Number(limitParam ?? 12) || 12));

  if (!q) {
    return NextResponse.json({ data: [], total: 0 }, { status: 200 });
  }

  const upstreamUrl = new URL("https://api.deezer.com/search");
  upstreamUrl.searchParams.set("q", q);
  upstreamUrl.searchParams.set("limit", String(limit));

  const upstream = await fetch(upstreamUrl, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 30 },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Deezer upstream error" },
      { status: 502 }
    );
  }

  const json = (await upstream.json()) as DeezerSearchResponse;

  return NextResponse.json(
    {
      data: Array.isArray(json.data) ? json.data : [],
      total: typeof json.total === "number" ? json.total : undefined,
      next: typeof json.next === "string" ? json.next : undefined,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
      },
    }
  );
}
