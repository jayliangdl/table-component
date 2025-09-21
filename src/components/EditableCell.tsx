import React from 'react';
import { type DisplayConfig } from '../types/displayConfig';
import {DisplayCell} from './DisplayCell';
import { type SelectOptionProps,type EditableCellType } from '../types/editableCell';
import CustomSelect,{type SelectConfigProps} from './baseComponent/CustomSelect';
import CustomInput,{type InputConfigProps} from './baseComponent/CustomInput';
import CustomInputNumber,{type InputNumberConfigProps} from './baseComponent/CustomInputNumber';
import CustomDate, { type DateConfigProps } from './baseComponent/CustomDate';
import CustomDatetime,{type DatetimeConfigProps} from './baseComponent/CustomDatetime';
import CustomTime, { type TimeConfigProps } from './baseComponent/CustomTime';
import CustomCheckbox,{type CheckboxConfigProps} from './baseComponent/CustomCheckbox';
import CustomTextarea,{type TextareaConfigProps} from './baseComponent/CustomTextarea';
import ActionButton from './ActionButton';
import { type Id } from '../types/id';
import { type EditConfig } from '../types/editableCell';


export interface EditableCellProps {
  columnEditConfig?:EditConfig; //列编辑配置，JSON字符串格式
  columnName:string,
  recordId: Id,
  value: any;
  isEditing: boolean;
  isSaving:boolean;
  type?: EditableCellType;
  editable?:boolean; //是否可编辑
  disabled?: boolean;
  readOnly?: boolean;
  displayConfig: DisplayConfig;
  record?: any; // 完整的行数据，用于自定义渲染
  onChange?(value:any):void;
  onBlur?():void;
  onFocus?():void;
  style?: React.CSSProperties;
  placeholder?:string;  
  select?:{
    mode?:"multiple" | "tags",//注：标签形式的多选框，用户亦可自由输入，即输入框+选择框。
    open?:boolean,
    defaultOpen?:boolean,
    allowClear?:boolean,
    optionFilterProp?:string,
    options: SelectOptionProps[] | (()=>SelectOptionProps[]);
  },
  onSave: (id: Id) => Promise<void>;
  onCancel: (id: Id) => Promise<void>;
  onEdit: (id: Id) => Promise<void>;
  onDelete: (id: Id) => Promise<void>;
  onColumnValueChange: (columnName:string,updatedValue:any)=>void;
}



