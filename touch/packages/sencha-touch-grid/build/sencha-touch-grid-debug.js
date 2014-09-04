/**
 * Description
 */
Ext.define('Ext.grid.infinite.Row', {
    extend:  Ext.Component ,
    xtype: 'gridrow',

    config: {
        baseCls: Ext.baseCSSPrefix + 'grid-row',
        index: 0,
        columns: null,
        renderedCellCount: null,
        columnPositionMap: null,
        minimumBufferDistance: 3,
        bufferSize: 12
    },

    leftRenderedIndex: 0,
    leftVisibleIndex: 0,

    constructor: function() {
        this.cells = [];
        this.updatedCells = [];

        this.offsets = {};
        this.widths = {};

        this.callParent(arguments);
    },

    createCell: function() {
        var prototype = this.self.prototype,
            renderTemplate, elements, element, i, ln;

        if (!prototype.hasOwnProperty('cellRenderTemplate')) {
            prototype.cellRenderTemplate = renderTemplate = document.createDocumentFragment();
            renderTemplate.appendChild(Ext.Element.create(this.getCellElementConfig(), true));

            elements = renderTemplate.querySelectorAll('[id]');

            for (i = 0, ln = elements.length; i < ln; i++) {
                element = elements[i];
                element.removeAttribute('id');
            }
        }

        return prototype.cellRenderTemplate.cloneNode(true).firstChild;
    },

    getCellElementConfig: function() {
        var config = {
                tag: 'div',
                cls: Ext.baseCSSPrefix + 'grid-cell'
            };

        return config;
    },

    onTranslate: function(x) {
        var me = this;
        if (me.cells.length) {
            me.handleCellUpdates(x);
            me.handleCellDimensions();
        }
    },

    handleCellUpdates: function(x) {
        var me = this,
            positionMap = me.getColumnPositionMap(),
            cells = me.cells,
            cellCount = cells.length,
            columns = me.getColumns(),
            lastIndex = columns.length - 1,
            bufferSize = me.getBufferSize(),
            record = me.getRecord(),
            rowIndex = me.getIndex(),
            minimumBufferDistance = me.getMinimumBufferDistance(),
            currentLeftVisibleIndex = me.leftVisibleIndex,
            leftRenderedIndex = me.leftRenderedIndex,
            leftVisibleIndex, bufferDistance, updateCount,
            cellIndex, cell, i, column;

        me.leftVisibleIndex = leftVisibleIndex = Math.max(0, positionMap.findIndex(-x) || 0);

        if (currentLeftVisibleIndex !== leftVisibleIndex) {
            if (currentLeftVisibleIndex > leftVisibleIndex) {
                // When we are scrolling to the left
                bufferDistance = leftVisibleIndex - leftRenderedIndex;
                if (bufferDistance < minimumBufferDistance) {
                    updateCount = Math.min(cellCount, minimumBufferDistance - bufferDistance);
                    for (i = 0; i < updateCount; i++) {
                        cellIndex = leftRenderedIndex - i - 1;
                        if (cellIndex < 0) {
                            break;
                        }

                        cell = cells.pop();
                        cells.unshift(cell);
                        column = columns[cellIndex];

                        me.updateCell(cell, column, record, rowIndex);
                        me.updatedCells.push(cell);
                        me.leftRenderedIndex--;
                    }
                }
            }
            else {
                // When we are scrolling to the right
                bufferDistance = leftRenderedIndex + bufferSize - leftVisibleIndex;
                if (bufferDistance < minimumBufferDistance) {
                    updateCount = Math.min(cellCount, minimumBufferDistance - bufferDistance);
                    for (i = 0; i < updateCount; i++) {
                        cellIndex = leftRenderedIndex + cellCount + i;
                        if (cellIndex > lastIndex) {
                            break;
                        }

                        cell = cells.shift();
                        cells.push(cell);
                        column = columns[cellIndex];

                        me.updateCell(cell, column, record, rowIndex);
                        me.updatedCells.push(cell);
                        me.leftRenderedIndex++;
                    }
                }
            }
        }
    },

    handleCellDimensions: function() {
        var me = this,
            cells = me.cells,
            widths = me.widths,
            offsets = me.offsets,
            updatedCells = me.updatedCells,
            positionMap = me.getColumnPositionMap(),
            leftRenderedIndex = me.leftRenderedIndex,
            width, offset,
            cell, cellEl, cellIndex;

        while (cell = updatedCells.shift()) {
            cellIndex = cells.indexOf(cell);
            cellEl = Ext.get(cell);

            width = positionMap.getItemHeight(cellIndex + leftRenderedIndex);
            offset = positionMap.map[cellIndex + leftRenderedIndex];

            if (width !== widths[cell.id]) {
                cellEl.setWidth(width);
                widths[cell.id] = width;
            }

            if (offset !== offsets[cell.id]) {
                cellEl.translate(offset);
                offsets[cell.id] = offset;
            }
        }
    },

    updateRenderedCellCount: function(maxVisibleCellCount) {
        var me = this,
            element = me.element,
            cells = me.cells,
            currentCellsLength = cells.length,
            bufferSize = me.getBufferSize(),
            renderedCellCount = maxVisibleCellCount + bufferSize,
            difference = renderedCellCount - currentCellsLength,
            i, cell;


        // This loop will create new items if the new itemsCount is higher than the amount of items we currently have
        for (i = 0; i < difference; i++) {
            cell = me.createCell(currentCellsLength + i);
            element.appendChild(cell);
            cells.push(cell);
            me.updatedCells.push(cell);
        }

        // This loop will destroy unneeded items if the new itemsCount is lower than the amount of items we currently have
        for (i = difference; i < 0; i++) {
            element.removeChild(cells.pop());
        }
    },

    updateRecord: function(record) {
        var me = this,
            index = me.getIndex(),
            columns = me.getColumns(),
            cells = me.cells,
            leftRenderedIndex = me.leftRenderedIndex,
            i, ln, cell, column;

        for (i = 0, ln = cells.length; i < ln; i++) {
            cell = cells[i];
            column = columns[i + leftRenderedIndex];
            me.updateCell(cell, column, record, index);
        }
    },

    updateCell: function(cell, column, record, index) {
        var me = this;

        record = record || me.getRecord();
        index = index || me.getIndex();

        cell.innerHTML = record && column ? column.getCellContent(record, me, index) : '';
    }
});

/**
 * Description
 */
Ext.define('Ext.grid.Row', {
    extend:  Ext.Component ,
    xtype: 'gridrow',

    config: {
        baseCls: Ext.baseCSSPrefix + 'grid-row',
        grid: null
    },

    constructor: function() {
        this.cells = [];
        this.columnMap = {};
        this.callParent(arguments);
    },

    updateGrid: function(grid) {
        var me = this,
            i, columns, ln;

        me.element.innerHTML = '';
        me.cells = [];

        if (grid) {
            columns = grid.getColumns();
            for (i = 0, ln = columns.length; i < ln; i++) {
                me.addColumn(columns[i]);
            }
        }
    },

    addColumn: function(column) {
        this.insertColumn(this.cells.length, column);
    },

    insertColumn: function(index, column) {
        if (this.getCellByColumn(column)) {
            return;
        }

        var me = this,
            element = me.element,
            cells = me.cells,
            columnMap = me.columnMap,
            cell = me.createCell(index),
            beforeCell = me.cells[index],
            cellCls = column.getCellCls(),
            cellEl = Ext.get(cell),
            record = this.getRecord(),
            cls = [];

        cell.$column = column;
        cell.style.width = column.getWidth() + 'px';

        if (column.isHidden()) {
            cell.style.display = 'none';
        }

        cls.push(Ext.baseCSSPrefix + 'grid-cell-align-' + column.getAlign());
        if (cellCls) {
            cls.push(cellCls);
        }
        cellEl.addCls(cls);

        if (record) {
            column.updateCell(cell, record);
        }

        if (beforeCell) {
            element.dom.insertBefore(cell, beforeCell);
            cells.splice(index, 0, cell);
        } else {
            element.dom.appendChild(cell);
            cells.push(cell);
        }

        columnMap[column.getId()] = cell;
    },

    removeColumn: function(column) {
        var me = this,
            columnMap = me.columnMap,
            element = me.element,
            columnId = column.getId(),
            cell = columnMap[columnId];

        delete cell.$column;
        if (cell) {
            element.removeChild(cell);
        }

        Ext.Array.remove(me.cells, cell);
        delete columnMap[columnId];
    },

    updateRecord: function(record) {
        var me = this,
            cells = me.cells,
            i, ln, cell, column;

        for (i = 0, ln = cells.length; i < ln; i++) {
            cell = cells[i];
            column = me.getColumnByCell(cell);
            column.updateCell(cell, record);
        }
    },

    setColumnWidth: function(column, width) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.style.width = width + 'px';
        }
    },

    showColumn: function(column) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.style.display = '';
        }
    },

    hideColumn: function(column) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.style.display = 'none';
        }
    },

    getCellByColumn: function(column) {
        return this.columnMap[column.getId()];
    },

    getColumnByCell: function(cell) {
        return cell.$column;
    },

    createCell: function() {
        var prototype = this.self.prototype,
            renderTemplate, elements, element, i, ln;

        if (!prototype.hasOwnProperty('cellRenderTemplate')) {
            prototype.cellRenderTemplate = renderTemplate = document.createDocumentFragment();
            renderTemplate.appendChild(Ext.Element.create(this.getCellElementConfig(), true));

            elements = renderTemplate.querySelectorAll('[id]');

            for (i = 0, ln = elements.length; i < ln; i++) {
                element = elements[i];
                element.removeAttribute('id');
            }
        }

        return prototype.cellRenderTemplate.cloneNode(true).firstChild;
    },

    getCellElementConfig: function() {
        var config = {
                tag: 'div',
                cls: Ext.baseCSSPrefix + 'grid-cell',
                html: '&nbsp;'
            };

        return config;
    }
});

/**
 * This class specifies the definition for a column inside a {@link Ext.grid.Grid}. It encompasses
 * both the grid header configuration as well as displaying data within the grid itself.
 * In general an array of column configurations will be passed to the grid:
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId: 'employeeStore',
 *         fields: ['firstname', 'lastname', 'seniority', 'dep', 'hired'],
 *         data: [
 *             {firstname:"Michael", lastname:"Scott", seniority:7, dep:"Management", hired:"01/10/2004"},
 *             {firstname:"Dwight", lastname:"Schrute", seniority:2, dep:"Sales", hired:"04/01/2004"},
 *             {firstname:"Jim", lastname:"Halpert", seniority:3, dep:"Sales", hired:"02/22/2006"},
 *             {firstname:"Kevin", lastname:"Malone", seniority:4, dep:"Accounting", hired:"06/10/2007"},
 *             {firstname:"Angela", lastname:"Martin", seniority:5, dep:"Accounting", hired:"10/21/2008"}
 *         ]
 *     });
 *
 *     var grid = Ext.create('Ext.grid.Grid', {
 *         title: 'Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {text: 'Hired Month',  dataIndex:'hired', xtype:'datecolumn', format:'M'},
 *             {text: 'Department (Yrs)', xtype:'templatecolumn', tpl:'{dep} ({seniority})'}
 *         ],
 *         width: 400
 *     });
 *     Ext.ViewPort.add(grid);
 *
 * # Convenience Subclasses
 *
 * There are several column subclasses that provide default rendering for various data types
 *
 *  - {@link Ext.grid.column.Boolean}: Renders for boolean values
 *  - {@link Ext.grid.column.Date}: Renders for date values
 *  - {@link Ext.grid.column.Number}: Renders for numeric values
 *  - {@link Ext.grid.column.Template}: Renders a value using an {@link Ext.XTemplate} using the record data
 *
 * # Setting Sizes
 *
 * The columns can be only be given an explicit width value. If no width is specified the grid will
 * automatically the size the column to 20px.
 *
 * # Header Options
 *
 *  - {@link #text}: Sets the header text for the column
 *  - {@link #sortable}: Specifies whether the column can be sorted by clicking the header or using the column menu
 *
 * # Data Options
 *
 *  - {@link #dataIndex}: The dataIndex is the field in the underlying {@link Ext.data.Store} to use as the value for the column.
 *  - {@link #renderer}: Allows the underlying store value to be transformed before being displayed in the grid
 */
