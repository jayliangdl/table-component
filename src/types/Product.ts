import { type Id } from "./id";
export interface Product {
  id: Id;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  cost: number;
  stock: number;
  weight: number;
  dimensions: string;
  color: string;
  material: string;
  manufacturerCountry: string;
  releaseDate: string;
  warranty: string;
  rating: number;
  description: string;
  isGift:boolean;
  createdAt: string; //创建时间（YYYY-MM-DD HH:mm:ss）
  shippingTime: string;//发货时间（HH:mm:ss）
  features:string[];//标签
}

export interface ProductInUI extends Product {
  isEditing?:boolean;//本属性由前端填入，非后端属性，表示界面上本记录是否在编辑状态
  isSaving?:boolean;//本属性由前端填入，非后端属性，表示界面上本记录是否正在保存中状态
  rowDataBeforeEdit?:Product;//本属性由前端填入，非后端属性，表示界面上本记录编辑前的原始数据
}

/**存放分组数据的接口
 * groupBy-依据哪个Column进行分组
 * value-Column的值
 * children-子分组节点数组(可能有更多子分组，children和data互斥，即有children就没有data)
 * data-当前分组下的行数据数组
 */
export interface GroupNode {
    groupBy?: string,
    value?: string,
    children?: GroupNode[]
    data?: ProductInUI[]
}