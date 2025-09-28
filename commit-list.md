## 20250921 提交代码包含的features:
-添加了用于日期选择的 CustomDate 组件，支持可配置格式。
-引入了用于日期和时间选择的 CustomDatetime 组件，支持可配置格式。
-创建了用于文本输入的 CustomInput 组件，提供基本功能。
-开发了用于数字输入的 CustomInputNumber 组件，支持格式化选项。
-实现了用于下拉选择的 CustomSelect 组件，支持静态和动态选项加载。
-添加了用于多行文本输入的 CustomTextarea 组件，支持自动调整大小功能。
-创建了用于时间选择的 CustomTime 组件，支持可配置格式。
-添加了用于测试操作按钮功能的 ActionButtonClient 组件。
-开发了用于测试 CustomSelect 的 TestCustomSelect 组件，支持静态和动态配置。
-实现了用于管理语言设置和翻译的 LanguageContext。
-创建了用于处理记录保存和删除的 RecordService，集成了 API 功能。
-定义了多种数据表示的显示配置类型。
-增强了可编辑单元格类型以支持新的输入组件。
-添加了默认翻译的国际化支持。
-实现了数据转换和格式化的实用函数。
-开发了选项加载工具，支持动态和静态选项获取。
-实现了表格中记录“展示”和“编辑”两种状态切换。
-增加了Row组件、EditableCell、ActionButton组件等，将原来Table组件写死字段优化成可动态配置。
-初步实现了编辑、保存（包括编辑后又取消）、删除等前端交互（TODO：未接入后端）
-优化了Table组件中记录从编辑状态恢复回展示状态时，行高一并恢复的问题。

## 20250922 提交代码包含的features:
- 初步使用react-beautiful-dnd实现了表格记录可拖拽方式改变顺序（缺陷：由于表格有字段冻结展示/滚动展示能力，使用了双表格实现，在 拖动记录时，鼠标若拖动冻结字段时，拖动动画仅展示冻结相关字段，可滚动字段未联动。需优化，或不支持在冻结字段的情况下更改记录顺序）。
- 初步描写了整个组件的todo list，列出所有待建设能力。
- 为适配第三方包react-beautiful-dnd，更改react版本从19降级到18

## 20250922 第二次提交代码包含的feature：
初步使用react-beautiful-dnd实现表格表头字段可拖拽切换顺序（但是有问题，每个字段拖拽后，都是更换到表格左边第1个字段）

## 20250922 第三次提交代码包含的feature：
重构表格组件中的列拖拽更改顺序功能，不使用第三方组件实现（react-beautiful-dnd），而使用纯html+js方式实现，移除DroppableColumn，添加DraggableColumn以支持列拖拽功能，更新样式和HTML结构

## 20250923:
重构表格组件（不再使用react-beautiful-dnd第三方包），移除DroppableRow，改为使用原生HTML+TS(JS)实现行拖拽功能（核心DraggableRow组件），更新样式和HTML结构，优化性能

## 20250928:
-实现了 Table2 组件，用于渲染带有分组数据、固定表头和固定列的表格。新的Table2组件是用<div>实现表格，而不是像之前Table组件使用<table>，主要是发现数据分类展示上原Table组件无法满足。所以再开发一个新的Table2组件。
-建立了 EventService，用于管理事件订阅和触发。
-添加了 ColumnRefresh 和 DataFetch 操作处理器，用于动态更新数据。