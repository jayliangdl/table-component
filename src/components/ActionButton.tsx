import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { type ButtonLabels } from '../types/i18n';
import {type Id} from '../types/id';

export interface ActionButtonProps {
    id:Id;
    isEditing?:boolean;
    onEdit(id:Id):Promise<void>;
    onSave(id:Id):Promise<void>;
    onCancel(id:Id):Promise<void>;
    onDelete(id:Id):Promise<void>;
    disabled?:boolean;    
    customLabels?: Partial<ButtonLabels>;//允许自定义按钮文本
    customerButtonStyles?: React.CSSProperties;//允许自定义按钮样式
}

export const ActionButton:React.FC<ActionButtonProps> = ({
    id, isEditing, onEdit, onSave, onCancel, onDelete, disabled = false,
    customLabels, customerButtonStyles
})=>{
    const { t } = useLanguage();
    const stringId = String(id);
    const labels:ButtonLabels = {
        edit: customLabels?.edit || t('edit'),
        save: customLabels?.save || t('save'),
        cancel: customLabels?.cancel || t('cancel'),
        saving: customLabels?.saving || t('saving'),
        delete: customLabels?.delete || t('delete'),
    };

    const [saving, setSaving] = React.useState(false);
    const buttonStyle: React.CSSProperties = {
        margin: '0 2px', 
        padding: '0px 8px 0px 0px', 
        color: '#2196F3',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        transition: 'all 1s ease',
        cursor: 'pointer',
        ...customerButtonStyles
    };

    if(isEditing){
        return (
            <div>
                <button style={{...buttonStyle}} onClick={()=>onSave(stringId)} disabled={saving || disabled}>
                    {saving ? labels.saving : labels.save}
                </button>
                <button style={{...buttonStyle}} onClick={()=>onCancel(stringId)} disabled={saving || disabled}>
                    {labels.cancel}
                </button>
            </div>
        );
    }else{
        return (
            <div>
                <button style={{...buttonStyle}} onClick={()=>onEdit(stringId)} disabled={disabled}>
                    {labels.edit}
                </button>
                <button style={{...buttonStyle}} onClick={()=>onDelete(stringId)} disabled={disabled}>
                    {labels.delete}
                </button>
            </div>
        );
    }
}

export default ActionButton;
