export const truncateToTwoDecimals = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0.00';
  const num = Number(value);
  if (isNaN(num)) return '0.00';
  
  const str = num.toFixed(10);
  const parts = str.split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  
  return `${intPart}.${decPart.substring(0, 2)}`;
};
