import React from "react";
import {Input} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";

export interface InputConfigProps {
    // 可以根据需要添加更多配置项
}

interface CustomInputProps extends CommonCustomComponentProps{
    config: InputConfigProps;
}

const CustomInput: React.FC<CustomInputProps> = ({
    columnName,
    config,
    defaultValue,
    disabled,
    readOnly,
    style,
    placeholder,
    onValueChanged,
}) => {
    const handleChange = (e: any) => {
        onValueChanged(e.target.value);
    };
    const ret = 
        <Input defaultValue={defaultValue} disabled={disabled || readOnly} style={style} placeholder={placeholder}
                     onChange={handleChange}
                />;
    return ret;
    }
export default CustomInput;