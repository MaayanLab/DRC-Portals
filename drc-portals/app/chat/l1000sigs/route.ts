import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest
) {
    const { gene, dir, perturb } = await req.json();
    var url: string;
    if (perturb == "drugs") {
        url = `https://lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/table/cp/${dir}/${gene}`
    } else {
        url = `https://lincs-reverse-search-dashboard.dev.maayanlab.cloud/api/table/xpr/${dir}/${gene}`
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
    }})
    try {
    const tableDataJson = await response.json()

    return new NextResponse(JSON.stringify(tableDataJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
    } catch (error) {
        console.log(error)
        return new NextResponse(JSON.stringify({
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });

    }
}
