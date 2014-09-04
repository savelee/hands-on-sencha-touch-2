Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',
    
    config: {
        models: ['Cab'],
        stores: ['Cabs']
    },

    init: function(){

        Ext.Viewport.mask({ 
            xtype: 'loadmask',
            message: 'loading...' 
        });
        Ext.getStore('Cabs').load();
        Ext.getStore('Cabs').addListener('load',
            this.onCabsStoreLoad,
        this);
    },
    onCabsStoreLoad: function(records, success, operation){
        console.log(records.getData());
        Ext.Viewport.unmask();      
    }
});

