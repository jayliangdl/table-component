import React from "react";
import {TimePicker} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import { safeDayjs } from '../../utils/convert';
export interface TimeConfigProps {
    // 可以根据需要添加更多配置项
    format?:string; //日期格式，参考dayjs格式
}

interface CustomTimeNumberProps extends CommonCustomComponentProps{
    config: TimeConfigProps;
}

const CustomTime: React.FC<CustomTimeNumberProps> = ({
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
    const format = (config?.format)?config?.format:"HH:mm:ss";            
    const timeValue = safeDayjs(defaultValue,format);
    const ret = <TimePicker defaultValue={timeValue} disabled={disabled} readOnly={readOnly} 
                style={style} placeholder={placeholder} format={format}
                onChange={(_date,dateString)=>handleChange(dateString)}             
                />;
    
    return ret;
    }
export default CustomTime;