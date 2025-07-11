import { NextResponse } from 'next/server';
import { generateDummyGroupedData } from '../_utils/generateDummyGroupedData';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const x_axis = searchParams.get('x_axis') || 'dcc';
    const group_by = searchParams.get('group_by');
    const y_axis = searchParams.get('y_axis') || 'subject';

    const data = generateDummyGroupedData({ x_axis, group_by, y_axis });
    return NextResponse.json({ data });
}