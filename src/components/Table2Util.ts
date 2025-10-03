import { type UnderGroupsProps, type ColumnConfig } from "../types/editableCell";
import type { GroupNode, Product, ProductInUI } from "../types/Product";
import { useDraggable } from "../service/useDraggable"
import { recordIsEqual } from "../utils/convert";
import { useMemo, useCallback } from "react";
import { deepClone } from "../utils/convert";


/***
 * 定义可拖拽行接口
 */
export interface DraggableEndPointRow {
    index: number;
    /**
     * 所属分组标识 (如 {category:"category_xxx",brand:"brand_xxx"})
     * 不同分组的行，不能互相拖拽放置
     * 若无分组，则为 undefined
     **/
    groupKey: Record<string, any>;
    // 行数据
    record: Product;
}

/**
 * 定义可拖拽表头Column接口
 */
export interface DraggableEndPointColumn {
    index: number;
    groupKey: undefined;
    record: ColumnConfig;
}

type UseDraggablePropsParams = {
    columnsConfig: ColumnConfig[];
    freezeCount: number;
    groupByColumnNames: string[];
    groups: GroupNode[];
    setGroups: React.Dispatch<React.SetStateAction<GroupNode[]>>;
    setColumnsConfig: React.Dispatch<React.SetStateAction<ColumnConfig[]>>;
    classes: {
        row: {
            targetBase: string; overOk: string; insertBefore: string; insertAfter: string;
        },
        column: {
            targetBase: string; overOk: string; insertBefore: string; insertAfter: string;
        }
    };
};



/**
 * 
 * @param columnsConfig - 列配置
 * @param freezeCount - 冻结列数
 * @param groupByColumnNames - 分组列名数组
 * @param groups - 分组数据
 * @param setGroups - 设置分组数据的函数，用于拖拽后调整行顺序
 * @param setColumnsConfig - 设置列配置的函数，用于拖拽后调整列顺序
 * @param classes - (有关拖拽的)样式类名对象 
 * @returns 
 */
