Ext.onReady(function() {

    Ext.create('Ext.Panel', {
        layout: 'auto',
        renderTo: Ext.getBody(),
        height: 400,
        width: 400,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box',
                html: 'layout: auto '
            },
            {
                cls: 'box',
                html: 'layout: auto, width: 200 ',
                width: 200
            },
            {
                cls: 'box',
                html: 'layout: auto, width: 250, height: 150, margin: 5 ',
                width: 250,
                height: 150,
                margin: 5
            }
        ]
    });
});