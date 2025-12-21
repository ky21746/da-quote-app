import React from 'react';
import { 
  Plane, 
  Hotel, 
  Car, 
  MapPin, 
  Plus, 
  Truck, 
  Trees 
} from 'lucide-react';

interface IconProps {
  size?: number;
  className?: string;
}

export function getCategoryIcon(
  category: string, 
  size: number = 18
): React.ReactElement | null {
  const iconProps: IconProps = { 
    size, 
    className: "text-brand-dark" 
  };
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('aviation') || categoryLower.includes('arrival')) {
    return <Plane {...iconProps} />;
  }
  
  if (categoryLower.includes('lodging') || categoryLower.includes('hotel')) {
    return <Hotel {...iconProps} />;
  }
  
  if (categoryLower.includes('transport') || categoryLower.includes('vehicle')) {
    return <Car {...iconProps} />;
  }
  
  if (categoryLower.includes('activit')) {
    return <MapPin {...iconProps} />;
  }
  
  if (categoryLower.includes('extra')) {
    return <Plus {...iconProps} />;
  }
  
  if (categoryLower.includes('logistic')) {
    return <Truck {...iconProps} />;
  }
  
  if (categoryLower.includes('park')) {
    return <Trees {...iconProps} />;
  }
  
  return null;
}


