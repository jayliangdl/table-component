# 传统 HTML/JS 到 React 转换指南

## 📝 概述

本文档总结了从传统 HTML + JavaScript 开发模式转换到 React 开发模式的核心思路和技术要点，特别针对 DOM 操作、事件处理、状态管理等关键场景。

## 🎯 核心转换概念

### 1. 开发范式转变

#### 传统 HTML/JS 范式（命令式）
```javascript
// 直接操作 DOM
const element = document.getElementById('myDiv');
element.style.color = 'red';
element.textContent = 'Hello World';
```

#### React 范式（声明式）
```jsx
// 通过状态驱动视图
const [color, setColor] = useState('red');
const [text, setText] = useState('Hello World');

return <div style={{ color }}>{text}</div>;
```

### 2. 思维模式对比

| 传统方式 | React 方式 |
|----------|------------|
| 直接操作 DOM | 通过状态驱动视图 |
| 手动管理元素引用 | 使用 useRef Hook |
| 全局变量存储状态 | useState/useReducer |
| 直接绑定事件监听器 | useEffect + 清理函数 |
| 命令式编程 | 声明式编程 |

## 🔧 核心转换技术

### 1. DOM 元素引用

#### 传统 HTML/JS 方式
```javascript
// HTML
<div id="fixedTableContainer">
  <table id="fixedTable"></table>
</div>
<div id="scrollContainer">
  <table id="scrollTable"></table>
</div>

// JavaScript
const fixedContainer = document.getElementById('fixedTableContainer');
const scrollContainer = document.getElementById('scrollContainer');
const fixedTable = document.getElementById('fixedTable');
const scrollTable = document.getElementById('scrollTable');
```

#### React 转换方式
```tsx
// React 组件
const fixedContainer = useRef<HTMLDivElement>(null);
const scrollContainer = useRef<HTMLDivElement>(null);
const fixedTable = useRef<HTMLTableElement>(null);
const scrollTable = useRef<HTMLTableElement>(null);

// JSX 中绑定 ref
<div ref={fixedContainer}>
  <table ref={fixedTable}></table>
</div>
<div ref={scrollContainer}>
  <table ref={scrollTable}></table>
</div>
```

**转换要点：**
- `document.getElementById()` → `useRef<ElementType>(null)`
- HTML `id` 属性 → JSX `ref` 属性
- 直接变量访问 → `refName.current`

### 2. 事件监听器

#### 传统 HTML/JS 方式
```javascript
// 滚动同步事件
scrollContainer.addEventListener('scroll', () => {
  fixedContainer.scrollTop = scrollContainer.scrollTop;
  syncHeights();
});

// 窗口大小变化事件
window.addEventListener('resize', () => {
  setFixedWidth();
  syncHeights();
});
```

#### React 转换方式
```tsx
useEffect(() => {
  const scrollableContainer = scrollContainer.current;
  const fixedContainer = fixedContainer.current;
  
  if (!scrollableContainer || !fixedContainer) return;
  
  // 事件处理函数
  const handleScroll = () => {
    fixedContainer.scrollTop = scrollableContainer.scrollTop;
    syncHeights();
  };
  
  const handleResize = () => {
    setFixedWidth();
    syncHeights();
  };
  
  // 绑定事件监听器
  scrollableContainer.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  
  // 清理函数 - 重要！
  return () => {
    scrollableContainer.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  };
}, [dependencies]); // 依赖数组
```

**转换要点：**
- 全局事件绑定 → `useEffect` Hook
- 必须添加清理函数防止内存泄漏
- 空值检查：`element.current` 可能为 null
- 合理设置依赖数组

### 3. 状态管理

#### 传统 HTML/JS 方式
```javascript
// 全局变量管理状态
let fixedTableMinWidth = 0;
let scrollableTableMinWidth = 0;
let products = [];

// 直接修改变量
function updateWidth() {
  fixedTableMinWidth = calculateWidth();
  scrollableTableMinWidth = calculateScrollWidth();
  
  // 直接操作 DOM
  fixedContainer.style.width = fixedTableMinWidth + 'px';
}
```

#### React 转换方式
```tsx
// 使用 useState 管理状态
const [fixedTableMinWidth, setFixedTableMinWidth] = useState<number>(0);
const [scrollableTableMinWidth, setScrollableTableMinWidth] = useState<number>(0);
const [products, setProducts] = useState<Product[]>([]);

// 通过状态更新触发重渲染
const updateWidth = () => {
  const newFixedWidth = calculateWidth();
  const newScrollWidth = calculateScrollWidth();
  
  setFixedTableMinWidth(newFixedWidth);
  setScrollableTableMinWidth(newScrollWidth);
};

// JSX 中使用状态
<div style={{ width: `${fixedTableMinWidth}px` }}>
  <table style={{ minWidth: `${fixedTableMinWidth}px` }}>
```

