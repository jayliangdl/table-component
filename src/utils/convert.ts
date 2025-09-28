import {type SelectOptionProps} from '../types/editableCell';
import dayjs, { type Dayjs } from 'dayjs';

/**
 * 转换为Ant Design Select组件可用的options格式
 * @param options - 支持数组(类型为本项目自定义的SelectOptionProps[])或返回数组的函数(返回类型也是SelectOptionProps[])
 * @returns 
 */
export const convertToAntdOptions = (
    options: SelectOptionProps[] | (()=>SelectOptionProps[])
):Array<{label:string;value:any}>=>{
    const opts = typeof options ==='function'? options() : options;
    return opts.map(opt=>({label:opt.label,value:opt.value}));
}

export const convertToCheckboxLabel = (
    checked: boolean,
    label?: string | ((checked: boolean) => string),
    ): string => {
        if(label===undefined){
            return '';
        }else{
            return typeof label === 'function' ? label(checked) : label;
        }
}


/**
 * 安全地将值转换为 dayjs 对象
 */
export const safeDayjs = (value: any,format:string): Dayjs | null => {
  if (!value) return null;
  
  try {
    const date = dayjs(value,format);
    if(!date.isValid()){
        console.error('Invalid date format:', value);
    }
    return date.isValid() ? date : null;
  } catch (error) {
    console.warn('Invalid date value:', value);
    return null;
  }
};

/**
 * 格式化日期为字符串
 */
export const formatDateValue = (value: any, format = 'YYYY-MM-DD'): string => {
  const date = safeDayjs(value,format);
  return date ? date.format(format) : '';
};

/**
 * 格式化时间为字符串
 */
export const formatTimeValue = (value: any, format = 'HH:mm:ss'): string => {
  const date = safeDayjs(value,format);
  return date ? date.format(format) : '';
};

/**
 * 格式化日期时间为字符串
 */
export const formatDateTimeValue = (value: any, format = 'HH:mm:ss HH:mm:ss'): string => {
  const date = safeDayjs(value,format);
  return date ? date.format(format) : '';
};


/**
 * 传入一个宽度或高度值（可以是number类型；也可以是类似"123px"字符串型，自动转为123），返回对应的数字像素值
 * 若wOrH传入undefined，则返回默认宽度
 * @param wOrH number | string | undefined
 * @param defaultValue 若wOrH传入undefined时，返回的默认值
 * @returns 
 */
export const toPx = (wOrH: number | string | undefined,defaultValue:number): number => {
    const v = wOrH === undefined ? defaultValue
        : typeof wOrH === "number" ? wOrH
            : typeof wOrH === "string" && wOrH.endsWith("px") ? parseInt(wOrH, 10) : defaultValue;
    return v;
}
