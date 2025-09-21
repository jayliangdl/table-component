/**
 * Jay-Table 显示单元格展示组件
 */

import React from 'react';
import { type DisplayConfig } from '../types/displayConfig';
import { formatNumber, formatDate, formatBoolean } from '../utils/formatters';
import styles from './DisplayCell.module.css';
export interface DisplayCellProps {
  value: any;
  config: DisplayConfig;
  record?: any; // 完整的行数据，用于自定义渲染
  className?: string;
  style?: React.CSSProperties;
}

export const DisplayCell: React.FC<DisplayCellProps> = ({
  value,
  config,
  record,
  className,
  style
}) => {
  
  const {
    type,
    align = 'left',
    prefix = '',
    suffix = '',
    customRender,
    emptyText = '-',
    emptyRender,
    className: configClassName,
    style: configStyle
  } = config;

  // 处理空值
  if (value === null || value === undefined || value === '') {
    if (emptyRender) {
      return <>{emptyRender()}</>;
    }
    return (
      <span 
        className={`${styles.displayCell} ${styles[`align-${align}`]} ${configClassName} ${className}`}
        style={{ ...configStyle, ...style }}
      >
        {emptyText}
      </span>
    );
  }

  // 自定义渲染优先级最高
  if (customRender) {
    return (
      <span 
        className={`${styles.displayCell} ${styles[`align-${align}`]} ${configClassName} ${className}`}
        style={{ ...configStyle, ...style }}
      >
        {customRender(value, record)}
      </span>
    );
  }

  // 根据类型格式化值
  let formattedValue: React.ReactNode = value;

  switch (type) {
    case 'number':
      formattedValue = formatNumber(value, config);
      break;
    case 'date':
      formattedValue = formatDate(value, config);
      break;
    case 'boolean':
      formattedValue = formatBoolean(value, config);
      break;
    case 'textarea':
      formattedValue =  value;
      break;
    case 'text':
    default:
      formattedValue = String(value);
      break;
  }
  return (
    <span 
      className={`${styles.displayCell} ${styles[`align-${align}`]} ${configClassName?configClassName:""} ${className?className:""}`}
      style={{ ...configStyle, ...style }}
      title={String(value)} // 悬停显示原始值
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

export default DisplayCell;