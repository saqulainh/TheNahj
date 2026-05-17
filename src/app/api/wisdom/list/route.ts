import { NextResponse } from "next/server";
import { getAllWisdom } from "@/lib/wisdom";

export async function GET() {
  const wisdom = await getAllWisdom();
  return NextResponse.json(wisdom);
}
