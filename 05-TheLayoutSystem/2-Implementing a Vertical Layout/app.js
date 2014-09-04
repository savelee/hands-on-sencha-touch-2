Ext.onReady(function() {
 
    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'start',
            pack: 'start'
        },
        height: 300,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            }
        ]
    });
    
    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'center',
            pack: 'center'
        },
        height: 300,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            }
        ]
    });

    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'center',
            pack: 'end'
        },
        height: 300,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            }
        ]
    });

    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'end',
            pack: 'start'
        },
        height: 300,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            }
        ]
    });

    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'center'
        },
        height: 300,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10
            }
        ]
    });    

    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'start',
            pack: 'start'
        },
        height: 500,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                flex: 1,
                html: 'flex: 1',
                margin: 10
            },
            {
                cls: 'box',
                flex: 3,
                html: 'flex: 3',
                margin: 10
            }
        ]
    }); 

    Ext.create('Ext.Panel', {
        renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
            align: 'start',
            pack: 'start'
        },
        height: 500,
        cls: 'background',
        margin: 10,
        items: [
            {
              docked: 'top',
              cls: 'title'
            },
            {
                cls: 'box',
                flex: 1,
                html: 'flex: 1',
                margin: 10
            },
            {
                cls: 'box',
                flex: 3,
                html: 'flex: 3',
                margin: 10
            },
            {
                cls: 'box',
                height: 50,
                html: 'height: 50',
                margin: 10              
            }
        ]
    }); 

});