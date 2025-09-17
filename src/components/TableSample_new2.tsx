import React, { useState, useEffect, useRef } from "react";
import type { Product } from "../types/Product";
import { generateMockProducts } from "../utils/mockData";
import "./TableSample.module.css";

const TableSampleNew2: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fixTableMinWidth, setFixTableMinWidth] = useState<number>(0);
  const [scrollableTableMinWidth, setScrollableTableMinWidth] = useState<number>(0);
  const fixTableRef = useRef<HTMLTableElement>(null);
  const scrollableTableRef = useRef<HTMLTableElement>(null);
  const fixTableContainer = useRef<HTMLDivElement>(null); // 🔑 修正类型
  const scrollableTableContainer = useRef<HTMLDivElement>(null);
  const [fixTableContainerMinWidth, setFixTableContainerMinWidth] = useState<number>(0);
  const [scrollableTableContainerMinWidth, setScrollableTableContainerMinWidth] = useState<number>(0);

  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🎯 新增：字体渲染完成标志
  const fontLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const mockProducts = generateMockProducts(80);
    setProducts(mockProducts);
  }, []);

  /**
   * 获取水平滚动条的高度
   */
  const getHorizontalScrollBarHeight = (): number => {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.height = "100px";
    outer.style.overflowX = "scroll";
    outer.style.overflowY = "hidden";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    outer.appendChild(inner);
    
    const scrollbarHeight = outer.offsetHeight - inner.offsetHeight;
    document.body.removeChild(outer);
    return scrollbarHeight;
  };

  /**
   * 检测元素是否有水平滚动条
   */
  const hasHorizontalScrollBar = (element: HTMLElement): boolean => {
    return element.scrollWidth > element.clientWidth;
  };

  /**
   * 🎯 改进的同步高度函数：处理字体渲染延迟
   */
  const syncHeights = () => {
    const fixedContainer = fixTableContainer.current;
    const scrollableContainer = scrollableTableContainer.current;
    const fixedTable = fixTableRef.current;
    const scrollableTable = scrollableTableRef.current;

    if (!fixedContainer || !scrollableContainer || !fixedTable || !scrollableTable) {
      return;
    }

    // 🔑 重置所有行高，让浏览器重新计算自然高度
    const resetRowHeights = () => {
      // 重置表头行高
      const fixedThreadRows = fixedTable.querySelectorAll("thead tr");
      const scrollThreadRows = scrollableTable.querySelectorAll("thead tr");
      
      fixedThreadRows.forEach(row => {
        (row as HTMLElement).style.height = 'auto';
      });
      scrollThreadRows.forEach(row => {
        (row as HTMLElement).style.height = 'auto';
      });

      // 重置数据行高
      const fixedRows = fixedTable.querySelectorAll("tbody tr");
      const scrollRows = scrollableTable.querySelectorAll("tbody tr");
      
      fixedRows.forEach(row => {
        (row as HTMLElement).style.height = 'auto';
      });
      scrollRows.forEach(row => {
        (row as HTMLElement).style.height = 'auto';
      });
    };

    // 🔑 强制重排，确保获取准确的高度
    const forceReflow = () => {
      fixedTable.offsetHeight;
      scrollableTable.offsetHeight;
    };

    // 执行重置和重排
    resetRowHeights();
    forceReflow();

    // 🎯 使用 requestAnimationFrame 确保在下一帧执行同步
    requestAnimationFrame(() => {
      // 再次强制重排，确保字体渲染完成
      forceReflow();

      // 同步表头高度
      const fixedThread = fixedTable.querySelector("thead");
      const scrollThread = scrollableTable.querySelector("thead");
      
      if (fixedThread && scrollThread) {
        const fixedHeaderHeight = (fixedThread as HTMLElement).offsetHeight;
        const scrollHeaderHeight = (scrollThread as HTMLElement).offsetHeight;
        const maxHeaderHeight = Math.max(fixedHeaderHeight, scrollHeaderHeight);
        
        (fixedThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
        (scrollThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
        
        console.log(`表头高度同步: 左侧=${fixedHeaderHeight}px, 右侧=${scrollHeaderHeight}px, 最大=${maxHeaderHeight}px`);
      }

      // 同步表头行高度
      const fixedThreadRows = fixedTable.querySelectorAll("thead tr");
      const scrollThreadRows = scrollableTable.querySelectorAll("thead tr");

      fixedThreadRows.forEach((row, index) => {
        const scrollRow = scrollThreadRows[index];
        if (scrollRow) {
          const fixedRowHeight = (row as HTMLElement).offsetHeight;
          const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
          const maxHeight = Math.max(fixedRowHeight, scrollRowHeight);
          
          (row as HTMLElement).style.height = `${maxHeight}px`;
          (scrollRow as HTMLElement).style.height = `${maxHeight}px`;
        }
      });

      // 同步数据行高度
      const fixedRows = fixedTable.querySelectorAll("tbody tr");
      const scrollRows = scrollableTable.querySelectorAll("tbody tr");

      fixedRows.forEach((row, index) => {
        const scrollRow = scrollRows[index];
        if (scrollRow) {
          const fixedRowHeight = (row as HTMLElement).offsetHeight;
          const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
          const maxHeight = Math.max(fixedRowHeight, scrollRowHeight);
          
          (row as HTMLElement).style.height = `${maxHeight}px`;
          (scrollRow as HTMLElement).style.height = `${maxHeight}px`;
          
          // 只显示前3行的调试信息
          if (index < 3) {
            console.log(`行${index + 1}高度同步: 左侧=${fixedRowHeight}px, 右侧=${scrollRowHeight}px, 最大=${maxHeight}px`);
          }
        }
      });

      // 处理滚动条补偿
      const hasFixedScrollBar = hasHorizontalScrollBar(fixedContainer);
      const hasScrollableScrollBar = hasHorizontalScrollBar(scrollableContainer);
      
      if (hasFixedScrollBar && hasScrollableScrollBar) {
        fixedContainer.style.paddingBottom = '0px';
        scrollableContainer.style.paddingBottom = '0px';
        console.log('两侧都有滚动条，无需补偿');
      } else if (!hasFixedScrollBar && hasScrollableScrollBar) {
        const scrollbarHeight = getHorizontalScrollBarHeight();
        fixedContainer.style.paddingBottom = `${scrollbarHeight}px`;
        scrollableContainer.style.paddingBottom = '0px';
        console.log(`只有右侧有滚动条，给左侧补偿 ${scrollbarHeight}px`);
      } else if (hasFixedScrollBar && !hasScrollableScrollBar) {
        const scrollbarHeight = getHorizontalScrollBarHeight();
        scrollableContainer.style.paddingBottom = `${scrollbarHeight}px`;
        fixedContainer.style.paddingBottom = '0px';
        console.log(`只有左侧有滚动条，给右侧补偿 ${scrollbarHeight}px`);
      } else {
        fixedContainer.style.paddingBottom = '0px';
        scrollableContainer.style.paddingBottom = '0px';
        console.log('两侧都没有滚动条，无需补偿');
      }
    });
  };

  /**
   * 动态计算表格最小宽度
   */
  useEffect(() => {
    const calculateFixTableWidth = () => {
      if (fixTableRef.current) {
        const thead = fixTableRef.current.querySelector("thead");
        if (thead) {
          const thElements = thead.querySelectorAll("th");
          let totalWidth = 0;

          thElements.forEach((th, index) => {
            const width = th.offsetWidth;
            totalWidth += width;
            console.log(`Fix表格 - th[${index}]: ${th.textContent} = ${width}px`);
          });

          const bufferWidth = 0;
          const newMinWidth = totalWidth + bufferWidth;

          setFixTableMinWidth(newMinWidth);
          setFixTableContainerMinWidth(newMinWidth);
        }
      }
    };

    const calculateScrollTableWidth = () => {
      if (scrollableTableRef.current) {
        const thead = scrollableTableRef.current.querySelector("thead");
        if (thead) {
          const thElements = thead.querySelectorAll("th");
          let totalWidth = 0;

          thElements.forEach((th) => {
            const width = th.offsetWidth;
            totalWidth += width;
          });

          const bufferWidth = Math.max(totalWidth * 0.1, 100);
          const newMinWidth = totalWidth + bufferWidth;

          setScrollableTableMinWidth(newMinWidth);
          setScrollableTableContainerMinWidth(newMinWidth);
        }
      }
    };

    if (products.length > 0) {
      // 🎯 增加延迟，确保字体渲染完成
      const timer = setTimeout(() => {
        calculateFixTableWidth();
        calculateScrollTableWidth();
        
        // 🎯 再次延迟执行同步，确保宽度计算完成后再同步高度
        setTimeout(() => {
          fontLoadedRef.current = true;
          syncHeights();
        }, 50);
      }, 150); // 增加延迟时间
      
      return () => clearTimeout(timer);
    }
  }, [products]);

  useEffect(() => {
    const fixedContainer = fixTableContainer.current;
    const scrollableContainer = scrollableTableContainer.current;

    if (!fixedContainer || !scrollableContainer) {
      console.error("表格容器未正确引用");
      return;
    }

    // 滚动同步处理函数
    const handleScroll = () => {
      fixedContainer.scrollTop = scrollableContainer.scrollTop;
      
      // 🎯 滚动时也需要重新同步高度，但要防抖
      if (fontLoadedRef.current) {
        clearTimeout(scrollTimeoutRef.current!);
        scrollTimeoutRef.current = setTimeout(() => {
          syncHeights();
        }, 16); // 约60fps
      }
    };

    scrollableContainer.addEventListener('scroll', handleScroll);

    // 窗口大小变化时重新同步
    const handleResize = () => {
      if (fontLoadedRef.current) {
        setTimeout(syncHeights, 100);
      }
    };
    window.addEventListener('resize', handleResize);

    // 🎯 监听字体加载完成事件
    if (document.fonts) {
      document.fonts.ready.then(() => {
        console.log('字体加载完成，重新同步高度');
        fontLoadedRef.current = true;
        setTimeout(syncHeights, 50);
      });
    }

    // 清理函数
    return () => {
      scrollableContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [products]);

  // 🎯 改进的样式函数，添加字体属性
  const getHeaderStyle = (additionStyle: React.CSSProperties = {}): React.CSSProperties => ({
    fontSize: '14px', // 🔑 现在可以安全添加字体大小
    fontWeight: 'bold',
    padding: "8px",
    border: "1px solid #ddd",
    textAlign: "left" as const,
    backgroundColor: "#f5f5f5",
    position: "sticky" as const,
    top: 0,
    zIndex: 1,
    ...additionStyle,
  });

  const getContentStyle = (additionStyle: React.CSSProperties = {}): React.CSSProperties => ({
    fontSize: '13px', // 🔑 现在可以安全添加字体大小
    fontWeight: 'normal',
    padding: "8px",
    border: "1px solid #ddd",
    ...additionStyle,
  });

  return (
    <div
      className="table-sample"
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        margin: 0,
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          margin: "0 0 0.5rem 0",
          fontSize: "1.2rem",
          flexShrink: 0,
          padding: "0.5rem",
        }}
      >
        产品数据表格 ({products.length} 条记录) - 动态宽度:{" "}
        {fixTableMinWidth.toFixed(0)}px - {scrollableTableMinWidth.toFixed(0)}px
      </h2>
      
      <div
        className="table-wrapper"
        style={{
          display: "flex",
          width: "100%",
          flex: 1,
          border: "0px solid #ddd",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* 左侧固定表格 */}
        <div 
          className="fixed-table" 
          ref={fixTableContainer} 
          style={{ 
            width: `${fixTableContainerMinWidth.toFixed(0)}px`,
            overflowY: "hidden",
            overflowX: "hidden",
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <table
            ref={fixTableRef}
            style={{
              width: "100%",
              minWidth: `${fixTableMinWidth}px`,
              borderCollapse: "collapse", // 🔑 添加边框合并
            }}
          >
            <thead>
              <tr>
                <th style={getHeaderStyle()}>ID</th>
                <th style={getHeaderStyle({ minWidth: '180px' })}>产品名称</th>
                <th style={getHeaderStyle({ minWidth: '180px' })}>分类</th>
                <th style={getHeaderStyle({ minWidth: '180px' })}>品牌</th>
                <th style={getHeaderStyle()}>型号</th>
                <th style={getHeaderStyle()}>价格(¥)</th>
                <th style={getHeaderStyle()}>成本(¥)</th>
                <th style={getHeaderStyle()}>库存</th>
                <th style={getHeaderStyle({ width: '200px' })}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={getContentStyle()}>{product.id}</td>
                  <td style={getContentStyle({ minWidth: '180px' })}>{product.name}</td>
                  <td style={getContentStyle({ minWidth: '180px' })}>{product.category}</td>
                  <td style={getContentStyle({ minWidth: '180px' })}>{product.brand}</td>
                  <td style={getContentStyle()}>{product.model}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>¥{product.price.toLocaleString()}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>¥{product.cost.toLocaleString()}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>{product.stock}</td>
                  <td style={getContentStyle({ textAlign: 'center', whiteSpace: 'nowrap' })}>
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
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右侧滚动表格 */}
        <div 
          className="scroll-table" 
          ref={scrollableTableContainer} 
          style={{ 
            flex: 1,
            overflowX: "auto",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <table
            ref={scrollableTableRef}
            style={{
              width: "100%",
              minWidth: `${scrollableTableMinWidth}px`,
              borderCollapse: "collapse", // 🔑 添加边框合并
            }}
          >
            <thead>
              <tr>
                <th style={getHeaderStyle()}>重量(kg)</th>
                <th style={getHeaderStyle()}>尺寸</th>
                <th style={getHeaderStyle()}>颜色</th>
                <th style={getHeaderStyle()}>材质</th>
                <th style={getHeaderStyle()}>产地</th>
                <th style={getHeaderStyle()}>发布日期</th>
                <th style={getHeaderStyle()}>保修</th>
                <th style={getHeaderStyle()}>评分</th>
                <th style={getHeaderStyle()}>描述</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={getContentStyle({ textAlign: "right" })}>{product.weight}</td>
                  <td style={getContentStyle()}>{product.dimensions}</td>
                  <td style={getContentStyle()}>{product.color}</td>
                  <td style={getContentStyle()}>{product.material}</td>
                  <td style={getContentStyle()}>{product.manufacturerCountry}</td>
                  <td style={getContentStyle()}>{product.releaseDate}</td>
                  <td style={getContentStyle()}>{product.warranty}</td>
                  <td style={getContentStyle({ textAlign: "right" })}>{product.rating}</td>
                  <td style={getContentStyle()}>{product.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableSampleNew2;