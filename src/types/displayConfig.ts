import type { ReactNode } from 'react';

export type TextAlign = 'left' | 'center' | 'right';
export type NumberFormat = 'currency' | 'percentage' | 'decimal' | 'integer';
export type DateFormat = 'date' | 'datetime' | 'time' | 'relative';

/**
 * Jay-Table 显示配置接口，定义各种数据类型的显示配置
 */
export interface DisplayConfig {
  // 基础配置
  type: 'text' | 'number' | 'date'|'datetime'|'time' | 'boolean' | 'custom'|'textarea'|'actionButton'; // 数据类型，默认 text
  align?: TextAlign;
  prefix?: string;//显示时前缀符号，例如表示金额前添加"￥"
  suffix?: string;//显示时后缀符号
  
  // 数字格式化
  numberFormat?: NumberFormat;
  currency?: string; // 货币符号，默认 ¥
  decimalPlaces?: number;// 小数位数
  thousandSeparator?: boolean;// 是否使用千分位分隔符，默认 false
  
  // 日期格式化
  dateFormat?: DateFormat;
  datePattern?: string; // 自定义日期格式，如 'YYYY-MM-DD'
  
  // 布尔值显示(布尔值转换成什么文本展示)
  booleanLabels?: {
    true: string;
    false: string;
  };
  
  // 自定义渲染
  customRender?: (value: any, record?: any) => ReactNode;
  
  // 样式配置
  className?: string;
  style?: React.CSSProperties;
  
  // 空值处理
  emptyText?: string;
  emptyRender?: () => ReactNode;
}