import { type DisplayConfig } from '../types/displayConfig';

/**
 * 数字格式化
 */
export const formatNumber = (value: number, config: DisplayConfig): string => {
  const {
    numberFormat = 'decimal',
    currency = '¥',
    decimalPlaces,
    thousandSeparator = true
  } = config;

  if (typeof value !== 'number' || isNaN(value)) {
    return String(value);
  }

  let formatted: string;

  switch (numberFormat) {
    case 'currency':
      formatted = thousandSeparator 
        ? value.toLocaleString('zh-CN', { 
            minimumFractionDigits: decimalPlaces ?? 2,
            maximumFractionDigits: decimalPlaces ?? 2
          })
        : value.toFixed(decimalPlaces ?? 2);
      return `${currency}${formatted}`;

    case 'percentage':
      formatted = (value * 100).toFixed(decimalPlaces ?? 1);
      return `${formatted}%`;

    case 'integer':
      formatted = thousandSeparator 
        ? Math.round(value).toLocaleString('zh-CN')
        : Math.round(value).toString();
      return formatted;

    case 'decimal':
    default:
      formatted = thousandSeparator
        ? value.toLocaleString('zh-CN', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
          })
        : decimalPlaces !== undefined 
          ? value.toFixed(decimalPlaces)
          : value.toString();
      return formatted;
  }
};

/**
 * 日期格式化
 */
export const formatDate = (value: string | number | Date, config: DisplayConfig): string => {
  const {
    dateFormat = 'date',
    datePattern
  } = config;

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return String(value);
  }

  // 自定义格式
  if (datePattern) {
    return formatDatePattern(date, datePattern);
  }

  switch (dateFormat) {
    case 'datetime':
      return date.toLocaleString('zh-CN');
    case 'time':
      return date.toLocaleTimeString('zh-CN');
    case 'relative':
      return formatRelativeTime(date);
    case 'date':
    default:
      return date.toLocaleDateString('zh-CN');
  }
};

/**
 * 布尔值格式化
 */
export const formatBoolean = (value: boolean, config: DisplayConfig): string => {
  const {
    booleanLabels = { true: '是', false: '否' }
  } = config;

  return value ? booleanLabels.true : booleanLabels.false;
};

/**
 * 自定义日期格式
 */
const formatDatePattern = (date: Date, pattern: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return pattern
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
};

/**
 * 相对时间格式化
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};