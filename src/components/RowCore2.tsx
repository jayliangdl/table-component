import React from "react";
import type { ColumnConfig } from "../types/editableCell";
import type { Product } from "../types/Product";
import {toPx} from "../utils/convert"
import {type Width} from "../types/editableCell"
import {
    COLUMN_DEFAULT_WIDTH,
    GROUP_BG,
} from "../utils/CONSTANT"

interface BaseCellProps {
    width: Width;
    left?: number;
    sticky?: boolean;
    children?: React.ReactNode;
    draggable?: boolean; // 是否可拖拽
}

export interface RowCore2Props {
  product: Product;
  columnsConfig: ColumnConfig[];
  indentW: number;
  freezeCount: number;
  accLeft: number; // Add accLeft if needed for sticky columns
  draggable?: boolean; // 是否可拖拽
}

// —— 基础单元格（纯内联样式）
function BaseCell({ children, width, left, sticky,draggable}: BaseCellProps) {
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
        borderRight: sticky ? "0px solid #eee" : "1px solid #eee",
        flex: `0 0 ${px}px`,
        flexShrink: 0,
    };
    return <div style={style} draggable={draggable}>{children}</div>;
}

const RowCore2= React.forwardRef<HTMLDivElement, RowCore2Props>((rowProps,ref) => {
    const {    
        product, 
        columnsConfig,
        indentW, 
        freezeCount,
        draggable,
    } = rowProps;

    let accLeft = 0;
    return (
    <div ref={ref}>
        {/* 缩进占位列（冻结） */}
        <BaseCell width={indentW} left={accLeft} draggable={draggable} sticky />
        {(accLeft += indentW)}
        {            
            columnsConfig.map((col,ci) => {
                const w = toPx(col.style?.width,COLUMN_DEFAULT_WIDTH);
                const value = (product as any)[col.columnName];
                const isFreezeColumn = ci < freezeCount;
                const cell = (
                    <BaseCell 
                    width={w}
                    key={`${product.id}-${col.columnName}`}
                        left={isFreezeColumn ? accLeft : undefined}
                        sticky={isFreezeColumn}
                    draggable={draggable}
                    >
                    {value as React.ReactNode}
                    </BaseCell>
                );
                accLeft += w;
                return cell;
            })
        }
    </div>)
});
export default RowCore2;