Ext.define('FindACab.model.Cab', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            { name: 'id', type: 'auto' },
            { name: 'name', type: 'string' },
            { name: 'latitude', type: 'float' },
            { name: 'longitude', type: 'float' },
            { name: 'address1', type: 'string' },
            { name: 'phone', type: 'string' },
            { name: 'state_code', type: 'string' },
            { name: 'zip', type: 'string' },
            { name: 'city', type: 'string' },
            { name: 'userinput', type: 'string'},
            { name: 'country_code', type: 'string' },
            { name: 'avg_rating', type: 'float' },
            { name: 'distance', type: 'float' }
        ]
    }
});