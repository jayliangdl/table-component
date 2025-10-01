# useDraggable 钩子函数文档

## 概述
`useDraggable` 是一个自定义 React 钩子函数，为表格行和列提供拖拽功能。它抽象了复杂的拖放操作逻辑，使得在不同组件中实现拖拽排序功能变得简单，避免了代码重复。这个钩子函数特别适用于需要通过拖拽重新排序行或列的表格组件。

## 背景
表格组件通常需要通过拖拽交互来重新排序行或列。为每个组件从头实现这个功能会导致代码重复和维护困难。`useDraggable` 钩子函数封装了拖放逻辑，提供了一个可重用的解决方案，可以应用于不同的表格实现。

## 设计理念
`useDraggable` 钩子函数的设计遵循以下原则：

1. **可重用性**：可用于行和列的重新排序。
2. **灵活性**：支持拖拽过程中不同的视觉反馈样式。
3. **类型安全**：使用 TypeScript 泛型确保类型安全。
4. **分组支持**：处理不同分组内的元素，并可限制跨分组拖拽。
5. **视觉反馈**：为拖拽操作提供清晰的视觉提示（前/后插入指示器）。
6. **自定义逻辑**：允许自定义逻辑来判断元素是否可以放置在特定位置。

## API 参考

### 导入
```typescript
import { useDraggable } from '../service/useDraggable';
```

### 类型定义

```typescript
export type InsertSide = "before" | "after" | null;

export interface DraggableEndPoint<K, T>{
  index: number;      // 元素在其分组中的索引
  groupKey: K;        // 分组标识符（如果没有分组可以是 undefined）
  record: T;          // 与可拖拽元素关联的数据记录
}

export interface DraggableProps<K, T> {
  lengthOf: (groupKey: K) => number;  // 获取分组中元素数量的函数
  onReorder: (from: DraggableEndPoint<K, T>, to: DraggableEndPoint<K, T>) => void;  // 重新排序时调用的回调
  unableDragItemIndexes?: (groupKey: K) => number[];  // 获取不可拖拽项索引的函数
  ableToDrop?: (from: DraggableEndPoint<K, T>, to: DraggableEndPoint<K, T>) => boolean;  // 判断是否允许拖放的函数
  resolveInsertSide: (e: React.DragEvent<HTMLElement>, el: HTMLElement) => InsertSide;  // 决定插入指示器位置的函数
  classNames?: {
    overOk?: string;       // 有效放置目标的 CSS 类
    insertBefore?: string; // 插入指示器（前）的 CSS 类
    insertAfter?: string;  // 插入指示器（后）的 CSS 类
    targetBase?: string;   // 可拖拽元素的基础 CSS 类
  };
}
```

### 参数

| 参数 | 类型 | 必填 | 描述 |
|-----------|------|----------|-------------|
| `lengthOf` | `(groupKey: K) => number` | 是 | 返回给定分组中元素数量的函数。对于列，这是列的总数；对于行，这是特定分组中行的数量。 |
| `onReorder` | `(from: DraggableEndPoint<K, T>, to: DraggableEndPoint<K, T>) => void` | 是 | 拖拽操作成功完成时调用的回调函数。提供重新排序操作的源和目标信息。 |
| `unableDragItemIndexes` | `(groupKey: K) => number[]` | 否 | 返回特定分组内不应可拖拽的索引数组。用于固定某些行或列。 |
| `ableToDrop` | `(from: DraggableEndPoint<K, T>, to: DraggableEndPoint<K, T>) => boolean` | 否 | 判断拖拽元素是否可以放置在特定位置。可用于防止跨分组拖拽或其他自定义限制。 |
| `resolveInsertSide` | `(e: React.DragEvent<HTMLElement>, el: HTMLElement) => InsertSide` | 是 | 决定插入指示器应出现在目标元素前还是后。对于行，通常基于 Y 位置；对于列，基于 X 位置。 |
| `classNames` | Object | 否 | 应用于各种拖拽状态的 CSS 类名。 |
| `classNames.targetBase` | `string` | 否 | 可拖拽元素的基础类名（例如，设置 position: relative）。 |
| `classNames.overOk` | `string` | 否 | 悬停在有效放置目标上时应用的类名。 |
| `classNames.insertBefore` | `string` | 否 | 显示目标元素前插入指示器的类名。 |
| `classNames.insertAfter` | `string` | 否 | 显示目标元素后插入指示器的类名。 |

### 返回值

```typescript
{
  getItemProps: (index: number, currentRecord: T, groupKey: K) => {
    draggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
    onDrop: (e: React.DragEvent<HTMLElement>) => void;
  }
}
```

钩子函数返回一个对象，其中包含 `getItemProps` 方法，该方法生成使元素可拖拽所需的所有属性。这些属性应该展开到你想要使可拖拽的元素上。

## 使用示例

### 行拖拽

```tsx
// 行拖拽
const { getItemProps: getDraggableRowProps } = useDraggable({
  lengthOf, // 获取分组中行数量的函数
  onReorder, // 行重新排序时的回调
  ableToDrop, // 判断行是否可以放置在特定位置的函数
  resolveInsertSide: resolveInsertSideRows, // 决定是显示前/后指示器
  classNames: classNamesRows // 视觉反馈的 CSS 类
});

// 在渲染函数中
{data.map((row, index) => {
  const props = getDraggableRowProps(index, row, groupKey);
  return (
    <div key={row.id} style={dataRowStyle} {...props}>
      <Row2
        columnsConfig={columnsConfig}
        product={row}
        indentW={indentW}
        freezeCount={freezeCount}
        isEditing={false}
        isSaving={false}
        groupKey={groupKey}
        onRowDrop={handleRowDrop}
      />
    </div>
  );
})}
```