Ext.define('Ext.grid.column.Column', {
    extend:  Ext.Component ,

    xtype: 'column',

    config: {
        /**
         * @cfg {String} dataIndex
         * The name of the field in the grid's {@link Ext.data.Store}'s {@link Ext.data.Model} definition from
         * which to draw the column's value. **Required.**
         */
        dataIndex: null,

        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         * **Note**: to have a clickable header with no text displayed you can use the default of `&#160;` aka `&nbsp;`.
         */
        text: '&nbsp;',

        /**
         * @cfg {Boolean} sortable
         * False to disable sorting of this column. Whether local/remote sorting is used is specified in
         * `{@link Ext.data.Store#remoteSort}`.
         */
        sortable: true,

        /**
         * @cfg {Boolean} resizable
         * False to prevent the column from being resizable.
         * Note that this configuration only works when the {@link Ext.grid.plugin.ColumnResizing ColumnResizing} plugin
         * is enabled on the {@link Ext.grid.Grid Grid}.
         */
        resizable: true,

        /**
         * @cfg {Boolean} hideable
         * False to prevent the user from hiding this column.
         * TODO: Not implemented yet
         * @private
         */
        hideable: true,

        /**
         * @cfg {Function/String} renderer
         * A renderer is an 'interceptor' method which can be used to transform data (value, appearance, etc.)
         * before it is rendered. Example:
         *
         *     {
         *         renderer: function(value, record){
         *             if (value === 1) {
         *                 return '1 person';
         *             }
         *             return value + ' people';
         *         }
         *     }
         *
         * @cfg {Object} renderer.value The data value for the current cell
         * @cfg {Ext.data.Model} renderer.record The record for the current row
         * @cfg {Number} renderer.rowIndex The index of the current row
         * @cfg {String} renderer.return The HTML string to be rendered.
         */
        renderer: false,

        /**
         * @cfg {Object} scope
         * The scope to use when calling the {@link #renderer} function.
         */
        scope: null,

        /**
         * @cfg {String} align
         * Sets the alignment of the header and rendered columns.
         * Possible values are: `'left'`, `'center'`, and `'right'`.
         */
        align: 'left',

        /**
         * @cfg {Boolean} editable
         * Set this to true to make this column editable.
         * Only applicable if the grid is using an {@link Ext.grid.plugin.Editable Editable} plugin.
         * @type {Boolean}
         */
        editable: false,

        /**
         * @cfg {Object/String} editor
         * An optional xtype or config object for a {@link Ext.field.Field Field} to use for editing.
         * Only applicable if the grid is using an {@link Ext.grid.plugin.Editable Editable} plugin.
         * Note also that {@link #editable} has to be set to true if you want to make this column editable.
         * If this configuration is not set, and {@link #editable} is set to true, the {@link #defaultEditor} is used.
         */
        editor: null,

        /**
         * @cfg {Object/Ext.field.Field}
         * An optional config object that should not really be modified. This is used to create
         * a default editor used by the {@link Ext.grid.plugin.Editable Editable} plugin when no
         * {@link #editor} is specified.
         * @type {Object}
         */
        defaultEditor: {
            xtype: 'textfield',
            required: true
        },

        /**
         * @cfg {Boolean} ignore
         * This configuration should be left alone in most cases. This is used to prevent certain columns
         * (like the MultiSelection plugin column) to show up in plugins (like the {@link Ext.grid.plugin.ViewOptions} plugin).
         */
        ignore: false,

        /**
         * @cfg {String} summaryType
         * This configuration specifies the type of summary. There are several built in summary types.
         * These call underlying methods on the store:
         *
         *  - {@link Ext.data.Store#count count}
         *  - {@link Ext.data.Store#sum sum}
         *  - {@link Ext.data.Store#min min}
         *  - {@link Ext.data.Store#max max}
         *  - {@link Ext.data.Store#average average}
         *
         * Note that this configuration only works when the grid has the {@link Ext.grid.plugin.SummaryRow SummaryRow}
         * plugin enabled.
         */
        summaryType: null,

        /**
         * @cfg {Function} summaryRenderer
         * This summaryRenderer is called before displaying a value in the SummaryRow. The function is optional,
         * if not specified the default calculated value is shown. The summaryRenderer is called with:
         *  - value {Object} - The calculated value.
         *
         * Note that this configuration only works when the grid has the {@link Ext.grid.plugin.SummaryRow SummaryRow}
         * plugin enabled.
         */
        summaryRenderer: null,

        minWidth: 20,
        baseCls: Ext.baseCSSPrefix + 'grid-column',
        cellCls: null,
        sortedCls: Ext.baseCSSPrefix + 'column-sorted',
        sortDirection: null
    },

    updateAlign: function(align, oldAlign) {
        if (oldAlign) {
            this.removeCls(Ext.baseCSSPrefix + 'grid-column-align-' + align);
        }
        if (align) {
            this.addCls(Ext.baseCSSPrefix + 'grid-column-align-' + align);
        }
    },

    initialize: function() {
        this.callParent();

        this.element.on({
            tap: 'onColumnTap',
            longpress: 'onColumnLongPress',
            scope: this
        });
    },

    onColumnTap: function(e) {
        this.fireEvent('tap', this, e);
    },

    onColumnLongPress: function(e) {
        this.fireEvent('longpress', this, e);
    },

    updateText: function(text) {
        this.setHtml(text);
    },

    doSetWidth: function(width) {
        this.callParent(arguments);
        this.fireEvent('columnresize', this, width);
    },

    updateDataIndex: function(dataIndex) {
        var editor = this.getEditor();
        if (editor) {
            editor.name = dataIndex;
        } else {
            this.getDefaultEditor().name = dataIndex;
        }
    },

    updateSortDirection: function(direction, oldDirection) {
        if (!this.getSortable()) {
            return;
        }

        var sortedCls = this.getSortedCls();

        if (oldDirection) {
            this.element.removeCls(sortedCls + '-' + oldDirection.toLowerCase());
        }

        if (direction) {
            this.element.addCls(sortedCls + '-' + direction.toLowerCase());
        }

        this.fireEvent('sort', this, direction, oldDirection);
    },

    getCellContent: function(record) {
        var me = this,
            dataIndex = me.getDataIndex(),
            renderer = me.getRenderer(),
            scope = me.getScope(),
            value = dataIndex && record.get(dataIndex);

        return renderer ? renderer.call(scope || me, value, record, dataIndex) : me.defaultRenderer(value, record);
    },

    /**
     * @method defaultRenderer
     * When defined this will take precedence over the {@link Ext.grid.column.Column#renderer renderer} config.
     * This is meant to be defined in subclasses that wish to supply their own renderer.
     * @protected
     * @template
     */
    defaultRenderer: function(value) {
        return value;
    },

    updateCell: function(cell, record, content) {
        if (cell && (record || content)) {
            cell.firstChild.nodeValue = content || this.getCellContent(record);
        }
    }
});

/**
 * A Column definition class which renders a passed date according to the default locale, or a configured
 * {@link #format}.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'sampleStore',
 *         fields:[
 *             { name: 'symbol', type: 'string' },
 *             { name: 'date',   type: 'date' },
 *             { name: 'change', type: 'number' },
 *             { name: 'volume', type: 'number' },
 *             { name: 'topday', type: 'date' }
 *         ],
 *         data:[
 *             { symbol: "msft",   date: '2011/04/22', change: 2.43, volume: 61606325, topday: '04/01/2010' },
 *             { symbol: "goog",   date: '2011/04/22', change: 0.81, volume: 3053782,  topday: '04/11/2010' },
 *             { symbol: "apple",  date: '2011/04/22', change: 1.35, volume: 24484858, topday: '04/28/2010' },
 *             { symbol: "sencha", date: '2011/04/22', change: 8.85, volume: 5556351,  topday: '04/22/2010' }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         title: 'Date Column Demo',
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Symbol',   dataIndex: 'symbol', flex: 1 },
 *             { text: 'Date',     dataIndex: 'date',   xtype: 'datecolumn',   format:'Y-m-d' },
 *             { text: 'Change',   dataIndex: 'change', xtype: 'numbercolumn', format:'0.00' },
 *             { text: 'Volume',   dataIndex: 'volume', xtype: 'numbercolumn', format:'0,000' },
 *             { text: 'Top Day',  dataIndex: 'topday', xtype: 'datecolumn',   format:'l' }
 *         ],
 *         height: 200,
 *         width: 450
 *     });
 */
Ext.define('Ext.grid.column.Date', {
    extend:  Ext.grid.column.Column ,

                           

    xtype: 'datecolumn',

    config: {
        /**
         * @cfg {String} format
         * A formatting string as used by {@link Ext.Date#format} to format a Date for this Column.
         */
        format: undefined
    },

    applyFormat: function(format) {
        if (!format) {
            format = Ext.Date.defaultFormat;
        }
        return format;
    },

    updateFormat: function(format) {
        this.getDefaultEditor().dateFormat = format;
    },

    defaultRenderer: function(value) {
        return Ext.util.Format.date(value, this.getFormat());
    }
});

/**
 * A Column definition class which renders a value by processing a {@link Ext.data.Model Model}'s
 * {@link Ext.data.Model#persistenceProperty data} using a {@link #tpl configured}
 * {@link Ext.XTemplate XTemplate}.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'seniority', 'department'],
 *         groupField: 'department',
 *         data:[
 *             { firstname: "Michael", lastname: "Scott",   seniority: 7, department: "Management" },
 *             { firstname: "Dwight",  lastname: "Schrute", seniority: 2, department: "Sales" },
 *             { firstname: "Jim",     lastname: "Halpert", seniority: 3, department: "Sales" },
 *             { firstname: "Kevin",   lastname: "Malone",  seniority: 4, department: "Accounting" },
 *             { firstname: "Angela",  lastname: "Martin",  seniority: 5, department: "Accounting" }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Column Template Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             { text: 'Full Name',       xtype: 'templatecolumn', tpl: '{firstname} {lastname}', flex:1 },
 *             { text: 'Department (Yrs)', xtype: 'templatecolumn', tpl: '{department} ({seniority})' }
 *         ],
 *         height: 200,
 *         width: 300,
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.grid.column.Template', {
    extend:  Ext.grid.column.Column ,

                                

    xtype: 'templatecolumn',

    config: {
        /**
         * @cfg {String/Ext.XTemplate} tpl
         * An {@link Ext.XTemplate XTemplate}, or an XTemplate *definition string* to use to process a
         * {@link Ext.data.Model Model}'s {@link Ext.data.Model#persistenceProperty data} to produce a
         * column's rendered value.
         */
        tpl: null
    },

    applyTpl: function(tpl) {
        if (Ext.isPrimitive(tpl) || !tpl.compile) {
            tpl = new Ext.XTemplate(tpl);
        }
        return tpl;
    },

    defaultRenderer: function(value, record) {
        return this.getTpl().apply(record.getData(true));
    },

    updateCell: function(cell, record, content) {
        if (cell && (record || content)) {
            cell.innerHTML = content || this.getCellContent(record);
        }
    }
});

