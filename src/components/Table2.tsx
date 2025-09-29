import React, { useEffect, useState } from "react";
import { generateMockProducts, productsGroupByColumns } from "../utils/mockData";
import type { Product, GroupNode } from "../types/Product";
import { sampleColumnsConfig,type UnderGroupsProps,type ColumnConfig } from "../types/editableCell";
import {toPx} from "../utils/convert"
import {type Width} from "../types/editableCell"
import Row2 from "./Row2"

import {
    COLUMN_DEFAULT_WIDTH,
    MAIN_BG,
    GROUP_BG,
    HEADER_BG,
    LEVEL_1_FONT_WEIGHT,
    FONT_WEIGHT_DECRISE_PER_LEVEL,
    LEVEL_1_FONT_SIZE,
    FONT_SIZE_DECRISE_PER_LEVEL,
    LEVEL_1_HEIGHT,
    HEIGHT_DECRISE_PER_LEVEL
} from "../utils/CONSTANT"
/**
 * 分组可滚动表格（div 模拟）- React + TypeScript（无 Tailwind，无 CSS Modules，纯内联样式）
 * - 多级分组：分组标题吸顶；
 * - 表头吸顶；
 * - 冻结前 n 列；
 * - 缩进占位列；
 * - 可复现随机，避免 CSR/SSR 不一致。
 */
export interface Column<T = any> {
    key: keyof T & string;
    label: string;
    width: Width; // 仅像素宽度，支持 number 或 "100px"
}

export interface RowRecord {
    id: number | string;
    [key: string]: string | number | boolean | undefined;
}

interface BaseCellProps {
    width: Width;
    left?: number;
    sticky?: boolean;
    children?: React.ReactNode;
}

interface TableSectionProps {
    data: Product[];
    top: number; // sticky top for header
    indentWidth: number; // px
    columnsConfig: ColumnConfig[];
    /**
     * 当前数据行所在的分组路径
     * 例如：[
     *   { columnName: 'category', value: 'category_xxx' },
     *   { columnName: 'brand', value: 'brand_xxx'
     * ]
     * 表示当前数据行在 category=category_xxx(一级分类) 且 brand=brand_xxx(二级分类) 的分组下
     * 如果为空，则表示当前记录在顶层分组下
     * **/
    underGroups:UnderGroupsProps[];
    onRowOrderChange:(fromIndex: number, toIndex: number, underGroups:UnderGroupsProps[])=>void;
}

interface GroupSectionProps {
    group: GroupNode;
    level: number; // 从 1 开始的分组层级
    thisTop?: number; // 该分组标题的 sticky top
    columnsConfig: ColumnConfig[];
    underGroups:UnderGroupsProps[];
    onRowOrderChange:(fromIndex: number, toIndex: number, underGroups:UnderGroupsProps[])=>void;
}
export const freezeCount = 3; // 冻结前 n 列
export const indentPerLevel = 20; // 每级缩进 px


// —— 计算整表宽度（包含缩进列）
function calcTableWidth(indentWidth: number, columnsConfig: ColumnConfig[]): number {
    let total = indentWidth;
    for (const col of columnsConfig) {
        // 获取 width 属性，支持 number 或字符串（如 "120px"）
        let width = col.style?.width;
        let px = 0;
        if (typeof width === "number") {
            px = width;
        } else if (typeof width === "string") {
            // 支持 "120px" 或 "120"
            px = width.endsWith("px") ? parseInt(width, 10) : parseInt(width, 10);
        }
        total += px > 0 ? px : 100; // 默认宽度100px
    }
    return total;
}

// —— 基础单元格（纯内联样式）
function BaseCell({ children, width, left, sticky }: BaseCellProps) {
    const w = typeof width === "number" ? `${width}px` : width;
    const px = typeof width === "number" ? width : toPx(width,COLUMN_DEFAULT_WIDTH);
    const style: React.CSSProperties = {
        width: w,
        minWidth: w,
        maxWidth: w,
        left: sticky ? left : undefined,
        position: sticky ? "sticky" : undefined,
        zIndex: sticky ? 5 : undefined,
        background: sticky ? GROUP_BG : undefined,
        boxSizing: "border-box",
        // overflow: "hidden",
        whiteSpace: "nowrap",
        fontSize: 13,
        padding: "6px 12px",
        borderRight: sticky ?"0px solid #eee":"1px solid #eee",
        flex: `0 0 ${px}px`,
        flexShrink: 0,
    };
    return <div style={style}>{children}</div>;
}

