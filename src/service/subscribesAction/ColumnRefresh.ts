
import type { Id } from "../../types/id";
import { EventService,type CallbackResult } from "../EventService";
export interface ColumnRefreshActionConfigProps{
    sourceField:string;//例如获取用户数据(如{data:{name:'xx', age:18}})后，需要刷新年龄字段，sourceField就是"age"
}

export const handleRefreshColumnValueAction = async (
      eventProps: ColumnRefreshActionConfigProps, 
      recordId:Id,
      columnName: string, 
      data: any,
      handleProductColumnChange:(recordId:Id,columnName:string,newValue:any)=>void,
    ): Promise<CallbackResult> => {
    // 可以根据 eventProps 中的 dataFetchedParams 配置，获取 sourceResultKey 和 sourceField    
    if (!eventProps || !eventProps.sourceField) {
      return {
        result: false,
        errorCode: 'INVALID_DATA_FETCHED_PARAMS',
        errorMessage: '请求参数无效，缺少必要的请求配置(sourceResultKey, sourceField 是必配置)'
      };
    }

    const sourceField = eventProps.sourceField;//userDataFetched_{sourceResultKey}事件携带的数据中获取的字段名
    if(!data && !data[sourceField]){                  
        return Promise.resolve({
        result:false,
        errorCode:'INVALID_EVENT_DATA',
        errorMessage:`捕获事件对象缺少${sourceField}字段，捕获对象:${JSON.stringify(data)}`
        });
    }
    handleProductColumnChange(recordId,columnName,data[sourceField]);
    console.debug(`已对记录(record:${recordId})的字段 ${columnName} 设置新值${data[sourceField]}`);
    return Promise.resolve({result:true});
  };