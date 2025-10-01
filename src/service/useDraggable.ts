import { useCallback, useMemo, useRef } from "react";

export type InsertSide = "before" | "after" | null;

/**
 * 定义可拖拽元素的接口
 * index: 元素所在分组的索引
 * groupKey: 元素所属分组（可选），如果没有分组，可以使用默认值，如 null 或 undefined
 * record: 元素对应的数据记录
 */
export interface DraggableEndPoint<K,T>{
    index: number;
    groupKey: K;
    record: T;
}
export interface DraggableProps<K,T> {
    lengthOf: (groupKey:K)=>number; //元素在该分组总数 或 元素总数(若没有分组)
    onReorder: (from:DraggableEndPoint<K,T>, to: DraggableEndPoint<K,T>) => void;
    unableDragItemIndexes?: (groupKey:K)=>number[]; //不可拖拽的行/列索引(按分组区分，或者不分组)
    // dragOverClassName?: string; //拖拽悬停时的样式类名    
    ableToDrop?:(fromRecord:DraggableEndPoint<K,T>,toRecord:DraggableEndPoint<K,T>)=>boolean, //是否允许放下的回调判断方法(例如A分组的行不允许拖到B分组)

    /** 由调用方决定当前应显示 before/after（或不显示） */
     resolveInsertSide: (e: React.DragEvent<HTMLElement>, el: HTMLElement) => InsertSide;
     classNames?: {
        overOk?: string;          // 可放置时淡背景（可选）
        insertBefore?: string;    // 插入线-前
        insertAfter?: string;     // 插入线-后
        targetBase?: string;      // 给目标元素的基础类（建议让它 position:relative）
    };
}    

export function useDraggable<K,T>(props: DraggableProps<K,T>) {
    const {
        lengthOf,
        onReorder,
        unableDragItemIndexes,
        // dragOverClassName,
        ableToDrop,
        resolveInsertSide,
        classNames,
    } = props;
    const dragSource = useRef<DraggableEndPoint<K,T> | null>(null); //存放拖拽的对象(源)
    const cleanupClasses = (el: HTMLElement) => {
        const before = classNames?.insertBefore ?? "drag-insert-before";
        const after  = classNames?.insertAfter  ?? "drag-insert-after";
        const overOk = classNames?.overOk      ?? "drag-over-ok";
        el.classList.remove(before, after, overOk);
    };
    const getItemProps = useCallback((index: number,currentRecord:T,groupKey:K) => {
        const isDragDisabled = (unableDragItemIndexes?unableDragItemIndexes(groupKey).includes(index):false);        
        return {
            draggable: isDragDisabled ? false : true,
            onDragStart: (e: React.DragEvent<HTMLElement>) => {
                if (isDragDisabled) return;
                dragSource.current = {index,groupKey,record:currentRecord};                
                e.dataTransfer!.effectAllowed = "move";
                e.dataTransfer!.setData("text/plain", String(index)); // 必须设置一些数据，否则某些浏览器（如Firefox）可能无法正确触发拖放
            },
            onDragOver: (e: React.DragEvent<HTMLElement>) => {
                const el = e.currentTarget as HTMLElement;
                if (isDragDisabled) return;
                const from = dragSource.current;
                const to = { index, groupKey, record:currentRecord };
                // 先清理旧样式
                cleanupClasses(el);
                classNames?.targetBase && el.classList.add(classNames.targetBase);
                if (!from) return;
                if (ableToDrop && !ableToDrop(from, to)) return;
                e.preventDefault();
                
                // 根据调用方解析的“插入侧”添加类
                const side = resolveInsertSide(e, el);
                const before = classNames?.insertBefore ?? "drag-insert-before";
                const after  = classNames?.insertAfter  ?? "drag-insert-after";
                if (classNames?.overOk) el.classList.add(classNames.overOk);
                if (side === "before") el.classList.add(before);
                else if (side === "after") el.classList.add(after);       

            },
            onDragLeave: (e: React.DragEvent<HTMLElement>) => {
                const el = e.currentTarget as HTMLElement;
                cleanupClasses(el);              
            },
            onDrop: (e: React.DragEvent<HTMLElement>) => {
                const el = e.currentTarget as HTMLElement;
                cleanupClasses(el);
                const from = dragSource.current;
                const to = { index, groupKey, record:currentRecord };
                
                if (!from) return;
                if(ableToDrop && from && !ableToDrop(from,to)){
                    return;
                }
                e.preventDefault();
                
                const fromLen = lengthOf(from.groupKey);
                const toLen = lengthOf(to.groupKey);
                if (from !== null && to !== null
                    && from !== to && from.index >= 0 && to.index >= 0
                    && from.index < fromLen && to.index < toLen
                    && unableDragItemIndexes?(!unableDragItemIndexes(groupKey).includes(from.index)):true
                    && unableDragItemIndexes?(!unableDragItemIndexes(groupKey).includes(to.index)):true
                ) {
                    onReorder(from, to);
                }
                dragSource.current = null;
            },
        }

    }, [lengthOf, onReorder, unableDragItemIndexes, resolveInsertSide,ableToDrop,classNames]);

    return useMemo(() => ({ getItemProps }), [getItemProps]);
}