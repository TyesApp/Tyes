import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const cui = searchParams.get('cui');
  const series = searchParams.get('series');
  const number = searchParams.get('number');

  if (!cui || !series || !number) {
    return new NextResponse('Missing required parameters', { status: 400 });
  }

  const username = process.env.SMARTBILL_USERNAME;
  const token = process.env.SMARTBILL_TOKEN;

  if (!username || !token) {
    return new NextResponse('SmartBill credentials not configured', { status: 500 });
  }

  const authHeader = `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`;

  try {
    const response = await fetch(`https://ws.smartbill.ro/SBORO/api/invoice/pdf?cif=${cui}&seriesname=${series}&number=${number}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/octet-stream'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SmartBill PDF error:', response.status, errorText);
      return new NextResponse(`Error fetching invoice from SmartBill: ${response.status}`, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Factura-${series}-${number}.pdf"`
      }
    });
  } catch (error) {
    console.error('Download Invoice Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