export function useDraggableProps({
    columnsConfig,
    freezeCount,
    groupByColumnNames,
    groups,
    setGroups,
    setColumnsConfig,
    classes,
}: UseDraggablePropsParams) {
    /**
     * 拖拽行后执行行顺序调整的回调函数核心部分
     * @param fromIndex - 被拖拽行的索引
     * @param toIndex - 被放下行的索引
     * @param underGroups - 被拖拽行所属的分组信息(例如 [{columnName:'category',value:'category_xxx1'},{columnName:'brand',value:'brand_xxx2'}]表示该行在 category=category_xxx1 下的子分组 brand=brand_xxx2 下)
     */
    const reOrderRowHandler = (fromIndex: number, toIndex: number, underGroups: UnderGroupsProps[]) => {
        if (!underGroups || underGroups.length !== groupByColumnNames.length) {
            return;
        }
        const cols = new Set(underGroups.map(g => g.columnName));
        if (cols.size !== groupByColumnNames.length) return;
        if (!groupByColumnNames.every(c => cols.has(c))) return;//todo:搞清楚这句作用
        setGroups((prevGroups) => {
            const newGroups = [...prevGroups];

            /**寻找满足入参underGroups分组情况下的数据，targetGroup.data */
            // let targetGroup: GroupNode | undefined = undefined;
            // if (underGroups.length === 0 && newGroups.length > 0) {
            //     //没有分组，全部数据一起展示的情况
            //     targetGroup = newGroups[0] as GroupNode;
            // } else {
            //     //数据有分组的情况
            //     let groupsLevel = newGroups;
            //     for (const g of underGroups) {
            //         targetGroup = groupsLevel.find(gr => gr.groupBy === g.columnName && gr.value === g.value);
            //         if (targetGroup && targetGroup.children) {
            //             groupsLevel = targetGroup.children;
            //         }
            //     }
            // }
            const targetGroup = findGroupNodeByUnderGroups(newGroups, underGroups);
            if (targetGroup && targetGroup.data) {
                const data = targetGroup.data;
                const [moved] = data.splice(fromIndex, 1);
                /**
                 *  场景1：
                 *      已有5笔记录，index从上到下分别是0,1,2,3,4，若将index=1的记录（fromIndex）放在目标位置（toIndex）3，则结果记录是插在3的后面
                 *  场景2：
                 *      已有5笔记录，index从上到下分别是0,1,2,3,4，若将index=3的记录（fromIndex）放在目标位置（toIndex）1，则结果记录是插在1的前面。
                 *  这两个场景，都是放在目标位置的前面。
                 * 
                 * 当 fromIndex < toIndex 时，先删除元素后，目标索引会减1（因为数组长度变了），所以插入时要用 toIndex - 1。
                 * 当 fromIndex > toIndex 时，直接插入到 toIndex 即可。
                 */
                let insertIndex = toIndex;
                if (fromIndex < toIndex) {
                    insertIndex = toIndex - 1;
                }

                data.splice(insertIndex, 0, moved);
                targetGroup.data = data;
                return newGroups;
            } else {
                return prevGroups;
            }
        });
    }

    /**
     * 拖拽行后执行行顺序调整的回调函数
     * @param fromIndex
     * @param toIndex 
     */
    const onReorderRows = (
        fromIndex: DraggableEndPointRow,
        toIndex: DraggableEndPointRow
    ) => {
        //从fromIndex获取所在分组信息
        const underGroups = fromIndex.groupKey
            ? Object.keys(fromIndex.groupKey).map(k => ({ columnName: k, value: fromIndex.groupKey[k] }))
            : [];
        reOrderRowHandler(
            fromIndex.index,
            toIndex.index,
            underGroups
        );
    }


    /**
     * 获取某个分组下的元素总数
     * 用于 useDraggable Hook 中参数lengthOf
     * @param groupKey:Record<string,any> - 分组标识 (如 {category:"category_xxx",brand:"brand_xxx"})     
     * @returns 
     */
    const lengthOfRows = (groupKey: Record<string, any>): number => {
        const findGroupChildren = (groups: GroupNode[], columnName: string, value: any): GroupNode[] => {
            for (const group of groups) {
                if (group.groupBy === columnName && group.value === value) {
                    const children = group.children || [];
                    return children;
                }
            }
            return [];
        }
        if (!groupByColumnNames.every(c => c in groupKey)) {
            return 0;
        }
        let children: GroupNode[] = groups;

        for (const groupByColumnName of groupByColumnNames) {
            const columnName = groupByColumnName;
            const value = groupKey[groupByColumnName];
            children = findGroupChildren(children, columnName, value);
            if (children.length === 0) {
                return 0;
            }
        }

        return children[0].data ? children[0].data.length : 0;
    }

    /**
     * 定义在行被拖拽后，是否允许放下的判断逻辑
     * @param from - 被拖拽的行。包括行索引、所属分组标识、行数据。
     * @param to - 被放下的目标行。包括行索引、所属分组标识、行数据。
     * @returns boolean - 是否允许放下
     */
    const ableToDropRows = (
        from: DraggableEndPointRow,
        to: DraggableEndPointRow
    ): boolean => {
        if (!from) return false;
        return recordIsEqual(from.groupKey, to.groupKey); // 不允许跨组放
    }

    // 行：用垂直方向判定
    const resolveInsertSideRows = (e: React.DragEvent<HTMLElement>, el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return e.clientY > r.top + r.height ? "after" : "before";
    }

    const classNamesRows = {
        targetBase: classes.row.targetBase,
        overOk: classes.row.overOk,
        insertBefore: classes.row.insertBefore,
        insertAfter: classes.row.insertAfter,
    }

    const { getItemProps: getDraggableRowProps } = useDraggable<Record<string, any>, Product>({
        lengthOf: lengthOfRows,
        onReorder: onReorderRows,
        ableToDrop: ableToDropRows,
        resolveInsertSide: resolveInsertSideRows,
        classNames: classNamesRows
    });

    const lengthOfColumns = (_groupKey: undefined): number => {
        return columnsConfig.length;
    }

    const onReorderColumns = (
        fromIndex: DraggableEndPointColumn,
        toIndex: DraggableEndPointColumn
    ) => {
        if (!fromIndex || !toIndex) return;
        setColumnsConfig((prevCols) => {
            const newCols = [...prevCols];
            const [moved] = newCols.splice(fromIndex.index, 1);
            let insertIndex = toIndex.index;
            if (fromIndex.index < toIndex.index) {
                insertIndex = toIndex.index - 1;
            }
            newCols.splice(insertIndex, 0, moved);
            return newCols;
        });
    }

    const ableToDropColumns = (
        from: DraggableEndPointColumn,
        to: DraggableEndPointColumn,
    ): boolean => {
        if (!from) return false;
        if (from.index < freezeCount || to.index < freezeCount) {
            return false; // 不允许拖动冻结列
        }
        return true; // 列拖拽不限制
    }

    const resolveInsertSideColumns = (e: React.DragEvent<HTMLElement>, el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return e.clientX > r.left + r.width ? "after" : "before";
    }
    const classNamesColumns = {
        targetBase: classes.column.targetBase,
        overOk: classes.column.overOk,
        insertBefore: classes.column.insertBefore,
        insertAfter: classes.column.insertAfter,
    }

    const { getItemProps: getDraggableColumnProps } = useDraggable<undefined, ColumnConfig>({
        lengthOf: lengthOfColumns,
        onReorder: onReorderColumns,
        ableToDrop: ableToDropColumns,
        resolveInsertSide: resolveInsertSideColumns,
        classNames: classNamesColumns,
    });
    return useMemo(() => ({
        getDraggableRowProps,
        getDraggableColumnProps
    }), [getDraggableRowProps, getDraggableColumnProps]);
}

