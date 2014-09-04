Ext.define('FindACab.model.Setting', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.identifier.Uuid'],
    config: {
        idProperty: 'id',
        identifier: 'uuid',
        fields: [
            { name: 'id', type: 'auto' },
            { name: 'gps', type: 'boolean' },
            { name: 'city', type: 'string' },
            { name: 'country', type: 'string' }
        ],
        validations: [{
            type: 'presence',
            field: 'city',
            message: "Please provide a city."
        },
        {
            type: 'presence',
            field: 'country',
            message: "Please provide a country."
        }],
        proxy: {
            type: 'sessionstorage',
            id: "Setting"
        }
    }
});