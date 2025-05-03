import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching customers from backend');
    const response = await fetch('http://localhost:4000/api/customers', {
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
    console.log('Customers from backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch customers from backend', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API route: Creating customer', body);
    
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
          c.gstNo === body.gstNo || c.gst_no === body.gstNo
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
    
    const response = await fetch('http://localhost:4000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    console.log('Create customer response status:', response.status);
    
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
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create customer', details: String(error) }),
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