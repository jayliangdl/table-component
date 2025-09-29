# GroupByCondition 组件文档

## 功能概述
`GroupByCondition` 是一个用于动态配置分组条件的 React 组件。用户可以通过弹窗界面选择分组字段及排序方式，并将分组条件应用到数据表格中。组件支持以下功能：

- 动态添加、删除分组条件。
- 支持字段选择和排序方式（升序/降序）的配置。
- 提供“确定”和“取消”交互逻辑，确保用户未确认的修改不会影响当前分组条件。
- 限制最大分组数量，避免用户配置过多分组条件。
- 通过事件服务触发分组条件的提交。
- **支持异步加载字段选项**，通过回调函数动态获取可用字段列表。

---

## 组件能力

### 1. 动态分组条件管理
- 用户可以动态添加或删除分组条件。
- 每个分组条件包含两个部分：
  - **字段选择器**：从可用字段中选择分组字段。
  - **排序选择器**：选择升序或降序排序。

### 2. 状态管理
- **实时状态**：`groupByColumns`，用于存储弹窗中当前的分组条件。
- **确认状态**：`currentGroupByColumns`，用于存储用户点击“确定”按钮后确认的分组条件。
- **删除按钮悬停状态**：`deleteButtonHovered`，用于控制删除按钮的悬停样式。

### 3. 弹窗交互逻辑
- 弹窗打开时，初始化分组条件为上次确认的分组条件。
- 弹窗关闭时，恢复分组条件为上次确认的分组条件。
- 用户点击“确定”按钮后，更新确认状态并触发分组条件提交事件。

### 4. 异步字段加载
- 使用 `columnsOptions` 属性作为回调函数，动态获取字段选项。
- 支持异步操作，例如从服务器加载字段数据。

### 5. 事件触发
- 使用 `EventService` 触发 `onGroupSubmit` 事件，将分组条件传递给外部。

---

## 关键设计逻辑

### 1. 状态管理
- **`groupByColumns`**：
  - 用于存储弹窗中实时编辑的分组条件。
  - 在弹窗打开时初始化为 `currentGroupByColumns`。
  - 在弹窗关闭时恢复为 `currentGroupByColumns`。
- **`currentGroupByColumns`**：
  - 用于存储用户点击“确定”按钮后确认的分组条件。
  - 确保未确认的修改不会影响当前分组条件。

### 2. 分组条件的动态渲染
- 使用 `map` 方法动态渲染每个分组条件的字段选择器和排序选择器。
- 通过 `filter` 方法过滤掉已选择的字段，避免重复选择。

### 3. 最大分组数量限制
- 使用常量 `MAX_GROUP_BY_LEVEL` 限制分组条件的最大数量。
- 当分组条件数量达到上限时，禁用“添加更多”按钮。

### 4. 删除按钮悬停样式
- 使用 `deleteButtonHovered` 数组存储每个删除按钮的悬停状态。
- 在 `onMouseEnter` 和 `onMouseLeave` 事件中动态更新悬停状态。

### 5. 确认与取消逻辑
- 点击“确定”按钮时：
  - 过滤掉未选择字段的分组条件。
  - 更新 `currentGroupByColumns`。
  - 触发 `onGroupSubmit` 事件。
- 点击“取消”或关闭弹窗时：
  - 恢复 `groupByColumns` 为 `currentGroupByColumns`。

---

## 调用说明

### 1. 属性说明
| 属性名                | 类型                                   | 必填 | 说明                     |
|---------------------|------------------------------------|------|------------------------|
| `columnsOptions`    | `() => Promise<{ label: string; value: string }[]>` | 是   | 异步回调函数，用于动态获取可供选择的分组字段列表。 |
| `onSubmit`          | `(groupByColumns: { column: string; sort: string }[]) => void` | 是   | 点击“确定”按钮时的回调函数。 |
| `initialGroupByColumns` | `{ column: string; sort: string }[]` | 否   | 弹窗初始化时的分组条件。       |

### 2. 使用示例

```tsx
import React from 'react';
import GroupByCondition from './GroupByCondition';

const Example = () => {
  const columnsOptions = async () => {
    // 模拟异步加载字段选项
    return [
      { label: 'Column 1', value: 'column1' },
      { label: 'Column 2', value: 'column2' },
      { label: 'Column 3', value: 'column3' },
    ];
  };

  const handleGroupSubmit = (groupByColumns) => {
    console.log('分组条件已提交：', groupByColumns);
  };

  return (
    <GroupByCondition
      columnsOptions={columnsOptions}
      onSubmit={handleGroupSubmit}
      initialGroupByColumns={[]}
    />
  );
};

export default Example;
```

---

## 注意事项
1. **分组条件的唯一性**：
   - 同一字段不能重复选择。
   - 通过过滤已选择字段实现。
2. **最大分组数量限制**：
   - 默认限制为 `MAX_GROUP_BY_LEVEL`。
   - 超过限制时，“添加更多”按钮会被禁用。
3. **未确认修改的恢复**：
   - 用户未点击“确定”按钮时，关闭弹窗会恢复到上次确认的分组条件。

---

## 未来优化方向
1. **支持字段动态加载**：
   - 当前字段列表为静态传入，可扩展为动态加载。
2. **分组条件的校验**：
   - 增加对分组条件的校验逻辑，例如字段是否有效。
3. **样式优化**：
   - 提供更多自定义样式的能力，支持主题切换。