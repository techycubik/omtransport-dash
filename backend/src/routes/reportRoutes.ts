import { Router } from 'express';
import { Request, Response } from 'express';

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