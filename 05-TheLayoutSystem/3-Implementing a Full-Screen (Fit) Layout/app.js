Ext.onReady(function() {

    Ext.create('Ext.Panel', {
        layout: 'fit',
        renderTo: Ext.getBody(),
        height: 400,
        width: 400,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box',
                html: 'layout: fit '
            }
        ]
    });

    Ext.create('Ext.Panel', {
        layout: 'fit',
        renderTo: Ext.getBody(),
        height: 400,
        width: 400,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box',
                margin: 25,
                html: 'layout: fit '
            }
        ]
    });

});