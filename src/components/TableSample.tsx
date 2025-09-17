import React, { useState, useEffect, useRef } from "react";
import type { Product } from "../types/Product";
import { generateMockProducts } from "../utils/mockData";
import "./TableSample.module.css";

// 🎯 新增：表格样式配置接口
interface TableFontConfig {
  headerFontSize: string;
  contentFontSize: string;
  headerFontWeight: string;
  contentFontWeight: string;
}

// 🎯 默认字体配置
const DEFAULT_FONT_CONFIG: TableFontConfig = {
  headerFontSize: '14px',
  contentFontSize: '13px',
  headerFontWeight: 'bold',
  contentFontWeight: 'normal'
};

const TableSample: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fixTableMinWidth, setFixTableMinWidth] = useState<number>(0);
  const [scrollableTableMinWidth, setScrollableTableMinWidth] = useState<number>(0);
  const fixTableRef = useRef<HTMLTableElement>(null);
  const scrollableTableRef = useRef<HTMLTableElement>(null);
  const fixTableContainer = useRef<HTMLDivElement>(null);
  const scrollableTableContainer = useRef<HTMLDivElement>(null);
  const [fixTableContainerMinWidth, setFixTableContainerMinWidth] = useState<number>(0);
  const [scrollableTableContainerMinWidth, setScrollableTableContainerMinWidth] = useState<number>(0);

  // 🎯 新增：字体配置状态
  const [fontConfig, setFontConfig] = useState<TableFontConfig>(DEFAULT_FONT_CONFIG);

  // 🎯 新增：字体配置更新函数
  const updateFontConfig = (newConfig: Partial<TableFontConfig>) => {
    setFontConfig(prev => ({ ...prev, ...newConfig }));
  };

  // 🎯 新增：预设字体配置
  const FONT_PRESETS = {
    small: {
      headerFontSize: '12px',
      contentFontSize: '11px',
      headerFontWeight: 'bold',
      contentFontWeight: 'normal'
    },
    medium: {
      headerFontSize: '14px',
      contentFontSize: '13px',
      headerFontWeight: 'bold',
      contentFontWeight: 'normal'
    },
    large: {
      headerFontSize: '16px',
      contentFontSize: '15px',
      headerFontWeight: 'bold',
      contentFontWeight: 'normal'
    },
    xlarge: {
      headerFontSize: '18px',
      contentFontSize: '16px',
      headerFontWeight: 'bold',
      contentFontWeight: 'normal'
    }
  };

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
      const timer = setTimeout(() => {
        calculateFixTableWidth();
        calculateScrollTableWidth();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [products, fontConfig]); // 🎯 添加 fontConfig 依赖，字体变化时重新计算

  useEffect(() => {
    const fixedContainer = fixTableContainer.current;
    const scrollableContainer = scrollableTableContainer.current;
    const fixedTable = fixTableRef.current;
    const scrollableTable = scrollableTableRef.current;

    if (!fixedContainer || !scrollableContainer || !fixedTable || !scrollableTable) {
      console.error("表格容器或表格元素未正确引用");
      return;
    }

    const syncHeights = () => {
      // 头部高度同步
      const fixedThread = fixedTable.querySelector("thead");
      const scrollThread = scrollableTable.querySelector("thead");
      if (fixedThread && scrollThread) {
        const fixedHeaderHeight = (fixedThread as HTMLElement).offsetHeight;
        const scrollHeaderHeight = (scrollThread as HTMLElement).offsetHeight;
        const maxHeaderHeight = Math.max(fixedHeaderHeight, scrollHeaderHeight);
        (fixedThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
        (scrollThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
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
        }
      });

      // 滚动条补偿逻辑
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
    };

    const handleScroll = () => {
      fixedContainer.scrollTop = scrollableContainer.scrollTop;
      syncHeights();
    };

    scrollableContainer.addEventListener("scroll", handleScroll);
    syncHeights();

    const handleResize = () => {
      syncHeights();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      scrollableContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [products, fontConfig]); // 🎯 添加 fontConfig 依赖

  // 🎯 新增：表头样式生成函数
  const getHeaderStyle = (additionalStyles: React.CSSProperties = {}) => ({
    fontSize: fontConfig.headerFontSize,
    fontWeight: fontConfig.headerFontWeight,
    padding: "8px",
    border: "1px solid #ddd",
    textAlign: "left" as const,
    backgroundColor: "#f5f5f5",
    position: "sticky" as const,
    top: 0,
    zIndex: 1,
    ...additionalStyles
  });

  // 🎯 新增：表格内容样式生成函数
  const getContentStyle = (additionalStyles: React.CSSProperties = {}) => ({
    fontSize: fontConfig.contentFontSize,
    fontWeight: fontConfig.contentFontWeight,
    padding: "8px",
    border: "1px solid #ddd",
    ...additionalStyles
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
      {/* 🎯 新增：字体配置控制面板 */}
      <div style={{ 
        padding: "1rem", 
        backgroundColor: "#f8f9fa", 
        borderBottom: "1px solid #ddd",
        flexShrink: 0 
      }}>
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>字体配置:</h3>
          
          {/* 预设配置按钮 */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span>预设:</span>
            {Object.entries(FONT_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setFontConfig(preset)}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  borderRadius: "3px",
                  cursor: "pointer"
                }}
              >
                {key === 'small' ? '小' : 
                 key === 'medium' ? '中' : 
                 key === 'large' ? '大' : '特大'}
              </button>
            ))}
          </div>

          {/* 自定义配置 */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              表头字号:
              <select
                value={fontConfig.headerFontSize}
                onChange={(e) => updateFontConfig({ headerFontSize: e.target.value })}
                style={{ padding: "2px 4px", fontSize: "12px" }}
              >
                <option value="11px">11px</option>
                <option value="12px">12px</option>
                <option value="13px">13px</option>
                <option value="14px">14px</option>
                <option value="15px">15px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              内容字号:
              <select
                value={fontConfig.contentFontSize}
                onChange={(e) => updateFontConfig({ contentFontSize: e.target.value })}
                style={{ padding: "2px 4px", fontSize: "12px" }}
              >
                <option value="10px">10px</option>
                <option value="11px">11px</option>
                <option value="12px">12px</option>
                <option value="13px">13px</option>
                <option value="14px">14px</option>
                <option value="15px">15px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
              </select>
            </label>
          </div>

          {/* 当前配置显示 */}
          <div style={{ 
            fontSize: "12px", 
            color: "#666",
            marginLeft: "auto"
          }}>
            当前: 表头{fontConfig.headerFontSize} / 内容{fontConfig.contentFontSize}
          </div>
        </div>
      </div>

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
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={getHeaderStyle({ width: "100px" })}>ID</th>
                <th style={getHeaderStyle({ minWidth: '180px' })}>产品名称</th>
                <th style={getHeaderStyle({ minWidth: "180px" })}>分类</th>
                <th style={getHeaderStyle({ minWidth: '80px' })}>品牌</th>
                <th style={getHeaderStyle({ minWidth: '80px' })}>型号</th>
                <th style={getHeaderStyle()}>价格(¥)</th>
                <th style={getHeaderStyle()}>成本(¥)</th>
                <th style={getHeaderStyle()}>库存</th>
                <th style={getHeaderStyle({ width: '200px' })}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={getContentStyle({ width: "100px" })}>{product.id}</td>
                  <td style={getContentStyle({ minWidth: '180px' })}>{product.name}</td>
                  <td style={getContentStyle({ minWidth: '180px' })}>{product.category}</td>
                  <td style={getContentStyle({ minWidth: '80px' })}>{product.brand}</td>
                  <td style={getContentStyle({ minWidth: '80px' })}>{product.model}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>¥{product.price.toLocaleString()}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>¥{product.cost.toLocaleString()}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>{product.stock}</td>
                  <td style={getContentStyle({ textAlign: 'center', whiteSpace: 'nowrap' })}>
                    <button 
                      style={{ 
                        margin: '0 2px', 
                        padding: '4px 8px', 
                        fontSize: fontConfig.contentFontSize, // 🎯 使用配置的字体大小
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
              borderCollapse: "collapse",
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

export default TableSample;