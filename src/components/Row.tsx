import React from "react";
import DraggableRow from "./DraggableRow";
//使用 React.memo 进行性能优化，避免不必要的重复渲染（仅当组件入参变化时才重新渲染）
// export default React.memo(Row);
/**
 * 为确保只有在 product 或 columnsConfigs 或 isEditing 发生变化时才重新渲染组件，我们可以提供一个自定义的比较函数给 React.memo。
 * 背景：发现即使增加了React.memo包裹着Row组件，还是会频繁渲染，例如表格中仅对某记录进行编辑，但是保存或取消时，整个表格都会重新渲染。
 * 所以定义了以下函数，仅当只有在 product 或 columnsConfigs 或 isEditing 发生变化时才重新渲染组件。
 */
export default React.memo(DraggableRow, (prevProps, nextProps) => {
  return prevProps.product === nextProps.product && prevProps.columnsConfigs===nextProps.columnsConfigs
  && prevProps.isEditing === nextProps.isEditing;
});