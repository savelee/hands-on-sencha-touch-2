Ext.define('FindACab.view.Overview', {
    extend: 'Ext.List', 
    xtype: 'overview',
    requires: [
        'Ext.TitleBar',
    ],
    config: {
        emptyText: 'No data',
        grouped: true,
        onItemDisclosure: true,

        itemTpl: '<span class="distance">' +
            '{[values.distance.toFixed(2)]}' +
                '</span> {name:ellipsis(16, true)} ',
        

    	items: [{ 
            xtype: 'titlebar',
            docked: 'top',
            title: 'Overview'
    	},{
            xtype: 'toolbar',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            docked: 'bottom',
            ui: 'light',

            items: [{
                handler: function(){
                    this.fireEvent('filtername');
                },
                ui: 'small',
                text: 'name'
            },{
                handler: function(){
                    this.fireEvent('filterdistance');
                },
                ui: 'small',
                text: 'distance'
            }],
        }]
    }
});