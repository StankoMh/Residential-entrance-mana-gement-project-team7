// Utility функции за форматиране на дати в български формат с 24-часова система

export const formatDate = (date: string | Date, options?: {
  includeTime?: boolean;
  shortMonth?: boolean;
  includeYear?: boolean;
}): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const baseOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: options?.shortMonth ? 'short' : 'long',
    ...(options?.includeYear !== false && { year: 'numeric' }),
  };
  
  if (options?.includeTime) {
    baseOptions.hour = '2-digit';
    baseOptions.minute = '2-digit';
    baseOptions.hour12 = false; // 24-часов формат
  }
  
  return dateObj.toLocaleString('bg-BG', baseOptions);
};

export const formatShortDate = (date: string | Date): string => {
  return formatDate(date, { shortMonth: true, includeYear: false });
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, { includeTime: true });
};

export const formatShortDateTime = (date: string | Date): string => {
  return formatDate(date, { includeTime: true, shortMonth: true });
};
