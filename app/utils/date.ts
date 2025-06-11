/**
 * 日付を YYYY/MM/DD 形式でフォーマットします
 * @param dateString - 日付文字列（ISO 8601形式等）
 * @returns YYYY/MM/DD 形式の日付文字列
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};