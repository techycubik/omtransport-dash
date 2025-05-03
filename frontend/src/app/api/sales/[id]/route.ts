import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log(`API route: Updating sales order with ID ${id}`, body);
    
    const response = await fetch(`http://localhost:4000/api/sales/${id}`, {
      method: 'PUT',
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
        items: body.items?.map((item: any) => ({
          materialId: item.materialId,
          crusherSiteId: item.crusherSiteId || undefined,
          qty: item.qty,
          rate: item.rate || 0,
          uom: item.uom
        }))
      }),
    });
    
    console.log('Update sales order response status:', response.status);
    
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
    console.error('Error updating sales order:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to update sales order' 
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
    console.log(`API route: Deleting sales order with ID ${id}`);
    
    const response = await fetch(`http://localhost:4000/api/sales/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('Delete sales order response status:', response.status);
    
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
        errorData = { error: 'Failed to delete sales order' };
      }
      
      return new NextResponse(
        JSON.stringify(errorData),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales order:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to delete sales order' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 