**转换要点：**
- 全局变量 → `useState` Hook
- 直接赋值 → `setState` 函数
- 手动 DOM 更新 → 状态驱动自动更新
- 类型安全：TypeScript 泛型支持

## 📊 具体转换示例

### 示例 1：滚动同步功能

#### 传统方式
```html
<!-- HTML -->
<div id="fixedTableContainer"></div>
<div id="scrollContainer"></div>

<script>
const fixedContainer = document.getElementById('fixedTableContainer');
const scrollContainer = document.getElementById('scrollContainer');

scrollContainer.addEventListener('scroll', () => {
  fixedContainer.scrollTop = scrollContainer.scrollTop;
});
</script>
```

#### React 转换
```tsx
const FixedTable: React.FC = () => {
  const fixedContainer = useRef<HTMLDivElement>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fixed = fixedContainer.current;
    const scrollable = scrollContainer.current;
    
    if (!fixed || !scrollable) {
      console.error('Container refs not properly initialized');
      return;
    }
    
    const handleScroll = () => {
      fixed.scrollTop = scrollable.scrollTop;
    };
    
    scrollable.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollable.removeEventListener('scroll', handleScroll);
    };
  }, []); // 空依赖数组，仅在组件挂载时执行
  
  return (
    <>
      <div ref={fixedContainer}>{/* 固定表格内容 */}</div>
      <div ref={scrollContainer}>{/* 滚动表格内容 */}</div>
    </>
  );
};
```

### 示例 2：动态宽度计算

#### 传统方式
```javascript
function setFixedWidth() {
  const firstRowTh = fixedTable.querySelectorAll('thead tr:first-child th');
  let totalWidth = 0;
  firstRowTh.forEach(th => {
    totalWidth += th.offsetWidth;
  });
  fixedContainer.style.width = totalWidth + 'px';
}

// 初始化调用
setFixedWidth();
```

#### React 转换
```tsx
const [fixedTableMinWidth, setFixedTableMinWidth] = useState<number>(0);

const calculateFixedWidth = useCallback(() => {
  if (fixedTableRef.current) {
    const thead = fixedTableRef.current.querySelector('thead');
    if (thead) {
      const thElements = thead.querySelectorAll('th');
      let totalWidth = 0;
      
      thElements.forEach((th) => {
        totalWidth += th.offsetWidth;
      });
      
      setFixedTableMinWidth(totalWidth);
    }
  }
}, []);

useEffect(() => {
  if (products.length > 0) {
    const timer = setTimeout(() => {
      calculateFixedWidth();
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [products, calculateFixedWidth]);

// JSX 中使用状态
<div style={{ width: `${fixedTableMinWidth}px` }}>
  <table ref={fixedTableRef} style={{ minWidth: `${fixedTableMinWidth}px` }}>
```

### 示例 3：行高同步功能

#### 传统方式
```javascript
function syncHeights() {
  const fixedRows = fixedTable.querySelectorAll('tbody tr');
  const scrollRows = scrollTable.querySelectorAll('tbody tr');
  
  fixedRows.forEach((row, index) => {
    if (scrollRows[index]) {
      row.style.height = scrollRows[index].offsetHeight + 'px';
    }
  });
}

// 在滚动时调用
scrollContainer.addEventListener('scroll', () => {
  fixedContainer.scrollTop = scrollContainer.scrollTop;
  syncHeights(); // 每次滚动都同步
});
```

#### React 转换
```tsx
const syncHeights = useCallback(() => {
  const fixedTable = fixedTableRef.current;
  const scrollableTable = scrollableTableRef.current;
  
  if (!fixedTable || !scrollableTable) return;
  
  const fixedRows = fixedTable.querySelectorAll('tbody tr');
  const scrollRows = scrollableTable.querySelectorAll('tbody tr');
  
  fixedRows.forEach((row, index) => {
    const scrollRow = scrollRows[index];
    if (scrollRow) {
      const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
      (row as HTMLElement).style.height = `${scrollRowHeight}px`;
    }
  });
}, []);

useEffect(() => {
  const scrollableContainer = scrollableTableContainer.current;
  const fixedContainer = fixTableContainer.current;
  
  if (!scrollableContainer || !fixedContainer) return;
  
  const handleScroll = () => {
    fixedContainer.scrollTop = scrollableContainer.scrollTop;
    syncHeights();
  };
  
  scrollableContainer.addEventListener('scroll', handleScroll);
  syncHeights(); // 初始同步
  
  return () => {
    scrollableContainer.removeEventListener('scroll', handleScroll);
  };
}, [products, syncHeights]);
```

## 🚀 高级转换技巧

### 1. 使用 useCallback 优化性能