export const EditableCell:React.FC<EditableCellProps> = ({
    columnEditConfig,
  columnName, recordId, value, isEditing, isSaving, type="text", editable, disabled = false,readOnly = false,
  displayConfig, record, onChange, onBlur, onFocus, style, placeholder,
  select,
    onSave, onCancel, onEdit, onDelete,onColumnValueChange
})=>{ 

    React.useEffect(() => {
    console.debug(`EditableCell组件实例重新渲染，组件参数: recordId=${recordId}, columnName=${columnName}`);
  });


    /**
     * 每个字段变更后的处理思路：
     * 1. 维护当前字段值的state（currentValue），初始值来源于props.value
     * 2. 当props.value变化时，更新currentValue
     * 3. 当字段值变化时，更新currentValue，并调用onColumnValueChange，通知上层父组件（Row），更新当前行数据
     */
    const [currentValue, setCurrentValue] = React.useState<any>(value);
    React.useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    //当每个Custom*****组件的值变化时，调用此函数，更新当前值（currentValue），并通知上层父组件（onColumnValueChange）
    const handleValueChanged = (updatedValue:any)=>{
        setCurrentValue(updatedValue);
        onColumnValueChange(columnName,updatedValue);//通知上层父组件，指定更新的columName和最新的值
    }

    if((!isEditing || editable===false) && type!=="actionButton"){
        return <DisplayCell value={currentValue} config={displayConfig} record={record} style={style}  />;
    }
    /**
     * 依据不同type，进行组件入参必填校验
     */
    // switch(type){
    //     case 'select':
    //         if(select===undefined || select.options===undefined){
    //             throw Error('Select type requires options property in select prop.');
    //         }        
    // }

    if(type!=="actionButton"){
    const commonProps = {
        disabled,
        readOnly,
        style: { ...style },
        placeholder,
        onChange: (e:any)=>Promise<void>
    };
    if(isSaving){
        commonProps.disabled = true;
        commonProps.readOnly = true;
    }else{
        commonProps.disabled = disabled;
        commonProps.readOnly = readOnly;
    }

    switch(type){
        case 'text':{
            const inputConfig: InputConfigProps = columnEditConfig as InputConfigProps;
            const ret = (<CustomInput columnName={columnName}
                {...commonProps}                
                defaultValue={currentValue}
                config={inputConfig}
                onValueChanged={handleValueChanged}
                />);
            return ret;
        }
        case 'number':{
            const inputNumberConfig: InputNumberConfigProps = columnEditConfig as InputNumberConfigProps;
            return (<CustomInputNumber columnName={columnName}
                    {...commonProps}                
                    defaultValue={currentValue}
                    config={inputNumberConfig}
                    onValueChanged={handleValueChanged}
                    />);
        }
        case 'date':{
            const dateConfig:DateConfigProps = columnEditConfig as DateConfigProps;
            const ret = (<CustomDate columnName={columnName}
                {...commonProps}                
                defaultValue={currentValue}
                onValueChanged={handleValueChanged}
                config={dateConfig}
                />);
            return ret;
        }
        case 'time':{
            const timeConfig:TimeConfigProps = columnEditConfig as TimeConfigProps;
            const ret = (<CustomTime columnName={columnName}
                {...commonProps}            
                onValueChanged={handleValueChanged}    
                defaultValue={currentValue}
                config={timeConfig}
                />);
            return ret;         
        }      
        case 'datetime':{
            const datetimeConfig:DatetimeConfigProps = columnEditConfig as DatetimeConfigProps;
            const ret = (<CustomDatetime columnName={columnName}
                {...commonProps}              
                onValueChanged={handleValueChanged}  
                defaultValue={currentValue}
                config={datetimeConfig}
                />);
            return ret;
        }
        case 'boolean':{
            const checkboxConfig:CheckboxConfigProps = columnEditConfig as CheckboxConfigProps;
            const ret = (
                <CustomCheckbox 
                    columnName={columnName} 
                    {...commonProps} 
                    defaultValue={currentValue} 
                    config={checkboxConfig}
                    onValueChanged={handleValueChanged}
                />)
            return ret;            
        }
        case 'select':{
            // const isMultiple = select?.mode === 'multiple' || select?.mode === 'tags';//Jay-TODO: 这里需要进一步确认
            //const selectValue = isMultiple?Array.isArray(value)?value:value?[value]:[]:value??undefined;//Jay-TODO: 这里需要进一步确认
            const selectConfig:SelectConfigProps = columnEditConfig as SelectConfigProps;
            const ret = (<CustomSelect columnName={columnName}
                {...commonProps}
                config={selectConfig}
                defaultValue={currentValue}
                onValueChanged={handleValueChanged}
                />);
            return ret;
        }
        case 'textarea':{            
            const textareaConfig:TextareaConfigProps = columnEditConfig as TextareaConfigProps;
            const ret = (<CustomTextarea columnName={columnName}
                {...commonProps}                
                defaultValue={currentValue} 
                onValueChanged={handleValueChanged}
                config={textareaConfig}
                />);
            return ret; 
        }
        default:
            throw Error(`Unsupported editable cell type: ${type}`);
    }
    }
    if(type==="actionButton"){
        const ret = (<ActionButton
            id={recordId}
            onSave={onSave}
            onDelete={onDelete}
            onEdit={onEdit}
            onCancel={onCancel}
            isEditing={isEditing}
        />)
        return ret;     
    } 
}

// export default React.memo(EditableCell);

/**
 * 自定义比较函数，决定是否重新渲染组件
 * 仅当以下props变化时，才重新渲染组件：
 * - value
 * - isEditing
 * - isSaving
 * 其他props变化时，不重新渲染组件
 * Jay-TODO:未来若增加其他属性，可能需要考虑调整此条件
 */
export default React.memo(EditableCell, (prevProps, nextProps) => {
    
   return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.isSaving === nextProps.isSaving
  );
});