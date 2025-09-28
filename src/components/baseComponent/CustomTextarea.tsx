import React,{useEffect} from "react";
import {Input} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import {EventName} from "../../types/editableCell";
import {columnChangeBaseHandler} from "../../service/EventService";
export interface TextareaConfigProps {
    // 可以根据需要添加更多配置项
    autoSize?: boolean | { minRows?: number; maxRows?: number }; //是否自动高度，或自动高度的行数范围
}

interface CustomTextareaProps extends CommonCustomComponentProps{
    config: TextareaConfigProps;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
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
    const handleChange = (e: any) => {
        onValueChanged(e.target.value);
    };
    const [originalValue, setOriginalValue] = React.useState<any>(value);
    const [currentValue, setCurrentValue] = React.useState<any>(value);

    useEffect(()=>{
        setCurrentValue(value);
    },[value]);

    const handleColumnFocus = (e:any)=>{  
        const value = e.target.value;  
        setOriginalValue(value);
    }
    
    const handleColumnBlur = (e:any)=>{    
        const updatedValue = e.target.value;
        columnChangeBaseHandler(
        {
            eventName:`${EventName.onBlur}__${columnName}`,
            columnName:columnName,
            recordId:recordId,
            newValue:updatedValue,
            oldValue:originalValue,
            setValue:setOriginalValue,
        });
    };
    const ret = 
            <Input.TextArea value={currentValue} disabled={disabled} readOnly={readOnly} style={style} placeholder={placeholder}
                    autoSize={config?.autoSize}
                    onChange={handleChange} onFocus={handleColumnFocus}
                    onBlur={handleColumnBlur}/>;
    return ret;
    }
export default CustomTextarea;