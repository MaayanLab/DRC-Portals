import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
    const dccs = 
    await prisma.dCC.findMany({
      where: {
        cfde_partner: true,
      },
    });

    console.log(dccs)

    return new NextResponse(JSON.stringify({
        dccs: dccs
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
}