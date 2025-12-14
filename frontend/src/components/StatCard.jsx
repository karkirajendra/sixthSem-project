import { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color, change }) => {
  const [count, setCount] = useState(0);
  
  // Define colors based on passed color prop
  const getColors = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          iconBg: 'bg-green-100'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          iconBg: 'bg-purple-100'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          iconBg: 'bg-orange-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          iconBg: 'bg-gray-100'
        };
    }
  };
  
  const colors = getColors();

  // Animate count up effect
  useEffect(() => {
    if (value <= 0) {
      setCount(0);
      return;
    }
    
    // Get the increment value (at least 1)
    const increment = Math.max(1, Math.floor(value / 20));
    
    // Set an interval to increment the count
    let currentCount = 0;
    
    const timer = setInterval(() => {
      currentCount += increment;
      
      if (currentCount >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(currentCount);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`${colors.bg} rounded-lg p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
          <div className="flex items-baseline">
            <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
            
            {change && (
              <span className={`ml-2 text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
            )}
          </div>
        </div>
        
        <div className={`${colors.iconBg} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;