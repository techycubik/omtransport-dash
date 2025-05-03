import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log(`API route: Updating customer with ID ${id}`, body);
    
    // Check if a GST number is provided and validate it's not a duplicate
    if (body.gstNo) {
      console.log('Checking for duplicate GST number:', body.gstNo);
      
      // Get all customers to check for duplicate GST
      const checkResponse = await fetch('http://localhost:4000/api/customers', {
        headers: { 'Accept': 'application/json' },
      });
      
      if (checkResponse.ok) {
        const existingCustomers = await checkResponse.json();
        const duplicate = existingCustomers.find((c: any) => 
          (c.gstNo === body.gstNo || c.gst_no === body.gstNo) && 
          c.id !== parseInt(id) && 
          c.id !== id
        );
        
        if (duplicate) {
          console.error('Duplicate GST number found:', duplicate);
          return new NextResponse(
            JSON.stringify({ error: 'A customer with this GST number already exists' }),
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
    
    const response = await fetch(`http://localhost:4000/api/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    console.log('Update customer response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
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
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response JSON:', e);
      data = {};
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update customer', details: String(error) }),
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
    
    console.log(`API route: Deleting customer with ID ${id}`);
    
    const response = await fetch(`http://localhost:4000/api/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Delete customer response status:', response.status);
    
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
      JSON.stringify({ error: 'Failed to delete customer', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to format address from components
function formatAddress(data: any): string {
  const components = [];
  
  if (data.street) components.push(data.street);
  if (data.city) components.push(data.city);
  if (data.state) components.push(data.state);
  if (data.pincode) components.push(data.pincode);
  
  return components.join(', ');
} 