import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching materials from backend');
    const response = await fetch('http://localhost:4000/api/materials', {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return new NextResponse(
        JSON.stringify({ error: `Backend returned ${response.status}: ${errorText}` }),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Materials from backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch materials from backend', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API route: Creating material', body);
    
    const response = await fetch('http://localhost:4000/api/materials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('Create material response status:', response.status);
    
    let responseText;
    try {
      responseText = await response.text();
      console.log('Response text:', responseText);
    } catch (e) {
      console.error('Failed to get response text:', e);
    }
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText || '{}');
      } catch (e) {
        errorData = { error: responseText || 'Unknown error' };
      }
      
      console.error('Backend error:', errorData);
      return new NextResponse(
        JSON.stringify(errorData),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    let data;
    try {
      data = JSON.parse(responseText || '{}');
    } catch (e) {
      console.error('Failed to parse response JSON:', e);
      data = {};
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create material', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Using Next.js App Router dynamic route handling
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get material ID from the URL parameters or query parameters
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    let id = pathSegments[pathSegments.length - 1]; // Try to get ID from path
    
    // If ID is "api" or "materials", use query parameter as fallback
    if (id === "api" || id === "materials") {
      id = url.searchParams.get('id') || '';
    }
    
    if (!id) {
      console.error('No material ID provided');
      return new NextResponse(
        JSON.stringify({ error: 'Material ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`API route: Deleting material with ID ${id}`);
    
    const response = await fetch(`http://localhost:4000/api/materials/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Delete material response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return new NextResponse(
        JSON.stringify({ error: `Backend returned ${response.status}: ${errorText}` }),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete material', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 