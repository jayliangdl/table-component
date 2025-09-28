import { type DisplayConfig } from "./displayConfig";
import {type DateConfigProps} from '../components/baseComponent/CustomDate';
import {type DatetimeConfigProps} from '../components/baseComponent/CustomDatetime';
import {type InputConfigProps} from '../components/baseComponent/CustomInput';
import {type InputNumberConfigProps} from '../components/baseComponent/CustomInputNumber';
import {type SelectConfigProps} from '../components/baseComponent/CustomSelect';
import {type TextareaConfigProps} from '../components/baseComponent/CustomTextarea';
import {type CheckboxConfigProps} from '../components/baseComponent/CustomCheckbox';
import { type Id } from "./id";
import {type FetchDataActionConfigProps} from "../service/subscribesAction/DataFetch";
import {type ColumnRefreshActionConfigProps} from "../service/subscribesAction/ColumnRefresh";

// —— 类型定义
export type Width = number | `${number}px`;

/**
 * 定义某笔记录所在的分组路径
 */
export interface UnderGroupsProps {
    columnName:string;
    value:any;
}

//可监听的事件名称枚举
export const EventName = {
  onFocus: 'ON_FOCUS',
  onBlur: 'ON_BLUR',
  onChange:'ON_CHANEG',  
  onDataFetched: 'ON_DATA_FETCHED',
} as const;

export type EventName = typeof EventName[keyof typeof EventName];
export interface EventData_OnBlur{

  columnName:string|undefined,
  recordId:Id,
  newValue:any,
  oldValue:any,
}

export type EditConfig = InputConfigProps|InputNumberConfigProps|TextareaConfigProps|SelectConfigProps|DateConfigProps|DatetimeConfigProps|CheckboxConfigProps;

export type EditableCellType =
    'text' | 'number' | 'textarea' | 'date' | 'time'|'datetime' | 'boolean' | 'select' | 'actionButton';
export interface SelectOptionProps{
    label: string;
    value: any;
}


export interface CommonCustomComponentProps{
    columnName: string;
	recordId: Id;
    value?: any;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?:string;  
    style?: React.CSSProperties;
	onValueChanged(value:any):void;
}

export interface ColumnConfig{
    title: string; //列标题
    dataIndex: string; //数据字段
    columnName: string; //列key
    type: EditableCellType; //编辑类型，默认text
	disabled?: boolean; //整列禁用编辑
	readOnly?: boolean; //整列只读
    fixed?: 'left' | 'right'; //固定列
    editable?: boolean; //是否可编辑
    editConfig?: EditConfig; //列编辑配置
    options?: SelectOptionProps[] | {dataSourceFetchUrl:string,labelFieldName:string,valueFieldName:string}; //下拉选项，支持静态数组或远程数据源配置
    displayConfig: DisplayConfig; //显示配置，针对不同类型有不同配置项，比如boolean类型可以配置true/false的标签文本等
	style?: React.CSSProperties; //列样式
	/**
	 * 此处描述本字段要监听的事件
	 * 例如，在“产品编号字段输入后（光标视角），触发获取产品信息”的场景中，在“产品编号”字段的列配置中，可以配置：
	 * ```
	 * subscribes:[
	 * 		{
	 *    		eventName: EventName.onBlur; //监听失去焦点事件
	 *    		actionType: "fetchData"; //事件触发时，执行获取数据的动作
	 *    		actionConfig: {
	 * 	      		url: "/api/getProductInfo", //获取数据的URL
	 * 	      		method: "GET", //请求方法
	 * 	      		headers: {}, //请求头
	 * 	      		params: { productId: "{value}" }, //请求参数，{value}表示当前字段的值
	 *    		}
	 * 		}
	 * 	]
	 * }
	 * ```
	 * 然后在事件触发时，执行获取产品信息的逻辑
	 */
	subscribes?:ColumnEventSubscribeConfig[]; //列事件监听配置
}



export interface ColumnEventSubscribeConfig
{
	eventName: string; //要监听的事件名称
	actionType: ActionType; //事件触发时的动作类型，fetchData表示获取数据，todo:otherActionType表示其他动作（TODO:待补充）
	actionConfig?:ActionConfig; //事件触发时的动作配置，例如fetchData时，配置获取数据的URL等
}

export const ActionType = {
	dataFetch:"dataFetch",
	columnRefresh:"columnRefresh",
	todo_otherAction: "todo:otherActionType"
};
export type ActionType = typeof ActionType[keyof typeof ActionType];