/**
 * @class Ext.grid.HeaderContainer
 * @extends Ext.Container
 * Description
 */
Ext.define('Ext.grid.HeaderContainer', {
    extend:  Ext.Container ,
    xtype: 'headercontainer',

    config: {
        baseCls: Ext.baseCSSPrefix + 'grid-header-container',
        height: 65,
        docked: 'top',
        translationMethod: 'auto',
        defaultType: 'column'
    },

    initialize: function() {
        var me = this;

        me.columns = [];

        me.callParent();

        me.on({
            tap: 'onHeaderTap',
            columnresize: 'onColumnResize',
            show: 'onColumnShow',
            hide: 'onColumnHide',
            sort: 'onColumnSort',
            scope: me,
            delegate: 'column'
        });

        me.on({
            show: 'onGroupShow',
            hide: 'onGroupHide',
            add: 'onColumnAdd',
            remove: 'onColumnRemove',
            scope: me,
            delegate: 'gridheadergroup'
        });

        me.on({
            add: 'onColumnAdd',
            remove: 'onColumnRemove',
            scope: me
        });

        if (Ext.browser.getPreferredTranslationMethod({translationMethod: this.getTranslationMethod()}) == 'scrollposition') {
            me.innerElement.setLeft(500000);
        }
    },

    getColumns: function() {
        return this.columns;
    },

    getAbsoluteColumnIndex: function(column) {
        var items = this.getInnerItems(),
            ln = items.length,
            index = 0,
            innerIndex, i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];

            if (item === column) {
                return index;
            }
            else if (item.isHeaderGroup) {
                innerIndex = item.innerIndexOf(column);
                if (innerIndex !== -1) {
                    index += innerIndex;
                    return index;
                }
                else {
                    index += item.getInnerItems().length;
                }
            }
            else {
                index += 1;
            }
        }
    },

    onColumnAdd: function(parent, column) {
        var me = this,
            columns = me.columns,
            columnIndex = me.getAbsoluteColumnIndex(column),
            groupColomns, ln, i;

        if (column.isHeaderGroup) {
            groupColomns = column.getItems().items;

            for (i = 0, ln = groupColomns.length; i < ln; i++) {
                columns.splice(columnIndex + i, 0, groupColomns[i]);
                me.fireEvent('columnadd', me, groupColomns[i], column);
            }
        } else {
            columns.splice(columnIndex, 0, column);
            me.fireEvent('columnadd', me, column, null);
        }
    },

    onColumnRemove: function(parent, column) {
        if (column.isHeaderGroup) {
            var columns = column.getItems().items,
                ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                Ext.Array.remove(this.columns, columns[i]);
                this.fireEvent('columnremove', this, columns[i]);
            }
        } else {
            Ext.Array.remove(this.columns, column);
            this.fireEvent('columnremove', this, column);
        }
    },

    onHeaderTap: function(column) {
        if (!column.getIgnore() && column.getSortable()) {
            var sortDirection = column.getSortDirection() || 'DESC',
                newDirection = (sortDirection === 'DESC') ? 'ASC' : 'DESC';

            column.setSortDirection(newDirection);
        }

        this.fireEvent('columntap', this, column);
    },

    onColumnShow: function(column) {
        this.fireEvent('columnshow', this, column);
    },

    onColumnHide: function(column) {
        this.fireEvent('columnhide', this, column);
    },

    onGroupShow: function(group) {
        var columns = group.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (!column.isHidden()) {
                this.fireEvent('columnshow', this, column);
            }
        }
    },

    onGroupHide: function(group) {
        var columns = group.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            this.fireEvent('columnhide', this, column);
        }
    },

    onColumnResize: function(column, width) {
        this.fireEvent('columnresize', this, column, width);
    },

    onColumnSort: function(column, direction, newDirection) {
        if (direction !== null) {
            this.fireEvent('columnsort', this, column, direction, newDirection);
        }
    },

    scrollTo: function(x) {
        switch (Ext.browser.getPreferredTranslationMethod({translationMethod: this.getTranslationMethod()})) {
            case 'scrollposition':
                this.renderElement.dom.scrollLeft = 500000 - x;
                break;
            case 'csstransform':
                this.innerElement.translate(x, 0);
                break;
        }
    }
});

/**
 * @class Ext.grid.HeaderGroup
 * @extends Ext.Container
 * Description
 */
Ext.define('Ext.grid.HeaderGroup', {
    extend:  Ext.Container ,
    alias: 'widget.gridheadergroup',
    isHeaderGroup: true,

    config: {
        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         */
        text: '&nbsp;',

        defaultType: 'column',
        baseCls: Ext.baseCSSPrefix + 'grid-headergroup',

        /**
         * We hide the HeaderGroup by default, and show it when any columns are added to it.
         * @hide
         */
        hidden: true
    },

    updateText: function(text) {
        this.setHtml(text);
    },

    initialize: function() {
        this.on({
            add: 'doVisibilityCheck',
            remove: 'doVisibilityCheck'
        });

        this.on({
            show: 'doVisibilityCheck',
            hide: 'doVisibilityCheck',
            delegate: '> column'
        });

        this.callParent(arguments);

        this.doVisibilityCheck();
    },

    doVisibilityCheck: function() {
        var columns = this.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (!column.isHidden()) {
                if (this.isHidden()) {
                    if (this.initialized) {
                        this.show();
                    } else {
                        this.setHidden(false);
                    }
                }
                return;
            }
        }

        this.hide();
    }
});

/**
 * Description
 */
Ext.define('Ext.grid.infinite.Grid', {
    extend:  Ext.Container ,
    alias: 'widget.grid',

    mixins: [
         Ext.mixin.Selectable ,
         Ext.mixin.Bindable 
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

/**
 * @author Tommy Maintz
 *
 * Grids are an excellent way of showing large amounts of tabular data on the client side. Essentially a supercharged
 * `<table>`, Grid makes it easy to fetch, sort and filter large amounts of data.
 *
 * Grids are composed of two main pieces - a {@link Ext.data.Store Store} full of data and a set of columns to render.
 *
 * **Note: **  _This functionality is only available with the purchase of 
 * Sencha Complete.  For more information about using this class, please visit 
 * our [Sencha Complete](https://www.sencha.com/products/complete/) product page._
 *
 * ## Basic GridPanel
 *
 *     Ext.create('Ext.data.Store', {
 *         storeId: 'simpsonsStore',
 *         fields: ['name', 'email', 'phone'],
 *         data: [
 *             { 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
 *             { 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
 *             { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
 *             { 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         title: 'Simpsons',
 *         store: Ext.data.StoreManager.lookup('simpsonsStore'),
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name', width: 200},
 *             { text: 'Email', dataIndex: 'email', width: 250},
 *             { text: 'Phone', dataIndex: 'phone', width: 120}
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 *
 * The code above produces a simple grid with three columns. We specified a Store which will load JSON data inline.
 * In most apps we would be placing the grid inside another container and wouldn't need to use the
 * {@link #height}, {@link #width} and {@link #renderTo} configurations but they are included here to make it easy to get
 * up and running.
 *
 * The grid we created above will contain a header bar with a title ('Simpsons'), a row of column headers directly underneath
 * and finally the grid rows under the headers.
 *
 * ## Configuring columns
 *
 * By default, each column is sortable and will toggle between ASC and DESC sorting when you click on its header.
 * It's easy to configure each column - here we use the same example as above and just modify the columns config:
 *
 *     columns: [
 *         {
 *             text: 'Name',
 *             dataIndex: 'name',
 *             sortable: false,
 *             width: 250
 *         },
 *         {
 *             text: 'Email',
 *             dataIndex: 'email',
 *             hidden: true
 *         },
 *         {
 *             text: 'Phone',
 *             dataIndex: 'phone',
 *             width: 100
 *         }
 *     ]
 *
 * We turned off sorting on the 'Name' column so clicking its header now has no effect. We also made the Email
 * column hidden by default (it can be shown again by using the {@link Ext.grid.plugin.ViewOptions ViewOptions} plugin).
 * See the {@link Ext.grid.column.Column column docs} for more details.
 *
 * ## Renderers
 *
 * As well as customizing columns, it's easy to alter the rendering of individual cells using renderers. A renderer is
 * tied to a particular column and is passed the value that would be rendered into each cell in that column. For example,
 * we could define a renderer function for the email column to turn each email address into a mailto link:
 *
 *     columns: [
 *         {
 *             text: 'Email',
 *             dataIndex: 'email',
 *             renderer: function(value) {
 *                 return Ext.String.format('<a href="mailto:{0}">{1}</a>', value, value);
 *             }
 *         }
 *     ]
 *
 * See the {@link Ext.grid.column.Column column docs} for more information on renderers.
 *
 * ## Sorting & Filtering
 *
 * Every grid is attached to a {@link Ext.data.Store Store}, which provides multi-sort and filtering capabilities. It's
 * easy to set up a grid to be sorted from the start:
 *
 *     var myGrid = Ext.create('Ext.grid.Panel', {
 *         store: {
 *             fields: ['name', 'email', 'phone'],
 *             sorters: ['name', 'phone']
 *         },
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name' },
 *             { text: 'Email', dataIndex: 'email' }
 *         ]
 *     });
 *
 * Sorting at run time is easily accomplished by simply clicking each column header. If you need to perform sorting on
 * more than one field at run time it's easy to do so by adding new sorters to the store:
 *
 *     myGrid.store.sort([
 *         { property: 'name',  direction: 'ASC' },
 *         { property: 'email', direction: 'DESC' }
 *     ]);
 *
 * See {@link Ext.data.Store} for examples of filtering.
 *
 * ## Plugins and Features
 *
 * Grid supports addition of extra functionality through plugins:
 *
 * - {@link Ext.grid.plugin.ViewOptions ViewOptions} - adds the ability to show/hide columns and reorder them.
 *
 * - {@link Ext.grid.plugin.ColumnResizing ColumnResizing} - allows for the ability to pinch to resize columns.
 *
 * - {@link Ext.grid.plugin.Editable Editable} - editing grid contents an entire row at a time.
 *
 * - {@link Ext.grid.plugin.MultiSelection MultiSelection} - selecting and deleting several rows at a time.
 *
 * - {@link Ext.grid.plugin.PagingToolbar PagingToolbar} - adds a toolbar at the bottom of the grid that allows you to quickly navigate to another page of data.
 *
 * - {@link Ext.grid.plugin.SummaryRow SummaryRow} - adds and pins an additional row to the top of the grid that enables you to display summary data.
 */
Ext.define('Ext.grid.Grid', {
    extend:  Ext.List ,

               
                       
                                 
                               
                                   
                                   
                               
                       
                        
      

    xtype: 'grid',

    config: {
        defaultType: 'gridrow',

        /**
         * @cfg {Boolean} infinite
         * This List configuration should always be set to true on a Grid.
         * @hide
         */
        infinite: true,

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
         *                  dataIndex: "field_A",
         *                  width: 200
         *              },{
         *                  text: "Column B",
         *                  dataIndex: "field_B",
         *                  width: 150
         *              },
         *              ...
         *          ]
         *      }
         *
         */
        columns: null,

        /**
         * @cfg baseCls
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'grid',

        /**
         * @cfg {Boolean} useHeaders
         * @hide
         */
        useHeaders: false,

        itemHeight: 60,

        /**
         * @cfg {Boolean} variableHeights
         * This configuration is best left to false on a Grid for performance reasons.
         */
        variableHeights: false,

        headerContainer: {
            xtype: 'headercontainer'
        },

        /**
         * @cfg {Boolean} striped
         * @inherit
         */
        striped: true,

        itemCls: Ext.baseCSSPrefix + 'list-item',
        scrollToTopOnRefresh: false,

        titleBar: {
            xtype: 'titlebar',
            docked: 'top'
        },

        /**
         * @cfg {String} title
         * The title that will be displayed in the TitleBar at the top of this Grid.
         */
        title: ''
    },

    /**
     * @event columnadd
     * Fires whenever a column is added to the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The added column
     * @param {Number} index The index of the added column
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event columnremove
     * Fires whenever a column is removed from the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The removed column
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event columnshow
     * Fires whenever a column is shown in the Grid
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The shown column
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event columnhide
     * Fires whenever a column is hidden in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The shown column
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event columnresize
     * Fires whenever a column is resized in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The resized column
     * @param {Number} width The new column width
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event columnsort
     * Fires whenever a column is sorted in the Grid
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The sorted column
     * @param {String} direction The direction of the sort on this Column. Either 'asc' or 'desc'
     * @param {Ext.EventObject} e The event object
     */

    platformConfig: [{
        theme: ['Windows'],
        itemHeight: 60
    }],

    beforeInitialize: function() {
        this.container = Ext.factory({
            xtype: 'container',
            scrollable: {
                scroller: {
                    autoRefresh: false,
                    direction: 'auto',
                    directionLock: true
                }
            }
        });

        this.callParent();
    },

    initialize: function() {
        var me = this,
            titleBar = me.getTitleBar(),
            headerContainer = me.getHeaderContainer();

        me.callParent();

        if (titleBar) {
            me.container.add(me.getTitleBar());
        }
        me.container.doAdd(headerContainer);

        me.scrollElement.addCls(Ext.baseCSSPrefix + 'grid-scrollelement');
    },

    onTranslate: function(x) {
        this.callParent(arguments);
        this.getHeaderContainer().scrollTo(x);
    },

    applyTitleBar: function(titleBar) {
        if (titleBar && !titleBar.isComponent) {
            titleBar = Ext.factory(titleBar, Ext.TitleBar);
        }
        return titleBar;
    },

    updateTitle: function(title) {
        var titleBar = this.getTitleBar();
        if (titleBar) {
            this.getTitleBar().setTitle(title);
        }
    },

    applyHeaderContainer: function(headerContainer) {
        if (headerContainer && !headerContainer.isComponent) {
            headerContainer = Ext.factory(headerContainer, Ext.grid.HeaderContainer);
        }
        return headerContainer;
    },

    updateHeaderContainer: function(headerContainer, oldHeaderContainer) {
        var me = this;

        if (oldHeaderContainer) {
            oldHeaderContainer.un({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }

        if (headerContainer) {
            headerContainer.on({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }
    },

    addColumn: function(column) {
        this.getHeaderContainer().add(column);
    },

    removeColumn: function(column) {
        this.getHeaderContainer().remove(column);
    },

    insertColumn: function(index, column) {
        this.getHeaderContainer().insert(index, column);
    },

    onColumnAdd: function(container, column) {
        if (this.isPainted()) {
            var items = this.listItems,
                ln = items.length,
                columnIndex = container.getColumns().indexOf(column),
                i, row;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.insertColumn(columnIndex, column);
            }

            this.updateTotalColumnWidth();

            this.fireEvent('columnadd', this, column, columnIndex);
        }
    },

    onColumnRemove: function(container, column) {
        if (this.isPainted()) {
            var items = this.listItems,
                ln = items.length,
                i, row;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.removeColumn(column);
            }

            this.updateTotalColumnWidth();

            this.fireEvent('columnremove', this, column);
        }
    },

    updateColumns: function(columns) {
        if (columns && columns.length) {
            var ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                this.addColumn(columns[i]);
            }

            this.updateTotalColumnWidth();
        }
    },

    getColumns: function() {
        return this.getHeaderContainer().getColumns();
    },

    onColumnResize: function(container, column, width) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        for (i = 0; i < ln; i++) {
            row = items[i];
            row.setColumnWidth(column, width);
        }
        this.updateTotalColumnWidth();

        this.fireEvent('columnresize', column, width);
    },

    onColumnShow: function(container, column) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        this.updateTotalColumnWidth();
        for (i = 0; i < ln; i++) {
            row = items[i];
            row.showColumn(column);
        }

        this.fireEvent('columnshow', this, column);
    },

    onColumnHide: function(container, column) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        for (i = 0; i < ln; i++) {
            row = items[i];
            row.hideColumn(column);
        }
        this.updateTotalColumnWidth();

        this.fireEvent('columnhide', this, column);
    },

    onColumnSort: function(container, column, direction) {
        if (this.sortedColumn && this.sortedColumn !== column) {
            this.sortedColumn.setSortDirection(null);
        }
        this.sortedColumn = column;

        this.getStore().sort(column.getDataIndex(), direction);

        this.fireEvent('columnsort', this, column, direction);
    },

    getTotalColumnWidth: function() {
        var me = this,
            columns = me.getColumns(),
            ln = columns.length,
            totalWidth = 0,
            i, column, parent;


        for (i = 0; i < ln; i++) {
            column = columns[i];
            parent = column.getParent();

            if (!column.isHidden() && (!parent.isHeaderGroup || !parent.isHidden())) {
                totalWidth += column.getWidth();
            }
        }

        return totalWidth;
    },

    updateTotalColumnWidth: function() {
        var me = this,
            scroller = me.getScrollable().getScroller(),
            totalWidth = this.getTotalColumnWidth();

        me.scrollElement.setWidth(totalWidth);

        scroller.setSize({
            x: totalWidth,
            y: scroller.getSize().y
        });
        scroller.refresh();
    },

    setScrollerHeight: function(height) {
        var me = this,
            scroller = me.container.getScrollable().getScroller();

        if (height != scroller.givenSize.y) {
            scroller.setSize({
                x: scroller.givenSize.x,
                y: height
            });
            scroller.refresh();
        }
    },

    createItem: function(config) {
        var me = this,
            container = me.container,
            listItems = me.listItems,
            item;

        config.grid = me;
        item = Ext.factory(config);
        item.dataview = me;
        item.$height = config.minHeight;

        container.doAdd(item);
        listItems.push(item);

        return item;
    }
});

