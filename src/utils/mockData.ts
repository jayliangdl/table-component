import type { Product } from '../types/Product';

export const categories = ['电子产品', '家居用品', '服装配饰', '运动户外', '美妆护肤', '食品饮料', '图书文具', '汽车用品'];
export const brands = ['华为', '小米', '苹果', '三星', '联想', '戴尔', '索尼', '松下', '格力', '美的', '海尔', '飞利浦'];
export const colors = ['黑色', '白色', '银色', '金色', '蓝色', '红色', '绿色', '粉色', '灰色', '紫色'];
export const materials = ['塑料', '金属', '玻璃', '陶瓷', '木材', '皮革', '布料', '硅胶', '碳纤维', '合金'];
export const countries = ['中国', '美国', '日本', '韩国', '德国', '意大利', '法国', '英国', '瑞士', '瑞典'];

const productNames = [
  '智能手机', '笔记本电脑', '平板电脑', '智能手表', '蓝牙耳机', '无线充电器', '移动电源',
  '台式机', '显示器', '键盘', '鼠标', '音响', '摄像头', '路由器', '硬盘', '内存条',
  '沙发', '餐桌', '书柜', '床垫', '枕头', '被子', '窗帘', '地毯', '灯具', '花瓶',
  '运动鞋', '休闲裤', '衬衫', 'T恤', '外套', '裙子', '帽子', '背包', '手表', '太阳镜'
];

// 标签池
const featureTags = [
  '热销', '新品', '限量', '环保', '高性价比', '轻奢', '便携', '防水', '智能', '多功能', '经典', '高端', '节能', '时尚', '耐用'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(): number {
  return Math.floor(Math.random() * 10000) + 100;
}

function getRandomDate(): string {
  // const start = new Date(2020, 0, 1);
  // const end = new Date();
  // const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  // return randomDate.toLocaleDateString('zh-CN');
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  // 格式化为 YYYY-MM-DD HH:mm:ss
  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, '0');
  const day = String(randomDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRandomDateTime(): string {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  // 格式化为 YYYY-MM-DD HH:mm:ss
  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, '0');
  const day = String(randomDate.getDate()).padStart(2, '0');
  const hours = String(randomDate.getHours()).padStart(2, '0');
  const minutes = String(randomDate.getMinutes()).padStart(2, '0');
  const seconds = String(randomDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getRandomTime(): string {
  const hours = String(getRandomNumber(0, 23)).padStart(2, '0');
  const minutes = String(getRandomNumber(0, 59)).padStart(2, '0');
  const seconds = String(getRandomNumber(0, 59)).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function getRandomTags(tags: string[], min = 1, max = 4): string[] {
  const count = getRandomNumber(min, max);
  const shuffled = tags.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateMockProducts(count: number = 35): Product[] {
  const products: Product[] = [];
  
  for (let i = 1; i <= count; i++) {
    const price = getRandomPrice();
    const cost = Math.floor(price * (0.4 + Math.random() * 0.3)); // 成本为售价的40-70%
    
    const product: Product = {
      id: i,
      name: `${getRandomElement(productNames)} ${getRandomElement(['Pro', 'Max', 'Plus', 'Lite', 'Mini', 'Standard', 'Premium', 'Elite'])}`,
      category: getRandomElement(categories),
      brand: getRandomElement(brands),
      model: `${getRandomElement(['X', 'Y', 'Z', 'A', 'B', 'C'])}${getRandomNumber(100, 999)}${getRandomElement(['S', 'Pro', 'Max', ''])}`,
      price: price,
      cost: cost,
      isGift: Math.random() < 0.2, // 20% 概率为赠品
      stock: getRandomNumber(0, 500),
      weight: Math.round((Math.random() * 5 + 0.1) * 100) / 100,
      dimensions: `${getRandomNumber(10, 50)}×${getRandomNumber(10, 50)}×${getRandomNumber(5, 20)}cm`,
      color: getRandomElement(colors),
      material: getRandomElement(materials),
      manufacturerCountry: getRandomElement(countries),
      releaseDate: getRandomDate(),      
      warranty: `${getRandomNumber(1, 5)}年质保`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating,
      createdAt: getRandomDateTime(), //创建时间（YYYY-MM-DD HH:mm:ss）
      shippingTime: getRandomTime(),//发货时间（HH:mm:ss）
      features: getRandomTags(featureTags),
      description: `这是一款高品质的${getRandomElement(productNames)}，采用先进的技术和优质的材料制造，为用户提供卓越的使用体验。产品设计精美，功能强大，性价比极高。`
    };
    
    products.push(product);
  }
  
  return products;
}