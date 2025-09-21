import React from "react";
import {DatePicker} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import { safeDayjs } from '../../utils/convert';
export interface DatetimeConfigProps {
    // 可以根据需要添加更多配置项
    format?:string; //日期格式，参考dayjs格式
}

interface CustomDatetimeNumberProps extends CommonCustomComponentProps{
    config: DatetimeConfigProps;
}

const CustomDatetime: React.FC<CustomDatetimeNumberProps> = ({
    columnName,
    config,
    defaultValue,
    disabled,
    readOnly,
    style,
    placeholder,
    onValueChanged,
}) => {
    const handleChange= (value:string|string[]): void=>{
        // 在这里实现你的变化逻辑
        onValueChanged(value);
    };
    const format = (config?.format)?config?.format:"YYYY-MM-DD HH:mm:ss";            
    const dateValue = safeDayjs(defaultValue,format);
    const ret = <DatePicker showTime defaultValue={dateValue} disabled={disabled} readOnly={readOnly} 
                style={style} placeholder={placeholder} format={format}
                onChange={(_date,dateString)=>handleChange(dateString)}             
                />;
    
    return ret;
    }
export default CustomDatetime;