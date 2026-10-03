import React from 'react';

export interface FinancialTokenProps {
  amount: number | null | undefined;
  percentage?: number | string | null;
  currency?: string;
  isNegative?: boolean;
  prefix?: string;
  className?: string;
  amountClassName?: string;
  currencyClassName?: string;
  percentClassName?: string;
  showCurrency?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Enterprise Financial Token Component
 * Guarantees zero text wrapping between number and currency symbol (ج.م),
 * attaches minus signs firmly to values without disconnection,
 * and maintains strict LTR bidirectional isolation so percentages
 * format cleanly as: [Amount] ج.م ([Percentage]%)
 */
export const FinancialToken: React.FC<FinancialTokenProps> = ({
  amount,
  percentage,
  currency = 'ج.م',
  isNegative = false,
  prefix,
  className = '',
  amountClassName = '',
  currencyClassName = '',
  percentClassName = '',
  showCurrency = true,
  size = 'md',
}) => {
  const numericVal = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const shouldBeNegative = isNegative || numericVal < 0;
  const absVal = Math.abs(numericVal);
  const formattedAmount = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const sizeClasses = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-base font-bold',
    xl: 'text-xl font-black',
    '2xl': 'text-2xl font-black',
  }[size];

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-1 whitespace-nowrap tabular-nums leading-none select-all ${sizeClasses} ${className}`}
    >
      {prefix && <span className="font-bold opacity-80">{prefix}</span>}
      <span className={`font-bold ${shouldBeNegative ? 'text-red-500 dark:text-red-400' : ''} ${amountClassName}`}>
        {shouldBeNegative ? `-${formattedAmount}` : formattedAmount}
      </span>
      {showCurrency && (
        <span className={`text-[10.5px] sm:text-xs font-normal text-[#5C665E] dark:text-[#8FA392] ${currencyClassName}`}>
          {currency}
        </span>
      )}
      {percentage !== undefined && percentage !== null && (
        <span className={`text-[10px] sm:text-xs font-medium text-[#5C665E] dark:text-[#8FA392] opacity-90 ${percentClassName}`}>
          ({percentage}%)
        </span>
      )}
    </span>
  );
};