export type ActionConfig = FetchDataActionConfigProps|ColumnRefreshActionConfigProps|"todo:otherActionConfig"; 

export const sampleFixedColumnsNames = ["id","name","category","brand","model","price","cost","stock","isGift","actions"];
export const sampleScrollabledColumnsNames = ["weight","dimensions","color","material","origin","releaseDate","createdAt","shippingTime","warranty","rating","description"];
// export const sampleFixedColumnsNames = ["xxxxxxxxxxxxxxxxx"];
// export const sampleScrollabledColumnsNames = ["id","name",
// 	"category","brand","model",
// 	"price",
// 	"cost","stock","isGift",
// 	"actions",
// 	"weight","dimensions","color","material","origin","releaseDate","createdAt","shippingTime","warranty","rating","description"
// ];
export const sampleColumnsConfig: ColumnConfig[]= [{
		title: "ID",
		dataIndex: "id",
		columnName: "id",
		type: 'text',
		editable: false,
		displayConfig: {
			type: 'text'
		},
		style:{
			width: "40px",
		}
	},
	{
		title: "产品名称",
		dataIndex: "name",
		columnName: "name",
		editable: true,
		type: 'text',
		displayConfig: {
			type: 'text'
		},
		style:{
			minWidth: "180px",
			width: "180px",
		},
		subscribes:[
			{
				eventName: EventName.onBlur,
				actionType: ActionType.dataFetch,
				actionConfig: {
					mainUrl: "/api/user",
					method: "POST",
					headers: {},
					bodyTemplate:"{\"name\":\"{name}\"}",	
					notificationSuffix:"PRODUCT"				
				}
			}
		]
	},
	{
		title: "分类",
		dataIndex: "category",
		columnName: "category",
		editable: true,
		type: 'select',
		displayConfig: {
			type: 'text'
		},
        editConfig: {
            optionsConfig: {
                type: "dynamic",
                dynamicOptionsConfig: {
                    url: "temp:category",
                    method: "GET",
                    headers: {},
                    params: {},
                    labelFieldName: "label",
                    valueFieldName: "value"
                }
            },
            optionFilterProp:"label",
            allowClear: true
        },
		style:{
			minWidth: "80px",
			width: "80px",
		}
	},
	// { 
    //     title: '特征', 
    //     dataIndex: 'features', 
    //     columnName: 'features', 
    //     minWidth: 180, 
    //     editable: true, 
    //     type: 'multi-select', 
    //     options: features 
    //     displayConfig: { type: "text" },
    // },
	{
		title: "品牌",
		dataIndex: "brand",
		columnName: "brand",
		editable: true,
		type: 'select',
        displayConfig: {
			type: 'text'
		},
		editConfig: {
            optionsConfig: {
                type: "dynamic",
                dynamicOptionsConfig: {
                    url: "temp:brand",
                    method: "GET",
                    headers: {},
                    params: {},
                    labelFieldName: "label",
                    valueFieldName: "value"
                }
            },
            optionFilterProp:"label",
            allowClear: true
        },
		style:{
			minWidth: "80px",
			width: "80px",
		}
	},
	{
		title: "型号",
		dataIndex: "model",
		columnName: "model",
		editable: true,
		type: 'text',
        displayConfig: {
			type: 'text'
		},
        editConfig: {
            optionsConfig: {
                type: "dynamic",
                dynamicOptionsConfig: {
                    url: "temp:model",
                    method: "GET",
                    headers: {},
                    params: {},
                    labelFieldName: "label",
                    valueFieldName: "value"
                }
            },
            optionFilterProp:"label",
            allowClear: true
        },
		style:{
			minWidth: "80px",
			width: "80px",
		}
	},
	{
		title: "价格(¥)",
		dataIndex: "price",
		columnName: "price",
		editable: true,
		type: 'number',
        displayConfig: {
			type: 'number',
			prefix: "¥",
			align: "right",
            decimalPlaces:2,
		},
        editConfig: {
            "min":100,
            "max":1000000,
            "step":1,
            "precision":2,
			"prefix":"¥"
        },
		style:{
			minWidth: "120px",
			width: "120px",
		},
		subscribes:[
			{
				eventName: EventName.onDataFetched+"__PRODUCT",
				actionType: ActionType.columnRefresh,
				actionConfig: {
					sourceField:"money",
				}
			}
		]
	},
	{
		title: "成本(¥)",
		dataIndex: "cost",
		columnName: "cost",
		editable: true,
		type: 'number',
        displayConfig: {
			type: 'number',
            prefix: "¥",
            align: "right",
            decimalPlaces:2,
		},
		editConfig: {
            "min":100,
            "max":10000,
            "step":1,
            "precision":2,
			"prefix":"¥"
        },
		style:{
			minWidth: "80px",
			width: "80px",
		}
	},
	{
		title: "库存",
		dataIndex: "stock",
		columnName: "stock",
		editable: false,
		type: 'number',
        displayConfig: {
			type: 'number',
			align: "right",
		},
		style:{
			minWidth: "80px",
			width: "80px",
		}
	},
	{
		title: "是否赠品",
		dataIndex: "isGift",
		columnName: "isGift",
		editable: true,
		type: 'boolean',
		displayConfig: {
			booleanLabels: {
				true: "是的",
				false: "不是哦"
			},
			type: "boolean",
		},
        editConfig: {
            "label":"label here"
        },
		style:{
			minWidth: "80px",
			width: "80px",
		}
	},
	{
		title: '重量(kg)',
		dataIndex: 'weight',
		columnName: 'weight',
		editable: false,
		type: 'number',
        displayConfig: {
			type: 'number',
			align: "right",
		},
		style:{
			minWidth: "50px",
			width: "50px",
		}
	},
	{
		title: '尺寸',
		dataIndex: 'dimensions',
		columnName: 'dimensions',
		editable: false,
		type: 'text',
        displayConfig: {
			type: 'number',
			align: "right",
		},
		style:{
			width: "100px",
		}
	},
	{
		title: '颜色',
		dataIndex: 'color',
		columnName: 'color',
		editable: false,
		type: 'text',
        displayConfig: {
			type: 'text'
		},
		style:{
			width: "80px",
		}
	},
	{
		title: '材质',
		dataIndex: 'material',
		columnName: 'material',
		editable: false,
		disabled: false,
		type: 'text',
        displayConfig: {
			type: 'text'
		},
		style:{
			width: "80px",
		}
	},
	{
		title: '产地',
		dataIndex: 'origin',
		columnName: 'origin',
		editable: false,		
		type: 'text',
        displayConfig: {
			type: 'text'
		},
		style:{
			width: "100px",
		}
	},
	{
		title: '发布日期',
		dataIndex: 'releaseDate',
		columnName: 'releaseDate',
		editable: true,
		type: 'date',
        displayConfig: {
            datePattern: "YYYY-MM-DD",
            type: "date",
        },
        editConfig: {},
		style:{
			width: "80px",
		}
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		columnName: 'createdAt',
		editable: true,
		type: 'datetime',
        displayConfig: {
            datePattern: "YYYY-MM-DD HH:mm:ss",
            type: "datetime",
        },
        editConfig: {},
		style:{
			width: "180px",
		}
	},
	{
		title: '发货时间',
		dataIndex: 'shippingTime',
		columnName: 'shippingTime',
		editable: true,
		type: 'time',	
        displayConfig: {
            datePattern: "HH:mm:ss",
            type: "time",
        },
        editConfig: {},
		style:{
			width: "100px",
		}
	},
	{
		title: '保修',
		dataIndex: 'warranty',
		columnName: 'warranty',
		editable: false,
		type: 'text',
        displayConfig: {
			type: 'text'
		},
		style:{
			width: "120px",
		}
	},
	{
		title: '评分',
		dataIndex: 'rating',
		columnName: 'rating',
		editable: false,
		type: 'number',
        displayConfig: {
			type: 'number'
		},
		style:{
			width: "80px",
		}
	},
	{
		title: '描述',
		dataIndex: 'description',
		columnName: 'description',
		editable: true,
		type: 'textarea',
        displayConfig: { type: "textarea" },
        editConfig: {
			type:"textarea",
			"autoSize": { "minRows": 2, "maxRows": 60 }
		},
		style:{
			minWidth: "800px",
			width: "800px",
		}
	},
	{
		title: '操作',
		dataIndex: 'actions',
		columnName: 'actions',
		editable: false,
		type: 'actionButton',
		style: { textAlign: "left", whiteSpace: "nowrap", width: "200px" },
		displayConfig: { type: "actionButton" },
	}
];