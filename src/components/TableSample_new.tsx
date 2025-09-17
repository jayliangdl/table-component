import React, { useState, useEffect, useRef } from "react";
import type { Product } from "../types/Product";
import { generateMockProducts } from "../utils/mockData";
import "./TableSample.module.css";

const TableSampleNew: React.FC = () => {
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

  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        /**
         * Jay-处理两表表头行高不一致的问题
         * 问题：
         * 两侧表格的th内容不一致（例如某一侧的表头的字数太多，可能存在换行，而另一侧没有），导致行高不一致
         * 解决方案：
         * 1. 分别获取两侧表格的thead元素
         * 2. 计算thead的高度，取两者中较大的值，设置为两侧thead的高度
         * 3. 进一步，遍历thead中的每一行（tr），分别计算每一行的高度，取两侧中较大的值，设置为对应行的高度
         * 4. 这样可以确保无论表头内容如何变化，两侧表格的表头行高始终保持一致，避免错位
         * 5. 该逻辑同样适用于tbody中的行高同步
         */
        // 头部高度同步
        const fixedThread  = fixedTable.querySelector("thead");
        const scrollThread = scrollableTable.querySelector("thead");
        if (fixedThread && scrollThread) {
            const fixedHeaderHeight = (fixedThread as HTMLElement).offsetHeight;
            const scrollHeaderHeight = (scrollThread as HTMLElement).offsetHeight;
            const maxHeaderHeight = Math.max(fixedHeaderHeight, scrollHeaderHeight);
            (fixedThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
            (scrollThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
        }

        //同步表头行高度
        const fixedThreadRows = fixedTable.querySelectorAll("thead tr");
        const scrollThreadRows = scrollableTable.querySelectorAll("thead tr");

        fixedThreadRows.forEach((row, index) => {
            const scrollRow = scrollThreadRows[index];
            if (scrollRow) {
            const fixedRowHeight = (row as HTMLElement).offsetHeight;
            const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
            // 取两个表格中较大的行高，确保内容都能完整显示
            const maxHeight = Math.max(fixedRowHeight, scrollRowHeight);
            (row as HTMLElement).style.height = `${maxHeight}px`;
            (scrollRow as HTMLElement).style.height = `${maxHeight}px`;
            }
        });

        /**
         * Jay-处理两表tbody行高不一致的问题
         * 问题：
         * 两侧表格的td内容不一致（例如某一侧的单元格的字数太多，可能存在换行，而另一侧没有），导致行高不一致
         * 解决方案：
         * 1. 分别获取两侧表格的tbody元素
         * 2. 遍历tbody中的每一行（tr），分别计算每一行的高度，取两侧中较大的值，设置为对应行的高度
         * 3. 这样可以确保无论单元格内容如何变化，两侧表格的行高始终保持一致，避免错位
         */
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
            console.log(`同步行 ${index} 高度: ${maxHeight}px`);
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


    

    const createScrollHandler = (source: 'fixed' | 'scrollable') => {
        return (event: Event) => {
            event.preventDefault(); // 阻止默认的垂直滚动行为
            //防止循环滚动
            if(isScrollingRef.current) {
                return; // 如果正在滚动，忽略新的滚动事件
            }
            const target = event.target as HTMLElement;
            const newScrollTop = target.scrollTop;

            //设置滚动标记，防止循环触发
            isScrollingRef.current = true;
            if(source === 'fixed') {
                scrollableContainer.scrollTop = newScrollTop;
            } else {
                fixedContainer.scrollTop = newScrollTop;
            }
            //重新同步高度
            requestAnimationFrame(syncHeights);
            //清除滚动标志（延迟一点时间可以确保同步完成）
            if(scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
            }, 10); // 10ms后允许新的滚动事件
        }
    }

    const handleLeftMouseWheel = (event: WheelEvent) => {
        event.preventDefault(); // 阻止默认的垂直滚动行为
        if(isScrollingRef.current) {
            return; // 如果正在滚动，忽略新的滚动事件
        }

        //计算新的滚动位置
        const deltaY = event.deltaY;
        const currentScrollTop = scrollableContainer.scrollTop;
        /**
         * Jay：
         * scrollableContainer.scrollHeight为整个内容（例如整个表格所有记录，包括未能在一屏显示出来的部分）
         * scrollableContainer.clientHeight为可视区域（例如当前屏幕能显示出来的部分）
         * maxScrollTop为最大滚动高度（例如滚动到最底部时，scrollTop的值）
         */
        const maxScrollTop = scrollableContainer.scrollHeight - scrollableContainer.clientHeight;
        /**
         * Jay-
         * currentScrollTop + deltaY为新的滚动位置
         */
        const newScrollTop = Math.min(Math.max(currentScrollTop + deltaY, 0), maxScrollTop);
        //设置滚动标记，防止循环触发
        isScrollingRef.current = true;
        //同步滚动位置到另一侧表格
        scrollableContainer.scrollTop = newScrollTop;
        fixedContainer.scrollTop = newScrollTop;

        requestAnimationFrame(syncHeights);

        //清除滚动标记
        if(scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
        }, 10); // 10ms后允许新的滚动事件
    };

    const rightScrollHandler = createScrollHandler('scrollable');
    const leftScrollHandler = createScrollHandler('fixed');

    //监听滚动事件
    scrollableContainer.addEventListener('scroll', rightScrollHandler);
    fixedContainer.addEventListener('scroll', leftScrollHandler);
    
    //监听左侧表格的鼠标滚轮事件
    fixedContainer.addEventListener('wheel', handleLeftMouseWheel, { passive: false });
    // 滚动同步处理函数
    const handleScroll = () => {
        // console.log(`scrollTop: ${scrollableContainer.scrollTop}`);
        fixedContainer.scrollTop = scrollableContainer.scrollTop;
        syncHeights();
    };
    scrollableContainer.addEventListener('scroll', rightScrollHandler);
    scrollableContainer.addEventListener('scroll', handleScroll);
    syncHeights(); // 初始同步高度

      // 窗口大小变化时重新同步
      const handleResize = () => {
        syncHeights();
      };
      window.addEventListener('resize', handleResize);

      // 清理函数：移除事件监听器
    return () => {
        scrollableContainer.removeEventListener('scroll', handleScroll);
        // fixedContainer.removeEventListener('scroll', handleScroll);
        // fixedContainer.removeEventListener('wheel', handleLeftMouseWheel);
        window.removeEventListener('resize', handleResize);
    };
    },[products]);

    const getHeaderStyle = (additionStyle?:React.CSSProperties): React.CSSProperties => {
      const stylesParams = {
        fontSize: '14px',
        fontWeight: 'bold',
      }
      const ret =  additionStyle?
      {
        ...stylesParams,
        // padding: "8px",
        // // border: "none",
        // border: "1px solid #ddd",
        // textAlign: "left" as const,
        // backgroundColor: "#f5f5f5",
        // position: "sticky" as const,
        // top: 0,
        // zIndex: 1,
        ...additionStyle,
      }:{
        ...stylesParams,
      };
      return ret;
    };

    const getContentStyle = (additionStyle?:React.CSSProperties): React.CSSProperties => {
      const stylesParams = {
        fontSize: '13px',
        padding: "8px",
        // border: "0px solid #ddd",
      };

      const ret = additionStyle?
      {
          ...stylesParams,
          ...additionStyle,
      }:{
          ...stylesParams,
      };
      return ret;
    };


  return (
    <div
      className="table-sample"
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
              // borderCollapse: "collapse",
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

                <th style={getHeaderStyle({ width: "100px" })}>ID</th>
                <th style={getHeaderStyle({ minWidth: '180px' })}>产品名称</th>
                <th style={getHeaderStyle({ minWidth: '80px' })}>分类</th>
                <th style={getHeaderStyle({ minWidth: '80px' })}>品牌</th>
                <th style={getHeaderStyle()}>型号</th>
                <th style={getHeaderStyle()}>价格(¥)</th>
                <th style={getHeaderStyle()}>成本(¥)</th>
                <th style={getHeaderStyle()}>库存</th>
                {/* <th style={getHeaderStyle()}>重量(kg)</th>
                <th style={getHeaderStyle()}>尺寸</th>
                <th style={getHeaderStyle()}>颜色</th>
                <th style={getHeaderStyle()}>材质</th>
                <th style={getHeaderStyle()}>产地</th>
                <th style={getHeaderStyle()}>发布日期</th>
                <th style={getHeaderStyle()}>保修</th>
                <th style={getHeaderStyle()}>评分</th>
                <th style={getHeaderStyle()}>描述</th>  */}
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
                  <td style={getContentStyle({ textAlign: 'right'})}>¥{product.price.toLocaleString()}</td>
                  <td style={getContentStyle({ textAlign: 'right'})}>¥{product.cost.toLocaleString()}</td>
                  <td style={getContentStyle({ textAlign: 'right'})}>{product.stock}</td>

                  {/* <td style={getContentStyle({ textAlign: 'right' }}>{product.weight}</td>
                  <td style={getContentStyle()}>{product.dimensions}</td>
                  <td style={getContentStyle()}>{product.color}</td>
                  <td style={getContentStyle()}>{product.material}</td>
                  <td style={getContentStyle()}>{product.manufacturerCountry}</td>
                  <td style={getContentStyle()}>{product.releaseDate}</td>
                  <td style={getContentStyle()}>{product.warranty}</td>
                  <td style={getContentStyle({ textAlign: 'right' })}>{product.rating}</td>
                  <td style={getContentStyle({ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
                    {product.description}
                  </td>*/}
                  <td style={getContentStyle({ textAlign: 'center', whiteSpace: 'nowrap' })}>
                    <button 
                      style={{ 
                        margin: '0 2px', 
                        padding: '4px 8px', 
                        // fontSize: '12px',
                        // backgroundColor: '#4CAF50',
                        color: '#2196F3',
                        border: 'none',
                        // borderRadius: '3px',
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
                        color: '#2196F3',
                        border: 'none',
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
                        color: '#2196F3',
                        border: 'none',
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
                        color: '#2196F3',
                        border: 'none',
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
        <div className="scroll-table" 
        ref={scrollableTableContainer} 
        style={{ 
          flex:1,
          overflowX: "auto", // 允许水平滚动
          overflowY: "auto", // 允许垂直滚动
          // minWidth: `${scrollableTableContainerMinWidth.toFixed(0)}px`,
          // width: `${scrollableTableContainerMinWidth.toFixed(0)}px` 
          boxSizing: "border-box",
          }}>
          <table
            ref={scrollableTableRef}
            border={0}
            cellPadding={8}
            cellSpacing={0}
            style={{
              width: "100%",
              minWidth: `${scrollableTableMinWidth}px`,
              // borderCollapse: "collapse",
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
                {/* <th style={getHeaderStyle()}>ID</th>
                <th style={getHeaderStyle()}>产品名称</th>
                <th style={getHeaderStyle()}>分类</th>
                <th style={getHeaderStyle()}>品牌</th>
                <th style={getHeaderStyle()}>型号</th> 
                <th style={getHeaderStyle()}>价格(¥)</th>
                <th style={getHeaderStyle()}>成本(¥)</th>
                <th style={getHeaderStyle()}>库存</th>*/}
                <th style={getHeaderStyle()}>重量(kg)</th>
                <th style={getHeaderStyle()}>尺寸</th>
                <th style={getHeaderStyle()}>颜色</th>
                <th style={getHeaderStyle()}>材质</th>
                <th style={getHeaderStyle()}>产地</th>
                <th style={getHeaderStyle()}>发布日期</th>
                <th style={getHeaderStyle()}>保修</th>
                <th style={getHeaderStyle()}>评分</th>
                <th style={getHeaderStyle()}>描述</th>
                {/* <th style={getHeaderStyle({ width: "200px" })}>操作</th> */}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  {/* <td style={getContentStyle()}>{product.id}</td>
                  <td style={getContentStyle({ minWidth: '180px' })}>{product.name}</td>
                  <td style={getContentStyle()}>{product.category}</td> 
                  <td style={getContentStyle()}>{product.brand}</td>
                  <td style={getContentStyle()}>{product.model}</td>
                  <td style={getContentStyle({ textAlign: "right" })}>
                    ¥{product.price.toLocaleString()}
                  </td>
                  <td style={getContentStyle({ textAlign: "right" })}>
                    ¥{product.cost.toLocaleString()}
                  </td>
                  <td style={getContentStyle({ textAlign: "right" })}>{product.stock}</td>*/}
                  <td style={getContentStyle({ textAlign: "right" })}>{product.weight}</td>
                  <td style={getContentStyle()}>{product.dimensions}</td>
                  <td style={getContentStyle()}>{product.color}</td>
                  <td style={getContentStyle()}>{product.material}</td>
                  <td style={getContentStyle()}>{product.manufacturerCountry}</td>
                  <td style={getContentStyle()}>{product.releaseDate}</td>
                  <td style={getContentStyle()}>{product.warranty}</td>
                  <td style={getContentStyle({ textAlign: "right" })}>{product.rating}</td>
                  <td
                    style={getContentStyle({
                    //   maxWidth: "200px",
                    //   overflow: "hidden",
                    //   textOverflow: "ellipsis",
                    //   whiteSpace: "nowrap",
                    })}
                  >
                    {product.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableSampleNew;