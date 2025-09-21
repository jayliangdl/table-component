export type Language = 'zh'|'en';
export interface ButtonLabels {
    edit?: string;
    save?: string;
    cancel?: string;
    delete?: string;
    saving?: string;
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
        saving: '保存中...'
    },
    en: {
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        saving: 'Saving...'
    }
};