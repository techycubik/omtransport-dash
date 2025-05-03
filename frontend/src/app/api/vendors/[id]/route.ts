import { NextRequest, NextResponse } from 'next/server';

// Helper function to format address from individual components
function formatAddress(data: any): string {
  const components = [];
  if (data.street) components.push(data.street);
  if (data.city) components.push(data.city);
  if (data.state) components.push(data.state);
  if (data.pincode) components.push(data.pincode);
  
  return components.length > 0 ? components.join(', ') : '';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log(`API route: Updating vendor with ID ${id}`, body);
    
    // Check if a GST number is provided and validate it's not a duplicate
    if (body.gstNo) {
      console.log('Checking for duplicate GST number:', body.gstNo);
      
      // Get all vendors to check for duplicate GST
      const checkResponse = await fetch('http://localhost:4000/api/vendors', {
        headers: { 'Accept': 'application/json' },
      });
      
      if (checkResponse.ok) {
        const existingVendors = await checkResponse.json();
        const duplicate = existingVendors.find((v: any) => 
          (v.gstNo === body.gstNo || v.gst_no === body.gstNo) && 
          v.id !== parseInt(id) && 
          v.id !== id
        );
        
        if (duplicate) {
          console.error('Duplicate GST number found:', duplicate);
          return new NextResponse(
            JSON.stringify({ error: 'A vendor with this GST number already exists' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // Process address fields to ensure address is correctly saved
    const formattedData = {
      ...body,
      // Create a combined address field if individual address components are provided
      address: body.address || formatAddress(body),
    };
    
    console.log('Sending formatted data to backend:', formattedData);
    
    const response = await fetch(`http://localhost:4000/api/vendors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    console.log('Update vendor response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      return new NextResponse(
        responseText,
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const responseData = JSON.parse(responseText);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to update vendor' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`API route: Deleting vendor with ID ${id}`);
    
    const response = await fetch(`http://localhost:4000/api/vendors/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('Delete vendor response status:', response.status);
    
    if (!response.ok) {
      // Try to parse the error as JSON, fall back to text if not valid JSON
      let errorData;
      try {
        const errorText = await response.text();
        console.error('Error response from backend:', errorText);
        
        // Try to parse as JSON
        errorData = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
      } catch (parseError) {
        // If parsing fails, use a generic error
        errorData = { error: 'Failed to delete vendor' };
      }
      
      return new NextResponse(
        JSON.stringify(errorData),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // For successful response, return a JSON confirmation even for 204
    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to delete vendor' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 