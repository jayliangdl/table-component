import React,{useEffect,useCallback} from "react";

import ActionButton from "./ActionButton";
import EditableCell from "./EditableCell";
import {type ColumnConfig} from "../types/editableCell";
import type { Id } from "../types/id";

interface RowProps {
  columnsConfigs: ColumnConfig[];
  product: any;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (id: Id,newRecord:any) => Promise<void>;
  onCancel: (id: Id) => Promise<void>;
  onEdit: (id: Id)=>void;
  onDelete: (id: Id) => Promise<void>;
}
const getContentStyle = (
  additionStyle?: React.CSSProperties
): React.CSSProperties => {
  const stylesParams = {
    fontSize: "13px",
    padding: "8px",
    // border: "0px solid #ddd",
  };

  const ret = additionStyle
    ? {
        ...stylesParams,
        ...additionStyle,
      }
    : {
        ...stylesParams,
      };
  return ret;
};
const RowCore: React.FC<RowProps> = (rowProps: RowProps) => {
  const {
    columnsConfigs,
    product,
    isEditing,
    isSaving,
    onSave,
    onCancel,
    onEdit,
    onDelete,
  } = rowProps;


  React.useEffect(() => {
    console.debug(`Row组件实例重现渲染，组件参数: productId=${product.id}`);
  });
  /**
   * 行中每个字段更新后的处理思路：
   * 1. 每个EditableCell组件中，值变化时，会回调父组件（即本组件）传入的onColumnValueChange方法(handleColumnValueChange)，传递columnName和最新值
   * 2. 本组件中，onColumnValueChange方法会更新当前行数据currentRowData
   * 3. currentRowData变更后，会通过useEffect更新currentRecordDataRef（类型：React.useRef）引用
   * 4. 当用户点击保存按钮时，调用handleSave方法，通知上层父组件（Table组件）的onSave方法，并传递最新的行数据currentRecordDataRef.current
   * 5. 这样就实现了每个字段更新后，最终保存时，传递最新的整行数据
   */
  const [currentRowData, setCurrentRowData] = React.useState<any>(product);

  useEffect(() => {
    setCurrentRowData(product);
  }, [product]);

  const currentRecordDataRef = React.useRef<any>(currentRowData);

  useEffect(() => {
    currentRecordDataRef.current = currentRowData;
  }, [currentRowData]);
  //当每个EditableCell组件的值变化时，调用此函数，更新当前行数据（currentRecord）
  const handleColumnValueChange = useCallback(async (columnName:string,updatedValue:any) => {
    setCurrentRowData((prev:any)=>{
      const updatedRecord = {...prev,[columnName]:updatedValue};
      return updatedRecord;
    });
  },[]);

  //当用户点击保存按钮时，调用此函数，通知上层父组件（onSave），并传递最新的行数据
  const handleSave = useCallback(async (recordId:Id) => {  
    await onSave(recordId,currentRecordDataRef.current);
    setCurrentRowData(currentRecordDataRef.current);//更新当前行数据为最新值
  },[onSave]);

  //当用户点击编辑按钮时，触发的方法
  const handleEdit = useCallback((recordId:Id):Promise<void> => {
    //开始编辑前，先记录当前行数据的原始值
    // setRowDataBeforeEdit(currentRowData);
    onEdit(recordId);
    return Promise.resolve();
  },[onEdit,currentRowData]);

  //当用户点击取消按钮时，触发的方法
  const handleCancel = useCallback(async (recordId:Id):Promise<void> => {
    await onCancel(recordId);
    return Promise.resolve();
  },[onCancel]);

  const handleDelete = useCallback(async (recordId:Id):Promise<void> => {
    return await onDelete(recordId);
  }
  ,[onDelete]);

  return (
    <tr key={currentRowData.id}>
      {
        columnsConfigs.map(
          (col)=>{
            const style=col.style?{...col.style}:{};
            const editable = col.editable;
            const disabled = col.disabled;
            const readOnly = col.readOnly;
             return (
             <td key={col.columnName} style={getContentStyle(style)}>
                <EditableCell columnEditConfig={col.editConfig}                  
                  columnName={col.columnName}
                  recordId={currentRowData.id}
                  style={style}
                  editable={editable}
                  value={currentRowData[col.dataIndex]}
                  isEditing={isEditing}
                  isSaving={isSaving}
                  type={col.type}
                  disabled={disabled}
                  readOnly={readOnly}
                  displayConfig={col.displayConfig}
                  onColumnValueChange={handleColumnValueChange}
                  onCancel={handleCancel}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onDelete={handleDelete}

                />
              </td>)
          }
        )
      }
      {/* <td
        style={getContentStyle({
          textAlign: "center",
          whiteSpace: "nowrap",
        })}
      >
        
        <ActionButton
          id={product.id}
          onSave={handleSave}
          onDelete={onDelete}
          onEdit={handleEdit}
          onCancel={onCancel}
          isEditing={isEditing}
        />
      </td> */}
    </tr>
  );
};
const Row = RowCore;//使用 React.memo 进行性能优化，避免不必要的重复渲染（仅当组件入参变化时才重新渲染）
// export default React.memo(Row);
/**
 * 为确保只有在 product 或 isEditing 发生变化时才重新渲染组件，我们可以提供一个自定义的比较函数给 React.memo。
 * 背景：发现即使增加了React.memo包裹着Row组件，还是会频繁渲染，例如表格中仅对某记录进行编辑，但是保存或取消时，整个表格都会重新渲染。
 * 所以定义了以下函数，仅当只有在 product 或 isEditing 发生变化时才重新渲染组件。
 */
export default React.memo(Row, (prevProps, nextProps) => {
  return prevProps.product === nextProps.product && prevProps.isEditing === nextProps.isEditing;
});
