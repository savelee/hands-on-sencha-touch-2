Ext.onReady(function() {
    
    Ext.create('Ext.Component', {
        html: 'Hello World!',
        style : { background: 'red' },
        cls: 'box',
        width: 300,
        height: 100,
        renderTo: Ext.getBody()
    });

});