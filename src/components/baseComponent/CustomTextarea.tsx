import React from "react";
import {Input} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";

export interface TextareaConfigProps {
    // 可以根据需要添加更多配置项
    autoSize?: boolean | { minRows?: number; maxRows?: number }; //是否自动高度，或自动高度的行数范围
}

interface CustomTextareaProps extends CommonCustomComponentProps{
    config: TextareaConfigProps;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
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
            <Input.TextArea defaultValue={defaultValue} disabled={disabled} readOnly={readOnly} style={style} placeholder={placeholder}
                    autoSize={config?.autoSize}
                    onChange={handleChange} />;
    return ret;
    }
export default CustomTextarea;