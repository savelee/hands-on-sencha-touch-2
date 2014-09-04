Ext.define('FindACab.view.Main', {
    extend: 'Ext.Container',
    requires: [
    	'FindACab.view.Overview',
    	'FindACab.view.DetailView'
    ],
    config: {
        layout: 'hbox',
        items: [{
        	xtype: 'overview',
        	flex: 1,
        	store: 'Cabs'
        }, {
        	xtype: 'detailview',
        	flex: 3
        }]
    }
});