/**
 * 在整棵分组树中(groupsRoot)，按 underGroups 路径找到目标分组
 * @param groupsRoot - 根分组
 * @param underGroups - 需要寻找的目标分组，(例如 [{columnName:'category',value:'category_xxx1'},{columnName:'brand',value:'brand_xxx2'}]表示需要寻找的分组在 category=category_xxx1 下的子分组 brand=brand_xxx2 下)
 * @returns 
 */
function findGroupNodeByUnderGroups(
    groupsRoot: GroupNode[],
    underGroups: UnderGroupsProps[]
): GroupNode | null {

    // 逐层下钻
    let curLevel: GroupNode[] = groupsRoot;
    let targetGroup: GroupNode | undefined;

    for (let i = 0; i < underGroups.length; i++) {
        const seg = underGroups[i];
        targetGroup = curLevel.find(
            (g) => g.groupBy === seg.columnName && g.value === seg.value
        );
        if (!targetGroup) return null;
        // 继续下一层
        curLevel = targetGroup.children ?? [];
    }

    // 如果 underGroups 为空，表示“顶层无分组”，
    if (!underGroups.length) {
        targetGroup = groupsRoot[0];
        if (!targetGroup) return null;
    }

    if (!targetGroup?.data) {
        return null;
    }

    return targetGroup;
}
/**
 * 在整棵分组树中，按 underGroups 路径找到目标分组，并取该分组 data[indexInGroup] 记录。
 * 返回 { group, row, index }；找不到时返回 null。
 * @param groupsRoot 分组树根节点数组
 * @param underGroups 目标行所在的分组路径
 * @param indexInGroup 目标行在所在分组内的索引
 * @return 找到时返回 { group, row, index }；找不到时返回 null。
 * 例如：
 * findRow(groups, [{columnName:'category',value:'category_xxx1'},{columnName:'brand',value:'brand_xxx2'}], 3)
 * 表示找分组 category=category_xxx1 下的子分组 brand=brand_xxx2 下的第4行数据（index从0开始）
 * 注意：如果 underGroups 为空数组，表示“顶层无分组”，
 * 直接从groupsRoot[0]取data[indexInGroup]即可。
 */
