Ext.define('FindACab.view.Main', {
    extend: 'Ext.Container',
    xtype: 'mainview',
    config: {
    	items:[{
    		html: 'Here comes the view.'
    	}, {
    		docked: 'bottom',
    		xtype: 'button',
    		action: 'press',
    		text: 'Demo'
    	}]
    }
});