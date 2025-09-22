import {type ColumnConfig} from '../types/editableCell';
import React,{forwardRef} from "react";
import {type DraggableProvidedDragHandleProps,type DraggableProvidedDraggableProps } 
from "react-beautiful-dnd";

export interface ColumnCoreProps {
    columnConfig: ColumnConfig;
    style?: React.CSSProperties;
    draggableProps?: DraggableProvidedDraggableProps; // 添加 draggableProps
    dragHandleProps?: DraggableProvidedDragHandleProps; // 添加 dragHandleProps
    isDragging?: boolean; // 添加 isDragging，用于拖拽状态,
    isDraggingRow?: boolean; // 添加 isDraggingRow，用于拖拽状态,
}

  const getHeaderStyle = (
    additionStyle?: React.CSSProperties
  ): React.CSSProperties => {
    const stylesParams = {
      fontSize: "14px",
      fontWeight: "bold",
    };
    const ret = additionStyle
      ? {
          ...stylesParams,
          // padding: "8px",
          // // border: "none",
          // border: "1px solid #ddd",
          // textAlign: "left" as const,
          // backgroundColor: "#f5f5f5",
          // position: "sticky" as const,
          // top: 0,
          // zIndex: 1,
          ...additionStyle,
        }
      : {
          ...stylesParams,
        };
    return ret;
  };

/**
 * 本组件实现表格的列头相关布局与功能
 * todo: filter过滤功能，sort排序功能
 * @param param0 
 * @returns 
 */

// const RowCore= forwardRef<HTMLTableRowElement, RowCoreProps>((rowProps,ref) => {
const ColumnCore= forwardRef<HTMLTableCellElement, ColumnCoreProps>((columnCoreProps,ref)=>{
  const {columnConfig,draggableProps,dragHandleProps,isDraggingRow} = columnCoreProps;
    // const style=columnConfig.style?{...columnConfig.style}:{};    
    // style["backgroundColor"]=isDraggingRow ? "rgba(0, 123, 255, 0.1)" : "white"; // 拖拽时高亮
    const style = {
      // backgroundColor: isDraggingRow ? "rgba(0, 123, 255, 0.1)" : "white",
      ...draggableProps?.style,
      ...(columnConfig.style || {})
    };

  return (
    <td>
      <span {...dragHandleProps} {...draggableProps}
      style={getHeaderStyle(style)} 
      ref={ref} key={columnConfig.columnName} >{columnConfig.title}</span>
    </td>
  )
})
export default React.memo(ColumnCore);