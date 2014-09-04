var stack = null;
Ext.onReady(function() {

    stack = Ext.create('Ext.Panel', {
        layout: 'card',
        renderTo: Ext.getBody(),
        height: 400,
        width: 400,
        margin: 10,
        cls: 'background',
        items: [
            {
                cls: 'box',
                html: 'stacked card 1: .setActiveItem(0)'
            },
            {
                cls: 'box2',
                html: 'stacked card 2: .setActiveItem(1)'
            },
            {
                cls: 'box',
                html: 'stacked card 3: .setActiveItem(2)'
            },
            {
                cls: 'box2',
                html: 'stacked card 4: .setActiveItem(3)'
            }
        ]
    });
    stack.setActiveItem(2);

    console.log('use stack.setActiveItem() in your console to switch cards.');
});