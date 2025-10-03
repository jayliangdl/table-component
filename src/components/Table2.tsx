import React, { useEffect, useState, useMemo } from "react";
import { generateMockProducts, productsGroupByColumns } from "../utils/mockData";
import type { GroupNode } from "../types/Product";
import { sampleColumnsConfig,type ColumnConfig } from "../types/editableCell";
import {GroupSection} from "./Table2GroupSection"

import { useDraggableProps, useEditableColumns, mergeDraftsIntoGroupsById } from "./Table2Util"
import styles from "./Table2.module.css";
import type { ProductInUI } from "../types/Product";


import {
    MAIN_BG,
} from "../utils/CONSTANT"

export const freezeCount = 2; // 冻结前 n 列
type Drafts = Record<string, Partial<ProductInUI>>; // key 建议用 rowKey（分组路径 + rowId）

export default function Table2(): JSX.Element {
    /**groups:存放分组后的数据 */
    const [groups, setGroups] = useState<GroupNode[]>([]);
    
     /**drafts:维护所有行的草稿数据(编辑未保存的数据，编辑完成后或取消后，删除对应行的草稿数据) */      
    const [drafts, setDrafts] = useState<Drafts>({});
    /**columnsConfig: 所有字段配置 */
    const [columnsConfig, setColumnsConfig] = useState<ColumnConfig[]>([]);

    const groupByColumnNames = ["category", "brand"]; // 分组字段，有两种分组
    // const groupByColumnNames = ["category"]; // 分组字段，有一种分组
    // const groupByColumnNames:any[] = []; // 没有任何分组的情况

    // 获取可拖拽的行和列的属性(包括事件处理函数和样式类名)，useDraggableProps 自定义Hook
    const { getDraggableRowProps, getDraggableColumnProps } = useDraggableProps({
        columnsConfig,
        freezeCount,
        groupByColumnNames,
        groups,
        setGroups,
        setColumnsConfig,
        classes: {
            row: {
                targetBase: styles["drag-target"],
                overOk: styles["drag-over-ok"],
                insertBefore: styles["drag-insert-before"],
                insertAfter: styles["drag-insert-after"],
            },
            column: {
                targetBase: styles["drag-target"],
                overOk: styles["drag-over-ok"],
                insertBefore: styles["col-insert-before"],
                insertAfter: styles["col-insert-after"],
            }
        }
    });

    // 获取可编辑列的各种处理函数，useEditableColumns 自定义Hook
    const {
        isColumnEditable,
        handleCellChange,
        handleRowEdit,
        handleRowCancel,
        handleRowSave,
        handleRowDelete
    } = useEditableColumns({
        freezeCount,
        groupByColumnNames,
        setDrafts,
        setGroups,
    });

    useEffect(() => {
        // 生成测试数据 - 增加到80条以便展示更多内容
        // TODO:从后台获取数据
        const mockProducts = generateMockProducts(80);
        const grouped: GroupNode[] = productsGroupByColumns(groupByColumnNames, mockProducts);
        // console.log("分组后的数据:", grouped);
        // console.log("分组后的平铺数据:", groupFlatData);

        setGroups(grouped);
        // TODO:从后台获取列配置
        setColumnsConfig(sampleColumnsConfig);
        // setColumnsConfig(sampleColumnsConfig.filter((col, index) => index < 4 || index + 1 === sampleColumnsConfig.length));
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
     *  把 drafts 合并到 groups，得到“渲染用”的 effectiveGroups
     * */ 
    const effectiveGroups = useMemo(
        () => mergeDraftsIntoGroupsById(groups, drafts),
    [groups, drafts]);

    return (
        <div style={containerStyle}>
            {effectiveGroups.map((g, i) => (
                <GroupSection key={`g-${i}`} group={g} level={1} underGroups={[]}
                    columnsConfig={columnsConfig}
                    freezeCount={freezeCount}
                    handleCellChange={handleCellChange}
                    handleRowEdit={handleRowEdit}
                    handleRowSave={handleRowSave}
                    handleRowCancel={handleRowCancel}
                    handleRowDelete={handleRowDelete}
                    isColumnEditable={isColumnEditable}
                    getDragRowProps={(index, record, groupKey) => getDraggableRowProps(index, record, groupKey)}
                    getDragColumnProps={(index, record, groupKey) => getDraggableColumnProps(index, record, groupKey)}
                />
            ))}
        </div>
    );
}