/**
 * A Column definition class which renders boolean data fields.  See the {@link Ext.grid.column.Column#xtype xtype}
 * config option of {@link Ext.grid.column.Column} for more details.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *        storeId:'sampleStore',
 *        fields:[
 *            {name: 'framework', type: 'string'},
 *            {name: 'rocks', type: 'boolean'}
 *        ],
 *        data:{'items':[
 *            { 'framework': "Ext JS 4",     'rocks': true  },
 *            { 'framework': "Sencha Touch", 'rocks': true  },
 *            { 'framework': "Ext GWT",      'rocks': true  },
 *            { 'framework': "Other Guys",   'rocks': false }
 *        ]}
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Framework',  dataIndex: 'framework', flex: 1 },
 *             {
 *                 xtype: 'booleancolumn',
 *                 text: 'Rocks',
 *                 trueText: 'Yes',
 *                 falseText: 'No',
 *                 dataIndex: 'rocks'
 *             }
 *         ],
 *         height: 200,
 *         width: 400
 *     });
 */
Ext.define('Ext.grid.column.Boolean', {
    extend:  Ext.grid.column.Column ,

    xtype: 'booleancolumn',

    config: {
        /**
         * @cfg {String} trueText
         * The string returned by the renderer when the column value is not falsey.
         */
        trueText: 'True',

        /**
         * @cfg {String} falseText
         * The string returned by the renderer when the column value is falsey (but not undefined).
         */
        falseText: 'False',

        /**
         * @cfg {String} undefinedText
         * The string returned by the renderer when the column value is undefined.
         */
        undefinedText: '&#160;',

        defaultEditor: {
            xtype: 'checkboxfield'
        }
    },

    defaultRenderer: function(value) {
        if (value === undefined) {
            return this.getUndefinedText();
        }

        if (!value || value === 'false') {
            return this.getFalseText();
        }

        return this.getTrueText();
    }
});

/**
 * A Column definition class which renders a numeric data field according to a {@link #format} string.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *        storeId:'sampleStore',
 *        fields:[
 *            { name: 'symbol', type: 'string' },
 *            { name: 'price',  type: 'number' },
 *            { name: 'change', type: 'number' },
 *            { name: 'volume', type: 'number' }
 *        ],
 *        data:[
 *            { symbol: "msft",   price: 25.76,  change: 2.43, volume: 61606325 },
 *            { symbol: "goog",   price: 525.73, change: 0.81, volume: 3053782  },
 *            { symbol: "apple",  price: 342.41, change: 1.35, volume: 24484858 },
 *            { symbol: "sencha", price: 142.08, change: 8.85, volume: 5556351  }
 *        ]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         title: 'Number Column Demo',
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Symbol',         dataIndex: 'symbol', width: 100},
 *             { text: 'Current Price',  dataIndex: 'price',  renderer: Ext.util.Format.usMoney },
 *             { text: 'Change',         dataIndex: 'change', xtype: 'numbercolumn', format:'0.00' },
 *             { text: 'Volume',         dataIndex: 'volume', xtype: 'numbercolumn', format:'0,000' }
 *         ],
 *         height: 200,
 *         width: 400
 *     });
 */
Ext.define('Ext.grid.column.Number', {
    extend:  Ext.grid.column.Column ,

                                  

    xtype: 'numbercolumn',

    config: {
        /**
         * @cfg {String} format
         * A formatting string as used by {@link Ext.util.Format#number} to format a numeric value for this Column.
         */
        format: '0,000.00',

        defaultEditor: {
            xtype: 'numberfield'
        }
    },

    defaultRenderer: function(value) {
        return Ext.util.Format.number(value, this.getFormat());
    }
});

/*
This file is part of Ext JS 4.2

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-03-11 22:33:40 (aed16176e68b5e8aa1433452b12805c0ad913836)
*/
/**
 * A Grid header type which renders an icon, or a series of icons in a grid cell, and offers a scoped click
 * handler for each icon.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'seniority', 'dep', 'hired'],
 *         data:[
 *             {firstname:"Michael", lastname:"Scott"},
 *             {firstname:"Dwight", lastname:"Schrute"},
 *             {firstname:"Jim", lastname:"Halpert"},
 *             {firstname:"Kevin", lastname:"Malone"},
 *             {firstname:"Angela", lastname:"Martin"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Action Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {
 *                 xtype:'actioncolumn',
 *                 width:50,
 *                 items: [{
 *                     icon: 'extjs/examples/shared/icons/fam/cog_edit.png',  // Use a URL in the icon config
 *                     tooltip: 'Edit',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Edit " + rec.get('firstname'));
 *                     }
 *                 },{
 *                     icon: 'extjs/examples/restful/images/delete.png',
 *                     tooltip: 'Delete',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Terminate " + rec.get('firstname'));
 *                     }
 *                 }]
 *             }
 *         ],
 *         width: 250,
 *         renderTo: Ext.getBody()
 *     });
 *
 * The action column can be at any index in the columns array, and a grid can have any number of
 * action columns.
 */
