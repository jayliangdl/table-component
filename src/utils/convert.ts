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

/**
 * 调整颜色明暗度
 * @param color 十六进制颜色值，可以带#或不带，如"e8d2ffff"、"#e8d2ff"
 * @param amount 调整程度，正数表示加深，负数表示变浅，建议范围在-1到1之间
 * @returns 调整后的十六进制颜色
 * // 示例用法
 * console.log(adjustColorLightness("e8d2ffff", 0.4)); // 浅紫色加深
 * console.log(adjustColorLightness("#ffcccc", -0.3)); // 浅红色变浅
 * console.log(adjustColorLightness("aaffaa", 0.6)); // 浅绿色加深更多
 */
export const adjustColorLightness = (color: string, amount: number = 0): string => {
    // 处理输入格式，移除#并确保是6或8位
    let hex = color.replace(/^#/, '');
    
    // 处理8位带alpha通道的颜色，提取RGB部分
    if (hex.length === 8) {
        hex = hex.substring(0, 6);
    }
    
    // 验证输入
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        throw new Error('无效的颜色格式，请使用6位或8位十六进制颜色');
    }
    
    // 限制调整范围在-1到1之间
    amount = Math.max(-1, Math.min(1, amount));
    
    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // RGB转HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number = 0;
    let s: number;
    let v: number = max;
    
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max !== min) {
        switch (max) {
            case r: 
                h = (g - b) / d + (g < b ? 6 : 0); 
                break;
            case g: 
                h = (b - r) / d + 2; 
                break;
            case b: 
                h = (r - g) / d + 4; 
                break;
        }
        h /= 6;
    }
    
    // 调整明度（V值）
    // 正数amount降低明度（加深），负数amount增加明度（变浅）
    if (amount > 0) {
        // 加深颜色
        v = Math.max(0, v * (1 - amount));
    } else {
        // 变浅颜色
        v = Math.min(1, v * (1 + Math.abs(amount)));
    }
    
    // HSV转RGB
    let r2: number, g2: number, b2: number;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: 
            r2 = v; 
            g2 = t; 
            b2 = p; 
            break;
        case 1: 
            r2 = q; 
            g2 = v; 
            b2 = p; 
            break;
        case 2: 
            r2 = p; 
            g2 = v; 
            b2 = t; 
            break;
        case 3: 
            r2 = p; 
            g2 = q; 
            b2 = v; 
            break;
        case 4: 
            r2 = t; 
            g2 = p; 
            b2 = v; 
            break;
        case 5: 
            r2 = v; 
            g2 = p; 
            b2 = q; 
            break;
        default:
            r2 = 0;
            g2 = 0;
            b2 = 0;
    }
    
    // 转换为十六进制并返回
    const toHex = (x: number): string => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

