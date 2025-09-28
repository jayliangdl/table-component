import type { ColumnConfig } from "../types/editableCell";
import { type Id } from "../types/id";
import { ActionType } from "../types/editableCell";
import {
  handleRequestAction,
  type FetchDataActionConfigProps,
} from "./subscribesAction/DataFetch";
import {
  handleRefreshColumnValueAction,
  type ColumnRefreshActionConfigProps,
} from "./subscribesAction/ColumnRefresh";
import { type EventData_OnDataFetched } from "./subscribesAction/DataFetch";
import { EventName } from "../types/editableCell";

// 创建全局事件总线实例
export type EventCallback<PARAM = any, RESULT = any> = (
  data: PARAM
) => CallbackResult<RESULT> | Promise<CallbackResult<RESULT>>;
export interface CallbackResult<RESULT = any> {
  result: boolean;
  errorCode?: string;
  errorMessage?: string;
  data?: RESULT;
}
class EventBus {
  private events: Partial<Record<string, EventCallback[]>> = {};
  // 订阅事件，返回一个取消订阅的函数
  on<PARAM = any>(
    eventName: string,
    callback: EventCallback<PARAM>
  ): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => {
      this.off(eventName, callback);
    };
  }
  // 取消订阅
  off<PARAM = any>(eventName: string, callback: EventCallback<PARAM>): void {
    if (!this.events[eventName]) {
      return;
    }

    const index = this.events[eventName].indexOf(callback);
    if (index !== -1) {
      this.events[eventName].splice(index, 1);
    }
  }
  // 触发事件
  async emit<PARAM = any, RESULT = any>(
    eventName: string,
    data: PARAM
  ): Promise<CallbackResult<RESULT>[]> {
    if (!this.events[eventName]) {
      return [];
    }
    const results: CallbackResult<RESULT>[] = [];
    for (const callback of this.events[eventName]) {
      try {
        console.debug(`触发事件${eventName}，传递数据:`, data);
        const result = await callback(data);
        console.debug(`事件${eventName}处理结果:`, result);
        if (!result.result) {
          console.error(
            `事件${eventName}处理失败:`,
            result?.errorCode,
            result?.errorMessage
          );
        }
        results.push(result as CallbackResult<RESULT>);
      } catch (error) {
        console.error(`事件${eventName}处理执行失败:`, error);
        results.push({
          result: false,
          errorCode: "EVENT_HANDLER_ERROR",
          errorMessage: (error as Error).message,
        } as CallbackResult<RESULT>);
      }
    }
    return results;
  }
  // 清除所有事件
  clear(): void {
    this.events = {};
  }
  // 清除特定事件
  clearEvent(eventName: string): void {
    delete this.events[eventName];
  }
}
// 创建全局事件总线实例
export const eventBus = new EventBus();

export class EventService {
  static triggerEvent<PARAM>(eventName: string, data?: PARAM) {
    console.debug(`触发事件: ${eventName}，数据:`, data);
    eventBus.emit<PARAM | undefined>(eventName, data);
  }

  static substribeEvent<PARAM>(
    eventName: string,
    callback: EventCallback<PARAM>
  ): () => void {
    console.debug(`订阅事件: ${eventName}`);
    return eventBus.on(eventName, callback);
  }
}

export interface ColumnChangeHandlerProps {
  eventName: string;
  columnName: string;
  recordId: Id;
  newValue: any;
  oldValue: any;
  setValue: React.Dispatch<any>;
}

/**
 * Column的值改变后（例如对于Select下拉框的onChange事件、Input输入框的onBlur事件）
 * 触发事件，并调用父组件的setValue回调方法更新值
 * @param param0
 */
export const columnChangeBaseHandler = ({
  eventName,
  columnName,
  recordId,
  newValue,
  oldValue,
  setValue,
}: ColumnChangeHandlerProps): void => {
  if (oldValue !== undefined && oldValue !== newValue) {
    EventService.triggerEvent(`${eventName}`, {
      columnName: columnName,
      recordId: recordId,
      newValue: newValue,
      oldValue: oldValue,
    });
  }
  setValue(newValue);
};

export const substribeColumnEvent = (
    columnsConfig: ColumnConfig[],
    handleProductColumnChange:(recordId:Id,columnName:string,newValue:any)=>void,
  ) => {
  const columnEventUnsubscribes: (() => void)[] = [];
  for (let i = 0; i < columnsConfig.length; i++) {
    const columnConfig = columnsConfig[i];
    const columnName = columnConfig.columnName;
    const subscribes = columnConfig?.subscribes;
    if (subscribes === undefined || subscribes.length === 0) {
      continue;
    }
    for (let j = 0; j < subscribes.length; j++) {
      const subscribe = subscribes[j];
      const { eventName, actionType, actionConfig } = subscribe;

      if (eventName === undefined || eventName.trim() === "") {
        console.warn(
          `列${columnName}的事件订阅配置中，事件名称(eventName)未定义，跳过该订阅`
        );
        continue;
      }
      if (actionType === undefined || actionType.trim() === "") {
        console.warn(
          `列${columnName}的事件订阅配置中，动作类型(actionType)未定义，跳过该订阅`
        );
        continue;
      }
      if (eventName.startsWith(EventName.onBlur)) {
        const unsubscribe =
          EventService.substribeEvent<ColumnChangeHandlerProps>(
            `${eventName}__${columnName}`,
            async ({
              columnName,
              recordId,
              newValue,
              oldValue,
            }): Promise<CallbackResult> => {
              switch (actionType) {
                case ActionType.dataFetch:
                  const fetchDataActionConfigProps =
                    subscribe.actionConfig as FetchDataActionConfigProps;
                  return await handleRequestAction(
                    fetchDataActionConfigProps,
                    recordId,
                    columnName,
                    newValue
                  );

                default:
                  return {
                    result: false,
                    errorCode: "UNSUPPORTED_ACTION_TYPE",
                    errorMessage: `不支持的动作类型: ${actionType}`,
                  };
              }
            }
          );
        columnEventUnsubscribes.push(unsubscribe);
      } else if (eventName.startsWith(EventName.onDataFetched)) {
        const unsubscribe =
          EventService.substribeEvent<EventData_OnDataFetched>(
            `${eventName}`,
            async ({
              data, //获取到的数据
              recordId,
            }): Promise<CallbackResult> => {
              const columnRefreshActionConfigProps =
                subscribe.actionConfig as ColumnRefreshActionConfigProps;
              return await handleRefreshColumnValueAction(
                columnRefreshActionConfigProps,
                recordId,
                columnName,
                data,
                handleProductColumnChange
              );
            }
          );
        columnEventUnsubscribes.push(unsubscribe);
      }
    }
  }
  return columnEventUnsubscribes;
};
