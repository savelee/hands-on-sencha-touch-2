Ext.define('FindACab.view.Overview', {
    extend: 'Ext.List', //extend from a list
    xtype: 'overview',
    requires: [
        'Ext.Toolbar',
    ],
    config: {
        items: [{
            xtype: 'titlebar',
            docked: 'top'
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
        }],

        //list specific
        emptyText: 'No data',
        grouped: true,
        itemTpl: '<span class="distance">{[values.distance.toFixed(2)]}</span> {name:ellipsis(16, true)} ',
        onItemDisclosure: true
    }
});