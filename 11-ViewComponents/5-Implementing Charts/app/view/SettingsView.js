Ext.define('FindACab.view.SettingsView', {
    extend: 'Ext.Panel',
    xtype: 'settingsview',
    requires: [
        'Ext.TitleBar'
    ],
    config: {
        items: [{
    		xtype: 'titlebar',
    		ui: 'light',
    		docked: 'top',
    		title: 'Settings',
    		items: [{
            	iconCls: 'delete',
                itemId: 'close',
            	ui: 'decline',
            	align: 'right'
    		}]
        },
        {
            padding: '20',
            html: 'Forms here'
    	}],

        //TODO controller
        //TODO add to app.js array
        //TODO itemId in DetailView button
    }
});