import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  maps_link?: string;
  fullAddress?: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  defaultValue?: string;
}

export default function AddressAutocomplete({ onAddressSelect, defaultValue = '' }: AddressAutocompleteProps) {
  const [value, setValue] = useState(defaultValue);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
  };
  
  const handleManualAddress = () => {
    if (!value.trim()) return;
    
    // Simple parsing for demonstration purposes
    const addressData: AddressData = {
      fullAddress: value,
      // Let the user edit the specific fields manually
    };
    
    onAddressSelect(addressData);
  };
  
  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleManualAddress}
        placeholder="Enter a full address"
        className="w-full p-3 text-lg bg-white text-gray-800 border-gray-300 placeholder-gray-400"
      />
      <p className="text-xs text-gray-600">
        Enter an address above, then edit the fields below as needed
      </p>
    </div>
  );
} 