function findRow(
    groupsRoot: GroupNode[],
    underGroups: UnderGroupsProps[],
    indexInGroup: number
): { group: GroupNode; row: ProductInUI; index: number } | null {

    const targetGroup = findGroupNodeByUnderGroups(groupsRoot, underGroups);

    if (!targetGroup?.data || indexInGroup < 0 || indexInGroup >= targetGroup.data.length) {
        return null;
    }

    const row = targetGroup.data[indexInGroup];
    return { group: targetGroup, row, index: indexInGroup };
}

/**
 * 合并草稿数据到分组数据中
 * @param groups - 分组数据
 * @param draftsById - 草稿数据，key 直接用 rowId（转成字符串作为索引）
 * @returns 
 */
export function mergeDraftsIntoGroupsById(
    groups: GroupNode[],
    draftsById: Record<string, Partial<ProductInUI>> // key 直接用 rowId（转成字符串作为索引）
): GroupNode[] {

    // 没有草稿就直接复用原引用，避免无谓拷贝
    if (!draftsById || Object.keys(draftsById).length === 0) return groups;

    const cloned = deepClone(groups);

    const walk = (node: GroupNode) => {
        if (node.data?.length) {
            node.data = node.data.map(row => {
                const patch =
                    draftsById[String(row.id)] ?? // row.id 可能是 number，统一转字符串索引
                    (draftsById as any)[row.id];  // 兼容直接用 number 做 key 的场景
                return patch ? { ...row, ...patch } : row;//如果该row有草稿，就合并草稿
            });
        }
        node.children?.forEach(walk);
    };

    cloned.forEach(walk);
    return cloned;
}

