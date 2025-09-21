# TypeScript 常用转换总结

在 TypeScript 中，数据转换是开发中非常常见的操作。以下是一些常用的转换方法和相关知识点：

---

## 🎯 对象列表/数组 转换为 `key-value` 对象

### 方法：使用 `reduce`

```typescript
type Item = { id: string; [key: string]: any };

function listToKeyValue(items: Item[]): Record<string, Item> {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, Item>);
}
```

### 示例：
```typescript
const itemList = [
  { id: "1", name: "Item 1", value: 100 },
  { id: "2", name: "Item 2", value: 200 },
];

const keyValueObject = listToKeyValue(itemList);
console.log(keyValueObject);
/*
{
  "1": { id: "1", name: "Item 1", value: 100 },
  "2": { id: "2", name: "Item 2", value: 200 }
}
*/
```

---

## 🎯 `key-value` 对象 转换为 对象列表/数组

### 方法：使用 `Object.values`

```typescript
function keyValueToList<T>(keyValueObject: Record<string, T>): T[] {
  return Object.values(keyValueObject);
}
```

### 示例：
```typescript
const keyValueObject = {
  "1": { id: "1", name: "Item 1", value: 100 },
  "2": { id: "2", name: "Item 2", value: 200 },
};

const itemList = keyValueToList(keyValueObject);
console.log(itemList);
/*
[
  { id: "1", name: "Item 1", value: 100 },
  { id: "2", name: "Item 2", value: 200 }
]
*/
```

---

## 🎯 类型断言（Type Assertion）

### 作用：
告诉 TypeScript 将某个值视为特定类型。

### 语法：
```typescript
const value = someValue as TargetType;
```

### 示例：
```typescript
const someValue: any = "Hello, TypeScript!";
const strLength: number = (someValue as string).length;
console.log(strLength); // 输出: 18
```

---

## 🎯 类型守卫（Type Guards）

### 方法：使用 `typeof` 或自定义类型守卫

```typescript
function isString(value: any): value is string {
  return typeof value === "string";
}

const value: any = "Hello";
if (isString(value)) {
  console.log(value.toUpperCase()); // 类型缩小为 string
}
```

---

## 🎯 泛型转换

### 方法：使用泛型函数

```typescript
function convertArrayToMap<T>(array: T[], key: keyof T): Record<string, T> {
  return array.reduce((acc, item) => {
    acc[String(item[key])] = item;
    return acc;
  }, {} as Record<string, T>);
}
```

### 示例：
```typescript
const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const userMap = convertArrayToMap(users, "id");
console.log(userMap);
/*
{
  "1": { id: "1", name: "Alice" },
  "2": { id: "2", name: "Bob" }
}
*/
```

---

## 🎯 使用 `Record` 类型

### 作用：
`Record<K, V>` 是 TypeScript 的内置泛型类型，用于表示键值对对象。

### 示例：
```typescript
type User = { id: string; name: string };
const userRecord: Record<string, User> = {
  "1": { id: "1", name: "Alice" },
  "2": { id: "2", name: "Bob" },
};
```

---

## 🎯 使用 `Object.entries` 和 `Object.fromEntries`

### 方法：
- `Object.entries`：将对象转换为键值对数组。
- `Object.fromEntries`：将键值对数组转换为对象。

### 示例：
```typescript
const obj = { a: 1, b: 2, c: 3 };

// 转换为键值对数组
const entries = Object.entries(obj);
console.log(entries);
/*
[
  ["a", 1],
  ["b", 2],
  ["c", 3]
]
*/

// 转换回对象
const newObj = Object.fromEntries(entries);
console.log(newObj);
/*
{
  a: 1,
  b: 2,
  c: 3
}
*/
```

---

## 🎯 使用 `Map` 和 `Set`

### `Map` 示例：
```typescript
const map = new Map<string, number>();
map.set("a", 1);
map.set("b", 2);
console.log(map.get("a")); // 输出: 1
```

### `Set` 示例：
```typescript
const set = new Set<number>();
set.add(1);
set.add(2);
console.log(set.has(1)); // 输出: true
```

---

## 🎯 JSON 转换

### 对象转 JSON 字符串：
```typescript
const obj = { a: 1, b: 2 };
const jsonString = JSON.stringify(obj);
console.log(jsonString); // 输出: '{"a":1,"b":2}'
```

### JSON 字符串转对象：
```typescript
const jsonString = '{"a":1,"b":2}';
const obj = JSON.parse(jsonString);
console.log(obj); // 输出: { a: 1, b: 2 }
```

---

## 🎯 总结

- 使用 `reduce` 和 `Object.values` 进行对象与数组的转换。
- 使用 `Record<K, V>` 表示键值对对象。
- 使用 `Object.entries` 和 `Object.fromEntries` 进行键值对数组与对象的转换。
- 使用 `Map` 和 `Set` 处理复杂数据结构。
- 使用类型断言和类型守卫确保类型安全。

这些方法是 TypeScript 中常用的转换技巧，能够帮助您更高效地处理数据。