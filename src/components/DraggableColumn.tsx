import { Draggable, type DraggableProvided, type DraggableStateSnapshot } from "react-beautiful-dnd";
import React from "react";
import { type ColumnCoreProps } from "./ColumnCore";
import ColumnCore from "./ColumnCore";

/**
 * 可拖拽的列组件，基于 react-beautiful-dnd 实现
 * 本组件包裹了 ColumnCore 组件，并为其提供拖拽功能
 */
interface DraggableColumnProps extends ColumnCoreProps{
  index:number;
}
const DraggableColumn:React.FC<DraggableColumnProps> = ({index,...columnCoreProps})=>{
  const {columnConfig} = columnCoreProps;
  return (
    <Draggable draggableId={`column-${columnConfig.columnName}`} index={index}>
      {(provided: DraggableProvided,snapshot:DraggableStateSnapshot)=>(

        <ColumnCore key={columnConfig.columnName}
          {...columnCoreProps} 
          ref={provided.innerRef}
          style={{...provided.draggableProps.style}}  //Jay:拖动时重要的样式
          draggableProps={provided.draggableProps}
          dragHandleProps={provided.dragHandleProps || undefined}
          isDragging={snapshot.isDragging}
          />
      )}
    </Draggable>
  )
}

export default DraggableColumn;