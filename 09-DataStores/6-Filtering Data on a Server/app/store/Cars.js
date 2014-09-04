Ext.define('RemoteTest.store.Cars', {
    extend: 'Ext.data.Store',
    requires: ['Ext.data.proxy.JsonP'],
    config: {
        model: 'RemoteTest.model.Car',
        autoLoad: true,
        pageSize: 20,

        remoteFilter : true,
        filters: [{
            property: "brand",
            value: "BMW"
        }],

        proxy: {
	        type: 'jsonp',
            url: 'http://someurl.com/test.php',
	        reader: {
                rootProperty: 'results',
                totalProperty: 'total',
                successProperty: 'success'
            }
	    },
    }
});

