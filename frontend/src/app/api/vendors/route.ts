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

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:4000/api/vendors', {
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('GET vendors response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendors');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch vendors' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API route: Creating vendor', body);
    
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
          v.gstNo === body.gstNo || v.gst_no === body.gstNo
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
    
    const response = await fetch('http://localhost:4000/api/vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    console.log('Create vendor response status:', response.status);
    
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
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create vendor' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 