import React, { useEffect, useState } from "react";
import { generateMockProducts, productsGroupByColumns } from "../utils/mockData";
import type { Product, GroupNode } from "../types/Product";
import { sampleColumnsConfig } from "../types/editableCell";
import type { ColumnConfig } from "../types/editableCell";
import {toPx} from "../utils/convert"
import {type Width} from "../types/editableCell"
import RowCore2 from "./RowCore2"
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
}

interface GroupSectionProps {
    group: GroupNode;
    level: number; // 从 1 开始的分组层级
    thisTop?: number; // 该分组标题的 sticky top
    columnsConfig: ColumnConfig[];
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

function ContentCell(props: BaseCellProps) {
    return <BaseCell {...props} />;
}

// —— 表格片段（表头 + 数据行）
function TableSection({ data, top, indentWidth, columnsConfig }: TableSectionProps) {
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
            {data.map((row) => {
                let accLeft =0;                
                return (
                    <div key={row.id} style={dataRowStyle}>
                    {/* <RowCore2 product={row} columnsConfig={columnsConfig} indentW={indentW} 
                            freezeCount={freezeCount} accLeft={accLeft}/> */}
                        {/* 缩进占位列（冻结） */}
                        <BaseCell width={indentW} left={accLeft} sticky />
                        {(() => {
                            accLeft += indentW;
                            // return RowCore2(row,columnsConfig,freezeCount,accLeft);
                            return columnsConfig.map((col, ci) => {
                                const w = toPx(col.style?.width,COLUMN_DEFAULT_WIDTH);
                                const value = (row as any)[col.columnName];
                                const cell = (
                                    <ContentCell
                                        key={`${row.id}-${col.columnName}`}
                                        width={w}
                                        left={ci < freezeCount ? accLeft : undefined}
                                        sticky={ci < freezeCount}
                                    >
                                        {value as React.ReactNode}
                                    </ContentCell>
                                );
                                accLeft += w;
                                return cell;
                            });
                        })()}
                    </div>
                );
            })}
        </>
    );
}

// —— 分组递归渲染
function GroupSection({ group, level, thisTop, columnsConfig }: GroupSectionProps) {

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
                    <GroupSection key={`${group.name}-${idx}`} group={child} level={level + 1} thisTop={nextTop} columnsConfig={columnsConfig} />
                ))
            ) : group.data && group.data.length > 0 ? (
                <div 
                style={{ width: calcTableWidth(indentWidth,columnsConfig) }}
                >
                <TableSection data={group.data} top={nextTop} indentWidth={indentWidth} columnsConfig={columnsConfig} />
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


    /**
     * 从后台读出表格要展示的数据
     */
    useEffect(() => {
        // 生成测试数据 - 增加到80条以便展示更多内容
        const mockProducts = generateMockProducts(80);
        const grouped: GroupNode[] = productsGroupByColumns(["category","brand"], mockProducts);
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
    const innerStyle: React.CSSProperties = {
        display: "inline-block",
        minWidth: `${calcTableWidth(indentPerLevel, columnsConfig)}px`, // 动态设置宽度,    
    };

    return (
        <div style={containerStyle}>
            {/* <div style={innerStyle}> */}
            {groups.map((g, i) => (
                <GroupSection key={`g-${i}`} group={g} level={1} columnsConfig={columnsConfig} />
            ))}
            {/* </div> */}
        </div>
    );
}
