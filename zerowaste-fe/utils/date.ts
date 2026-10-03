/**
 * Formats a date string to DD-MM-YYYY format
 * @param dateString - The date string to format (ISO format or any valid date string)
 * @returns Formatted date string in DD-MM-YYYY format, or "N/A" if date is invalid/missing
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString;
  }
};

