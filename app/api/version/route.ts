import { NextResponse } from "next/server";
import { getGitCommitFull } from "@/lib/version";

export async function GET() {
  const commit = await getGitCommitFull();
  return NextResponse.json({ commit });
}
