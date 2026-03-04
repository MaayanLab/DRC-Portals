import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
    const centers = 
    await prisma.center.findMany({
      where: {
        active: true
      },
    });

    return new NextResponse(JSON.stringify({
        centers: centers
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
}