import { fetchGETApi, fetchPOSTApi } from "../../utils/requestAPI";
import { EventService,type CallbackResult } from "../EventService";
import {EventName} from "../../types/editableCell";
import type { Id } from "../../types/id";
/**
 * actionType为"fetchData"的actionConfig配置参数定义
 * @param url 获取数据的URL
 * @param method 请求方法，GET或POST
 * @param headers 请求头
 * @param params 请求参数，支持占位符{value}，表示当前字段的值
 * @returns
 */
export interface FetchDataActionConfigProps{
    mainUrl: string; //获取数据的主URL（不需要给url的前缀，例如正式地址是Http://pd_server_url/mainurl?params=v1，则此处填入/mainurl）
    method: "GET" | "POST"; //请求方法
    headers?: Record<string, string>; //请求头
    params?: Record<string, any>; //请求参数
    bodyTemplate?: string; //请求体模板，仅在POST请求时使用，支持占位符${value}，表示当前字段的值
    //获取数据后，会抛出ON_DATA_FETCHED_{resultKey}事件，例如在"产品编号"字段输入后，产生ON_BLUR事件，
    // 按actionType/actionConfig配置向后端服务器获取产品信息，获取后，抛出ON_DATA_FETCHED_PRODUCT事件，
    // 其中PRODUCT就是这个notificationSuffix参数
    notificationSuffix:string;
}

/**
 * 在后台获取到数据后，抛出OnDataFetched事件，该事件的结构定义
 * onDataFetched事件的数据结构定义
 * @param data 获取到的数据
 * @param rowKey 触发事件的行记录ID
 * @returns
 */
export interface EventData_OnDataFetched{
  data:any;//获取到的数据
  recordId:Id;
}

  // 处理 CustomActionType.request 的具体实现
export const handleRequestAction = async (
    eventProps: FetchDataActionConfigProps, 
    recordId:Id,
    columnName: string, 
    newValue: any
  ): Promise<CallbackResult> => {
    if (!eventProps || !eventProps.mainUrl || !eventProps.method) {
      return {
        result: false,
        errorCode: 'INVALID_REQUEST_PARAMS',
        errorMessage: '请求参数无效，缺少必要的请求配置(mainUrl, method, resultKey是必配置)'
      };
    }
    
    const queryParams: { [key: string]: any } = {};
    // const resultKey = requestParams.resultKey || "";
    queryParams[columnName!] = newValue;
    try {
      let response;
      if (eventProps.method === 'POST') {
        const bodyTemplate = eventProps.bodyTemplate || "{}";
        response = await fetchPOSTApi(eventProps.mainUrl, bodyTemplate, queryParams);
      } else if (eventProps.method === 'GET') {        
        response = await fetchGETApi(eventProps.mainUrl, queryParams);
      } else {
        return {
          result: false,
          errorCode: 'UNSUPPORTED_METHOD',
          errorMessage: `不支持的请求方法: ${eventProps.method}`
        };
      }
      if (response) {
        const eventData: EventData_OnDataFetched = {
          data: response,
          recordId: recordId,
        };        
        EventService.triggerEvent<EventData_OnDataFetched>(`${EventName.onDataFetched}__${eventProps.notificationSuffix}`, eventData);
      }

      return { result: true };
    } catch (error) {
      return {
        result: false,
        errorCode: 'FETCH_DATA_ERROR',
        errorMessage: error instanceof Error ? error.message : '请求数据时发生未知错误'
      };
    }
  };