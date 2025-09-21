import { type DisplayConfig } from "./displayConfig";
import {type DateConfigProps} from '../components/baseComponent/CustomDate';
import {type DatetimeConfigProps} from '../components/baseComponent/CustomDatetime';
import {type InputConfigProps} from '../components/baseComponent/CustomInput';
import {type InputNumberConfigProps} from '../components/baseComponent/CustomInputNumber';
import {type SelectConfigProps} from '../components/baseComponent/CustomSelect';
import {type TextareaConfigProps} from '../components/baseComponent/CustomTextarea';
import {type CheckboxConfigProps} from '../components/baseComponent/CustomCheckbox';

export type EditConfig = InputConfigProps|InputNumberConfigProps|TextareaConfigProps|SelectConfigProps|DateConfigProps|DatetimeConfigProps|CheckboxConfigProps;

export type EditableCellType =
    'text' | 'number' | 'textarea' | 'date' | 'time'|'datetime' | 'boolean' | 'select' | 'actionButton';
export interface SelectOptionProps{
    label: string;
    value: any;
}


export interface CommonCustomComponentProps{
    columnName: string;
    defaultValue?: any;
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
}

export const sampleFixedColumnsNames = ["id","name","category","brand","model","price","cost","stock","isGift","actions"];
export const sampleScrollabledColumnsNames = ["weight","dimensions","color","material","origin","releaseDate","createdAt","shippingTime","warranty","rating","description"];
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
			width: "100px",
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
		}
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
			minWidth: "180px",
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
            "max":10000,
            "step":1,
            "precision":2,
			"prefix":"¥"
        },
		style:{
			minWidth: "80px",
		}
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