Ext.define('Ext.grid.column.Action', {
    extend:  Ext.grid.column.Column ,
    alias: ['widget.actioncolumn'],
    alternateClassName: 'Ext.grid.ActionColumn',

    /**
     * @cfg {String} icon
     * The URL of an image to display as the clickable element in the column.
     *
     * Defaults to `{@link Ext#BLANK_IMAGE_URL}`.
     */
    /**
     * @cfg {String} iconCls
     * A CSS class to apply to the icon image. To determine the class dynamically, configure the Column with
     * a `{@link #getClass}` function.
     */
    /**
     * @cfg {Function} handler
     * A function called when the icon is clicked.
     * @cfg {Ext.view.Table} handler.view The owning TableView.
     * @cfg {Number} handler.rowIndex The row index clicked on.
     * @cfg {Number} handler.colIndex The column index clicked on.
     * @cfg {Object} handler.item The clicked item (or this Column if multiple {@link #cfg-items} were not configured).
     * @cfg {Event} handler.e The click event.
     * @cfg {Ext.data.Model} handler.record The Record underlying the clicked row.
     * @cfg {HTMLElement} handler.row The table row clicked upon.
     */
    /**
     * @cfg {Object} scope
     * The scope (`this` reference) in which the `{@link #handler}`, `{@link #getClass}`, `{@link #cfg-isDisabled}` and `{@link #getTip}` fuctions are executed.
     * Defaults to this Column.
     */
    /**
     * @cfg {String} tooltip
     * A tooltip message to be displayed on hover. {@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager} must
     * have been initialized.
     * 
     * The tooltip may also be determined on a row by row basis by configuring a {@link #getTip} method.
     */
    /**
     * @cfg {Boolean} disabled
     * If true, the action will not respond to click events, and will be displayed semi-opaque.
     * 
     * This Column may also be disabled on a row by row basis by configuring a {@link #cfg-isDisabled} method.
     */
    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid selection upon mousedown.
     */
    /**
     * @cfg {Function} getClass
     * A function which returns the CSS class to apply to the icon image.
     * @cfg {Object} getClass.v The value of the column's configured field (if any).
     * @cfg {Object} getClass.metadata An object in which you may set the following attributes:
     * @cfg {String} getClass.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} getClass.metadata.attr An HTML attribute definition string to apply to the data container
     * element *within* the table cell (e.g. 'style="color:red;"').
     * @cfg {Ext.data.Model} getClass.r The Record providing the data.
     * @cfg {Number} getClass.rowIndex The row index.
     * @cfg {Number} getClass.colIndex The column index.
     * @cfg {Ext.data.Store} getClass.store The Store which is providing the data Model.
     */
    /**
     * @cfg {Function} isDisabled A function which determines whether the action item for any row is disabled and returns `true` or `false`.
     * @cfg {Ext.view.Table} isDisabled.view The owning TableView.
     * @cfg {Number} isDisabled.rowIndex The row index.
     * @cfg {Number} isDisabled.colIndex The column index.
     * @cfg {Object} isDisabled.item The clicked item (or this Column if multiple {@link #cfg-items} were not configured).
     * @cfg {Ext.data.Model} isDisabled.record The Record underlying the row.
     */
    /**
     * @cfg {Function} getTip A function which returns the tooltip string for any row.
     * @cfg {Object} getTip.v The value of the column's configured field (if any).
     * @cfg {Object} getTip.metadata An object in which you may set the following attributes:
     * @cfg {String} getTip.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} getTip.metadata.attr An HTML attribute definition string to apply to the data
     * container element _within_ the table cell (e.g. 'style="color:red;"').
     * @cfg {Ext.data.Model} getTip.r The Record providing the data.
     * @cfg {Number} getTip.rowIndex The row index.
     * @cfg {Number} getTip.colIndex The column index.
     * @cfg {Ext.data.Store} getTip.store The Store which is providing the data Model.
     *
     */
    /**
     * @cfg {Object[]} items
     * An Array which may contain multiple icon definitions, each element of which may contain:
     *
     * @cfg {String} items.icon The url of an image to display as the clickable element in the column.
     *
     * @cfg {String} items.iconCls A CSS class to apply to the icon image. To determine the class dynamically,
     * configure the item with a `getClass` function.
     *
     * @cfg {Function} items.getClass A function which returns the CSS class to apply to the icon image.
     * @cfg {Object} items.getClass.v The value of the column's configured field (if any).
     * @cfg {Object} items.getClass.metadata An object in which you may set the following attributes:
     * @cfg {String} items.getClass.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} items.getClass.metadata.attr An HTML attribute definition string to apply to the data
     * container element _within_ the table cell (e.g. 'style="color:red;"').
     * @cfg {Ext.data.Model} items.getClass.r The Record providing the data.
     * @cfg {Number} items.getClass.rowIndex The row index.
     * @cfg {Number} items.getClass.colIndex The column index.
     * @cfg {Ext.data.Store} items.getClass.store The Store which is providing the data Model.
     *
     * @cfg {Function} items.handler A function called when the icon is clicked.
     * @cfg {Ext.view.Table} items.handler.view The owning TableView.
     * @cfg {Number} items.handler.rowIndex The row index clicked on.
     * @cfg {Number} items.handler.colIndex The column index clicked on.
     * @cfg {Object} items.handler.item The clicked item (or this Column if multiple {@link #cfg-items} were not configured).
     * @cfg {Event} items.handler.e The click event.
     * @cfg {Ext.data.Model} items.handler.record The Record underlying the clicked row.
     * @cfg {HTMLElement} items.row The table row clicked upon.
     *
     * @cfg {Function} items.isDisabled A function which determines whether the action item for any row is disabled and returns `true` or `false`.
     * @cfg {Ext.view.Table} items.isDisabled.view The owning TableView.
     * @cfg {Number} items.isDisabled.rowIndex The row index.
     * @cfg {Number} items.isDisabled.colIndex The column index.
     * @cfg {Object} items.isDisabled.item The clicked item (or this Column if multiple {@link #cfg-items} were not configured).
     * @cfg {Ext.data.Model} items.isDisabled.record The Record underlying the row.
     *
     * @cfg {Function} items.getTip A function which returns the tooltip string for any row.
     * @cfg {Object} items.getTip.v The value of the column's configured field (if any).
     * @cfg {Object} items.getTip.metadata An object in which you may set the following attributes:
     * @cfg {String} items.getTip.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} items.getTip.metadata.attr An HTML attribute definition string to apply to the data
     * container element _within_ the table cell (e.g. 'style="color:red;"').
     * @cfg {Ext.data.Model} items.getTip.r The Record providing the data.
     * @cfg {Number} items.getTip.rowIndex The row index.
     * @cfg {Number} items.getTip.colIndex The column index.
     * @cfg {Ext.data.Store} items.getTip.store The Store which is providing the data Model.
     *
     * @cfg {Object} items.scope The scope (`this` reference) in which the `handler`, `getClass`, `isDisabled` and `getTip` functions
     * are executed. Fallback defaults are this Column's configured scope, then this Column.
     *
     * @cfg {String} items.tooltip A tooltip message to be displayed on hover.
     * {@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager} must have been initialized.
     * 
     * The tooltip may also be determined on a row by row basis by configuring a `getTip` method.
     *
     * @cfg {Boolean} items.disabled If true, the action will not respond to click events, and will be displayed semi-opaque.
     * 
     * This item may also be disabled on a row by row basis by configuring an `isDisabled` method.
     */
    /**
     * @property {Array} items
     * An array of action items copied from the configured {@link #cfg-items items} configuration. Each will have
     * an `enable` and `disable` method added which will enable and disable the associated action, and
     * update the displayed icon accordingly.
     */

    actionIdRe: new RegExp(Ext.baseCSSPrefix + 'action-col-(\\d+)'),

    /**
     * @cfg {String} altText
     * The alt text to use for the image element.
     */
    altText: '',

    /**
     * @cfg {String} [menuText=<i>Actions</i>]
     * Text to display in this column's menu item if no {@link #text} was specified as a header.
     */
    menuText: '<i>Actions</i>',

    sortable: false,

    constructor: function(config) {
        var me = this,
            cfg = Ext.apply({}, config),
            // Items may be defined on the prototype
            items = cfg.items || me.items || [me],
            hasGetClass,
            i,
            len;


        me.origRenderer = cfg.renderer || me.renderer;
        me.origScope = cfg.scope || me.scope;
        
        me.renderer = me.scope = cfg.renderer = cfg.scope = null;
        
        // This is a Container. Delete the items config to be reinstated after construction.
        cfg.items = null;
        me.callParent([cfg]);

        // Items is an array property of ActionColumns
        me.items = items;
        
        for (i = 0, len = items.length; i < len; ++i) {
            if (items[i].getClass) {
                hasGetClass = true;
                break;
            }
        }
        
        // Also need to check for getClass, since it changes how the cell renders
        if (me.origRenderer || hasGetClass) {
            me.hasCustomRenderer = true;
        }
    },
    
    // Renderer closure iterates through items creating an <img> element for each and tagging with an identifying
    // class name x-action-col-{n}
    defaultRenderer: function(v, meta, record, rowIdx, colIdx, store, view){
        var me = this,
            prefix = Ext.baseCSSPrefix,
            scope = me.origScope || me,
            items = me.items,
            len = items.length,
            i = 0,
            item, ret, disabled, tooltip;
 
        // Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
        // Assign a new variable here, since if we modify "v" it will also modify the arguments collection, meaning
        // we will pass an incorrect value to getClass/getTip
        ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';

        meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
        for (; i < len; i++) {
            item = items[i];

            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || scope, view, rowIdx, colIdx, item, record) : false);
            tooltip = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(item.scope || scope, arguments) : null));

            // Only process the item action setup once.
            if (!item.hasActionConfiguration) {

                // Apply our documented default to all items
                item.stopSelection = me.stopSelection;
                item.disable = Ext.Function.bind(me.disableAction, me, [i], 0);
                item.enable = Ext.Function.bind(me.enableAction, me, [i], 0);
                item.hasActionConfiguration = true;
            }

            ret += '<img alt="' + (item.altText || me.altText) + '" src="' + (item.icon || Ext.BLANK_IMAGE_URL) +
                '" class="' + prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (disabled ? prefix + 'item-disabled' : ' ') +
                ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || scope, arguments) : (item.iconCls || me.iconCls || '')) + '"' +
                (tooltip ? ' data-qtip="' + tooltip + '"' : '') + ' />';
        }
        return ret;    
    },

    /**
     * Enables this ActionColumn's action at the specified index.
     * @param {Number/Ext.grid.column.Action} index
     * @param {Boolean} [silent=false]
     */
    enableAction: function(index, silent) {
        var me = this;

        if (!index) {
            index = 0;
        } else if (!Ext.isNumber(index)) {
            index = Ext.Array.indexOf(me.items, index);
        }
        me.items[index].disabled = false;
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).removeCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('enable', me);
        }
    },

    /**
     * Disables this ActionColumn's action at the specified index.
     * @param {Number/Ext.grid.column.Action} index
     * @param {Boolean} [silent=false]
     */
    disableAction: function(index, silent) {
        var me = this;

        if (!index) {
            index = 0;
        } else if (!Ext.isNumber(index)) {
            index = Ext.Array.indexOf(me.items, index);
        }
        me.items[index].disabled = true;
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).addCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('disable', me);
        }
    },

    destroy: function() {
        delete this.items;
        delete this.renderer;
        return this.callParent(arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     * Also fires any configured click handlers. By default, cancels the mousedown event to prevent selection.
     * Returns the event handler's status to allow canceling of GridView's bubbling process.
     */
    processEvent : function(type, view, cell, recordIndex, cellIndex, e, record, row){
        var me = this,
            target = e.getTarget(),
            match,
            item, fn,
            key = type == 'keydown' && e.getKey(),
            disabled;

        // If the target was not within a cell (ie it's a keydown event from the View), then
        // rely on the selection data injected by View.processUIEvent to grab the
        // first action icon from the selected cell.
        if (key && !Ext.fly(target).findParent(view.getCellSelector())) {
            target = Ext.fly(cell).down('.' + Ext.baseCSSPrefix + 'action-col-icon', true);
        }

        // NOTE: The statement below tests the truthiness of an assignment.
        if (target && (match = target.className.match(me.actionIdRe))) {
            item = me.items[parseInt(match[1], 10)];
            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || me.origScope || me, view, recordIndex, cellIndex, item, record) : false);
            if (item && !disabled) {
                if (type == 'click' || (key == e.ENTER || key == e.SPACE)) {
                    fn = item.handler || me.handler;
                    if (fn) {
                        fn.call(item.scope || me.origScope || me, view, recordIndex, cellIndex, item, e, record, row);
                    }
                } else if (type == 'mousedown' && item.stopSelection !== false) {
                    return false;
                }
            }
        }
        return me.callParent(arguments);
    },

    cascade: function(fn, scope) {
        fn.call(scope||this, this);
    },

    // Private override because this cannot function as a Container, and it has an items property which is an Array, NOT a MixedCollection.
    getRefItems: function() {
        return [];
    }
});

