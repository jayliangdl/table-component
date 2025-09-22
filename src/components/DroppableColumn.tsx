import { DragDropContext, Droppable, type DropResult, type DragUpdate } from "react-beautiful-dnd";
import DraggableColumn from "./DraggableColumn";
import { type Id } from "../types/id";
import type { ColumnConfig } from "../types/editableCell";
import { useState } from "react";

interface DroppableColumnProps {
    columnsConfigs: ColumnConfig[];
    resetDatasource:(data:ColumnConfig[])=>void;//本方法用于在拖拽排序后，重置数据源
}
const DroppableColumn: React.FC<DroppableColumnProps> = (
    {
        columnsConfigs,
        resetDatasource,
    }
) => {
        const [draggingColumnName, setDraggingColumnName] = useState<Id | null>(null);
        const handleDragEnd = (result: DropResult) => {
          if (!result.destination) return;
          
          console.log("拖拽结束:",result);
          const reorderedColumns = Array.from(columnsConfigs);
          const [movedProduct] = reorderedColumns.splice(result.source.index, 1);
          reorderedColumns.splice(result.destination.index, 0, movedProduct);
          resetDatasource(reorderedColumns);
          //清除拖拽状态
          setDraggingColumnName(null);
        };

        const handleDragUpdate = (update:DragUpdate)=>{
              if(update.draggableId){
                setDraggingColumnName(update.draggableId);
              }
            }

    return (
        
            
        <thead>
          <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
            <Droppable droppableId="column-body">
          {(provided) => (
            <tr ref={provided.innerRef} {...provided.droppableProps}
                style={{
                  backgroundColor: "#f5f5f5",
                  position: "sticky", // Jay-固定表头，重要~！
                  top: 0, // Jay-固定在顶部，重要~！
                  zIndex: 1, // 确保在内容之上
                }}
              >
            {columnsConfigs.map((columnConfig,index) => {
            return (
                <DraggableColumn index={index} 
                columnConfig={columnConfig} 
                key={columnConfig.columnName} 
                isDragging={draggingColumnName===`column-${columnConfig.columnName}`}
                />
            );
            })}
            {provided.placeholder}
            </tr>
            )}
            </Droppable>
        </DragDropContext>
        </thead>
        
        
    )
}

export default DroppableColumn;