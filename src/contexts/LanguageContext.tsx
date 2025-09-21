import {type Language,type I18nConfig,defaultI18nConfig} from '../types/i18n';
import React, { useState, useContext } from 'react';    
interface LangContextType {
    language: Language;
    setLanguage(lang: Language): void;
    i18nConfig: I18nConfig;
    setI18nConfig(config: I18nConfig): void;
    t(key: keyof I18nConfig['zh']): string;
}

const LanguageContext = React.createContext<LangContextType | undefined>(undefined);
interface LanguageProviderProps {
    children: React.ReactNode;
    defaultLanguage?: Language;
    customI18nConfig?: Partial<I18nConfig>;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
    children,
    defaultLanguage = 'zh',
    customI18nConfig = {}
})=>{
    const [language, setLanguage] = useState<Language>(defaultLanguage);
    const [i18nConfig, setI18nConfig] = useState<I18nConfig>({
        ...defaultI18nConfig,
        ...customI18nConfig
    });
    const t = (key: keyof I18nConfig['zh']): string=>{
        return i18nConfig[language][key] || key;
    };
    return (
        <LanguageContext.Provider value={{
            language, 
            setLanguage, 
            i18nConfig, 
            setI18nConfig, 
            t
            }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = (): LangContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }

    return context;
}