Ext.onReady(function() {

    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        height: 220,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box2',
                html: 'docked: top',
                docked: 'top'
            },{
                cls: 'box',
                html: ''
            }
        ]
    });
    
    Ext.create('Ext.Panel', {
        layout: 'fit',
        renderTo: Ext.getBody(),
        height: 220,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box2',
                html: 'docked: left',
                docked: 'left'
            },{
                cls: 'box',
                html: ''
            }
        ]
    });

    Ext.create('Ext.Panel', {
        layout: 'fit',
        renderTo: Ext.getBody(),
        height: 220,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box2',
                html: 'docked: right',
                docked: 'right'
            },{
                cls: 'box',
                html: ''
            }
        ]
    });
    
    Ext.create('Ext.Panel', {
        layout: 'fit',
        renderTo: Ext.getBody(),
        height: 220,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box2',
                html: 'docked: bottom',
                docked: 'bottom'
            },{
                cls: 'box',
                html: ''
            }
        ]
    });
});