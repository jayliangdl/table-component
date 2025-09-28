import React,{useEffect} from "react";
import {DatePicker} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import { safeDayjs } from '../../utils/convert';
import {columnChangeBaseHandler} from "../../service/EventService";
import {EventName} from "../../types/editableCell";

export interface DateConfigProps {
    // 可以根据需要添加更多配置项
    format?:string; //日期格式，参考dayjs格式
}

const convertToDayjs = (value:string, defaultFormat:string, format?:string)=>{    
    const dateValue = safeDayjs(value,format?format:defaultFormat);
    return dateValue;
}

interface CustomDateNumberProps extends CommonCustomComponentProps{
    config: DateConfigProps;
}

const CustomDate: React.FC<CustomDateNumberProps> = ({
    columnName,
    recordId,
    config,
    value,
    disabled,
    readOnly,
    style,
    placeholder,
    onValueChanged,
}) => {
    const handleChange= (value:string|string[]): void=>{
        columnChangeBaseHandler(
            {
                eventName:`${EventName.onChange}__${columnName}`,
                columnName:columnName,
                recordId:recordId,
                newValue:value,
                oldValue:originalValue,
                setValue:setOriginalValue,
            }
        );
        // 在这里实现你的变化逻辑
        onValueChanged(value);
    };
    const defaultFormat = "YYYY-MM-DD";
    const [originalValue, setOriginalValue] = React.useState<any>(
        (value:string)=>{
            return convertToDayjs(value,defaultFormat,config?.format);
        }
    );
    const [currentValue, setCurrentValue] = React.useState<any>(
        (value:string)=>{
            return convertToDayjs(value,defaultFormat,config?.format);
        }
    );
    const [format,setFormat] = React.useState<string>((config?.format)?config?.format:defaultFormat);

    useEffect(()=>{
        setFormat((config?.format)?config?.format:defaultFormat);
        setCurrentValue((prev:string)=>{
            return convertToDayjs(value,defaultFormat,config?.format);
        });
    },[value, config?.format]);     
    
    const ret = <DatePicker value={currentValue} disabled={disabled} readOnly={readOnly} 
                style={style} placeholder={placeholder} format={format}
                onChange={(_date,dateString)=>handleChange(dateString)}         
                />;
    
    return ret;
    }
export default CustomDate;