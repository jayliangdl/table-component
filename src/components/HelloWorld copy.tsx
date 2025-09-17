import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types/Product';
import { generateMockProducts } from '../utils/mockData';
import './HelloWorld.module.css';

const HelloWorld: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tableMinWidth, setTableMinWidth] = useState<number>(2100); // 默认值
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    // 生成测试数据 - 增加到80条以便展示更多内容
    const mockProducts = generateMockProducts(80);
    setProducts(mockProducts);
  }, []);

  /**
   * 动态计算表格最小宽度
   * 逻辑：通过获取表格中所有的th元素，并累计他们的宽度（offsetWidth）+ 少量bufferWidth
   * */
  useEffect(() => {    
    const calculateTableWidth = () => {
      if (tableRef.current) {
        const thead = tableRef.current.querySelector('thead');
        if (thead) {
          const thElements = thead.querySelectorAll('th');
          let totalWidth = 0;
          
          thElements.forEach((th) => {
            // 获取每个th的实际宽度，包括padding和border
            const width = th.offsetWidth;
            totalWidth += width;
          });
          
          // 添加一些额外的缓冲空间（10%）确保不会过紧
          const bufferWidth = Math.max(totalWidth * 0.1, 100);
          const newMinWidth = totalWidth + bufferWidth;
          
          setTableMinWidth(newMinWidth);
        }
      }
    };

    // 延迟执行，确保DOM已渲染完成
    if (products.length > 0) {
      const timer = setTimeout(calculateTableWidth, 100);
      return () => clearTimeout(timer);
    }
  }, [products]);

  return (
    <div className="hello-world" style={{ 
      height: '90vh', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: 0, 
      margin: 0,
      overflow: 'hidden'  // 防止页面级滚动条
    }}>
        <h2 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.2rem', 
          flexShrink: 0,  // 防止标题被压缩
          padding: '0.5rem'
        }}>
          产品数据表格 ({products.length} 条记录) - 动态宽度: {tableMinWidth.toFixed(0)}px
        </h2>
        <div className="table-wrapper" style={{ 
          overflowX: 'auto', 
          overflowY: 'auto', 
          width: '100%',
          flex: 1,  // 占满剩余空间
          border: '1px solid #ddd',
          minHeight: 0  // 重要：允许flex子项收缩
        }}>
          <table 
            id="table1" 
            ref={tableRef}
            border={1} 
            cellPadding={8} 
            cellSpacing={0} 
            style={{ 
              width: '100%', 
              minWidth: `${tableMinWidth}px`
            }}
          >
            <thead>
              <tr style={{ 
                backgroundColor: '#f5f5f5',
                position: 'sticky',  // Jay-固定表头，重要~！
                top: 0,             // Jay-固定在顶部，重要~！
                zIndex: 1           // 确保在内容之上
              }}>
                <th>ID</th>
                <th>产品名称</th>
                <th>分类</th>
                <th>品牌</th>
                <th>型号</th>
                <th>价格(¥)</th>
                <th>成本(¥)</th>
                <th>库存</th>
                <th>重量(kg)</th>
                <th>尺寸</th>
                <th>颜色</th>
                <th>材质</th>
                <th>产地</th>
                <th>发布日期</th>
                <th>保修</th>
                <th>评分</th>
                <th>描述</th>
                <th style={{ width: '200px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td style={{ minWidth: '180px' }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.model}</td>
                  <td style={{ textAlign: 'right' }}>¥{product.price.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>¥{product.cost.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{product.stock}</td>
                  <td style={{ textAlign: 'right' }}>{product.weight}</td>
                  <td>{product.dimensions}</td>
                  <td>{product.color}</td>
                  <td>{product.material}</td>
                  <td>{product.manufacturerCountry}</td>
                  <td>{product.releaseDate}</td>
                  <td>{product.warranty}</td>
                  <td style={{ textAlign: 'right' }}>{product.rating}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.description}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      style={{ 
                        margin: '0 2px', 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`查看产品 ${product.name}`)}
                    >
                      查看
                    </button>
                    <button 
                      style={{ 
                        margin: '0 2px', 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`编辑产品 ${product.name}`)}
                    >
                      编辑
                    </button>
                    <button 
                      style={{ 
                        margin: '0 2px', 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`复制产品 ${product.name}`)}
                    >
                      复制
                    </button>
                    <button 
                      style={{ 
                        margin: '0 2px', 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (confirm(`确定要删除产品 ${product.name} 吗？`)) {
                          alert(`已删除产品 ${product.name}`);
                        }
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default HelloWorld;