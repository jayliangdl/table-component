import {useState, useEffect} from 'react';
import { 
    DragDropContext, 
    Droppable, 
    Draggable, 
    type DropResult,
    type DroppableProvided,
    type DroppableStateSnapshot,
    type DraggableProvided,
    type DraggableStateSnapshot
} from 'react-beautiful-dnd';
import './DndDemo.css';

// 这个函数用来解决React 18 StrictMode中的问题
// const useDndSafeRender = () => {
//   const [enabled, setEnabled] = useState(false);
  
//   useEffect(() => {
//     // 使用setTimeout来确保在组件首次渲染后再启用拖拽功能
//     const timeout = setTimeout(() => {
//       setEnabled(true);
//     }, 500);
    
//     return () => clearTimeout(timeout);
//   }, []);
  
//   return enabled;
// };
interface ItemProps {
    id: string;
    index: number;
}

interface ListProps {
    items: ItemProps[];
}

const Item = ({id,index}:ItemProps)=>{
    return (
        <Draggable draggableId={id} index={index}>
            {
                (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        data-testid={`item-${id}`}
                        style={{
                            padding: 16,
                            margin: '0 0 8px 0',
                            backgroundColor: snapshot.isDragging ? '#e0f7fa' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            boxShadow: snapshot.isDragging ? '0 0 10px rgba(0,0,0,0.1)' : 'none',
                            ...provided.draggableProps.style //Jay:拖动时重要的样式
                        }}
                    >
                        Item {id}
                    </div>
                )                                
            }
        </Draggable>
    );
};


const List = ({items}:ListProps)=>{
    return (
        <Droppable droppableId="droppable-1">
            {
                (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        data-testid="droppable-container" 
                        style={{
                            backgroundColor: snapshot.isDraggingOver ? '#e1f5fe' : '#f0f0f0',
                            padding: 8,
                            width: 500,
                            minHeight: 500,
                            transition: 'background-color 0.2s ease'
                        }}
                    >
                        {
                            items.map((item, index) =>
                                <Item key={item.id} id={item.id} index={index} />
                            )
                        }
                        {provided.placeholder}
                    </div>
                )
            }
        </Droppable>
    );
};

const DndDemo=()=>{
    // 使用安全渲染钩子来解决React 18兼容性问题
    // const dndEnabled = useDndSafeRender();
    
    const [items,setItems] = useState([
        {id:'1',index:0},
        {id:'2',index:1},
        {id:'3',index:2},
        {id:'4',index:3},
        {id:'5',index:4},
    ]);

    // 添加 onDragEnd 处理函数实现
    const handleDragEnd = (result: DropResult) => {
        console.log('拖拽结束', result);
        
        // 如果放置位置无效或没有移动，则不执行任何操作
        if (!result.destination) {
            return;
        }

        // 如果源位置和目标位置相同，也不执行操作
        if (
            result.destination.droppableId === result.source.droppableId &&
            result.destination.index === result.source.index
        ) {
            return;
        }

        // 创建新数组并重新排序
        const newItems = Array.from(items);
        /**
         * 第一步：从数组中删除被拖动的项目，并保存该项目
         * splice(result.source.index, 1) 从原位置删除1个元素
         * [movedItem] 使用解构赋值获取被删除的元素
         **/
        const [movedItem] = newItems.splice(result.source.index, 1);
        /**
         * 第二步：将被拖动的项目插入到新位置
         * splice(result.destination.index, 0, movedItem) 在目标位置插入被移动的元素
         * 第一个参数是插入位置的索引
         * 第二个参数是0，表示不删除任何元素
         * 第三个参数是要插入的元素
         **/
        newItems.splice(result.destination.index, 0, movedItem);

        // 更新状态
        setItems(newItems);
        console.log('Item moved from', result.source.index, 'to', result.destination.index);
    };

    return (
         <div>
            <h2>拖拽演示</h2>
            <p>拖动下面的项目可以重新排序</p>

            <DragDropContext onDragEnd={handleDragEnd}>
                    <List items={items} />
                </DragDropContext>
            {/* {dndEnabled ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <List items={items} />
                </DragDropContext>
            ) : (
                <div style={{ padding: 10, background: '#f9f9f9' }}>
                    正在加载拖拽功能...
                </div>
            )} */}
            <div style={{ marginTop: 20 }}>
                <h3>当前顺序：</h3>
                <pre>{JSON.stringify(items, null, 2)}</pre>
            </div>
        </div>
    );
}
export default DndDemo;