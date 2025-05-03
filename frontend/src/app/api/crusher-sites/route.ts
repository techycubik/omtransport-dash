import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:4000/api/crusher-sites', {
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('GET crusher sites response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch crusher sites');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crusher sites:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch crusher sites' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 