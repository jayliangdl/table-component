export type Language = 'zh'|'en';
export interface ButtonLabels {
    edit?: string;
    save?: string;
    cancel?: string;
    delete?: string;
    saving?: string;
    group_GroupByColumns?:string;  
    group_AddMore?:string; 
    group_GroupBy?:string;
    group_asc?:string;
    group_desc?:string;
    group_submit?:string;    
}

export interface I18nConfig{
    zh: ButtonLabels;
    en: ButtonLabels;
}

export const defaultI18nConfig:I18nConfig = {
    zh: {
        edit: '编辑',
        save: '保存',
        cancel: '取消',
        delete: '删除',
        saving: '保存中...',
        group_GroupByColumns: '分组',
        group_AddMore: '添加分组',
        group_GroupBy: '分组配置',
        group_asc: '升序',
        group_desc: '降序',
        group_submit: '确定',
    },
    en: {
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        saving: 'Saving...',
        group_GroupByColumns: 'Group',
        group_AddMore: 'Add More',
        group_GroupBy: 'Group By',
        group_asc: 'Ascending',
        group_desc: 'Descending',
        group_submit: 'Submit',
    }
};