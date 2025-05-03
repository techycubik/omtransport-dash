import { Router } from 'express';
import { Request, Response } from 'express';
import { sequelize } from '../index';
import { Op } from 'sequelize';

const router = Router();

// KPI Endpoint
router.get('/kpis', (req: Request, res: Response) => {
  // Mock data
  const kpiData = {
    todaysDispatch: 145,
    pendingPurchases: 12,
    variancePct: 3.2,
    topMaterial: 'Gravel'
  };
  
  res.json(kpiData);
});

// Weekly data endpoint
router.get('/weekly', (req: Request, res: Response) => {
  // Mock weekly data
  const weeklyData = [
    { day: 'Mon', sold: 20, purchased: 18 },
    { day: 'Tue', sold: 15, purchased: 12 },
    { day: 'Wed', sold: 25, purchased: 22 },
    { day: 'Thu', sold: 22, purchased: 20 },
    { day: 'Fri', sold: 30, purchased: 28 },
    { day: 'Sat', sold: 18, purchased: 15 },
    { day: 'Sun', sold: 10, purchased: 8 }
  ];
  
  res.json(weeklyData);
});

// Delivery data endpoint
router.get('/deliveries', async (req: Request, res: Response) => {
  try {
    // Get date range from query params
    const startDate = req.query.startDate as string || new Date().toISOString().split('T')[0];
    const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
    
    // Create date objects for comparison
    // Set start date to beginning of day (00:00:00)
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    // Set end date to end of day (23:59:59)
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    
    const { PurchaseOrder, SalesOrder, Dispatch, Material, Vendor, Customer, CrusherRun } = sequelize.models;
    
    console.log(`Fetching dispatches between ${startDateTime.toISOString()} and ${endDateTime.toISOString()}`);
    
    // Get dispatches with related data for the specified date range
    const dispatches = await Dispatch.findAll({
      where: {
        dispatchDate: {
          [Op.between]: [startDateTime, endDateTime]
        }
      },
      include: [
        {
          model: SalesOrder,
          include: [
            { model: Customer }
          ]
        },
        {
          model: PurchaseOrder,
          include: [
            { model: Material },
            { model: Vendor }
          ]
        },
        { model: CrusherRun, include: [{ model: Material }] }
      ]
    });
    
    // Transform data to the format expected by the frontend
    const deliveries = dispatches.map(dispatch => {
      const dispatchData = dispatch.get({ plain: true });
      
      // Check if this is a sales order or purchase order dispatch
      const isSalesOrder = !!dispatchData.SalesOrder;
      const order = isSalesOrder ? dispatchData.SalesOrder : dispatchData.PurchaseOrder;
      const entity = isSalesOrder ? order?.Customer : order?.Vendor;
      
      // Get material info from the relationships we have
      const material = isSalesOrder 
        ? dispatchData.CrusherRun?.Material
        : (order?.Material || dispatchData.CrusherRun?.Material);
      
      return {
        id: dispatchData.id,
        type: isSalesOrder ? 'SALE' : 'PURCHASE',
        orderId: order?.id || 0,
        orderType: isSalesOrder ? 'Sales Order' : 'Purchase Order',
        entityId: entity?.id || 0,
        entityName: entity?.name || 'Unknown',
        entityAddress: entity?.address || '',
        entityContact: isSalesOrder ? entity?.contactPerson : entity?.contactPerson,
        entityPhone: isSalesOrder ? entity?.contactNumber : entity?.contactNumber,
        materialId: material?.id || 0,
        materialName: material?.name || 'Unknown',
        materialUom: material?.uom || '',
        pickupLocation: isSalesOrder ? 'Main Site' : entity?.address || '',
        dropLocation: dispatchData.destination || '',
        pickupDate: dispatchData.dispatchDate,
        dropDate: dispatchData.deliveryStatus === 'DELIVERED' ? dispatchData.updatedAt : null,
        pickupQuantity: dispatchData.quantity || 0,
        dropQuantity: dispatchData.dropQuantity || null,
        difference: dispatchData.dropQuantity 
          ? dispatchData.dropQuantity - dispatchData.quantity 
          : null,
        vehicleNo: dispatchData.vehicleNo,
        driver: dispatchData.driver || '',
        deliveryDuration: dispatchData.deliveryDuration || null,
        status: dispatchData.deliveryStatus,
        rate: order?.rate || 0,
        amount: (order?.rate || 0) * (dispatchData.quantity || 0),
        notes: dispatchData.notes || ''
      };
    });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch delivery data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Transactions data endpoint
router.get('/transactions', (req: Request, res: Response) => {
  // Mock transaction data
  const transactions = [
    {
      id: 1,
      challanNo: '1326',
      vehicleNo: 'KA.05.AN.9144',
      material: 'M.SAND',
      purchasedFrom: 'AMB TRADERS',
      pickupDate: '16-08-2023',
      pickupQty: 35.203,
      buyRate: 609.52,
      buyAmount: 21517,
      soldTo: 'NUVOCO ANJANAPURA',
      dropDate: '16-08-2023',
      dropQty: 35.735,
      sellRate: 670,
      sellAmount: 23942,
      difference: 2425.47,
      amountInclusiveGST: 26253.00
    },
    {
      id: 2,
      challanNo: '1327',
      vehicleNo: 'KA.05.AN.9036',
      material: 'M.SAND',
      purchasedFrom: 'AMB TRADERS',
      pickupDate: '22-08-2023',
      pickupQty: 35.856,
      buyRate: 609.52,
      buyAmount: 21733,
      soldTo: 'NUVOCO ANJANAPURA',
      dropDate: '22-08-2023',
      dropQty: 36.656,
      sellRate: 670,
      sellAmount: 23890,
      difference: 2156.47,
      amountInclusiveGST: 25984.00
    },
    {
      id: 3,
      challanNo: '1328',
      vehicleNo: 'KA.05.AN.9144',
      material: 'M.SAND',
      purchasedFrom: 'AMB TRADERS',
      pickupDate: '23-08-2023',
      pickupQty: 37.413,
      buyRate: 609.52,
      buyAmount: 22860,
      soldTo: 'NUVOCO ANJANAPURA',
      dropDate: '23-08-2023',
      dropQty: 37.413,
      sellRate: 670,
      sellAmount: 25067,
      difference: 2282.74,
      amountInclusiveGST: 27573.00
    }
  ];
  
  res.json(transactions);
});

export default router; 