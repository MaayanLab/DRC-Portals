import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest
) {
    const { gene, dir, perturb } = await req.json();
    var url: string;
    console.log(perturb)
    if (perturb == "drug") {
        url = `https://lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/table/cp/${dir}/${gene}`
    } else {
        url = `https://lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/table/xpr/${dir}/${gene}`
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
    }})
    if (!response.ok) {
        return Response.json({}, { status: response.status })
    }
    const tableDataJson = await response.json()
    return Response.json(tableDataJson, { status: 200 });
}
