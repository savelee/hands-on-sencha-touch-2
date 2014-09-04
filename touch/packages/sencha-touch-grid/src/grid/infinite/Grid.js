/**
 * Description
 */
Ext.define('Ext.grid.infinite.Grid', {
    extend: 'Ext.Container',
    alias: 'widget.grid',

    mixins: [
        'Ext.mixin.Selectable',
        'Ext.mixin.Bindable'
    ],

    requires: [
        'Ext.util.PositionMap',
        'Ext.grid.Row',
        'Ext.grid.column.Column'
    ],

    xtype: 'grid',

    config: {
        /**
         * @cfg {Ext.grid.column.Column[]} columns (required)
         * An array of column definition objects which define all columns that appear in this grid.
         * Each column definition provides the header text for the column, and a definition of where
         * the data for that column comes from.
         *
         * This can also be a configuration object for a {Ext.grid.header.Container HeaderContainer}
         * which may override certain default configurations if necessary. For example, the special
         * layout may be overridden to use a simpler layout, or one can set default values shared
         * by all columns:
         *
         *      columns: {
         *          items: [
         *              {
         *                  text: "Column A"
         *                  dataIndex: "field_A"
         *              },{
         *                  text: "Column B",
         *                  dataIndex: "field_B"
         *              },
         *              ...
         *          ],
         *          defaults: {
         *              flex: 1
         *          }
         *      }
         *
         */
        columns: null,

        /**
         * @cfg {Ext.data.Store/Object} store
         * Can be either a Store instance or a configuration object that will be turned into a Store. The Store is used
         * to populate the set of items that will be rendered in the Grid.
         * @accessor
         */
        store: null,

        /**
         * @cfg {Object[]} data
         * @inheritdoc
         */
        data: null,

        /**
         * @cfg baseCls
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'grid',

        /**
         * @cfg {String} emptyText
         * The text to display in the view when there is no data to display
         */
        emptyText: null,

        /**
         * @cfg {Boolean} deferEmptyText `true` to defer `emptyText` being applied until the store's first load.
         */
        deferEmptyText: true,

        /**
         * @cfg {String} loadingText
         * A string to display during data load operations.  If specified, this text will be
         * displayed in a loading div and the view's contents will be cleared while loading, otherwise the view's
         * contents will continue to display normally until the new data is loaded and the contents are replaced.
         */
        loadingText: 'Loading...',

        /**
         * @cfg {Boolean} variableHeights
         * This configuration allows you optimize the list by not having it read the DOM heights of list items.
         * Instead it will assume (and set) the height to be the {@link #itemHeight}.
         */
        variableHeights: false,

        layout: 'fit',

        /**
         * @cfg {String} defaultType
         * The xtype used for the component based DataView. Defaults to dataitem.
         * Note this is only used when useComponents is true.
         * @accessor
         */
        defaultType: 'gridrow',

        /**
         * @cfg {String} rowCls
         * An additional CSS class to apply to rows within the Grid.
         * @accessor
         */
        rowCls: null,

        /**
         * @cfg {String} selectedCls
         * The CSS class to apply to an item on the view while it is selected.
         * @accessor
         */
        selectedCls: Ext.baseCSSPrefix + 'row-selected',

        minimumRowHeight: 30,

        bufferSize: 10,
        minimumBufferDistance: 3
    },

    storeEventHooks: {
        beforeload: 'onBeforeLoad',
        load: 'onLoad',
        refresh: 'refresh',
        addrecords: 'onStoreAdd',
        removerecords: 'onStoreRemove',
        updaterecord: 'onStoreUpdate'
    },

    hasLoadedStore: false,

    constructor: function() {
        var me = this;
        me.mixins.selectable.constructor.apply(me, arguments);
        me.callParent(arguments);
    },

    // We create complex instance arrays and objects in beforeInitialize so that we can use these inside of the initConfig process.
    beforeInitialize: function() {
        var me = this,
            container, scrollable, scrollViewElement;

        Ext.apply(me, {
            rows: [],
            offsets: {},
            updatedRows: [],
            topRenderedIndex: 0,
            topVisibleIndex: 0,
            // We set these two to null to have the cells be updated the first time we translate
            currentX: null,
            currentY: null,
            rowPositionMap: Ext.create('Ext.util.PositionMap', {minimumHeight: me.getMinimumRowHeight()}),
            columnPositionMap: Ext.create('Ext.util.PositionMap', {minimumHeight: 20})
        });

        // We determine the translation methods for headers and items within this List based
        // on the best strategy for the device
        this.translationMethod = Ext.browser.is.AndroidStock2 ? 'cssposition' : 'csstransform';

        // Create the inner container that will actually hold all the list items
        container = me.container = Ext.factory({
            xtype: 'container',
            scrollable: {
                scroller: {
                    autoRefresh: false,
                    direction: 'both'
                }
            }
        });

        // We add the container after creating it manually because when you add the container,
        // the items config is initialized. When this happens, any scrollDock items will be added,
        // which in turn tries to add these items to the container
        me.add(container);

        container.element.on({
            resize: 'onContainerResize',
            scope: me
        });

        // We make this List's scrollable the inner containers scrollable
        scrollable = container.getScrollable();
        scrollViewElement = me.scrollViewElement = scrollable.getElement();
        me.scrollElement = scrollable.getScroller().getElement();

        me.setScrollable(scrollable);
        me.scrollableBehavior = container.getScrollableBehavior();

        // We want to intercept any translate calls made on the scroller to perform specific list logic
        me.bind(scrollable.getScroller().getTranslatable(), 'doTranslate', 'onTranslate');
    },

    onContainerResize: function(container, size) {
        var me = this;

        me.visibleRowCount = Math.ceil(size.height / me.getMinimumRowHeight());
        me.visibleColumnCount = this.determineMaxVisibleColumnCount(size.width);
        me.containerHeight = size.height;

        me.setRenderedRowCount(me.visibleRowCount + 1);
    },

    onTranslate: function(x, y) {
        var me = this,
            store = me.getStore(),
            storeCount = store && store.getCount(),
            rows = me.rows,
            i, ln;

        if (!storeCount) {
            me.showEmptyText();
        }
        else if (me.rowCount) {
            if (y !== me.currentY) {
                me.handleRowUpdates(y);
            }

            if (x !== me.currentX) {
                for (i = 0, ln = rows.length; i < ln; i++) {
                    rows[i].onTranslate(x);
                }
                me.currentX = x;
            }

            if (y !== me.currentY) {
                me.handleRowTransforms();
                me.currentY = y;
            }
        }
    },

    handleRowUpdates: function(y) {
        var me = this,
            positionMap = me.rowPositionMap,
            rows = me.rows,
            rowCount = rows.length,
            store = me.getStore(),
            lastIndex = store.getCount() - 1,
            bufferSize = me.getBufferSize(),
            minimumBufferDistance = me.getMinimumBufferDistance(),
            currentTopVisibleIndex = me.topVisibleIndex,
            topRenderedIndex = me.topRenderedIndex,
            topVisibleIndex, bufferDistance, updateCount,
            rowIndex, row, i;

        me.topVisibleIndex = topVisibleIndex = Math.max(0, positionMap.findIndex(-y) || 0);

        if (currentTopVisibleIndex !== topVisibleIndex) {
            if (currentTopVisibleIndex > topVisibleIndex) {
                // When we are scrolling to the top
                bufferDistance = topVisibleIndex - topRenderedIndex;
                if (bufferDistance < minimumBufferDistance) {
                    updateCount = Math.min(rowCount, minimumBufferDistance - bufferDistance);
                    for (i = 0; i < updateCount; i++) {
                        rowIndex = topRenderedIndex - i - 1;
                        if (rowIndex < 0) {
                            break;
                        }

                        row = rows.pop();
                        rows.unshift(row);

                        me.updateRow(row, rowIndex);
                        me.topRenderedIndex--;
                    }
                }
            }
            else {
                // When we are scrolling to the right
                bufferDistance = topRenderedIndex + bufferSize - topVisibleIndex;
                if (bufferDistance < minimumBufferDistance) {
                    updateCount = Math.min(rowCount, minimumBufferDistance - bufferDistance);
                    for (i = 0; i < updateCount; i++) {
                        rowIndex = topRenderedIndex + rowCount + i;
                        if (rowIndex > lastIndex) {
                            break;
                        }

                        row = rows.shift();
                        rows.push(row);

                        me.updateRow(row, rowIndex);
                        me.topRenderedIndex++;
                    }
                }
            }
        }
    },

    handleRowTransforms: function() {
        var me = this,
            offsets = me.offsets,
            updatedRows = me.updatedRows,
            positionMap = me.rowPositionMap,
            offset, row;

        while (row = updatedRows.shift()) {
            offset = positionMap.map[row.getIndex()];

            if (offset !== offsets[row.id]) {
                row.translate(0, offset);
                offsets[row.id] = offset;
            }
        }
    },

    applyColumns: function(columns) {
        var i, ln, column;

        if (columns) {
            if (!Ext.isArray(columns)) {
                columns = [columns];
            }

            for (i = 0, ln = columns.length; i < ln; i++) {
                column = columns[i];
                if (!column.isComponent) {
                    column = Ext.factory(column, Ext.grid.column.Column);
                    columns[i] = column;
                }
            }
        }

        return columns;
    },

    updateColumns: function(columns) {
        if (columns && columns.length) {
            var me = this,
                ln = columns.length,
                i, column;

            me.columnPositionMap.populate(ln);
            for (i = 0; i < ln; i++) {
                column = columns[i];
                me.columnPositionMap.setItemHeight(i, column.getWidth());
            }
            me.columnPositionMap.update();
            me.scrollElement.setWidth(me.columnPositionMap.getTotalHeight());
        }
    },

    determineMaxVisibleColumnCount: function(width) {
        var me = this,
            positionMap = me.columnPositionMap,
            maxCount = 0,
            currentCount, currentWidth, i, j, ln;

        for (i = 0, ln = positionMap.map.length; i < ln; i++) {
            currentCount = currentWidth = 0;
            j = i;
            while (currentWidth < width && j < ln) {
                currentWidth += positionMap.getItemHeight(j);
                currentCount++;
                j++;
            }
            if (currentCount > maxCount) {
                maxCount = currentCount;
            }
        }
        return maxCount;
    },

    setRenderedRowCount: function(rowCount) {
        var me = this,
            rows = me.rows,
            config = me.getRowConfig(),
            difference = rowCount + me.getBufferSize() - rows.length,
            i;

        // This loop will create new items if the new itemsCount is higher than the amount of items we currently have
        for (i = 0; i < difference; i++) {
            me.createRow(config);
        }

        // This loop will destroy unneeded items if the new itemsCount is lower than the amount of items we currently have
        for (i = difference; i < 0; i++) {
            rows.pop().destroy();
        }

        me.rowCount = rowCount;

        // Finally we update all the list items with the correct content
        me.updateAllRows();

        return me.rows;
    },

    getRowConfig: function() {
        var me = this;

        return {
            xtype: me.getDefaultType(),
            minHeight: me.rowPositionMap.getMinimumHeight(),
            columns: me.getColumns(),
            cls: me.getRowCls(),
            columnPositionMap: me.columnPositionMap,
            translatable: {
                translationMethod: this.translationMethod
            }
        };
    },

    createRow: function(config) {
        var me = this,
            container = me.container,
            rows = me.rows,
            row;

        row = Ext.factory(config);
        row.grid = me;
        row.$height = config.minHeight;

        container.doAdd(row);
        rows.push(row);

        return row;
    },

    updateAllRows: function() {
        var me = this,
            rows = me.rows,
            store = me.getStore(),
            topRenderedIndex = me.topRenderedIndex,
            i, ln;

        if (me.hasLoadedStore) {
            for (i = 0, ln = rows.length; i < ln; i++) {
                me.updateRow(rows[i], topRenderedIndex + i);
            }
            if (store.getCount()) {
                me.scrollElement.setHeight(me.rowPositionMap.getTotalHeight());
            } else {
                me.scrollElement.setHeight(me.containerHeight);
            }
        }

        me.refreshScroller();
    },

    updateRow: function(row, index) {
        var me = this,
            store = me.getStore(),
            record = store.getAt(index),
            updatedRows = me.updatedRows,
            selectedCls = me.getSelectedCls(),
            rowCls = [],
            rowRemoveCls = [selectedCls],
            currentRowCls = row.renderElement.classList,
            i, ln;

        // When we update a list item, the header and scrolldocks can make it have to be retransformed.
        // For that reason we want to always set the position to -10000 so that the next time we translate
        // all the pieces are transformed to the correct location
        row.$position = -10000;

        // We begin by hiding/showing the row and its header depending on a record existing at this index
        if (!record) {
            row.setRecord(null);
            row.translate(0, -10000);
            row.$hidden = true;
            return;
        } else if (row.$hidden) {
            row.$hidden = false;
        }

        updatedRows.push(row);

        row.setIndex(index);
        row.setRenderedCellCount(me.visibleColumnCount);

        // This is where we actually update the row with the record
        if (row.getRecord() === record) {
            row.updateRecord(record);
        } else {
            row.setRecord(record);
        }

        if (me.isSelected(record)) {
            rowCls.push(selectedCls);
        }

        if (currentRowCls) {
            for (i = 0, ln = rowRemoveCls.length; i < ln; i++) {
                Ext.Array.remove(currentRowCls, rowRemoveCls[i]);
            }
            rowCls = Ext.Array.merge(rowCls, currentRowCls);
        }

        row.renderElement.setCls(rowCls);
    },

    refreshScroller: function() {
        var me = this;

        if (me.isPainted()) {
            me.container.getScrollable().getScroller().refresh();
        }
    },

    /**
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        var me = this,
            container = me.container;

        if (!me.getStore()) {
            if (!me.hasLoadedStore && !me.getDeferEmptyText()) {
                me.showEmptyText();
            }
            return;
        }
        if (container) {
            me.fireAction('refresh', [me], 'doRefresh');
        }
    },

    doRefresh: function() {
        var me = this,
            rows = me.rows,
            store = me.getStore(),
            storeCount = store.getCount();

        me.rowPositionMap.populate(storeCount, this.topRenderedIndex);

        if (rows.length) {
            if (storeCount) {
                me.hideEmptyText();
            }
            me.updateAllRows();
        }
    },

    onBeforeLoad: function() {
        var loadingText = this.getLoadingText();
        if (loadingText && this.isPainted()) {
            this.setMasked({
                xtype: 'loadmask',
                message: loadingText
            });
        }

        this.hideEmptyText();
    },

    updateData: function(data) {
        var store = this.getStore();
        if (!store) {
            this.setStore(Ext.create('Ext.data.Store', {
                data: data,
                autoDestroy: true
            }));
        } else {
            store.add(data);
        }
    },

    applyStore: function(store) {
        var me = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            if (store && Ext.isObject(store) && store.isStore) {
                store.on(bindEvents);
                proxy = store.getProxy();
                if (proxy) {
                    reader = proxy.getReader();
                    if (reader) {
                        reader.on('exception', 'handleException', this);
                    }
                }
            }
            //<debug warn>
            else {
                Ext.Logger.warn("The specified Store cannot be found", this);
            }
            //</debug>
        }

        return store;
    },

    /**
     * Method called when the Store's Reader throws an exception
     * @method handleException
     */
    handleException: function() {
        this.setMasked(false);
    },

    updateStore: function(newStore, oldStore) {
        var me = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (oldStore && Ext.isObject(oldStore) && oldStore.isStore) {
            oldStore.un(bindEvents);

            if (!me.isDestroyed) {
                me.onStoreClear();
            }

            if (oldStore.getAutoDestroy()) {
                oldStore.destroy();
            }
            else {
                proxy = oldStore.getProxy();
                if (proxy) {
                    reader = proxy.getReader();
                    if (reader) {
                        reader.un('exception', 'handleException', this);
                    }
                }
            }
        }

        if (newStore) {
            if (newStore.isLoaded()) {
                this.hasLoadedStore = true;
                me.refresh();
            }

            if (newStore.isLoading()) {
                me.onBeforeLoad();
            }
        }
    },

    updateEmptyText: function(newEmptyText, oldEmptyText) {
        var me = this,
            store;

        if (oldEmptyText && me.emptyTextCmp) {
            me.remove(me.emptyTextCmp, true);
            delete me.emptyTextCmp;
        }

        if (newEmptyText) {
            me.emptyTextCmp = me.add({
                xtype: 'component',
                cls: me.getBaseCls() + '-emptytext',
                html: newEmptyText,
                hidden: true
            });
            store = me.getStore();
            if (store && me.hasLoadedStore && !store.getCount()) {
                this.showEmptyText();
            }
        }
    },

    onLoad: function(store) {
        //remove any masks on the store
        this.hasLoadedStore = true;
        this.setMasked(false);

        if (!store.getCount()) {
            this.showEmptyText();
        }
    },

    // Handling adds and removes like this is fine for now. It should not perform much slower then a dedicated solution
    // TODO: implement logic to not do full refreshes when this list is non-infinite
    onStoreAdd: function() {
        this.doRefresh();
    },

    onStoreRemove: function() {
        this.doRefresh();
    },

    onStoreUpdate: function() {
        this.doRefresh();
    },

    onStoreClear: function() {
        this.doRefresh();
    },

    showEmptyText: function() {
        if (this.getEmptyText() && (this.hasLoadedStore || !this.getDeferEmptyText())) {
            this.emptyTextCmp.show();
        }
    },

    hideEmptyText: function() {
        if (this.getEmptyText()) {
            this.emptyTextCmp.hide();
        }
    }
});