function HeaderCell(props: BaseCellProps) {
    const style: React.CSSProperties = {
        fontWeight: 500,
    };
    return <BaseCell {...props}>{<div style={style}>{props.children}</div>}</BaseCell>;
}

// —— 表格片段（表头 + 数据行）
function TableSection({ data, top, indentWidth, columnsConfig,underGroups,onRowOrderChange }: TableSectionProps) {
    const indentW = indentWidth; // px
    const headerRowStyle: React.CSSProperties = {
        display: "flex",
        position: "sticky" as const,
        top,
        background: HEADER_BG,
        zIndex: 10,
        borderBottom: "5px solid #ddd",
    };

    const dataRowStyle: React.CSSProperties = {
        display: "flex",
        borderBottom: "1px solid #eee",
        background: "#fff",
    };

    const groupKey = React.useMemo(()=>
        underGroups.map(g=>`${g.columnName}=${g.value}`).join("|"),
        [underGroups]
    );

    const handleRowDrop = React.useCallback((from: number, to: number) => {
       onRowOrderChange(from,to,underGroups);
    },[onRowOrderChange, underGroups]);
    return (
        <>
            {/* 表头 */}
            <div style={{
                ...headerRowStyle,
                position: "sticky",
            }}>
                {/* 缩进占位列（冻结） */}
                <HeaderCell width={indentW} left={0} sticky />
                {(() => {
                    let accLeft = indentW;
                    return columnsConfig.map((col, ci) => {
                        const w = toPx(col.style?.width,COLUMN_DEFAULT_WIDTH);
                        const cell = (
                            <HeaderCell
                                key={col.columnName}
                                width={w}
                                left={ci < freezeCount ? accLeft : undefined}
                                sticky={ci < freezeCount}
                            >
                                {col.title}
                            </HeaderCell>
                        );
                        accLeft += w;
                        return cell;
                    });
                })()}
            </div>

            {/* 数据行 */}
            {data.map((row,index) => {             
                return (
                    <div key={row.id} style={dataRowStyle}>
                        <Row2 index={index} 
                                columnsConfig={columnsConfig} 
                                key={`${row.id}-${index}`} 
                                product={row} 
                                indentW={indentW} 
                            freezeCount={freezeCount}
                                isEditing={false} 
                                isSaving={false} 
                                groupKey={groupKey}
                                onRowDrop={handleRowDrop}
                        />  
                    </div>
                );
            })}
        </>
    );
}

// —— 分组递归渲染
function GroupSection({ group, level, thisTop, columnsConfig,underGroups,onRowOrderChange }: GroupSectionProps) {

    const indentToTheLeft = indentPerLevel * level + "px";
    const fontWeight = LEVEL_1_FONT_WEIGHT - (level - 1) * FONT_WEIGHT_DECRISE_PER_LEVEL;
    const fontSize = LEVEL_1_FONT_SIZE - (level - 1) * FONT_SIZE_DECRISE_PER_LEVEL;
    const height = LEVEL_1_HEIGHT - (level - 1) * HEIGHT_DECRISE_PER_LEVEL;
    const indentWidth = level * indentPerLevel + indentPerLevel; // 标题后的表格再缩进一格

    const titleStyle: React.CSSProperties = {
        position: "sticky",
        top: (thisTop || 0) + "px",
        background: GROUP_BG,
        zIndex: 30,
        left: 0,
        right:0,
        // fontWeight: 700,
        // fontSize: 16,
        paddingTop: "5px",
        // paddingBottom: "10px",
        paddingRight: "20px",
        borderBottom: "0px solid #ccc",
        
    };

    const groupTitleRef = React.useRef<HTMLDivElement>(null);
    /**
     * 下一个分组标题的 sticky top = 本分组标题的 offsetHeight + 本分组标题的 thisTop
     * 初始渲染时，offsetHeight 为 0
    */
    const [nextTop, setNextTop] = useState<number>(0);

    /**Jay-useLayoutEffect 会在浏览器完成样式计算与布局之后、绘制之前执行，保证拿到的是最终高度。 */
    React.useLayoutEffect(() => {
        const h = groupTitleRef.current?.offsetHeight ?? 0;
        setNextTop(h + (thisTop ?? 0));
    }, [thisTop]);

    const currentPath =
        group.name !== undefined && group.groupBy
        ? [...underGroups, { columnName: group.groupBy, value: group.name }]
        : underGroups;
    return (
        <>
            {/* 分组标题（sticky） */}
            {group.name !== undefined && (
                <div style={{
                    paddingLeft: indentToTheLeft,
                    fontWeight,
                    fontSize,
                    height,
                    ...titleStyle
                }} ref={groupTitleRef}>
                    {group.groupBy ? `${group.groupBy}:${group.name}` : group.name}
                </div>
            )}

            {/* 子分组或数据 */}
            {group.children && group.children.length > 0 ? (
                group.children.map((child, idx) => (
                    <GroupSection key={`${group.name}-${idx}`} group={child} level={level + 1} thisTop={nextTop} 
                    columnsConfig={columnsConfig} underGroups={currentPath} onRowOrderChange={onRowOrderChange}/>
                ))
            ) : group.data && group.data.length > 0 ? (
                <div 
                style={{ width: calcTableWidth(indentWidth,columnsConfig) }}
                >
                <TableSection data={group.data} top={nextTop} indentWidth={indentWidth} 
                underGroups={currentPath}
                columnsConfig={columnsConfig} 
                onRowOrderChange={onRowOrderChange}/>
                </div>
            ) : null}
        </>
    );
}

