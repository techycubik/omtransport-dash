'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ApiTest() {
  const [customersResponse, setCustomersResponse] = useState<string>('Not tested');
  const [materialsResponse, setMaterialsResponse] = useState<string>('Not tested');
  const [directFetchResponse, setDirectFetchResponse] = useState<string>('Not tested');
  
  const testCustomersApi = async () => {
    setCustomersResponse('Testing...');
    try {
      const response = await fetch('https://omtransport-dash.onrender.com/api/customers', {
        credentials: 'include'
      });
      const data = await response.json();
      setCustomersResponse(`Success! Found ${data.length} customers. Data: ${JSON.stringify(data)}`);
    } catch (error) {
      setCustomersResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const testMaterialsApi = async () => {
    setMaterialsResponse('Testing...');
    try {
      const response = await fetch('https://omtransport-dash.onrender.com/api/materials', {
        credentials: 'include'
      });
      const data = await response.json();
      setMaterialsResponse(`Success! Found ${data.length} materials. Data: ${JSON.stringify(data)}`);
    } catch (error) {
      setMaterialsResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testDirectFetch = async () => {
    setDirectFetchResponse('Testing...');
    try {
      // Use the API utility from lib/api.ts
      const response = await fetch('/api/customers');
      const data = await response.json();
      setDirectFetchResponse(`Success via Next.js API route! Found ${data.length} customers.`);
    } catch (error) {
      setDirectFetchResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">API Connection Test</h1>
      
      <div className="space-y-2">
        <h2 className="font-semibold">Test Direct API Call to Customers:</h2>
        <Button onClick={testCustomersApi} variant="primary">Test Customers API</Button>
        <div className="mt-2 p-3 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{customersResponse}</pre>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="font-semibold">Test Direct API Call to Materials:</h2>
        <Button onClick={testMaterialsApi} variant="primary">Test Materials API</Button>
        <div className="mt-2 p-3 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{materialsResponse}</pre>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="font-semibold">Test Next.js API Route:</h2>
        <Button onClick={testDirectFetch} variant="primary">Test Next.js API Route</Button>
        <div className="mt-2 p-3 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{directFetchResponse}</pre>
        </div>
      </div>
    </div>
  );
} 