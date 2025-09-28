import React,{useRef,useEffect} from "react";
import RowCore2 from "./RowCore2";
import type { RowCore2Props } from "./RowCore2";
import { dragCtx } from "../service/DragContext";
import styles from "./DraggableRow2.module.css"
/**
 * 可拖拽的行组件，基于 react-beautiful-dnd 实现
 * 本组件包裹了 RowCore 组件，并为其提供拖拽功能
 */
interface DraggableRow2Props extends RowCore2Props{
  index:number;
  groupKey:string; //分组的key值
  onRowDrop: (from: number, to: number) => void;
}




const DraggableRow2:React.FC<DraggableRow2Props> = ({index,onRowDrop,groupKey,...rowCoreProps})=>{
  const {product} = rowCoreProps;

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragSrcIdx = useRef<number | null>(null);

  useEffect(() => {
    rowRefs.current.forEach((row, idx) => {
      if (!row) return;
      // 清理旧事件
      row.ondragstart = null;
      row.ondragover = null;
      row.ondragleave = null;
      row.ondrop = null;

      row.setAttribute("draggable", "true");
      row.dataset.groupKey = groupKey;
      row.ondragstart = (e) => {
        dragCtx.fromIndex = index;
        dragCtx.groupKey  = groupKey; 
        dragSrcIdx.current = idx;
        e.dataTransfer!.effectAllowed = "move";
        e.dataTransfer!.setData("text/plain", String(idx)); // 必须设置一些数据，否则某些浏览器（如Firefox）可能无法正确触发拖放
        e.dataTransfer!.setData("application/x-group-key",row.dataset.groupKey || "");
      };
      row.ondragover = (e) => {
        const fromGroup = dragCtx.groupKey;
        const toGroup = row.dataset.groupKey || "";
        if(fromGroup!==toGroup){
          row.classList.remove(styles.dragOver);
          e.dataTransfer!.dropEffect = "none";
          return;
        }
        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";
        row.classList.add(styles.dragOver);
      };
      row.ondragleave = () => {
        row.classList.remove(styles.dragOver);
      };
      row.ondrop = (e) => {
        e.preventDefault();
        row.classList.remove(styles.dragOver);
        const fromGroup = dragCtx.groupKey;
        const toGroup = row.dataset.groupKey || "";
        if(fromGroup!==toGroup){
          dragCtx.fromIndex = null;
          dragCtx.groupKey = "";
          return;
        }
        const from = dragCtx.fromIndex ?? Number(e.dataTransfer!.getData("text/plain")); // 关键：读取索引
        const to = idx;
        if (from !== null && from !== to) {
          onRowDrop(from, to);
        }
        dragCtx.fromIndex = null;
        dragCtx.groupKey = "";
        dragSrcIdx.current = null;
      };
    });
    // 清理函数
    return () => {
      rowRefs.current.forEach((row) => {
        if (!row) return;
        row.ondragstart = null;
        row.ondragover = null;
        row.ondragleave = null;
        row.ondrop = null;
      });
    };
  }, [product, onRowDrop, groupKey]);

  return (
      <RowCore2 {...rowCoreProps} draggable={true} ref={(el) => (rowRefs.current[index] = el)}
      className={styles.rowDraggable} />

        // <RowCore2 
        //   className={styles.rowDraggable} 
        //   {...rowCoreProps} 
        //   draggable={true}
        //   ref={(el) => (rowRefs.current[index] = el)}
        //   />
  )
}

export default DraggableRow2;