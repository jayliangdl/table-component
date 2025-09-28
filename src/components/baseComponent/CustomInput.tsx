import React from "react";
import {Input} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import {EventName} from "../../types/editableCell";
import {columnChangeBaseHandler} from "../../service/EventService";
export interface InputConfigProps {
    // 可以根据需要添加更多配置项
}

interface CustomInputProps extends CommonCustomComponentProps{
    config: InputConfigProps;
}

const CustomInput: React.FC<CustomInputProps> = ({
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

    const [originalValue, setOriginalValue] = React.useState<any>(value);
    const [currentValue, setCurrentValue] = React.useState<any>(value);

    React.useEffect(()=>{
        setCurrentValue(value);
    },[value]);
    const handleChange = (e: any) => {
        onValueChanged(e.target.value);
    };

    const handleColumnFocus= (e:any)=>{
        const value = e.target.value;
        setOriginalValue(value);
    }

    const handleColumnBlur = (e:any)=>{  
        const value = e.target.value;  
        columnChangeBaseHandler(
        {
            eventName:`${EventName.onBlur}__${columnName}`,
            columnName:columnName,
            recordId:recordId,
            newValue:value,
            oldValue:originalValue,
            setValue:setOriginalValue,
        });
    }
    
    
    
    const ret = 
        <Input value={currentValue} disabled={disabled || readOnly} style={style} placeholder={placeholder}
                     onChange={handleChange} onBlur={handleColumnBlur} onFocus={handleColumnFocus}
                />;
        return ret;
    }
export default CustomInput;