/**
 * 默认导出 Demo 组件
 * 如需封装为可复用组件，可把 columns/freezeCount/defaultGroups/indentPerLevel 作为 props 传入。
 */
export default function GroupedStickyTableDemo(): JSX.Element {
    //   const groups = useMemo(() => defaultGroups, []);
    const [groups, setGroups] = useState<GroupNode[]>([]);
    const [columnsConfig, setColumnsConfig] = useState<ColumnConfig[]>([]);

    const groupByColumnNames = ["category","brand"]; // 分组字段，有两种分组
    // const groupByColumnNames = ["category"]; // 分组字段，有一种分组
    // const groupByColumnNames:any[] = []; // 没有任何分组的情况
    /**
     * 从后台读出表格要展示的数据
     */
    useEffect(() => {
        // 生成测试数据 - 增加到80条以便展示更多内容
        const mockProducts = generateMockProducts(80);
        const grouped: GroupNode[] = productsGroupByColumns(groupByColumnNames, mockProducts);
        setGroups(grouped);

        // TODO:从后台获取列配置
        setColumnsConfig(sampleColumnsConfig);
    }, []);

    const containerStyle: React.CSSProperties = {
        height: "92vh",
        width: "auto",
        overflowX: "auto",
        overflowY: "auto",
        background: MAIN_BG,
        // minWidth: `${calcTableWidth(indentPerLevel, columnsConfig)}px`, // 动态设置宽度, 
    };

    /**
     * 在某个分组下，拖拽调整行顺序
     * @param fromIndex 
     * @param toIndex 
     * @param underGroups 
     */
    const reOrderRowHandler = (fromIndex: number, toIndex: number, underGroups:UnderGroupsProps[]) => {
        if(!underGroups || underGroups.length!== groupByColumnNames.length){
            return;
        }
        const cols = new Set(underGroups.map(g => g.columnName));
        if (cols.size !== groupByColumnNames.length) return;
        if (!groupByColumnNames.every(c => cols.has(c))) return;
        setGroups((prevGroups)=>{
            const newGroups = [...prevGroups];
            let targetGroup:GroupNode|undefined=undefined;
            if(underGroups.length===0 && newGroups.length>0){
                //没有分组，全部数据一起展示的情况
                targetGroup = newGroups[0] as GroupNode;
            }else{
                //数据有分组的情况
                let groupsLevel = newGroups;
                for(const g of underGroups){
                    targetGroup = groupsLevel.find(gr=>gr.groupBy===g.columnName && gr.name===g.value);
                    if(targetGroup && targetGroup.children){
                        groupsLevel = targetGroup.children;
                    }
                }
            }
            if(targetGroup && targetGroup.data){
                const data = targetGroup.data;
                const [moved] = data.splice(fromIndex, 1);
                data.splice(toIndex, 0, moved);
                targetGroup.data = data;
                return newGroups;
            }else{
                return prevGroups;
            }
        });
    }

    return (
        <div style={containerStyle}>
            {groups.map((g, i) => (
                <GroupSection key={`g-${i}`} group={g} level={1} underGroups={[]}
                columnsConfig={columnsConfig} onRowOrderChange={reOrderRowHandler}/>
            ))}
        </div>
    );
}
