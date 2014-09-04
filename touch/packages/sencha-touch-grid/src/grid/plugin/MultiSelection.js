/**
 * @class Ext.grid.plugin.MultiSelection
 * @extends Ext.components
 * Description
 */
Ext.define('Ext.grid.plugin.MultiSelection', {
    extend: 'Ext.Component',
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