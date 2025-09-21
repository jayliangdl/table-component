/**
 * 本文件用于实现选项（例如Select选择框中的选项，Radio中的选项，Checkbox中的选项）加载功能
 */
import { type SelectOptionProps } from "../types/editableCell";
export interface OptionsLoadingConfig {
  type: 'static' | 'dynamic'; // 静态选项或动态加载选项
  staticOptionsConfig?: SelectOptionProps[]; // 静态选项数组，仅在type为'static'时使用
  dynamicOptionsConfig?: DynamicOptionsConfig; // 动态加载选项的配置，仅在type为'dynamic'时使用

}

export interface DynamicOptionsConfig {
  url: string; // 用于获取选项的API端点
  method?: 'GET' | 'POST'; // HTTP方法，默认为'GET'
  headers?: Record<string, string>; // 可选的HTTP头
  body?: any; // 可选的请求体，仅在method为'POST'时使用
  transformResponse?: (response: any) => SelectOptionProps[]; // 可选的响应转换函数，用于将API响应转换为SelectOptionProps数组
  labelFieldName?: string; // 用于选项标签的字段名称
  valueFieldName?: string; // 用于选项值的字段名称
}

/**
 * 加载选项
 * Options的数据源配置支持两种方式：1.静态配置 2.动态加载
 * 对于静态配置，用户直接提供SelectOptionProps数组
 * 对于动态配置，用户可以选择：
 * 1.完整的动态加载配置（OptionsLoadingConfig），需提供transformResponse方法
 * 2.简化的动态加载配置（simpleDynamicOptionsLoadingConfig），无需提供transformResponse方法，仅需指定API的url，以及返回数据中哪个字段作为label，哪个字段作为value，省去定义transformResponse的回调方法
 * 注意：
 * 1.若API返回的数据格式复杂，仍需自定义transformResponse
 * 2.若已定义transformResponse，则忽略labelFieldName和valueFieldName，优先使用transformResponse
 * @param config - 选项加载配置
 * @returns Promise，解析为SelectOptionProps数组
 */
export const loadOptions = async (config: OptionsLoadingConfig): Promise<SelectOptionProps[]> => {
    if (config.type === 'static') {
        return config.staticOptionsConfig || [];
    } else if (config.type === 'dynamic') {
        if (!config.dynamicOptionsConfig) {
            throw new Error('Dynamic options configuration is required for dynamic type');
        } 
        if(config.dynamicOptionsConfig.url.startsWith('temp:')){
            // 使用临时数据源
            const key = config.dynamicOptionsConfig.url.replace('temp:','');
            const data = await tempDataSource(key);
            const ret = Object.entries(data).map(([value,label])=>({value,label}));
            return ret;
        }
        // 使用真实API  
        const { url, method = 'GET', headers, body, transformResponse } = config.dynamicOptionsConfig;
        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };
        if (method === 'POST' && body) {
            fetchOptions.body = JSON.stringify(body);
        }
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new Error(`Failed to load options: ${response.statusText}`);
        }
        const data = await response.json();
        if (transformResponse) {
            return transformResponse(data);
        } else if(config.dynamicOptionsConfig.labelFieldName && config.dynamicOptionsConfig.valueFieldName){
            // 若用户提供了labelFieldName和valueFieldName，则使用默认的转换逻辑
            return defaultTransformResponse(data,config.dynamicOptionsConfig.labelFieldName,config.dynamicOptionsConfig.valueFieldName);
        } else {
            // 默认假设API返回的数据已经是SelectOptionProps数组
            return data as SelectOptionProps[];
        } 
    } else {
        throw new Error('Invalid options loading type');
    }
}

const defaultTransformResponse = (response: any,labelFieldName:string,valueFieldName:string): SelectOptionProps[] => {
    if(!Array.isArray(response)){
        throw new Error('API response is not an array, cannot transform to SelectOptionProps[]');
    }
    return response.map((item: any) => ({
        label: item[labelFieldName],
        value: item[valueFieldName],
    }));
}

/**
 * 以下代码是模拟的临时数据源
 * 背景：暂时没有后端服务器参与开发
 * 在实际应用中，这些数据可能来自于数据库或其他服务
 */
import { categories, brands, colors, materials, countries } from './mockData';
const tempDataSource = (key:string):Promise<Record<string,string>>=> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let data: Record<string, string> = {};
            switch (key) {
                case 'category':
                    data = categories.reduce((acc, curr) => ({ ...acc, [curr]: curr }), data);
                    break;
                case 'brand':
                    data = brands.reduce((acc, curr) => ({ ...acc, [curr]: curr }), data);
                    break;
                case 'color':
                    data = colors.reduce((acc, curr) => ({ ...acc, [curr]: curr }), data);
                    break;
                case 'material':
                    data = materials.reduce((acc, curr) => ({ ...acc, [curr]: curr }), data);
                    break;
                case 'country':
                    data = countries.reduce((acc, curr) => ({ ...acc, [curr]: curr }), data);
                    break;
                default:
                    data = {};
            }
            resolve(data);
        }, 500); // 模拟网络延迟
    });
}


export default loadOptions;