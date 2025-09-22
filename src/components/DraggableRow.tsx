import { Draggable, type DraggableProvided, type DraggableStateSnapshot } from "react-beautiful-dnd";
import React from "react";
import RowCore from "./RowCore";
import type { RowCoreProps } from "./RowCore";

/**
 * 可拖拽的行组件，基于 react-beautiful-dnd 实现
 * 本组件包裹了 RowCore 组件，并为其提供拖拽功能
 */
interface DraggableRowProps extends RowCoreProps{
  index:number;
}
const DraggableRow:React.FC<DraggableRowProps> = ({index,...rowCoreProps})=>{
  const {product} = rowCoreProps;
  return (
    <Draggable draggableId={`row-${product.id}`} index={index}>
      {(provided: DraggableProvided,snapshot:DraggableStateSnapshot)=>(
        <RowCore 
          {...rowCoreProps} 
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

export default DraggableRow;