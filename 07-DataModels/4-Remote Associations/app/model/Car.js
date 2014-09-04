Ext.define('AssociationsTest.model.Car', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.association.BelongsTo'],
    config: {
        fields: [{
            name: 'id', //<1>
            type: 'int'
        }, {
            name: 'brand'
        }, {
            name: 'taxiservice_id',
            type: 'int' //<2>
        }],
        belongsTo: {
            model: 'AssociationsTest.model.TaxiService'
        },
        proxy: {
            type: 'ajax',
            reader: {
                rootProperty: 'cars'
            },
            url: 'app/data.php'
        }
    }
});