/*
This file is part of Ext JS 4.2

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-03-11 22:33:40 (aed16176e68b5e8aa1433452b12805c0ad913836)
*/
/**
 * A Column subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.
 *
 * Example usage:
 * 
 *    // create the grid
 *    var grid = Ext.create('Ext.grid.Panel', {
 *        ...
 *        columns: [{
 *           text: 'Foo',
 *           ...
 *        },{
 *           xtype: 'checkcolumn',
 *           text: 'Indoor?',
 *           dataIndex: 'indoor',
 *           width: 55
 *        }]
 *        ...
 *    });
 *
 */
Ext.define('Ext.grid.column.CheckColumn', {
    extend:  Ext.grid.column.Column ,
    alternateClassName: 'Ext.ux.CheckColumn',
    alias: 'widget.checkcolumn',

    /**
     * @cfg
     * @hide
     * Overridden from base class. Must center to line up with editor.
     */
    align: 'center',

    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid selection upon mousedown.
     */
    stopSelection: true,

    tdCls: Ext.baseCSSPrefix + 'grid-cell-checkcolumn',

    constructor: function() {
        this.addEvents(
            /**
             * @event beforecheckchange
             * Fires when before checked state of a row changes.
             * The change may be vetoed by returning `false` from a listener.
             * @param {Ext.ux.CheckColumn} this CheckColumn
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is to be checked
             */
            'beforecheckchange',
            /**
             * @event checkchange
             * Fires when the checked state of a row changes
             * @param {Ext.ux.CheckColumn} this CheckColumn
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is now checked
             */
            'checkchange'
        );
        this.scope = this;
        this.callParent(arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this,
            key = type === 'keydown' && e.getKey(),
            mousedown = type == 'mousedown';

        if (!me.disabled && (mousedown || (key == e.ENTER || key == e.SPACE))) {
            var dataIndex = me.dataIndex,
                checked = !record.get(dataIndex);

            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked) !== false) {
                record.set(dataIndex, checked);
                me.fireEvent('checkchange', me, recordIndex, checked);

                // Mousedown on the now nonexistent cell causes the view to blur, so stop it continuing.
                if (mousedown) {
                    e.stopEvent();
                }

                // Selection will not proceed after this because of the DOM update caused by the record modification
                // Invoke the SelectionModel unless configured not to do so
                if (!me.stopSelection) {
                    view.selModel.selectByPosition({
                        row: recordIndex,
                        column: cellIndex
                    });
                }

                // Prevent the view from propagating the event to the selection model - we have done that job.
                return false;
            } else {
                // Prevent the view from propagating the event to the selection model if configured to do so.
                return !me.stopSelection;
            }
        } else {
            return me.callParent(arguments);
        }
    },

    /**
     * Enables this CheckColumn.
     * @param {Boolean} [silent=false]
     */
    onEnable: function(silent) {
        var me = this;

        me.callParent(arguments);
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'grid-cell-' + me.id).removeCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('enable', me);
        }
    },

    /**
     * Disables this CheckColumn.
     * @param {Boolean} [silent=false]
     */
    onDisable: function(silent) {
        var me = this;

        me.callParent(arguments);
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'grid-cell-' + me.id).addCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('disable', me);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    renderer : function(value, meta) {
        var cssPrefix = Ext.baseCSSPrefix,
            cls = [cssPrefix + 'grid-checkcolumn'];

        if (this.disabled) {
            meta.tdCls += ' ' + this.disabledCls;
        }
        if (value) {
            cls.push(cssPrefix + 'grid-checkcolumn-checked');
        }
        return '<img class="' + cls.join(' ') + '" src="' + Ext.BLANK_IMAGE_URL + '"/>';
    }
});

/**
 * Description
 */
Ext.define('Ext.grid.infinite.TemplateRow', {
    extend:  Ext.Component ,
    xtype: 'listgridrow',

    config: {
        baseCls: Ext.baseCSSPrefix + 'listgrid-row',
        columns: null
    },

    constructor: function() {
        this.callParent(arguments);
    },

    updateColumns: function(columns) {
        var me = this,
            element = me.element,
            cells = me.cells,
            currentCellsLength = cells.length,
            renderedCellCount = columns.length,
            difference = renderedCellCount - currentCellsLength,
            i, cell;


        // This loop will create new items if the new itemsCount is higher than the amount of items we currently have
        for (i = 0; i < difference; i++) {
            cell = me.createCell(currentCellsLength + i);
            element.appendChild(cell);
            cells.push(cell);
        }

        // This loop will destroy unneeded items if the new itemsCount is lower than the amount of items we currently have
        for (i = difference; i < 0; i++) {
            element.removeChild(cells.pop());
        }

        for (i = 0; i < renderedCellCount; i++) {
            cells[i].style.width = (columns[i].getWidth()) + 'px';
        }
    }
});

/**
 * @class Ext.grid.plugin.ColumnResizing
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.ColumnResizing', {
    extend:  Ext.Component ,

    alias: 'plugin.gridcolumnresizing',

    config: {
        grid: null
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    updateGrid: function(grid, oldGrid) {
        if (oldGrid) {
            oldGrid.getHeaderContainer().renderElement.un({
                pinchstart: 'onContainerPinchStart',
                pinch: 'onContainerPinch',
                pinchend: 'onContainerPinchEnd',
                scope: this
            });
        }

        if (grid) {
            grid.getHeaderContainer().renderElement.on({
                pinchstart: 'onContainerPinchStart',
                pinch: 'onContainerPinch',
                pinchend: 'onContainerPinchEnd',
                scope: this
            });
        }
    },

    onContainerPinchStart: function(e) {
        var target = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-column'),
            column;

        if (target) {
            column = Ext.getCmp(target.id);
            if (column && column.getResizable()) {
                this.startColumnWidth = column.getWidth();
                this.resizeColumn = column;
                this.startDistance = e.distance;
                column.renderElement.addCls(Ext.baseCSSPrefix + 'grid-column-resizing');
            } else {
                e.preventDefault();
            }
        }
    },

    onContainerPinch: function(e) {
        var column = this.resizeColumn,
            resizeAmount = e.distance - this.startDistance;

        if (column) {
            this.currentColumnWidth = Math.ceil(this.startColumnWidth + resizeAmount);
            column.renderElement.setWidth(this.currentColumnWidth);
        }
    },

    onContainerPinchEnd: function() {
        var column = this.resizeColumn;
        if (column) {
            column.setWidth(this.currentColumnWidth + 1);
            column.renderElement.removeCls(Ext.baseCSSPrefix + 'grid-column-resizing');
            delete this.resizeColumn;
        }
    }
});

/**
 * @class Ext.grid.plugin.Editable
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.Editable', {
    extend:  Ext.Component ,
    alias: 'plugin.grideditable' ,

    config: {
        /**
         * @private
         */
        grid: null,

        /**
         * The event used to trigger the showing of the editor form.
         * @type {String}
         */
        triggerEvent: 'doubletap',

        /**
         * By changing the formConfig you can hardcode the form that gets created when editing a row.
         * Note that the fields are not set on this form, so you will have to define them yourself in this config.
         * If you want to alter certain form configurations, but still have the default editor fields applied, use
         * the defaultFormConfig instead.
         * @type Object
         */
        formConfig: null,

        defaultFormConfig: {
            xtype: 'formpanel',
            modal: true,
            scrollable: true,
            items: {
                xtype: 'fieldset'
            }
        },

        toolbarConfig: {
            xtype: 'titlebar',
            docked: 'top',
            items: [{
                xtype: 'button',
                ui: 'decline',
                text: 'Cancel',
                align: 'left',
                action: 'cancel'
            }, {
                xtype: 'button',
                ui: 'confirm',
                text: 'Submit',
                align: 'right',
                action: 'submit'
            }]
        },

        enableDeleteButton: true
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    updateGrid: function(grid, oldGrid) {
        var triggerEvent = this.getTriggerEvent();
        if (oldGrid) {
            oldGrid.renderElement.un(triggerEvent, 'onTrigger', this);
        }

        if (grid) {
            grid.renderElement.on(triggerEvent, 'onTrigger', this);
        }
    },

    onCancelTap: function() {
        this.sheet.hide();
    },

    onSubmitTap: function() {
        this.form.getRecord().set(this.form.getValues());
        this.sheet.hide();
    },

    onSheetHide: function() {
        this.sheet.destroy();
        this.form = null;
        this.sheet = null;
    },

    getRecordByTriggerEvent: function(e) {
        var rowEl = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row'),
            row;

        if (rowEl) {
            row = Ext.getCmp(rowEl.id);
            if (row) {
                return row.getRecord();
            }
        }

        return null;
    },

    getEditorFields: function(columns) {
        var fields = [],
            ln = columns.length,
            i, column, editor;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (column.getEditable()) {
                editor = Ext.apply({}, column.getEditor() || column.getDefaultEditor());
                editor.label = column.getText();
                fields.push(editor);
            }
        }

        return fields;
    },

    onTrigger: function(e) {
        var me = this,
            grid = me.getGrid(),
            formConfig = me.getFormConfig(),
            toolbarConfig = me.getToolbarConfig(),
            record = me.getRecordByTriggerEvent(e),
            fields, form, sheet, toolbar;

        if (record) {
            if (formConfig) {
                this.form = form = Ext.factory(formConfig, Ext.form.Panel);
            } else {
                this.form = form = Ext.factory(me.getDefaultFormConfig());

                fields = me.getEditorFields(grid.getColumns());
                form.down('fieldset').setItems(fields);
            }

            form.setRecord(record);

            toolbar = Ext.factory(toolbarConfig, Ext.form.TitleBar);
            toolbar.down('button[action=cancel]').on('tap', 'onCancelTap', this);
            toolbar.down('button[action=submit]').on('tap', 'onSubmitTap', this);

            this.sheet = sheet = grid.add({
                xtype: 'sheet',
                items: [toolbar, form],
                hideOnMaskTap: true,
                enter: 'right',
                exit: 'right',
                right: 0,
                width: 320,
                layout: 'fit',
                stretchY: true,
                hidden: true
            });

            if (me.getEnableDeleteButton()) {
                form.add({
                    xtype: 'button',
                    text: 'Delete',
                    ui: 'decline',
                    margin: 10,
                    handler: function() {
                        grid.getStore().remove(record);
                        sheet.hide();
                    }
                });
            }

            sheet.on('hide', 'onSheetHide', this);

            sheet.show();
        }
    }
});

/**
 * @class Ext.grid.plugin.MultiSelection
 * @extends Ext.components
 * Description
 */
