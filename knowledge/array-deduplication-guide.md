# JavaScript/TypeScript 数组去重完整指南

## 📋 目录
1. [基础去重方案](#基础去重方案)
2. [对象数组去重](#对象数组去重)
3. [复杂场景去重](#复杂场景去重)
4. [性能对比分析](#性能对比分析)
5. [实际应用案例](#实际应用案例)
6. [常见问题解答](#常见问题解答)

---

## 基础去重方案

### 1. 简单数组去重（基本类型）

#### 方案一：Set + Array.from（推荐）
```javascript
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = Array.from(new Set(numbers));
// 结果: [1, 2, 3, 4, 5]

// 或者使用扩展运算符
const uniqueNumbers2 = [...new Set(numbers)];
```

**优点**：
- 代码简洁
- 性能优秀
- ES6 标准方案

**缺点**：
- 只适用于基本类型（string, number, boolean）
- 不适用于对象比较

#### 方案二：filter + indexOf
```javascript
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = numbers.filter((item, index) => numbers.indexOf(item) === index);
```

**优点**：
- 兼容性好（ES5）
- 逻辑清晰

**缺点**：
- 性能相对较差（O(n²)）

#### 方案三：reduce 累加器
```javascript
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = numbers.reduce((acc, current) => {
  if (!acc.includes(current)) {
    acc.push(current);
  }
  return acc;
}, []);
```

### 2. 字符串数组去重

```javascript
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana'];

// 方案一：Set（推荐）
const uniqueFruits = [...new Set(fruits)];
// 结果: ['apple', 'banana', 'orange']

// 方案二：Map 记录出现次数
const fruitMap = new Map();
fruits.forEach(fruit => {
  fruitMap.set(fruit, (fruitMap.get(fruit) || 0) + 1);
});
const uniqueFruits2 = Array.from(fruitMap.keys());
```

---

## 对象数组去重

### 1. 根据单个属性去重

#### 您的原始问题：产品类别去重
```typescript
// ❌ 问题代码：会产生重复
const categories: {value: string, label: string}[] = [];
products.forEach(product => {
  categories.push({
    value: product.category,
    label: product.category
  });
});

// ✅ 解决方案一：Set + map（推荐）
const uniqueCategories = Array.from(
  new Set(products.map(product => product.category))
).map(category => ({
  value: category,
  label: category
}));

// ✅ 解决方案二：reduce
const uniqueCategories2 = products.reduce((acc, product) => {
  if (!acc.find(item => item.value === product.category)) {
    acc.push({
      value: product.category,
      label: product.category
    });
  }
  return acc;
}, [] as {value: string, label: string}[]);

// ✅ 解决方案三：Map 优化版
const categoryMap = new Map();
products.forEach(product => {
  if (!categoryMap.has(product.category)) {
    categoryMap.set(product.category, {
      value: product.category,
      label: product.category
    });
  }
});
const uniqueCategories3 = Array.from(categoryMap.values());
```

### 2. 根据多个属性去重

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', department: 'IT' },
  { id: 2, name: 'Bob', email: 'bob@example.com', department: 'HR' },
  { id: 3, name: 'Alice', email: 'alice@example.com', department: 'IT' }, // 重复
  { id: 4, name: 'Charlie', email: 'charlie@example.com', department: 'IT' }
];

// 方案一：根据 name + email 组合去重
const uniqueUsers = users.filter((user, index, arr) => {
  return arr.findIndex(u => u.name === user.name && u.email === user.email) === index;
});

// 方案二：使用 Map 以组合键去重
const userMap = new Map();
users.forEach(user => {
  const key = `${user.name}-${user.email}`;
  if (!userMap.has(key)) {
    userMap.set(key, user);
  }
});
const uniqueUsers2 = Array.from(userMap.values());

// 方案三：自定义比较函数
function deduplicateBy<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const uniqueUsers3 = deduplicateBy(users, user => `${user.name}-${user.email}`);
```

### 3. 根据对象深度比较去重

```typescript
// 深度比较函数
function deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// 深度去重
function deepDeduplicate<T>(array: T[]): T[] {
  return array.filter((item, index) => {
    return array.findIndex(otherItem => deepEqual(item, otherItem)) === index;
  });
}

// 使用示例
const complexObjects = [
  { user: { name: 'Alice', age: 25 }, preferences: { theme: 'dark' } },
  { user: { name: 'Bob', age: 30 }, preferences: { theme: 'light' } },
  { user: { name: 'Alice', age: 25 }, preferences: { theme: 'dark' } }, // 重复
];

const uniqueComplexObjects = deepDeduplicate(complexObjects);
```

---

## 复杂场景去重

### 1. 保留最新/最旧记录

```typescript
interface Product {
  id: number;
  name: string;
  category: string;
  updatedAt: Date;
}

// 保留最新记录
function keepLatest(products: Product[]): Product[] {
  const latestMap = new Map<string, Product>();
  
  products.forEach(product => {
    const existing = latestMap.get(product.name);
    if (!existing || product.updatedAt > existing.updatedAt) {
      latestMap.set(product.name, product);
    }
  });
  
  return Array.from(latestMap.values());
}
```

### 2. 优先级去重

```typescript
interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'guest';
  priority: number;
}

// 根据邮箱去重，保留优先级最高的
function deduplicateByPriority(users: User[]): User[] {
  const userMap = new Map<string, User>();
  
  users.forEach(user => {
    const existing = userMap.get(user.email);
    if (!existing || user.priority > existing.priority) {
      userMap.set(user.email, user);
    }
  });
  
  return Array.from(userMap.values());
}
```

### 3. 模糊匹配去重

```typescript
// 基于相似度的去重
function fuzzyDeduplicate(names: string[], threshold = 0.8): string[] {
  function similarity(str1: string, str2: string): number {
    // 简单的相似度计算（可以使用更复杂的算法）
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  return names.filter((name, index) => {
    return !names.slice(0, index).some(prevName => 
      similarity(name.toLowerCase(), prevName.toLowerCase()) >= threshold
    );
  });
}

// 使用示例
const similarNames = ['iPhone 12', 'iPhone12', 'iphone 12', 'Samsung Galaxy'];
const uniqueNames = fuzzyDeduplicate(similarNames, 0.8);
```

---

## 性能对比分析

### 1. 不同方案的时间复杂度

| 方案 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|-----------|-----------|----------|
| Set + Array.from | O(n) | O(n) | 基本类型，性能要求高 |
| filter + indexOf | O(n²) | O(n) | 小数据量，兼容性要求 |
| reduce + includes | O(n²) | O(n) | 需要自定义逻辑 |
| Map 方案 | O(n) | O(n) | 对象去重，复杂键 |
| 深度比较 | O(n²) | O(n) | 复杂对象，小数据量 |

### 2. 性能测试示例

```typescript
// 性能测试函数
function performanceTest() {
  const largeArray = Array.from({ length: 100000 }, (_, i) => Math.floor(i / 10));
  
  console.time('Set方案');
  const result1 = [...new Set(largeArray)];
  console.timeEnd('Set方案');
  
  console.time('filter+indexOf方案');
  const result2 = largeArray.filter((item, index) => largeArray.indexOf(item) === index);
  console.timeEnd('filter+indexOf方案');
  
  console.time('reduce方案');
  const result3 = largeArray.reduce((acc, current) => {
    if (!acc.includes(current)) acc.push(current);
    return acc;
  }, []);
  console.timeEnd('reduce方案');
}

// 运行测试
performanceTest();
```

---

## 实际应用案例

### 1. React 组件中的选项去重（您的场景）

```typescript
// 原始问题的完整解决方案
const TableSample: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  
  // 方案一：使用 useMemo 优化性能
  const uniqueCategories = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return Array.from(
      new Set(products.map(product => product.category))
    )
    .sort() // 按字母排序
    .map(category => ({
      value: category,
      label: category
    }));
  }, [products]);
  
  // 方案二：使用 useEffect（如果需要额外处理）
  useEffect(() => {
    if (!products || products.length === 0) {
      setCategories([]);
      return;
    }
    
    const uniqueCategories = Array.from(
      new Set(products.map(product => product.category))
    ).map(category => ({
      value: category,
      label: category
    }));
    
    setCategories(uniqueCategories);
    console.log('去重后的类别数量:', uniqueCategories.length);
  }, [products]);
  
  // 处理选择变化
  const handleChange = (value: string) => {
    console.log(`Selected category: ${value}`);
    // 添加筛选逻辑
  };
  
  return (
    <Select
      defaultValue="all"
      style={{ width: 120 }}
      onChange={handleChange}
      options={[
        { value: 'all', label: '全部类别' },
        ...uniqueCategories
      ]}
    />
  );
};
```

### 2. API 数据去重

```typescript
// API 响应数据去重
async function fetchAndDeduplicateUsers() {
  try {
    const response = await fetch('/api/users');
    const users: User[] = await response.json();
    
    // 根据邮箱去重，保留最新记录
    const uniqueUsers = users
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((user, index, arr) => 
        arr.findIndex(u => u.email === user.email) === index
      );
    
    return uniqueUsers;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}
```

### 3. 表单数据去重

```typescript
// 表单选项去重和格式化
function processFormOptions(rawOptions: any[]): SelectOption[] {
  return rawOptions
    .filter(option => option && option.label) // 过滤无效数据
    .map(option => ({
      value: option.value || option.id,
      label: option.label || option.name,
      disabled: option.disabled || false
    }))
    .filter((option, index, arr) => 
      arr.findIndex(o => o.value === option.value) === index
    ) // 去重
    .sort((a, b) => a.label.localeCompare(b.label)); // 排序
}
```

---

## 常见问题解答

### Q1: 为什么 Set 方案对对象无效？
```typescript
const objects = [
  { id: 1, name: 'Alice' },
  { id: 1, name: 'Alice' } // 内容相同但是不同的对象引用
];

console.log([...new Set(objects)]); // 仍然是 2 个元素！

// 原因：Set 比较的是引用，不是内容
console.log({id: 1} === {id: 1}); // false
```

### Q2: 如何处理 null 和 undefined？
```typescript
const dataWithNulls = [1, null, 2, undefined, 1, null, 3];

// 方案一：保留 null/undefined
const unique1 = [...new Set(dataWithNulls)];
// 结果: [1, null, 2, undefined, 3]

// 方案二：过滤掉 null/undefined
const unique2 = [...new Set(dataWithNulls.filter(item => item != null))];
// 结果: [1, 2, 3]
```

### Q3: 大数据量时如何优化性能？
```typescript
// 对于超大数据量，考虑分批处理
function batchDeduplicate<T>(array: T[], batchSize = 10000): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    batch.forEach(item => {
      if (!seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    });
  }
  
  return result;
}
```

### Q4: 如何保持原始顺序？
```typescript
// Set 天然保持插入顺序（ES2015+）
const ordered = [...new Set([3, 1, 4, 1, 5, 9, 2, 6, 5])];
// 结果: [3, 1, 4, 5, 9, 2, 6] - 保持首次出现的顺序

// 如果需要特定排序
const sorted = [...new Set(array)].sort((a, b) => a - b);
```

---

## 总结

### 推荐方案选择指南

1. **基本类型去重** → 使用 `[...new Set(array)]`
2. **对象按属性去重** → 使用 Map 或自定义函数
3. **复杂逻辑去重** → 使用 reduce 或 filter
4. **性能要求高** → 优先使用 Set 和 Map
5. **兼容性要求** → 使用 filter + indexOf

### 最佳实践

- 优先考虑性能和可读性
- 使用 TypeScript 确保类型安全
- 在 React 中使用 useMemo 缓存计算结果
- 对大数据量考虑分批处理
- 添加适当的错误处理和边界情况检查

---

*本文档涵盖了 JavaScript/TypeScript 中数组去重的各种场景和解决方案，建议根据具体需求选择合适的方案。*