'use client';

import AppShell from '@/components/AppShell';
import ApiTest from '../api-test';

export default function DebugPage() {
  return (
    <AppShell pageTitle="API Debug">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Debug Tools</h1>
        <p className="mt-2 text-gray-600">
          Use the tools below to test API connectivity and diagnose issues.
        </p>
      </div>
      
      <ApiTest />
    </AppShell>
  );
} 