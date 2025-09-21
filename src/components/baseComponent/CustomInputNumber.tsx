import React,{type ReactNode} from "react";
import {Input, InputNumber} from "antd";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import type { InputNumberProps } from 'antd';

export interface InputNumberConfigProps {
    // 可以根据需要添加更多配置项
    prefix?:string; //前缀
    suffix?:string; //后缀
    step?:number; //步长
    min?:number;//最小值
    max?:number;//最大值
    precision?:number;//精度
    
    formatter?: (value: number | string | null) => string; //格式化显示值
    parser?: (displayValue: string | undefined) => any; //解析输入值
}

interface CustomInputNumberProps extends CommonCustomComponentProps{
    config: InputNumberConfigProps;
}

const CustomInput: React.FC<CustomInputNumberProps> = ({
    columnName,
    config,
    defaultValue,
    disabled,
    readOnly,
    style,
    placeholder,
    onValueChanged,
}) => {
    const formatter: InputNumberProps<number>['formatter'] = (value) => {
        // 在这里实现你的格式化逻辑
        return String(value);
    };
    const addonBefore=():ReactNode=>{
        // 在这里实现你的前置元素逻辑
        return null;
    };//输入框前置元素（例如下拉框，选择正负号；例如图标等）
    const addonAfter=():ReactNode=>{
        // 在这里实现你的前置元素逻辑
        return null;
    };//输入框后置元素（例如下拉框，选择币种）
    const parser= (displayValue: string | undefined): any=>{
        // 在这里实现你的解析逻辑
        return displayValue;
    }
    const handleChange: InputNumberProps['onChange'] = (value) => {
        // 在这里实现你的变化逻辑
        onValueChanged(value);
    };
    const handleStep: InputNumberProps['onStep']= (value: number | string | null): void=>{
        // 在这里实现你的解析逻辑
        
    }; //步进时触发
    const ret = <InputNumber defaultValue={defaultValue} disabled={disabled} readOnly={readOnly} style={style} placeholder={placeholder}
            onChange={handleChange} onStep={handleStep} 
                     formatter={formatter} 
                     parser={parser}
                    addonBefore={addonBefore()}
                    addonAfter={addonAfter()}
                    prefix={config?.prefix}
                    suffix={config?.suffix}
                    step={config?.step}
                    min={config?.min}
                    max={config?.max}
                    precision={config?.precision}

                />
    
    return ret;
    }
export default CustomInput;