```tsx
// 避免每次渲染都创建新的函数
const handleScroll = useCallback(() => {
  if (fixedContainer.current && scrollableContainer.current) {
    fixedContainer.current.scrollTop = scrollableContainer.current.scrollTop;
    syncHeights();
  }
}, [syncHeights]);

const syncHeights = useCallback(() => {
  // 同步逻辑
}, []);
```

### 2. 自定义 Hook 封装复用逻辑

```tsx
// 自定义 Hook：滚动同步
const useScrollSync = (
  fixedRef: RefObject<HTMLElement>,
  scrollableRef: RefObject<HTMLElement>
) => {
  useEffect(() => {
    const fixed = fixedRef.current;
    const scrollable = scrollableRef.current;
    
    if (!fixed || !scrollable) return;
    
    const handleScroll = () => {
      fixed.scrollTop = scrollable.scrollTop;
    };
    
    scrollable.addEventListener('scroll', handleScroll);
    return () => scrollable.removeEventListener('scroll', handleScroll);
  }, [fixedRef, scrollableRef]);
};

// 使用自定义 Hook
const MyComponent = () => {
  const fixedRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  
  useScrollSync(fixedRef, scrollableRef);
  
  return (
    <>
      <div ref={fixedRef}>固定内容</div>
      <div ref={scrollableRef}>滚动内容</div>
    </>
  );
};
```

### 3. 错误边界和防御性编程

```tsx
const safeOperation = () => {
  try {
    const element = elementRef.current;
    if (!element) {
      console.warn('Element ref is null');
      return;
    }
    
    // 执行 DOM 操作
    element.style.height = '100px';
  } catch (error) {
    console.error('DOM operation failed:', error);
  }
};
```

## ⚠️ 常见陷阱和注意事项

### 1. Ref 的异步特性

```tsx
// ❌ 错误：在组件挂载前访问 ref
const MyComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // 这里 elementRef.current 是 null
  console.log(elementRef.current); // null
  
  useEffect(() => {
    // ✅ 正确：在 useEffect 中访问 ref
    console.log(elementRef.current); // HTMLDivElement
  }, []);
  
  return <div ref={elementRef}>Content</div>;
};
```

### 2. 事件监听器清理

```tsx
// ❌ 错误：忘记清理事件监听器
useEffect(() => {
  const handleResize = () => {
    // 处理逻辑
  };
  
  window.addEventListener('resize', handleResize);
  // 忘记清理，会导致内存泄漏
}, []);

// ✅ 正确：添加清理函数
useEffect(() => {
  const handleResize = () => {
    // 处理逻辑
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### 3. 依赖数组管理

```tsx
// ❌ 错误：遗漏依赖
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 始终是 0
  }, 1000);
  
  return () => clearInterval(timer);
}, []); // 遗漏 count 依赖

// ✅ 正确：包含所有依赖
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 正确的当前值
  }, 1000);
  
  return () => clearInterval(timer);
}, [count]); // 包含 count 依赖
```

### 4. TypeScript 类型安全

```tsx
// ✅ 使用正确的类型声明
const tableRef = useRef<HTMLTableElement>(null);
const containerRef = useRef<HTMLDivElement>(null);

// ✅ 类型断言（确保类型安全）
const element = tableRef.current as HTMLTableElement;
const row = element.querySelector('tr') as HTMLTableRowElement;
```

## 📋 转换检查清单

### ✅ DOM 操作转换
- [ ] `document.getElementById()` → `useRef()`
- [ ] 直接 DOM 样式设置 → 状态驱动样式
- [ ] 手动元素查询 → ref 引用

### ✅ 事件处理转换
- [ ] `addEventListener()` → `useEffect()`
- [ ] 事件监听器清理 → `return` 清理函数
- [ ] 全局事件 → 组件内 `useEffect`

### ✅ 状态管理转换
- [ ] 全局变量 → `useState`
- [ ] 直接赋值 → `setState` 函数
- [ ] 手动 DOM 更新 → 状态驱动更新

### ✅ 性能优化
- [ ] 函数缓存 → `useCallback`
- [ ] 重复逻辑 → 自定义 Hook
- [ ] 依赖管理 → 正确的依赖数组

### ✅ 类型安全
- [ ] TypeScript 类型声明
- [ ] Ref 类型泛型
- [ ] 防御性编程

## 📚 扩展学习

- [React Hooks 官方文档](https://react.dev/reference/react)
- [useRef Hook 详解](https://react.dev/reference/react/useRef)
- [useEffect Hook 详解](https://react.dev/reference/react/useEffect)
- [自定义 Hook 最佳实践](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**总结**: 从传统 HTML/JS 到 React 的转换核心是从命令式编程转向声明式编程，通过状态管理和 Hook 系统实现更优雅和可维护的代码结构。掌握 `useRef`、`useEffect`、`useState` 等核心 Hook 是成功转换的关键。