const syncHeights = () => {
      // 头部高度同步
      const fixedThread = fixedTable.querySelector("thead");
      const scrollThread = scrollableTable.querySelector("thead");
      if (fixedThread && scrollThread) {
        const fixedHeaderHeight = (fixedThread as HTMLElement).offsetHeight;
        const scrollHeaderHeight = (scrollThread as HTMLElement).offsetHeight;
        const maxHeaderHeight = Math.max(fixedHeaderHeight, scrollHeaderHeight);
        (fixedThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
        (scrollThread as HTMLElement).style.height = `${maxHeaderHeight}px`;
      }

      // 同步表头行高度
      const fixedThreadRows = fixedTable.querySelectorAll("thead tr");
      const scrollThreadRows = scrollableTable.querySelectorAll("thead tr");

      fixedThreadRows.forEach((row, index) => {
        const scrollRow = scrollThreadRows[index];
        if (scrollRow) {
          const fixedRowHeight = (row as HTMLElement).offsetHeight;
          const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
          const maxHeight = Math.max(fixedRowHeight, scrollRowHeight);
          (row as HTMLElement).style.height = `${maxHeight}px`;
          (scrollRow as HTMLElement).style.height = `${maxHeight}px`;
        }
      });

      // 同步数据行高度
      const fixedRows = fixedTable.querySelectorAll("tbody tr");
      const scrollRows = scrollableTable.querySelectorAll("tbody tr");

      fixedRows.forEach((row, index) => {
        const scrollRow = scrollRows[index];
        if (scrollRow) {
          const fixedRowHeight = (row as HTMLElement).offsetHeight;
          const scrollRowHeight = (scrollRow as HTMLElement).offsetHeight;
          const maxHeight = Math.max(fixedRowHeight, scrollRowHeight);
          (row as HTMLElement).style.height = `${maxHeight}px`;
          (scrollRow as HTMLElement).style.height = `${maxHeight}px`;
        }
      });

      // 滚动条补偿逻辑
      const hasFixedScrollBar = hasHorizontalScrollBar(fixedContainer);
      const hasScrollableScrollBar = hasHorizontalScrollBar(scrollableContainer);

      if (hasFixedScrollBar && hasScrollableScrollBar) {
        fixedContainer.style.paddingBottom = '0px';
        scrollableContainer.style.paddingBottom = '0px';
        console.log('两侧都有滚动条，无需补偿');
      } else if (!hasFixedScrollBar && hasScrollableScrollBar) {
        const scrollbarHeight = getHorizontalScrollBarHeight();
        fixedContainer.style.paddingBottom = `${scrollbarHeight}px`;
        scrollableContainer.style.paddingBottom = '0px';
        console.log(`只有右侧有滚动条，给左侧补偿 ${scrollbarHeight}px`);
      } else if (hasFixedScrollBar && !hasScrollableScrollBar) {
        const scrollbarHeight = getHorizontalScrollBarHeight();
        scrollableContainer.style.paddingBottom = `${scrollbarHeight}px`;
        fixedContainer.style.paddingBottom = '0px';
        console.log(`只有左侧有滚动条，给右侧补偿 ${scrollbarHeight}px`);
      } else {
        fixedContainer.style.paddingBottom = '0px';
        scrollableContainer.style.paddingBottom = '0px';
        console.log('两侧都没有滚动条，无需补偿');
      }
    };