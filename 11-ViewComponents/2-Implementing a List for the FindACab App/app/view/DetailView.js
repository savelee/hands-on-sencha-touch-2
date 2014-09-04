Ext.define('FindACab.view.DetailView', {
    extend: 'Ext.Container',
    xtype: 'detailview',
    requires: [
        'Ext.TitleBar',
        'Ext.Button'
    ],
    config: {
    	items: [{
    		xtype: 'titlebar',
    		ui: 'light',
    		docked: 'top',
    		title: 'FindACab',
    		items: [{
            	iconCls: 'settings',
            	ui: 'plain',
            	align: 'right'
    		}]
    	}],
        html: 'detail view'
    }
});