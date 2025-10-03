# Table2Util 文件文档

## 背景
`Table2Util.ts` 文件主要用于支持 `Table2` 组件的复杂逻辑处理。它包含了一些核心的工具函数和接口定义，帮助实现以下功能：

1. **拖拽操作支持**：通过定义 `DraggableEndPointRow` 和 `DraggableEndPointColumn` 接口，支持行和列的拖拽操作。
2. **分组数据管理**：提供了在分组树中查找分组和行的工具函数。
3. **草稿数据合并**：实现了将草稿数据合并到分组数据中的逻辑。
4. **可编辑列支持**：通过 `useEditableColumns` 和 `useDraggableProps` 自定义 Hook，提供了可编辑列和拖拽列的相关处理逻辑。

## 核心逻辑

### 拖拽相关接口

#### `DraggableEndPointRow`
定义了可拖拽行的接口，包含以下字段：
- `index`：行在分组中的索引。
- `groupKey`：分组标识，用于限制跨分组拖拽。
- `record`：行数据。

#### `DraggableEndPointColumn`
定义了可拖拽列的接口，包含以下字段：
- `index`：列的索引。
- `groupKey`：列的分组标识（默认为 `undefined`）。
- `record`：列数据。

### 工具函数

#### `findGroupNodeByUnderGroups`
在分组树中，根据 `underGroups` 路径找到目标分组。

**参数：**
- `groupsRoot`：分组树的根节点数组。
- `underGroups`：目标分组路径。

**返回值：**
找到的目标分组节点，或 `null`（如果未找到）。

#### `findRow`
在分组树中，根据 `underGroups` 路径找到目标分组，并获取分组中的某一行数据。

**参数：**
- `groupsRoot`：分组树的根节点数组。
- `underGroups`：目标行所在的分组路径。
- `indexInGroup`：目标行在分组中的索引。

**返回值：**
包含目标分组、行数据和索引的对象，或 `null`（如果未找到）。

#### `mergeDraftsIntoGroupsById`
将草稿数据合并到分组数据中。

**参数：**
- `groups`：分组数据。
- `draftsById`：草稿数据，使用行 ID 作为键。

**返回值：**
合并后的分组数据。

### 自定义 Hook

#### `useDraggableProps`
提供了拖拽相关的属性和事件处理函数。

**参数：**
- `columnsConfig`：列配置。
- `freezeCount`：冻结列数。
- `groupByColumnNames`：分组列名数组。
- `groups`：分组数据。
- `setGroups`：设置分组数据的函数。
- `setColumnsConfig`：设置列配置的函数。
- `classes`：拖拽相关的样式类名。

**返回值：**
包含拖拽属性和事件处理函数的对象。

#### `useEditableColumns`
提供了可编辑列的相关处理逻辑。

**参数：**
- `freezeCount`：冻结列数。
- `groupByColumnNames`：分组列名数组。
- `setDrafts`：设置草稿数据的函数。
- `setGroups`：设置分组数据的函数。

**返回值：**
包含可编辑列处理逻辑的对象。

## 调用示例

### 使用 `findRow`
```typescript
const rowData = findRow(groups, underGroups, indexInGroup);
if (rowData) {
    const { group, row, index } = rowData;
    console.log("找到的分组：", group);
    console.log("找到的行数据：", row);
    console.log("行索引：", index);
}
```

### 使用 `mergeDraftsIntoGroupsById`
```typescript
const updatedGroups = mergeDraftsIntoGroupsById(groups, drafts);
setGroups(updatedGroups);
```

### 使用 `useDraggableProps`
```typescript
const { getDraggableRowProps, getDraggableColumnProps } = useDraggableProps({
    columnsConfig,
    freezeCount,
    groupByColumnNames,
    groups,
    setGroups,
    setColumnsConfig,
    classes: {
        row: {
            targetBase: "drag-target",
            overOk: "drag-over-ok",
            insertBefore: "drag-insert-before",
            insertAfter: "drag-insert-after",
        },
        column: {
            targetBase: "drag-target",
            overOk: "drag-over-ok",
            insertBefore: "col-insert-before",
            insertAfter: "col-insert-after",
        }
    }
});
```

### 使用 `useEditableColumns`
```typescript
const {
    isColumnEditable,
    handleCellChange,
    handleRowEdit,
    handleRowCancel,
    handleRowSave,
    handleRowDelete
} = useEditableColumns({
    freezeCount,
    groupByColumnNames,
    setDrafts,
    setGroups,
});
```

## 总结
`Table2Util.ts` 文件为 `Table2` 组件提供了核心的工具函数和自定义 Hook，支持复杂的分组数据管理、拖拽操作和可编辑列功能。通过这些工具函数和 Hook，可以大大简化组件的逻辑，实现更高效的开发和维护。