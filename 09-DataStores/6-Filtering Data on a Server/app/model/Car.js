Ext.define('RemoteTest.model.Car', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            { name: 'id', type: 'int'},
            { name: 'brand'},
            { name: 'type'},
        ]
    }
});