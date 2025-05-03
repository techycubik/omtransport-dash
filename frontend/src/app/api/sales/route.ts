import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:4000/api/sales', {
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('GET sales response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sales orders');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch sales orders' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API route: Creating sales order', body);
    
    // Format and validate the data
    const response = await fetch('http://localhost:4000/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        customerId: body.customerId,
        vehicleNo: body.vehicleNo || undefined,
        challanNo: body.challanNo || undefined,
        address: body.address || undefined,
        orderDate: body.orderDate,
        items: body.items.map((item: any) => ({
          materialId: item.materialId,
          crusherSiteId: item.crusherSiteId || undefined,
          qty: item.qty,
          rate: item.rate || 0,
          uom: item.uom
        }))
      }),
    });
    
    console.log('Create sales order response status:', response.status);
    
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
    console.error('Error creating sales order:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create sales order' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 