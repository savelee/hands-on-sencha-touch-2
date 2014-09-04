/**
 * Description
 */
Ext.define('Ext.grid.infinite.Row', {
    extend: 'Ext.Component',
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