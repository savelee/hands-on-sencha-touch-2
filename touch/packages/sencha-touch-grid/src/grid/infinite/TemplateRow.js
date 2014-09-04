/**
 * Description
 */
Ext.define('Ext.grid.infinite.TemplateRow', {
    extend: 'Ext.Component',
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