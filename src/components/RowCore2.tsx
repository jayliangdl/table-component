import React, { useCallback, useEffect } from "react";
import type { ColumnConfig } from "../types/editableCell";
import type { Product, ProductInUI } from "../types/Product";
import { toPx } from "../utils/convert"
import { type Width } from "../types/editableCell"
import EditableCell2 from "./EditableCell2";
import type { Id } from "../types/id";

import {
    COLUMN_DEFAULT_WIDTH,
    GROUP_BG,
} from "../utils/CONSTANT"

interface BaseCellProps {
    width: Width;
    left?: number;
    sticky?: boolean;
    children?: React.ReactNode;
}

export interface RowCore2Props {
    indexInGroup: number; //当前行在所属分组中的索引位置
    product: Product;
    isEditing: boolean;
    isSaving: boolean;
    columnsConfig: ColumnConfig[];
    indentW: number;
    freezeCount: number;
    style?: React.CSSProperties;
    className?: string; //用于拖拽时的样式  
    onCellChange: (rowId: string, column: string, value: any) => void;
    onSave: (indexInGroup: number, newRecord: any) => Promise<void>;
    onCancel: (indexInGroup: number) => Promise<void>;
    onEdit: (indexInGroup: number) => void;
    onDelete: (indexInGroup: number) => Promise<void>;
    isColumnEditable: (columnIndex: number,column: ColumnConfig) => boolean;
}

// —— 基础单元格（纯内联样式）
function BaseCell({ children, width, left, sticky }: BaseCellProps) {
    const w = typeof width === "number" ? `${width}px` : width;
    const px = typeof width === "number" ? width : toPx(width, COLUMN_DEFAULT_WIDTH);
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
    return <div style={style}>{children}</div>;
}

const RowCore2 = (rowProps: RowCore2Props) => {
    const {
        indexInGroup,
        product,
        isEditing,
        isSaving,
        columnsConfig,
        indentW,
        freezeCount,
        style,
        className,
        onCellChange,
        onSave,
        onCancel,
        onEdit,
        onDelete,
        isColumnEditable,
    } = rowProps;

    /**
     * 行中每个字段更新后的处理思路：
     * 1. 每个EditableCell组件中，值变化时触发onColumnValueChange，会回调父组件（即本组件）传入的handleCellChange方法，传递columnName和最新值
     * 2. 本组件中，onColumnValueChange方法会更新当前行数据currentRowData
     * 3. currentRowData变更后，会通过useEffect更新currentRecordDataRef（类型：React.useRef）引用
     * 4. 当用户点击保存按钮时，调用handleSave方法，通知上层父组件（Table组件）的onSave方法，并传递最新的行数据currentRecordDataRef.current
     * 5. 这样就实现了每个字段更新后，最终保存时，传递最新的整行数据
     */
    const [currentRowData, setCurrentRowData] = React.useState<ProductInUI>(product);

    useEffect(() => {
        setCurrentRowData(product);
    }, [product]);

    const handleCellChange = useCallback((rowId: Id, column: string, value: any) => {
        onCellChange(String(rowId), column, value);
        setCurrentRowData((prev:ProductInUI) => ({...prev, [column]: value}));

    }, [onCellChange]);

    const currentRecordDataRef = React.useRef<any>(currentRowData);
    currentRecordDataRef.current = currentRowData;//Jay-实时更新引用，重要，否则保存时会取到旧值

    //当用户点击保存按钮时，调用此函数，通知上层父组件（onSave），并传递最新的行数据
    const handleSave = useCallback(async () => {
        await onSave(indexInGroup, currentRecordDataRef.current);
    }, [onSave, indexInGroup, product]);

    //当用户点击编辑按钮时，触发的方法
    const handleEdit = useCallback((): Promise<void> => {
        //开始编辑前，先记录当前行数据的原始值
        // setRowDataBeforeEdit(currentRowData);        
        onEdit(indexInGroup);
        return Promise.resolve();
    }, [onEdit, currentRowData, indexInGroup]);

    //当用户点击取消按钮时，触发的方法
    const handleCancel = useCallback(async (): Promise<void> => {
        await onCancel(indexInGroup);
        return Promise.resolve();
    }, [onCancel, indexInGroup]);

    const handleDelete = useCallback(async (): Promise<void> => {
        return await onDelete(indexInGroup);
    } , [onDelete, indexInGroup]);

    const lefts: Array<number | undefined> = [];
    let pos = indentW;
    for (let i = 0; i < columnsConfig.length; i++) {
        if (i < freezeCount) {
            lefts[i] = pos;
            pos += toPx(columnsConfig[i].style?.width, COLUMN_DEFAULT_WIDTH);
        } else {
            lefts[i] = undefined;
        }
    }
    return (
        <div style={{ ...style, display: "flex" }}
            className={className}>
            {/* 缩进占位列（冻结） */}
            <BaseCell width={indentW} left={0}
                sticky />
            {
                columnsConfig.map((col, ci) => {
                    const w = toPx(col.style?.width, COLUMN_DEFAULT_WIDTH);
                    const isFreezeColumn = ci < freezeCount;                    
                    // const editable = !!col.editConfig || col.type === "actionButton" || ;
                    const editable = isColumnEditable(ci,col);
                    const disabled = false;
                    const readOnly = false;
                    const cell = (
                        <BaseCell
                            width={w}
                            key={`${product.id}-${col.columnName}`}
                            left={isFreezeColumn ? lefts[ci] : undefined}
                            sticky={isFreezeColumn}
                        >
                            {/* {value as React.ReactNode} */}

                            <EditableCell2 key={`${col.columnName}-${product.id}`}
                            indexInGroup={indexInGroup}
                                columnEditConfig={col.editConfig}
                                columnName={col.columnName}
                                recordId={product.id}
                                style={style}
                                editable={editable}
                                // value={currentRowData[col.dataIndex]}
                                value={(product as any)[col.dataIndex]}
                                isEditing={isEditing}
                                isSaving={isSaving}
                                type={col.type}
                                disabled={disabled}
                                readOnly={readOnly}
                                displayConfig={col.displayConfig}
                                onColumnValueChange={(colName, v) => handleCellChange(product.id, colName, v)}
                                onCancel={handleCancel}
                                onEdit={handleEdit}
                                onSave={handleSave}
                                onDelete={handleDelete}

                            />
                        </BaseCell>
                    );
                    return cell;
                })
            }
        </div>
    )
};
export default RowCore2;