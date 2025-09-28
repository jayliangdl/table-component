import React, { useEffect } from "react";
import {Select} from "antd";
import { type OptionsLoadingConfig,loadOptions } from "../../utils/optionsLoading";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import {EventName} from "../../types/editableCell";
import {columnChangeBaseHandler} from "../../service/EventService";
export interface SelectConfigProps {
    optionsConfig: OptionsLoadingConfig;
    allowClear?:boolean;
    optionFilterProp?:string; //是否可对下拉选项进行搜索。搜索时过滤的属性，默认是label
    mode?:"multiple" | "tags",//注：标签形式的多选框，用户亦可自由输入，即输入框+选择框。
}

interface CustomSelectProps extends CommonCustomComponentProps{
    config: SelectConfigProps;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
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
    const [options, setOptions] = React.useState<{ label: string; value: any }[]>([]);
    useEffect(() => {
        const fetchOptions = async () => {
            const options = await loadOptions(config?.optionsConfig);
            setOptions(options);
        }
        fetchOptions();
    }, [config]);
    const handleChange = (value: any) => {
        onValueChanged(value);
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
            eventName:`${EventName.onChange}__${columnName}`,
            columnName:columnName,
            recordId:recordId,
            newValue:updatedValue,
            oldValue:originalValue,
            setValue:setOriginalValue,
        });
    };

    return (<Select value={currentValue} disabled={disabled || readOnly} style={style} placeholder={placeholder}
                   allowClear={config?.allowClear}
                     options={options}
                     showSearch={config?.optionFilterProp!==undefined}
                     optionFilterProp={config?.optionFilterProp}
                    mode={config?.mode}
                    onChange={handleChange}
                    onFocus={handleColumnFocus}
                    onBlur={handleColumnBlur}
                />);
    }
export default CustomSelect;