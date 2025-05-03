import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
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