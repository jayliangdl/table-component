// import React,{useRef,useEffect} from "react";
// import RowCore2 from "./RowCore2";
// import type { RowCore2Props } from "./RowCore2";
// import styles from "./DraggableRow.module.css"
// /**
//  * 可拖拽的行组件，基于 react-beautiful-dnd 实现
//  * 本组件包裹了 RowCore 组件，并为其提供拖拽功能
//  */
// interface DraggableRowProps2 extends RowCore2Props{
//   index:number;
//   onColumnDrop: (from: number, to: number) => void;
// }




// const DraggableRow2:React.FC<RowCore2Props> = ({index,onColumnDrop,...rowCoreProps})=>{
//   const {product} = rowCoreProps;

//   const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
//   const dragSrcIdx = useRef<number | null>(null);

//   useEffect(() => {
//     rowRefs.current.forEach((row, idx) => {
//       if (!row) return;
//       // 清理旧事件
//       row.ondragstart = null;
//       row.ondragover = null;
//       row.ondragleave = null;
//       row.ondrop = null;

//       row.setAttribute("draggable", "true");

//       row.ondragstart = (e) => {
//         dragSrcIdx.current = idx;
//         e.dataTransfer!.effectAllowed = "move";
//         e.dataTransfer!.setData("text/plain", String(idx)); // 必须设置一些数据，否则某些浏览器（如Firefox）可能无法正确触发拖放
//       };
//       row.ondragover = (e) => {
//         e.preventDefault();
//         row.classList.add(styles.dragOver);
//       };
//       row.ondragleave = () => {
//         row.classList.remove(styles.dragOver);
//       };
//       row.ondrop = (e) => {
//         e.preventDefault();
//         row.classList.remove(styles.dragOver);
//         const from = Number(e.dataTransfer!.getData("text/plain")); // 关键：读取索引
//         const to = idx;
//         if (from !== null && from !== to) {
//           onColumnDrop(from, to);
//         }
//         dragSrcIdx.current = null;
//       };
//     });
//     // 清理函数
//     return () => {
//       rowRefs.current.forEach((row) => {
//         if (!row) return;
//         row.ondragstart = null;
//         row.ondragover = null;
//         row.ondragleave = null;
//         row.ondrop = null;
//       });
//     };
//   }, [product, onColumnDrop]);

//   return (
    
//         <RowCore2 
//           className={styles.rowDraggable} 
//           {...rowCoreProps} 
//           draggable={true}
//           ref={(el) => (rowRefs.current[index] = el)}
//           />
//   )
// }

// export default DraggableRow2;