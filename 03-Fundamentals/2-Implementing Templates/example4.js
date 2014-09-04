Ext.application({
    requires: ['Ext.dataview.DataView', 'Ext.data.Store', 'Ext.Component'],
    launch: function() {

        //create a data store with id: CabStore.
        Ext.create('Ext.data.Store', { 
            id:'CabStore', 
            fields: ['name', 'description'],
            data : [
                { name: "Taxi Amsterdam", description: "The best taxi service" + 
                    "of Amsterdam."},
                {   name: "Cab & Co", description: "Always fast."}
            ]
        });    

        var myTpl = Ext.create('Ext.XTemplate', '<tpl for=".">',
                '<div class="row">',
                    '<h1>{name}</h1><p>{description}</p>',
                '</div>',
            '</tpl>'
        );

        Ext.create('Ext.DataView', {
            itemTpl: '<h1>{name}</h1><p>{description}</p>',
            store: 'CabStore',
            styleHtmlContent: true,
            cls: 'box',
            fullscreen: true,
            height: 250
        }); 

    }
});