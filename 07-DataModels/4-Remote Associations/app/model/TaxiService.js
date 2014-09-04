Ext.define('AssociationsTest.model.TaxiService', {
    extend: 'Ext.data.Model',

    requires: ['Ext.data.association.HasMany'],

    config: {
        fields: ['id', 'name'],
        hasMany  : { //<1>
        	model: 'AssociationsTest.model.Car', //<2>
        	name: 'cars', //<3>
        	foreignKey: 'taxiservice_id' //<4>
        }
    }
});