
import {
    GROUP_BG,
    LEVEL_1_FONT_WEIGHT,
    FONT_WEIGHT_DECRISE_PER_LEVEL,
    LEVEL_1_FONT_SIZE,
    FONT_SIZE_DECRISE_PER_LEVEL,
    LEVEL_1_HEIGHT,
    HEIGHT_DECRISE_PER_LEVEL,
    INDENT_PER_LEVEL,
    HEADER_BG,
    COLUMN_DEFAULT_WIDTH,
} from "../utils/CONSTANT"
import { type UnderGroupsProps, type ColumnConfig,type Width } from "../types/editableCell";
import type { Product, ProductInUI,GroupNode } from "../types/Product";
import { toPx } from "../utils/convert"
import Row2 from "./Row2"
import React,{useState,useCallback} from "react";

export interface GroupSectionProps {
    group: GroupNode;// 当前分组节点
    level: number; // 从 1 开始的分组层级
    thisTop?: number; // 该分组标题的 sticky top
    columnsConfig: ColumnConfig[]; // 所有字段配置
    underGroups: UnderGroupsProps[];// 当前数据行所在的分组路径
    freezeCount?: number;// 冻结前 n 列
    handleCellChange: (rowId: string, column: string, value: any) => void;// 单元格值变更的回调函数
    handleRowEdit: (underGroups: UnderGroupsProps[], dataIndexInGroup: number) => void;// 开始编辑行的回调函数
    handleRowSave: (underGroups: UnderGroupsProps[], dataIndexInGroup: number, newRecord: any) => void;// 保存行的回调函数
    handleRowCancel: (underGroups: UnderGroupsProps[], dataIndexInGroup: number) => void;// 取消编辑行的回调函数
    handleRowDelete: (underGroups: UnderGroupsProps[], dataIndexInGroup: number) => void;// 删除行的回调函数
    /**
     * 
     * @param index - 当前行在所属分组下的索引
     * @param currentRecord - 当前行的数据 Product类型
     * @param groupKey - 当前行所在的分组标识对象，如 {category:"category_xxx",brand:"brand_xxx"}
     * @returns - 用于绑定到行元素上的拖拽属性
     */
    getDragRowProps: (index: number, currentRecord: Product, groupKey: Record<string, any>) => React.HTMLAttributes<HTMLDivElement>;// 获取可拖拽行的属性
    getDragColumnProps: (index: number, currentRecord: ColumnConfig, groupKey: undefined) => React.HTMLAttributes<HTMLDivElement>;// 获取可拖拽列的属性
    isColumnEditable : (
        columnIndex: number,
        column: ColumnConfig,
    )=> boolean;// 判断列是否可编辑的函数
}

interface BaseCellProps {
    width: Width;
    left?: number;
    sticky?: boolean;
    children?: React.ReactNode;
}

type BaseCellDomProps = React.HTMLAttributes<HTMLDivElement>;
type HeaderCellProps = BaseCellProps & BaseCellDomProps;

interface TableSectionProps {
    data: ProductInUI[];// 当前分组下的数据行
    top: number; // sticky top for header
    indentWidth: number; // 缩进列宽度
    columnsConfig: ColumnConfig[];// 所有字段配置
    freezeCount?: number;// 冻结前 n 列
    /**
     * 当前数据行所在的分组路径
     * 例如：[
     *   { columnName: 'category', value: 'category_xxx' },
     *   { columnName: 'brand', value: 'brand_xxx'
     * ]
     * 表示当前数据行在 category=category_xxx(一级分类) 且 brand=brand_xxx(二级分类) 的分组下
     * 如果为空，则表示当前记录在顶层分组下
     * **/
    underGroups: UnderGroupsProps[];// 当前数据行所在的分组路径
    getDragRowProps: (index: number, currentRecord: Product, groupKey: Record<string, any>) => React.HTMLAttributes<HTMLDivElement>;
    getDragColumnProps: (index: number, currentRecord: ColumnConfig, groupKey: undefined) => React.HTMLAttributes<HTMLDivElement>;
    handleCellChange: (rowId: string, column: string, value: any) => void;
    handleRowEdit: (underGroups: UnderGroupsProps[], dataIndexInGroup: number) => void;
    handleRowSave: (underGroups: UnderGroupsProps[], dataIndexInGroup: number,newRecord:any) => void;
    handleRowCancel: (underGroups: UnderGroupsProps[], dataIndexInGroup: number) => void;
    handleRowDelete: (underGroups: UnderGroupsProps[], dataIndexInGroup: number) => void;
    // onRowOrderChange:(fromIndex: number, toIndex: number, underGroups:UnderGroupsProps[])=>void;
    isColumnEditable :(
        columnIndex: number,
        column: ColumnConfig,
    )=> boolean;// 判断列是否可编辑的函数
}
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

