import React, { useEffect } from "react";
import {Checkbox} from "antd";
import { type OptionsLoadingConfig,loadOptions } from "../../utils/optionsLoading";
import { type CommonCustomComponentProps } from "../../types/editableCell";
import {EventName} from "../../types/editableCell";
import {columnChangeBaseHandler} from "../../service/EventService";
export interface CheckboxConfigProps {
    type:"single"|"group"; //单选框类型，单选框组或单个checkbox
    label?:string; //单个checkbox的标签
    optionsConfig: OptionsLoadingConfig;
}


interface CustomCheckboxProps extends CommonCustomComponentProps{
    config: CheckboxConfigProps;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
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
    const [checked,setChecked] = React.useState(!!value);
    useEffect(() => {
        const { optionsConfig } = config;
        if(!optionsConfig || config.type!=="group"){
            return;
        }
        const fetchOptions = async () => {
            const options = await loadOptions(optionsConfig);
            setOptions(options);
        }
        fetchOptions();
    }, [config]);
    
    const [originalValue, setOriginalValue] = React.useState<any>(value);
    const handleChange = (checkValue:any) => {
        const updatedChecked = checkValue?.target?.checked;
        setChecked(updatedChecked);

        /**
         * 发送值变更event
         */
        columnChangeBaseHandler(
            {
                eventName:`${EventName.onBlur}__${columnName}`,
                columnName:columnName,
                recordId:recordId,
                newValue:checkValue,
                oldValue:originalValue,
                setValue:setOriginalValue,
            }
        );
        // if(originalValue!==undefined && originalValue!==checkValue){      
        //     EventService.triggerEvent<EventData_OnBlur>(`${EventName.onBlur}_${recordId}`,
        //         {
        //             columnName:columnName,
        //             recordId:recordId,
        //             newValue:checkValue,
        //             oldValue:originalValue
        //         }
        //     );
        // };
        // setOriginalValue(originalValue);

        // 在这里实现更多客制化逻辑
        onValueChanged(updatedChecked);


    };

    const { optionsConfig } = config;
    if(config.type==="group" && optionsConfig){
        return (<Checkbox.Group 
                options={options} 
                defaultValue={Array.isArray(value)?value:[]}
                disabled={disabled || readOnly}
                onChange={handleChange}  
                style={style}
                />);
    }else{
        return (<Checkbox 
                    // checked={!!defaultValue}
                    checked={checked}
                    // disabled={disabled || readOnly}
                    onChange={handleChange}
                    style={style}
                    >{config?.label}</Checkbox>);
        }
    }
export default CustomCheckbox;