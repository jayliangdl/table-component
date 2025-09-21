import React, { useState, useEffect, useRef } from "react";
import type { Product } from "../types/Product";
import { generateMockProducts } from "../utils/mockData";
import "./HelloWorld.module.css";

const HelloWorld: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fixTableMinWidth, setFixTableMinWidth] = useState<number>(0); // 默认值
  const [scrollableTableMinWidth, setScrollableTableMinWidth] =
    useState<number>(0); // 默认值
  const fixTableRef = useRef<HTMLTableElement>(null);
  const scrollableTableRef = useRef<HTMLTableElement>(null);

   const fixTableContainer = useRef<HTMLTableElement>(null);
  const scrollableTableContainer = useRef<HTMLDivElement>(null);

  const [fixTableContainerMinWidth,setFixTableContainerMinWidth] = useState<number>(0);
  const [scrollableTableContainerMinWidth,setScrollableTableContainerMinWidth] = useState<number>(0);

  useEffect(() => {
    // 生成测试数据 - 增加到80条以便展示更多内容
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
    outer.style.overflowX = "scroll"; // 强制显示滚动条
    outer.style.overflowY = "hidden"; // 不显示垂直滚动条
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    outer.appendChild(inner);
    // 获取滚动条的高度
    // outer.clientHeight 内容区域高度（不包含水平滚动条）
    // outer.offsetHeight 外部高度（包含水平滚动条）
    const scrollbarHeight = outer.offsetHeight - inner.offsetHeight;
    document.body.removeChild(outer);
    return scrollbarHeight;
  }

  /**
   * 检测元素是否有水平滚动条
   */
  const hasHorizontalScrollBar = (element: HTMLElement): boolean => {
    return element.scrollWidth > element.clientWidth;
  };

  /**
   * 动态计算表格最小宽度
   * 逻辑：通过获取表格中所有的th元素，并累计他们的宽度（offsetWidth）+ 少量bufferWidth
   * */
  useEffect(() => {
    const calculateFixTableWidth = () => {
      if (fixTableRef.current) {
        const thead = fixTableRef.current.querySelector("thead");
        if (thead) {
          const thElements = thead.querySelectorAll("th");
          let totalWidth = 0;

          thElements.forEach((th, index) => {
            // 获取每个th的实际宽度，包括padding和border
            const width = th.offsetWidth;
            totalWidth += width;
            console.log(
              `Fix表格 - th[${index}]: ${th.textContent} = ${width}px`
            );
          });

          // 添加一些额外的缓冲空间（10%）确保不会过紧
            // const bufferWidth = Math.max(totalWidth * 0.1, 100);
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
            // 获取每个th的实际宽度，包括padding和border
            const width = th.offsetWidth;
            totalWidth += width;
          });

          // 添加一些额外的缓冲空间（10%）确保不会过紧
          const bufferWidth = Math.max(totalWidth * 0.1, 100);
          const newMinWidth = totalWidth + bufferWidth;

          setScrollableTableMinWidth(newMinWidth);
          setScrollableTableContainerMinWidth(newMinWidth);
        }
      }
    };

    // 延迟执行，确保DOM已渲染完成
    if (products.length > 0) {
      const timer = setTimeout(() => {
        calculateFixTableWidth();
        calculateScrollTableWidth();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [products]);

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
      const fixedRows = fixedTable.querySelectorAll("tbody tr");
      const scrollRows = scrollableTable.querySelectorAll("tbody tr");

      fixedRows.forEach((row, index) => {
        const scrollRow = scrollRows[index];
        if (scrollRow) {
          const fixedRowHeight = (row as HTMLElement).offsetHeight;
          const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
          
          // 取两个表格中较大的行高，确保内容都能完整显示
          const maxHeight = Math.max(fixedRowHeight, scrollRowHeight);
          
          (row as HTMLElement).style.height = `${maxHeight}px`;
          (scrollRow as HTMLElement).style.height = `${maxHeight}px`;
        }
      })
      /**
       * Jay-处理scrollableTable有水平滚动条的占位问题
       * 问题：
       * 1. 右侧表格可能有水平滚动条，左侧没有 -> 右侧底部被占用，导致高度差
       * 2. 左侧表格也可能意外出现水平滚动条 -> 左侧底部也被占用
       * 解决方案：
       * 1. 检测两个表格容器是否都有水平滚动条
       * 2. 计算需要的补偿高度：如果只有一侧有滚动条，给没有滚动条的一侧添加补偿
       * 3. 确保两个表格容器的可视高度完全一致
       * 详细知识点见：./knowledge/scroll-bar-calculation.md
       */
      const hasFixedScrollBar = hasHorizontalScrollBar(fixedContainer);
      const hasScrollableScrollBar = hasHorizontalScrollBar(scrollableContainer);
      
      // // 🔑 升级逻辑：智能补偿
      if (hasFixedScrollBar && hasScrollableScrollBar) {
        // 情况1：两侧都有滚动条 -> 无需补偿
        fixedContainer.style.paddingBottom = '0px';
        scrollableContainer.style.paddingBottom = '0px';
        console.log('两侧都有滚动条，无需补偿');
      } else if (!hasFixedScrollBar && hasScrollableScrollBar) {
        // 情况2：只有右侧有滚动条 -> 给左侧补偿
        const scrollbarHeight = getHorizontalScrollBarHeight();
        fixedContainer.style.paddingBottom = `${scrollbarHeight}px`;
        // fixedContainer.style.boxSizing = 'border-box';
        scrollableContainer.style.paddingBottom = '0px';
        console.log(`只有右侧有滚动条，给左侧补偿 ${scrollbarHeight}px`);
      } else if (hasFixedScrollBar && !hasScrollableScrollBar) {
        // 情况3：只有左侧有滚动条 -> 给右侧补偿
        const scrollbarHeight = getHorizontalScrollBarHeight();
        scrollableContainer.style.paddingBottom = `${scrollbarHeight}px`;
        // scrollableContainer.style.boxSizing = 'border-box';
        fixedContainer.style.paddingBottom = '0px';
        console.log(`只有左侧有滚动条，给右侧补偿 ${scrollbarHeight}px`);
      } else {
        // 情况4：两侧都没有滚动条 -> 无需补偿
        fixedContainer.style.paddingBottom = '0px';
        scrollableContainer.style.paddingBottom = '0px';
        console.log('两侧都没有滚动条，无需补偿');
      }

            //检测右则表格是否有水平滚动条
      // const hasScrollBar = hasHorizontalScrollBar(scrollableContainer);
      // //获得水平滚动条的高度
      // const scrollbarHeight = hasScrollBar?getHorizontalScrollBarHeight():0;
      // fixedContainer.style.paddingBottom = `${scrollbarHeight}px`;
      // if(scrollbarHeight>0){ 
      //   fixedContainer.style.boxSizing = "border-box";
      // }     
      // console.debug(`hasScrollBar: ${hasScrollBar}, scrollbarHeight: ${scrollbarHeight}px`);

    };
      // 滚动同步处理函数
      const handleScroll = () => {
        fixedContainer.scrollTop = scrollableContainer.scrollTop;
        syncHeights();
      };
      
      scrollableContainer.addEventListener("scroll", handleScroll);
      syncHeights(); // 初始同步高度

      // 窗口大小变化时重新同步
      const handleResize = () => {
        syncHeights();
      };
      window.addEventListener('resize', handleResize);

      // 清理函数：移除事件监听器
    return () => {
        scrollableContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
    };
    },[products]);

  return (
    <div
      className="hello-world"
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        margin: 0,
        overflow: "hidden", // 防止页面级滚动条
      }}
    >
      <h2
        style={{
          margin: "0 0 0.5rem 0",
          fontSize: "1.2rem",
          flexShrink: 0, // 防止标题被压缩
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
          // overflowX: "auto",
          // overflowY: "auto",
          width: "100%",
          flex: 1, // 占满剩余空间
          border: "0px solid #ddd",
          overflow:"hidden",
          minHeight: 0, // 重要：允许flex子项收缩
        }}
      >
        <div className="fixed-table" 
        ref={fixTableContainer} 
        style={{ 
          width: `${fixTableContainerMinWidth.toFixed(0)}px`,
          overflowY: "hidden",  // 隐藏垂直滚动条
          overflowX: "hidden",  // 🔑 关键：隐藏水平滚动条，防止左侧表格出现滚动条
          flexShrink: 0, // 防止固定表格被压缩
          boxSizing: "border-box",
        }}>
          <table
            ref={fixTableRef}
            border={0}
            cellPadding={8}
            cellSpacing={0}
            style={{
              width: "100%",
              minWidth: `${fixTableMinWidth}px`,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f5f5f5",
                  position: "sticky", // Jay-固定表头，重要~！
                  top: 0, // Jay-固定在顶部，重要~！
                  zIndex: 1, // 确保在内容之上
                }}
              >
                <th style={{ width: "100px" }}>ID</th>
                <th style={{ minWidth: '180px' }}>产品名称</th>
                {/* <th style={{ minWidth: "180px" }}>分类</th>
                <th style={{ minWidth: '80px' }}>品牌</th>
                <th style={{ minWidth: '80px' }}>型号</th> */}
                {/* <th>价格(¥)</th>
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
                <th>描述</th>  */}
                <th style={{ width: '200px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: "100px" }}>{product.id}</td>
                  <td style={{ minWidth: '180px' }}>{product.name}</td>
                  {/* <td style={{ minWidth: '180px' }}>{product.category}</td>
                  <td style={{ minWidth: '80px' }}>{product.brand}</td>
                  <td style={{ minWidth: '80px' }}>{product.model}</td> */}
                  {/* <td style={{ textAlign: 'right' }}>¥{product.price.toLocaleString()}</td>
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
                  </td>*/}
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
                    {/* <button 
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
                    </button> */}
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="scroll-table" 
        ref={scrollableTableContainer} 
        style={{ 
          flex:1,
          overflowX: "auto", // 允许水平滚动
          overflowY: "auto", // 允许垂直滚动
          // minWidth: `${scrollableTableContainerMinWidth.toFixed(0)}px`,
          width: `${scrollableTableContainerMinWidth.toFixed(0)}px`,
          boxSizing: "border-box",
          }}>
          <table
            id="scrollableTable"
            ref={scrollableTableRef}
            border={0}
            cellPadding={8}
            cellSpacing={0}
            style={{
              width: "100%",
              minWidth: `${scrollableTableMinWidth}px`,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f5f5f5",
                  position: "sticky", // Jay-固定表头，重要~！
                  top: 0, // Jay-固定在顶部，重要~！
                  zIndex: 1, // 确保在内容之上
                }}
              >
                {/* <th>ID1</th>
                <th>产品名称</th>
                <th>分类</th> */}
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
                {/* <th style={{ width: "200px" }}>操作</th> */}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  {/* <td>{product.id}</td>
                  <td style={{ minWidth: '180px' }}>{product.name}</td>
                  <td>{product.category}</td> */}
                  <td>{product.brand}</td>
                  <td>{product.model}</td>
                  <td style={{ textAlign: "right" }}>
                    ¥{product.price.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    ¥{product.cost.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right" }}>{product.stock}</td>
                  <td style={{ textAlign: "right" }}>{product.weight}</td>
                  <td>{product.dimensions}</td>
                  <td>{product.color}</td>
                  <td>{product.material}</td>
                  <td>{product.manufacturerCountry}</td>
                  <td>{product.releaseDate}</td>
                  <td>{product.warranty}</td>
                  <td style={{ textAlign: "right" }}>{product.rating}</td>
                  <td
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.description}
                  </td>
                  {/* <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    <button
                      style={{
                        margin: "0 2px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      onClick={() => alert(`查看产品 ${product.name}`)}
                    >
                      查看
                    </button>
                    <button
                      style={{
                        margin: "0 2px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      onClick={() => alert(`编辑产品 ${product.name}`)}
                    >
                      编辑
                    </button>
                    <button
                      style={{
                        margin: "0 2px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#FF9800",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      onClick={() => alert(`复制产品 ${product.name}`)}
                    >
                      复制
                    </button>
                    <button
                      style={{
                        margin: "0 2px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (confirm(`确定要删除产品 ${product.name} 吗？`)) {
                          alert(`已删除产品 ${product.name}`);
                        }
                      }}
                    >
                      删除
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HelloWorld;