function HeaderCell({ children, width, left, sticky, style: styleFromProps, ...rest }: HeaderCellProps) {
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
            fontWeight: 500,
            ...(styleFromProps || {}),
        };

        return <div style={style} {...rest}>{children}</div>;
}

// —— 分组递归渲染
export function GroupSection({
    group, level, thisTop, columnsConfig, underGroups,
    freezeCount=0,
    getDragRowProps, getDragColumnProps,
    handleCellChange,
    handleRowEdit, handleRowSave, handleRowCancel, handleRowDelete,
    // onRowOrderChange 
    isColumnEditable,
}: GroupSectionProps) {
    const indentToTheLeft = INDENT_PER_LEVEL * level + "px";
    const fontWeight = LEVEL_1_FONT_WEIGHT - (level - 1) * FONT_WEIGHT_DECRISE_PER_LEVEL;
    const fontSize = LEVEL_1_FONT_SIZE - (level - 1) * FONT_SIZE_DECRISE_PER_LEVEL;
    const height = LEVEL_1_HEIGHT - (level - 1) * HEIGHT_DECRISE_PER_LEVEL;
    const indentWidth = level * INDENT_PER_LEVEL + INDENT_PER_LEVEL; // 标题后的表格再缩进一格

    const titleStyle: React.CSSProperties = {
        position: "sticky",
        top: (thisTop || 0) + "px",
        background: GROUP_BG,
        zIndex: 30,
        left: 0,
        right: 0,
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
        group.value !== undefined && group.groupBy
            ? [...underGroups, { columnName: group.groupBy, value: group.value }]
            : underGroups;
    return (
        <>
            {/* 分组标题（sticky） */}
            {group.value !== undefined && (
                <div style={{
                    paddingLeft: indentToTheLeft,
                    fontWeight,
                    fontSize,
                    height,
                    ...titleStyle
                }} ref={groupTitleRef}>
                    {group.groupBy ? `${group.groupBy}:${group.value}` : group.value}
                </div>
            )}

            {/* 子分组或数据 */}
            {group.children && group.children.length > 0 ? (
                group.children.map((child, idx) => (
                    <GroupSection key={`${group.value}-${idx}`} group={child} level={level + 1} thisTop={nextTop}
                        columnsConfig={columnsConfig} underGroups={currentPath}
                        freezeCount={freezeCount}
                        // onRowOrderChange={onRowOrderChange}
                        getDragRowProps={getDragRowProps}
                        getDragColumnProps={getDragColumnProps}
                        handleCellChange={handleCellChange}
                        handleRowEdit={handleRowEdit}
                        handleRowSave={handleRowSave}
                        handleRowCancel={handleRowCancel}
                        handleRowDelete={handleRowDelete}
                        isColumnEditable={isColumnEditable}
                    />
                ))
            ) : group.data && group.data.length > 0 ? (
                <div
                    style={{ width: calcTableWidth(indentWidth, columnsConfig) }}
                >
                    <TableSection data={group.data} top={nextTop} indentWidth={indentWidth}
                        underGroups={currentPath}
                        columnsConfig={columnsConfig}
                        freezeCount={freezeCount}
                        getDragRowProps={getDragRowProps}
                        getDragColumnProps={getDragColumnProps}
                        handleCellChange={handleCellChange}
                        // onRowOrderChange={onRowOrderChange}
                        handleRowEdit={handleRowEdit}
                        handleRowSave={handleRowSave}
                        handleRowCancel={handleRowCancel}
                        handleRowDelete={handleRowDelete}
                        isColumnEditable={isColumnEditable}
                    />
                </div>
            ) : null}
        </>
    );
}

// —— 表格片段（表头 + 数据行）
function TableSection({
    data, top, indentWidth, columnsConfig,
    freezeCount = 0,
    underGroups, getDragRowProps, getDragColumnProps,
    handleCellChange,
    handleRowEdit, handleRowSave, handleRowCancel, handleRowDelete,
    isColumnEditable,
}: TableSectionProps) {
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
        width:"400px",
    };



    const groupKey: Record<string, any> = React.useMemo(() =>
        underGroups.reduce((acc, group) => {
            acc[group.columnName] = group.value;
            return acc;
        }, {} as Record<string, any>),
        [underGroups]
    );

    // const handleSaveLocal = useCallback((recordId: Id, newRow: RecordData): Promise<void> => {
    //     const rowIndex = products.findIndex((product) => String(product.id) === recordId);
    //     setProducts((prevProducts) => {
    //         return prevProducts.map((product) =>
    //             String(product.id) === recordId ? { ...newRow, isSaving: true } : product
    //         )
    //     }

    //     );

    //     setProducts((prevProducts) =>
    //         prevProducts.map((product) =>
    //             String(product.id) === recordId
    //                 ? { ...newRow, isEditing: false, isSaving: false }
    //                 : product
    //         )
    //     );


    //     //Jay-恢复因变更为修改状态时，行高可能因输入组件导致变高，恢复回显示状态，需要重新调整行高。
    //     // syncRowHeight(rowIndex);

    //     return new Promise((_resolve, _reject) => {

    //     });
    // }, [products]);

    const handleSave = useCallback(async (indexInGroup: number,newRecord: any) => {
        // handleSaveServer(recordId,newRow);//Jay-TODO-先屏蔽，后续完善
        // handleSaveLocal(recordId.toString(), newRow);
        handleRowSave(underGroups, indexInGroup,newRecord);
    }, [underGroups, handleRowSave]);

    /**
 * 用户点击编辑按钮时，触发的方法
 * 要实现的逻辑包括：
 * 1. 将对应行的isEditing设置为true，进入编辑状态
 * 2. 记录当前行数据的快照，以便取消编辑时恢复
 */
    const handleEdit = useCallback((indexInGroup: number) => {
        handleRowEdit(underGroups, indexInGroup);
    }, [underGroups, handleRowEdit]);

    /**
     * 用户点击取消按钮时，触发的方法
     * 要实现的逻辑包括：
     * 1. 将对应行的isEditing设置为false，退出编辑状态
     * 2. 恢复当前行数据为编辑前的快照数据
     * 3. 清除行数据的快照
     * 4. 重新计算行高，确保显示正常
     */
    const handleCancel = useCallback((indexInGroup: number): Promise<void> => {
        handleRowCancel(underGroups, indexInGroup);
        return new Promise((_resolve, _reject) => {
            console.log(`取消编辑记录 indexInGroup: ${indexInGroup}, ${JSON.stringify(underGroups)}`);
        });
    }, [underGroups, handleRowCancel]);

    const handleDelete = useCallback((indexInGroup: number): Promise<void> => {
        handleRowDelete(underGroups, indexInGroup);
        return new Promise((_resolve, _reject) => {
            console.log(`删除记录 ${indexInGroup}`);
        });
    }, []);

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
                        const dragColumnProps = getDragColumnProps(ci, col, undefined);
                        const w = toPx(col.style?.width, COLUMN_DEFAULT_WIDTH);
                        const cell = (
                            <HeaderCell
                                key={col.columnName}
                                width={w}
                                left={ci < freezeCount ? accLeft : undefined}
                                sticky={ci < freezeCount}
                                {...dragColumnProps}
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
            {data.map((row, index) => {
                /**
                 * 获取当前行的拖拽属性，用于绑定到行元素上（如: <div ... {...dragRowProps}>）    
                 * @param index - 当前行在所属分组下的索引
                 * @param currentRecord - 当前行的数据 Product类型
                 * @param groupKey - 当前行所在的分组标识对象，如 {category:"category_xxx",brand:"brand_xxx"}            
                 * @return - 用于绑定到行元素上的拖拽属性 
                 */
                const dragRowProps = getDragRowProps(index, row, groupKey);
                return (
                    <div key={row.id} style={dataRowStyle} {...dragRowProps}>
                        <Row2 columnsConfig={columnsConfig}
                            key={`${row.id}-${index}`}
                            indexInGroup={index}
                            product={row}
                            indentW={indentW}
                            freezeCount={freezeCount}
                            isEditing={row.isEditing ? row.isEditing : false}
                            isSaving={row.isSaving ? row.isSaving : false}
                            onCellChange={handleCellChange}
                            onSave={handleSave} onEdit={handleEdit}
                            onCancel={handleCancel} onDelete={handleDelete}
                            isColumnEditable={isColumnEditable}
                        />
                    </div>
                );
            })}
        </>
    );
}