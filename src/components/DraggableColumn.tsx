import type { ColumnConfig } from "../types/editableCell";
import { useRef, useEffect } from "react";
import styles from "./DraggableColumn.module.css"; // 假设你用 CSS Modules

interface DraggableColumnProps {
  columnsConfigs: ColumnConfig[];
  onColumnDrop: (from: number, to: number) => void;
}
const DraggableColumn: React.FC<DraggableColumnProps> = ({
  columnsConfigs,
  onColumnDrop,
}) => {
  const thRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const dragSrcIdx = useRef<number | null>(null);

  useEffect(() => {
    thRefs.current.forEach((th, idx) => {
      if (!th) return;
      // 清理旧事件
      th.ondragstart = null;
      th.ondragover = null;
      th.ondragleave = null;
      th.ondrop = null;

      th.setAttribute("draggable", "true");

      th.ondragstart = (e) => {
        dragSrcIdx.current = idx;
        e.dataTransfer!.effectAllowed = "move";
      };
      th.ondragover = (e) => {
        e.preventDefault();
        th.classList.add(styles.dragOver);
      };
      th.ondragleave = () => {
        th.classList.remove(styles.dragOver);
      };
      th.ondrop = (e) => {
        e.preventDefault();
        th.classList.remove(styles.dragOver);
        const from = dragSrcIdx.current;
        const to = idx;
        if (from !== null && from !== to) {
          onColumnDrop(from, to);
        }
        dragSrcIdx.current = null;
      };
    });
    // 清理函数
    return () => {
      thRefs.current.forEach((th) => {
        if (!th) return;
        th.ondragstart = null;
        th.ondragover = null;
        th.ondragleave = null;
        th.ondrop = null;
      });
    };
  }, [columnsConfigs, onColumnDrop]);
  return (
    <thead>
      <tr
        style={{
          backgroundColor: "#f5f5f5",
          position: "sticky", // Jay-固定表头，重要~！
          top: 0, // Jay-固定在顶部，重要~！
          zIndex: 1, // 确保在内容之上
        }}
      >
        {columnsConfigs.map((columnConfig, index) => {
          return (
            <th className={styles.thDraggable} draggable="true" 
            ref={(el) => (thRefs.current[index] = el)} key={columnConfig.columnName}>
              <span>{columnConfig.title}</span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default DraggableColumn;
