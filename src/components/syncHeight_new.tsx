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