### 列拖拽

```tsx
// 列拖拽
const { getItemProps: getDraggableColumnProps } = useDraggable({
  lengthOf: lengthOfColumns, // 获取列总数的函数
  onReorder: onReorderColumns, // 列重新排序时的回调
  ableToDrop: ableToDropColumns, // 判断列是否可以放置在特定位置的函数
  resolveInsertSide: resolveInsertSideColumns, // 决定是显示左/右指示器
  classNames: classNamesColumns // 视觉反馈的 CSS 类
});

// 在渲染函数中
{columnsConfig.map((col, ci) => {
  const dragColumnProps = getDraggableColumnProps(ci, col, undefined);
  return (
    <HeaderCell
      key={col.columnName}
      width={col.style?.width || 100}
      left={ci < freezeCount ? accLeft : undefined}
      sticky={ci < freezeCount}
      {...dragColumnProps}
    >
      {col.title}
    </HeaderCell>
  );
})}
```

## 视觉反馈

`useDraggable` 钩子函数与 CSS 集成，在拖拽操作期间提供视觉反馈。这通过 `classNames` 参数和 `Table2.module.css` 中定义的 CSS 控制。

### CSS 类

```css
/* 可拖拽元素的基础类 */
.drag-target {
  position: relative;
}

/* 有效放置目标的高亮 */
.drag-over-ok {
  outline: 0;
  box-shadow: inset 0 0 0 2px rgba(254, 98, 178, .18);
}

/* 行插入指示器 */
.drag-insert-before::before {
  content: "";
  position: absolute;
  left: 0; right: 0; top: -1px;
  border-top: 4px solid rgb(254, 98, 178);
  box-shadow: 0 0 6px rgba(254, 98, 178, .6);
  pointer-events: none;
}

.drag-insert-after::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  border-bottom: 4px solid rgb(254, 98, 178);
  box-shadow: 0 0 6px rgba(254, 98, 178, .6);
  pointer-events: none;
}

/* 列插入指示器 */
.col-insert-before::before {
  content: "";
  position: absolute;
  top: 0; bottom: 0; left: -1px;
  border-left: 4px solid rgb(254, 98, 178);
  box-shadow: 0 0 6px rgba(254, 98, 178, .6);
  pointer-events: none;
}

.col-insert-after::after {
  content: "";
  position: absolute;
  top: 0; bottom: 0; right: -1px;
  border-right: 4px solid rgb(254, 98, 178);
  box-shadow: 0 0 6px rgba(254, 98, 178, .6);
  pointer-events: none;
}
```

## 关键实现细节

### 拖拽开始
拖拽开始时，源元素的信息存储在 `dragSource.current` 中，以便在放置操作期间使用。

### 拖拽悬停
当拖拽元素移动到潜在放置目标上时：
1. 应用/移除 CSS 类以显示有效放置目标
2. `resolveInsertSide` 函数决定是显示"前"还是"后"插入指示器
3. `ableToDrop` 函数判断是否允许在当前目标放置

### 放置
当元素被放置时：
1. 清理 CSS 类
2. 验证源和目标信息
3. 如果放置有效，调用 `onReorder` 回调更新数据

## 常见模式

### 防止跨分组拖拽
防止元素在不同分组之间拖拽：

```typescript
const ableToDrop = (from, to) => {
  // 只允许在同一分组内拖拽
  return from.groupKey === to.groupKey;
};
```

### 行与列的不同插入指示器
对于行，插入指示器通常是水平的（上/下），而对于列，是垂直的（左/右）。

```typescript
// 对于行
const resolveInsertSideRows = (e, el) => {
  const r = el.getBoundingClientRect();
  return e.clientY > r.top + r.height / 2 ? "after" : "before";
};

// 对于列
const resolveInsertSideColumns = (e, el) => {
  const r = el.getBoundingClientRect();
  return e.clientX > r.left + r.width / 2 ? "after" : "before";
};
```

### 固定元素（不可拖拽）
使特定元素不可拖拽（如冻结列）：

```typescript
const unableDragItemIndexes = (groupKey) => {
  // 使前 3 列不可拖拽
  return [0, 1, 2];
};
```

## 故障排除

### 事件处理器类型错误
确保 `useDraggable.ts` 中的事件类型与 React 的预期类型匹配：

```typescript
onDragStart: (e: React.DragEvent<HTMLElement>) => void;
```

### 视觉指示器不显示
检查：
1. CSS 类在 CSS 模块中正确定义
2. 元素设置了 `position: relative`（通常通过 `targetBase` 类）
3. `resolveInsertSide` 函数返回预期的值

### 元素不可拖拽
检查：
1. `draggable` 属性正确应用
2. 元素不在 `unableDragItemIndexes` 列表中
3. 拖拽事件没有被其他事件处理器阻止

## 扩展点

### 自定义视觉反馈
可以通过 `classNames` 参数提供自定义 CSS 类来扩展视觉反馈。

### 额外的拖拽限制
在 `ableToDrop` 函数中实现额外的限制来控制元素何时可以拖拽。

### 重新排序期间的数据转换
在 `onReorder` 回调中，可以实现复杂的数据转换。

## 结论
`useDraggable` 钩子函数为表格提供了灵活、可重用的拖放功能解决方案。通过将拖放逻辑与 UI 组件分离，它允许干净、可维护的代码，适用于各种用例。