type UseEditablePropsParams = {
    freezeCount?: number; // 冻结列数
    groupByColumnNames: string[];
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, Partial<ProductInUI>>>>;
    setGroups: React.Dispatch<React.SetStateAction<GroupNode[]>>;
}
export function useEditableColumns({
    freezeCount,
    groupByColumnNames,
    setDrafts,
    setGroups,
}: UseEditablePropsParams) {
    // 提供保存/取消：保存=把 drafts[rowId] 合回 groups；取消=丢弃 drafts[rowId]
    const clearDraft = useCallback((rowId: string) => {
        setDrafts(prev => {
            const { [rowId]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    // 更新某个单元格的值到草稿箱的回调方法
    const handleCellChange = useCallback((rowId: string, column: string, value: any) => {
        setDrafts(prev => ({
            ...prev,
            [rowId]: { ...(prev[rowId] ?? {}), [column]: value },
        }));
    }, []);
    /**
     * 用户点击编辑按钮时，触发的方法
     * 要实现的逻辑包括：
     * 1. 将对应行的isEditing设置为true，进入编辑状态
     * 2. 记录当前行数据的快照，以便取消编辑时恢复
     * 
     * 逻辑:
     * 1. 根据 underGroups 定位到具体的分组
     * 2. 在该分组的 data 中，找到 dataIndexInGroup 对应的行
     * 3. 将该行的 isEditing 设置为 true
     * 4. 保存该行数据的快照，以便取消编辑时恢复
     * 5. 更新状态
     * 对于没有匹配到的其他记录，保持不变
     * 
     * @param underGroups - 当前行所在的分组路径，如 [{columnName:"category",value:"category_xxx"},{columnName:"brand",value:"brand_xxx"}]
     * @param dataIndexInGroup - 当前行在所属分组下的索引
     */
    const handleRowEdit = useCallback((underGroups: UnderGroupsProps[], dataIndexInGroup: number) => {
        setGroups((prev) => {
            const next = deepClone(prev);              // 拿一份可变的副本
            const hit = findRow(next, underGroups, dataIndexInGroup);
            if (hit) {
                // 初始化快照 + 进入编辑
                const row = hit.row;
                hit.row.rowDataBeforeEdit = { ...row };// 记录编辑前的快照，用于取消编辑时恢复
                hit.row.isEditing = true;
                const rowId = row.id;
                setDrafts(prevDrafts => {
                    // 如果已经有该行的草稿，则保持不变
                    if (prevDrafts[rowId]) {
                        return prevDrafts;
                    }
                    // 否则，新增该行的草稿快照
                    return {
                        ...prevDrafts,
                        [rowId]: { ...row }
                    };
                });
            }
            return next;
        });
    }, []);

    const handleRowCancel = useCallback((underGroups: UnderGroupsProps[], dataIndexInGroup: number) => {
        setGroups((prev) => {
            const next = deepClone(prev);
            const hit = findRow(next, underGroups, dataIndexInGroup);
            clearDraft((hit?.row.id ?? "").toString());
            if (hit) {
                hit.group.data![hit.index] = {
                    ...(hit.row.rowDataBeforeEdit ?? hit.row),// 恢复编辑前的快照
                    isEditing: false,
                    isSaving: false,
                    rowDataBeforeEdit: undefined,// 清理快照
                };
            }
            return next;
        });
    }, []);

    // 作为未来接入后端的占位
    async function persistRowSave(_row: ProductInUI): Promise<void> {
        // TODO: 调用后端保存接口，例如：
        // await api.updateRow(_row.id, _row);
    }

    async function persistRowDelete(_rowId: string | number): Promise<void> {
        // TODO: 调用后端删除接口，例如：
        // await api.deleteRow(_rowId);
    }

    const handleRowSave = useCallback((underGroups: UnderGroupsProps[], dataIndexInGroup: number, newRecord: any) => {
        let savedRow: ProductInUI | null = null;
        setGroups(prev => {
            const next = deepClone(prev);
            const hit = findRow(next, underGroups, dataIndexInGroup);
            if (!hit) return prev;

            // 用 RowCore2 传上来的最终行数据作为真相
            const merged: ProductInUI = {
                ...hit.row,        // 旧行
                ...(newRecord ?? {}), // 最新值（含未保存变更）
                isEditing: false,
                isSaving: false,
                rowDataBeforeEdit: undefined,
            };

            hit.group.data![hit.index] = merged;
            savedRow = merged;
            return next;
        });

        // 清理该行的草稿
        if (savedRow) {
            setDrafts(prevDrafts => {
                const { [String(savedRow!.id)]: _, ...rest } = prevDrafts;
                return rest;
            });
            // 预留后端
            // void persistRowSave(savedRow);
        }
    }, []);

    const handleRowDelete = useCallback((underGroups: UnderGroupsProps[], dataIndexInGroup: number) => {
        let deletedRowId: string | number | null = null;
        setGroups(prev => {
            const next = deepClone(prev);
            const hit = findRow(next, underGroups, dataIndexInGroup);
            if (!hit) return prev;

            deletedRowId = hit.row.id;
            hit.group.data!.splice(hit.index, 1);
            return next;
        });

        if (deletedRowId !== null) {
            // 清理草稿
            setDrafts(prevDrafts => {
                const { [String(deletedRowId)]: _, ...rest } = prevDrafts;
                return rest;
            });
            // 预留后端
            // void persistRowDelete(deletedRowId);
        }
    }, []);

    /**
     * 判断某列是否可编辑
     * @param columnIndex 
     * @param column 
     * @param freezeCount 
     * @param underGroups 
     * @returns 
     */
    const isColumnEditable = (
        columnIndex: number,
        column: ColumnConfig,
    ): boolean => {
        if (columnIndex < (freezeCount?freezeCount:0)) return false; // 冻结列不可编辑
        if (column.editable === false) return false; // 显式标记不可编辑
        if(groupByColumnNames){
            for(const groupColumnName of groupByColumnNames){
                if(groupColumnName === column.columnName){
                    return false; // 分组列不可编辑
                }
            }
        }
        return true;
    }



    return useMemo(() => ({
        isColumnEditable,
        handleCellChange,
        handleRowEdit,
        handleRowCancel,
        handleRowSave,
        handleRowDelete,
    }), [
        isColumnEditable,
        handleCellChange,
        handleRowEdit,
        handleRowCancel,
        handleRowSave,
        handleRowDelete,]);
}