Ext.define('Ext.grid.plugin.MultiSelection', {
    extend:  Ext.Component ,
    alias: 'plugin.gridmultiselection',

    config: {
        grid: null,

        selectionColumn: {
            width: 60,
            xtype: 'column',
            cls: Ext.baseCSSPrefix + 'grid-multiselection-column',
            cellCls: Ext.baseCSSPrefix + 'grid-multiselection-cell',
            ignore: true,
            hidden: true
        },

        useTriggerButton: true,

        triggerText: 'Select',
        cancelText: 'Cancel',
        deleteText: 'Delete'
    },

    init: function(grid) {
        this.setGrid(grid);

        var titleBar = grid.getTitleBar();
        if (this.getUseTriggerButton() && titleBar) {
            this.triggerButton = titleBar.add({
                align: 'right',
                xtype: 'button',
                text: this.getTriggerText()
            });

            this.triggerButton.on({
                tap: 'onTriggerButtonTap',
                scope: this
            });
        }

        grid.getHeaderContainer().on({
            columntap: 'onColumnTap',
            scope: this
        });
    },

    onTriggerButtonTap: function() {
        if (this.getSelectionColumn().isHidden()) {
            this.enterSelectionMode();
        }
        else {
            this.deleteSelectedRecords();
            this.getGrid().deselectAll();
        }
    },

    onColumnTap: function(container, column) {
        var grid = this.getGrid();
        if (column === this.getSelectionColumn()) {
            if (grid.getSelectionCount() === grid.getStore().getCount()) {
                grid.deselectAll();
            } else {
                grid.selectAll();
            }
        }
    },

    enterSelectionMode: function() {
        this.triggerButton.setText(this.getDeleteText());
        this.triggerButton.setUi('decline');

        this.cancelButton = this.getGrid().getTitleBar().add({
            align: 'right',
            xtype: 'button',
            ui: 'action',
            text: this.getCancelText(),
            scope: this
        });
        this.cancelButton.on({
            tap: 'exitSelectionMode',
            scope: this
        });
        this.getSelectionColumn().show();

        this.getGrid().setMode('MULTI');
    },

    exitSelectionMode: function() {
        this.cancelButton.destroy();
        this.triggerButton.setText(this.getTriggerText());
        this.triggerButton.setUi(null);
        this.getSelectionColumn().hide();
        this.getGrid().setMode('SINGLE');
        this.getGrid().deselectAll();
    },

    deleteSelectedRecords: function() {
        this.getGrid().getStore().remove(this.getGrid().getSelection());
    },

    applySelectionColumn: function(column) {
        if (column && !column.isComponent) {
            column = Ext.factory(column, Ext.grid.Column);
        }
        return column;
    },

    updateSelectionColumn: function(column, oldColumn) {
        var grid = this.getGrid();
        if (grid) {
            if (oldColumn) {
                grid.removeColumn(oldColumn);
            }

            if (column) {
                grid.insertColumn(0, column);
            }
        }
    },

    onGridSelectionChange: function() {
        var grid = this.getGrid(),
            column = this.getSelectionColumn();

        if (grid.getSelectionCount() === grid.getStore().getCount()) {
            column.addCls(Ext.baseCSSPrefix + 'grid-multiselection-allselected');
        } else {
            column.removeCls(Ext.baseCSSPrefix + 'grid-multiselection-allselected');
        }
    },

    updateGrid: function(grid, oldGrid) {
        var delegateCls = '.' + Ext.baseCSSPrefix + 'grid-multiselectioncell';

        if (oldGrid) {
            oldGrid.removeColumn(this.getSelectionColumn());
            oldGrid.container.renderElement.un({
                tap: 'onGridTap',
                delegate: delegateCls,
                scope: this
            });
            oldGrid.un({
                selectionchange: 'onGridSelectionChange',
                scope: this
            });
        }

        if (grid) {
            grid.insertColumn(0, this.getSelectionColumn());
            grid.container.renderElement.on({
                tap: 'onGridTap',
                delegate: delegateCls,
                scope: this
            });
            grid.on({
                selectionchange: 'onGridSelectionChange',
                scope: this
            });
        }
    }
});

/**
 * @class Ext.grid.plugin.PagingToolbar
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.PagingToolbar', {
    extend:  Ext.Component ,
    alias: 'plugin.gridpagingtoolbar',
    mixins: [ Ext.mixin.Bindable ],

               
                     
      

    config: {
        grid: null,

        currentPage: 1,
        totalPages: 0,
        pageSize: 0,
        totalCount: 0,

        toolbar: {
            xtype: 'toolbar',
            docked: 'bottom',
            ui: 'gray',
            cls: Ext.baseCSSPrefix + 'grid-pagingtoolbar',
            items: [{
                xtype: 'button',
                ui: 'plain',
                iconCls: 'arrow_left',
                action: 'previouspage',
                left: 0,
                top: 5
            }, {
                xtype: 'component',
                role: 'currentpage',
                width: 20,
                cls: Ext.baseCSSPrefix + 'grid-pagingtoolbar-currentpage'
            }, {
                xtype: 'component',
                role: 'totalpages',
                width: 50,
                tpl: '&nbsp;/ {totalPages}'
            }, {
                xtype: 'sliderfield',
                value: 1,
                flex: 1,
                minValue: 1,
                role: 'pageslider'
            }, {
                xtype: 'button',
                ui: 'plain',
                iconCls: 'arrow_right',
                action: 'nextpage',
                right: 0,
                top: 5
            }]
        }
    },

    init: function(grid) {
        this.setGrid(grid);
        grid.container.add(this.getToolbar());
        if (grid.getStore().getCount()) {
            this.updateCurrentPage(this.getCurrentPage());
        }
    },

    updateGrid: function(grid, oldGrid) {
        if (oldGrid) {
            oldGrid.un({
                updatevisiblecount: 'onUpdateVisibleCount',
                scope: this
            });

            oldGrid.getStore().un({
                addrecords: 'onTotalCountChange',
                removerecords: 'onTotalCountChange',
                refresh: 'onTotalCountChange',
                scope: this
            });
        }

        if (grid) {
            grid.on({
                updatevisiblecount: 'onUpdateVisibleCount',
                scope: this
            });

            grid.getStore().on({
                addrecords: 'onTotalCountChange',
                removerecords: 'onTotalCountChange',
                refresh: 'onTotalCountChange',
                scope: this
            });

            this.bind(grid, 'onScrollBinder', 'checkPageChange');
        }
    },

    checkPageChange: function() {
        var grid = this.getGrid(),
            pageSize = this.getPageSize(),
            currentPage = this.getCurrentPage(),
            totalCount = this.getTotalCount(),
            topVisibleIndex = grid.topVisibleIndex,
            newPage = Math.floor(grid.topVisibleIndex / pageSize) + 1;

        if (topVisibleIndex + pageSize >= totalCount) {
            newPage++;
        }

        if (topVisibleIndex && newPage !== currentPage) {
            this.preventGridScroll = true;
            this.setCurrentPage(newPage);
            this.preventGridScroll = false;
        }
    },

    applyToolbar: function(toolbar) {
        if (toolbar && !toolbar.isComponent) {
            toolbar = Ext.factory(toolbar, Ext.Toolbar);
        }

        return toolbar;
    },

    updateToolbar: function(toolbar) {
        if (toolbar) {
            this.currentPage = toolbar.down('component[role=currentpage]');
            this.totalPages = toolbar.down('component[role=totalpages]');
            this.pageSlider = toolbar.down('sliderfield[role=pageslider]');

            this.nextPageButton = toolbar.down('button[action=nextpage]');
            this.previousPageButton = toolbar.down('button[action=previouspage]');

            this.pageSlider.on({
                change: 'onPageChange',
                drag: 'onPageSliderDrag',
                scope: this
            });

            this.nextPageButton.on({
                tap: 'onNextPageTap',
                scope: this
            });

            this.previousPageButton.on({
                tap: 'onPreviousPageTap',
                scope: this
            });

            this.currentPage.element.createChild({
                tag: 'span'
            });
        }
    },

    onPageChange: function(field, slider, thumb, page) {
        if (page !== this.getCurrentPage()) {
            this.setCurrentPage(page);
        }
    },

    onPageSliderDrag: function(field, slider, thumb, page) {
        if (page[0] !== this.getCurrentPage()) {
            this.setCurrentPage(page[0]);
        }
    },

    onNextPageTap: function() {
        var nextPage = this.getCurrentPage() + 1;
        if (nextPage <= this.getTotalPages()) {
            this.setCurrentPage(nextPage);
        }
    },

    onPreviousPageTap: function() {
        var previousPage = this.getCurrentPage() - 1;
        if (previousPage > 0) {
            this.setCurrentPage(previousPage);
        }
    },

    onTotalCountChange: function(store) {
        this.setTotalCount(store.getCount());
    },

    onUpdateVisibleCount: function(grid, visibleCount) {
        visibleCount -= 1;

        var store = grid.getStore(),
            totalCount = store.getCount(),
            totalPages = Math.ceil(totalCount / visibleCount);

        this.setTotalPages(totalPages);
        this.setPageSize(visibleCount);
    },

    updateTotalPages: function(totalPages) {
        // Ensure the references are set
        this.getToolbar();

        this.totalPages.setData({
            totalPages: totalPages
        });

        this.pageSlider.setMaxValue(totalPages || 1);

        this.updateCurrentPage(this.getCurrentPage());
    },

    updateCurrentPage: function(currentPage) {
        var grid = this.getGrid(),
            pageTopRecord;

        // Ensure the references are set
        this.getToolbar();

        this.currentPage.element.dom.firstChild.innerHTML = currentPage;

        if (this.pageSlider.getValue() !== currentPage) {
            this.pageSlider.setValue(currentPage);
        }

        pageTopRecord = this.getPageTopRecord(currentPage);
        if (grid && !this.preventGridScroll && pageTopRecord) {
            grid.scrollToRecord(pageTopRecord);
        }

        this.updatePageButtons();
    },

    updateTotalCount: function(totalCount) {
        var totalPages;

        if (totalCount !== null && totalCount !== undefined) {
            if (totalCount === 0) {
                totalPages = 1;
            } else {
                totalPages = Math.ceil(totalCount / this.getPageSize());
            }
            this.setTotalPages(totalPages);
        }
    },

    updatePageButtons: function() {
        var currentPage = this.getCurrentPage();

        this.previousPageButton.enable();
        this.nextPageButton.enable();

        if (currentPage == this.getTotalPages()) {
            this.nextPageButton.disable();
        }
        if (currentPage == 1) {
            this.previousPageButton.disable();
        }
    },

    getPageTopRecord: function(page) {
        var grid = this.getGrid(),
            store = grid && grid.getStore(),
            pageSize = this.getPageSize(),
            pageTopRecordIndex = (page - 1) * pageSize,
            pageTopRecord = store && store.getAt(pageTopRecordIndex);

        return pageTopRecord;
    }
});

/**
 * @class Ext.grid.plugin.SummaryRow
 * @extends Ext.grid.Row
 * Description
 */
