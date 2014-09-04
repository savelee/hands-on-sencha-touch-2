Ext.application({
    name: 'SyncDemo',
    launch: function() {

        Ext.define('MyModel', {
            extend: 'Ext.data.Model',
            fields: ['name']
        })

        var store = Ext.create('Ext.data.Store', {
            model: 'MyModel'
        })

        var record = Ext.create('MyModel', {
            name: 'TaxiAmsterdam'
        });

        store.add(record);
        store.sync({
            callback: function(batch, options){
                console.log(batch);
            },
            success: function(batch, options){
                console.log("succes", batch, options);
            },
            failure: function(batch){
                console.log("error", batch, options);
            }
        });

    }
});