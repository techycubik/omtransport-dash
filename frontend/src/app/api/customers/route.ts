import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching customers from backend');
    const response = await fetch('https://omtransport-dash.onrender.com/api/customers', {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return new NextResponse(
        JSON.stringify({ error: `Backend returned ${response.status}` }),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Customers from backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch customers from backend' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 