Ext.define('Ext.grid.plugin.SummaryRow', {
    extend:  Ext.grid.Row ,
    alias: 'plugin.gridsummaryrow',

    mixins: [
         Ext.mixin.Bindable 
    ],

    config: {
        grid: null,
        cls: Ext.baseCSSPrefix + 'grid-summaryrow',
        emptyText: '',
        emptyCls: Ext.baseCSSPrefix + 'grid-summaryrow-empty',
        docked: 'top',
        height: 32,
        translatable: {
            translationMethod: 'csstransform'
        }
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    updateGrid: function(grid) {
        if (grid) {
            var columns = grid.getColumns(),
                ln = columns.length,
                headerContainer = grid.getHeaderContainer(),
                i;

            grid.getStore().onAfter({
                addrecords: 'doUpdateSummary',
                removerecords: 'doUpdateSummary',
                updaterecord: 'doUpdateSummary',
                refresh: 'doUpdateSummary',
                scope: this
            });

            grid.getHeaderContainer().on({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnresize: 'onColumnResize',
                scope: this
            });

            if (grid.initialized) {
                grid.container.insertAfter(this, grid.getHeaderContainer());
            }
            else {
                grid.on('initialize', function() {
                    grid.container.insertAfter(this, grid.getHeaderContainer());
                }, this, {single: true});
            }

            grid.addCls(Ext.baseCSSPrefix + 'grid-hassummaryrow');

            for (i = 0; i < ln; i++) {
                this.onColumnAdd(headerContainer, columns[i]);
            }

            this.bind(grid, 'onScrollBinder', 'onGridScroll');
        }
    },

    onGridScroll: function(x) {
        if (this.currentX !== x) {
            this.translate(x);
            this.currentX = x;
        }
    },

    onColumnAdd: function(container, column) {
        this.insertColumn(container.getColumns().indexOf(column), column);
        this.updateRowWidth();
    },

    onColumnRemove: function(container, column) {
        this.removeColumn(column);
        this.updateRowWidth();
    },

    onColumnShow: function(container, column) {
        this.showColumn(column);
        this.updateRowWidth();
    },

    onColumnHide: function(container, column) {
        this.hideColumn(column);
        this.updateRowWidth();
    },

    onColumnResize: function(container, column, width) {
        this.setColumnWidth(column, width);
        this.updateRowWidth();
    },

    updateRowWidth: function() {
        this.setWidth(this.getGrid().getTotalColumnWidth());
    },

    doUpdateSummary: function() {
        var grid = this.getGrid(),
            store = grid.getStore(),
            columns = grid.getColumns(),
            ln = columns.length,
            emptyText = this.getEmptyText(),
            emptyCls = this.getEmptyCls(),
            i, column, type, renderer, cell, value, field, cellEl;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            type = column.getSummaryType();
            cell = this.getCellByColumn(column);
            cellEl = Ext.get(cell);

            if (!column.getIgnore() && type !== null) {
                field = column.getDataIndex();
                renderer = column.getSummaryRenderer();

                if (Ext.isFunction(type)) {
                    value = type.call(store, store.data.items.slice(), field);
                }
                else {
                    switch (type) {
                        case 'sum':
                        case 'average':
                        case 'min':
                        case 'max':
                                value = store[type](column.getDataIndex());
                            break;

                        case 'count':
                                value = store.getCount();
                            break;
                    }
                }

                if (renderer !== null) {
                    value = renderer.call(store, value);
                }

                cellEl.removeCls(emptyCls);
                column.updateCell(cell, null, value);
            }
            else {
                cellEl.addCls(emptyCls);
                column.updateCell(cell, null, emptyText);
            }
        }
    }
});

/**
 * @class Ext.grid.plugin.ViewOptions
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.ViewOptions', {
    extend:  Ext.Component ,
    alias: 'plugin.gridviewoptions' ,

               
                           
                                  
                                 
      

    config: {
        /**
         * @private
         */
        grid: null,

        sheetWidth: 320,

        sheet: {
            baseCls: Ext.baseCSSPrefix + 'grid-viewoptions',
            xtype: 'sheet',
            items: [{
                docked: 'top',
                xtype: 'titlebar',
                title: 'Customize',
                items: {
                    xtype: 'button',
                    text: 'Done',
                    ui: 'action',
                    align: 'right',
                    role: 'donebutton'
                }
            }],
            hideOnMaskTap: false,
            enter: 'right',
            exit: 'right',
            modal: false,
            translatable: {
                translationMethod: 'csstransform'
            },
            right: 0,
            layout: 'fit',
            stretchY: true
        },

        columnList: {
            xtype: 'nestedlist',
            title: 'Column',
            listConfig: {
                plugins: [{
                    type: 'sortablelist',
                    handleSelector: '.x-column-options-sortablehandle'
                }],
                mode: 'MULTI',
                infinite: true,
                itemTpl: [
                    '<div class="x-column-options-sortablehandle"></div>',
                    '<tpl if="header">',
                        '<div class="x-column-options-folder"></div>',
                    '<tpl else>',
                        '<div class="x-column-options-leaf"></div>',
                    '</tpl>',
                    '<div class="x-column-options-text">{text}</div>',
                    '<div class="x-column-options-visibleindicator"></div>'
                ],
                triggerEvent: null,
                bufferSize: 1,
                minimumBufferSize: 1
            },
            store: {
                type: 'tree',
                fields: ['id', 'text', 'header'],
                root: {
                    text: 'Columns'
                }
            },
            clearSelectionOnListChange: false
        },

        visibleIndicatorSelector: '.x-column-options-visibleindicator'
    },

    sheetVisible: false,

    init: function(grid) {
        this.setGrid(grid);
        grid.add(this.getSheet());
        this.getSheet().translate(this.getSheetWidth());

        this.getSheet().down('button[role=donebutton]').on({
            tap: 'onDoneButtonTap',
            scope: this
        });
    },

    updateGrid: function(grid, oldGrid) {
        if (oldGrid) {
            oldGrid.getHeaderContainer().renderElement.un({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                scope: this
            });
            oldGrid.getHeaderContainer().un({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: this
            });
        }

        if (grid) {
            grid.getHeaderContainer().renderElement.on({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                scope: this
            });
            grid.getHeaderContainer().on({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                columnhide: 'onColumnHide',
                columnshow: 'onColumnShow',
                scope: this
            });
        }
    },

    applySheet: function(sheet) {
        if (sheet && !sheet.isComponent) {
            sheet = Ext.factory(sheet, Ext.Sheet);
        }

        return sheet;
    },

    applyColumnList: function(list) {
        if (list && !list.isComponent) {
            list = Ext.factory(list, Ext.Container);
        }
        return list;
    },

    updateColumnList: function(list) {
        if (list) {
            list.on({
                listchange: 'onListChange',
                scope: this
            });

            list.on({
                selectionchange: 'onColumnToggle',
                dragsort: 'onColumnReorder',
                delegate: '> list',
                scope: this
            });

            this.attachTapListeners();
        }
    },

    updateSheet: function(sheet) {
        var sheetWidth = this.getSheetWidth();
        sheet.setWidth(sheetWidth);
        sheet.translate(sheetWidth);

        sheet.add(this.getColumnList());
    },

    onDoneButtonTap: function() {
        this.hideViewOptions();
    },

    onColumnReorder: function(list, row, newIndex) {
        var column = Ext.getCmp(row.getRecord().get('id')),
            parent = column.getParent(),
            siblings = parent.getInnerItems(),
            i, ln, sibling;

        for (i = 0, ln = newIndex; i < ln; i++) {
            sibling = siblings[i];
            if (!sibling.isHeaderGroup && sibling.getIgnore()) {
                newIndex += 1;
            }
        }

        this.isMoving = true;
        parent.remove(column, false);
        parent.insert(newIndex, column);
        this.isMoving = false;
    },

    attachTapListeners: function() {
        var activeList = this.getColumnList().getActiveItem();
        if (!activeList.hasAttachedTapListeners) {
            activeList.onBefore({
                itemtap: 'onListItemTap',
                scope: this
            });
            activeList.hasAttachedTapListeners = true;
        }
    },

    onListChange: function(nestedList, list) {
        var store = list.getStore(),
            activeNode = store.getNode(),
            records = activeNode.childNodes,
            ln = records.length,
            i, column, record;

        for (i = 0; i < ln; i++) {
            record = records[i];
            column = Ext.getCmp(record.getId());

            if (column.isHidden() && list.isSelected(record)) {
                list.deselect(record, true, true);
            }
            else if (!column.isHidden() && !list.isSelected(record)) {
                list.select(record, true, true);
            }
        }

        this.attachTapListeners();
    },

    onListItemTap: function(list, index, row, record, e) {
        if (Ext.DomQuery.is(e.target, this.getVisibleIndicatorSelector())) {
            this.onVisibleIndicatorTap(row, record, index);
            return false;
        }
    },

    onVisibleIndicatorTap: function(row, record) {
        var activeList = this.getColumnList().getActiveItem();
        if (activeList.isSelected(record)) {
            activeList.deselect(record);
        } else {
            activeList.select(record, true);
        }
    },

    onColumnToggle: function(list, change) {
        var toggleRecord = change[0],
            column = Ext.getCmp(toggleRecord.get('id'));

        if (list.isSelected(toggleRecord)) {
            column.show();
        } else {
            column.hide();
        }
    },

    onColumnHide: function(headerContainer, column) {
        var nestedList = this.getColumnList(),
            activeList = nestedList.getActiveItem(),
            store = activeList.getStore(),
            record = store.getById(column.getId());

        if (record && activeList.isSelected(record)) {
            activeList.deselect(record, true, true);
        }
    },

    onColumnShow: function(headerContainer, column) {
        var nestedList = this.getColumnList(),
            activeList = nestedList.getActiveItem(),
            store = activeList.getStore(),
            record = store.getById(column.getId());

        if (record && !activeList.isSelected(record)) {
            activeList.select(record, true, true);
        }
    },

    onColumnAdd: function(headerContainer, column, header) {
        if (column.getIgnore() || this.isMoving) {
            return;
        }

        var nestedList = this.getColumnList(),
            activeList = nestedList.getActiveItem(),
            store = nestedList.getStore(),
            parentNode = store.getRoot(),
            data = {
                id: column.getId(),
                text: column.getText(),
                leaf: true
            },
            record;

        if (header) {
            if (header.innerIndexOf(column) === 0) {
                parentNode = parentNode.appendChild({
                    header: true,
                    id: header.getId(),
                    text: header.getText()
                });

                if (!header.isHidden()) {
                    activeList.select(parentNode, true, true);
                }
            } else {
                parentNode = parentNode.findChild('id', header.getId());
            }

            parentNode.appendChild(data);
        } else {
            record = parentNode.appendChild(data);

            if (!column.isHidden()) {
                activeList.select(record, true, true);
            }
        }
    },

    onColumnRemove: function(headerContainer, column) {
        if (column.getIgnore() || this.isMoving) {
            return;
        }

        var root = this.getColumnList().getStore().getRoot(),
            record = root.findChild('id', column.getId(), true);

        if (record) {
            record.parentNode.removeChild(record, true);
        }
    },

    onDragStart: function() {
        var sheetWidth = this.getSheetWidth(),
            sheet = this.getSheet();

        if (!this.sheetVisible) {
            sheet.translate(sheetWidth);
            this.startTranslate = sheetWidth;
        } else {
            sheet.translate(0);
            this.startTranslate = 0;
        }
    },

    onDrag: function(e) {
        this.getSheet().translate(Math.max(this.startTranslate + e.deltaX, 0));
    },

    onDragEnd: function(e) {
        var me = this;
        if (e.flick.velocity.x > 0.1) {
            me.hideViewOptions();
        } else {
            me.showViewOptions();
        }
    },

    hideViewOptions: function() {
        var sheet = this.getSheet();

        sheet.translate(this.getSheetWidth(), 0, {duration: 100});
        sheet.getTranslatable().on('animationend', function() {
            if (sheet.getModal()) {
                sheet.getModal().destroy();
                sheet.setModal(null);
            }
        }, this, {single: true});

        this.sheetVisible = false;
    },

    showViewOptions: function() {
        if (!this.sheetVisible) {
            var sheet = this.getSheet(),
                modal = null;

            sheet.translate(0, 0, {duration: 100});
            sheet.getTranslatable().on('animationend', function() {
                sheet.setModal(true);

                modal = sheet.getModal();
                modal.element.onBefore({
                    tap: 'hideViewOptions',
                    dragstart: 'onDragStart',
                    drag: 'onDrag',
                    dragend: 'onDragEnd',
                    scope: this
                });
            }, this, {single: true});

            this.sheetVisible = true;
        }
    }
});

