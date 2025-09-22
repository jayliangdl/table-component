import { DragDropContext, Droppable, type DropResult, type DragUpdate } from "react-beautiful-dnd";
import type { ProductInUI } from "../types/Product";
import Row from "./Row";
import { type Id } from "../types/id";
import type { RecordData } from "../service/RecordService";
import type { ColumnConfig } from "../types/editableCell";
import { useState } from "react";

interface DroppableRowProps {
    products: ProductInUI[];
    // draggingRowId: Id | null;
    columnsConfigs: ColumnConfig[];
    handleSave:(recordId: Id, newRow: RecordData) => Promise<void>,
    handleEdit:(id: Id) => void,
    handleCancel:(id: Id) => Promise<void>,
    handleDelete:(id: Id) => Promise<void>,
    resetDatasource:(data:any[])=>void;//本方法用于在拖拽排序后，重置数据源
    // handleDragEnd : (result: DropResult) => void;
    // handleDragUpdate : (update:DragUpdate) => void;
}
const DroppableRow: React.FC<DroppableRowProps> = (
    {
        products,
        // draggingRowId,
        columnsConfigs,
        handleSave,
        handleEdit,
        handleCancel,
        handleDelete,
        resetDatasource,
    }
) => {
        console.log("DroppableRow render：",columnsConfigs);
        const [draggingRowId, setDraggingRowId] = useState<Id | null>(null);
        const handleDragEnd = (result: DropResult) => {
          if (!result.destination) return;
    
          const reorderedProducts = Array.from(products);
          const [movedProduct] = reorderedProducts.splice(result.source.index, 1);
          reorderedProducts.splice(result.destination.index, 0, movedProduct);
          resetDatasource(reorderedProducts);
          //清除拖拽状态
          setDraggingRowId(null);
        };

        const handleDragUpdate = (update:DragUpdate)=>{
              if(update.draggableId){
                setDraggingRowId(update.draggableId);
              }
            }

    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
            <Droppable droppableId="table-body">
            {(provided) => (
        <tbody ref={provided.innerRef} {...provided.droppableProps}>
            {products.map((product,index) => {
            const isEditing = product?.isEditing ? true : false;
            const isSaving = product?.isSaving ? true : false;
            return (
                <Row index={index} 
                columnsConfigs={columnsConfigs} 
                key={product.id} 
                product={product} 
                isEditing={isEditing} isSaving={isSaving} 
                isDragging={draggingRowId===`row-${product.id}`}
                onSave={handleSave} onEdit={handleEdit}
                onCancel={handleCancel} onDelete={handleDelete}
                />                  
            );
            })}
        </tbody>
        )}
        </Droppable>
        </DragDropContext>
    )
}

export default DroppableRow;