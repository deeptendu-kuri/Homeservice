import React from 'react';

interface DurationOption {
  duration: number;
  price: number;
  label: string;
}

interface DurationSelectorProps {
  options: DurationOption[];
  selected: number;
  onSelect: (duration: number) => void;
  currency?: string;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  options,
  selected,
  onSelect,
  currency = 'INR'
}) => {
  const formatPrice = (price: number) => {
    if (currency === 'INR') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  // If no options provided, don't render
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => {
        const isSelected = selected === option.duration;

        return (
          <button
            key={option.duration}
            onClick={() => onSelect(option.duration)}
            className={`
              flex-shrink-0 flex flex-col items-center py-3 px-5 rounded-xl transition-all
              ${isSelected
                ? 'bg-[#8B9B7C] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#8B9B7C]'
              }
            `}
          >
            <span className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
              {option.label || `${option.duration} min`}
            </span>
            <span className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
              {formatPrice(option.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DurationSelector;
