Ext.define('RemoteTest.store.Cars', {
    extend: 'Ext.data.Store',
    requires: ['Ext.data.proxy.JsonP'],
    config: {
        model: 'RemoteTest.model.Car',
        autoLoad: true,

        remoteSort: true, //<1>
        sorters: [{ //<2>
            property: "brand",
            direction: "ASC"
        }],
        pageSize: 20, //<3>

        proxy: { //<4>
            type: 'jsonp',
            url: 'http://someurl.com/test.php',
            reader: { //<5>
                rootProperty: 'results', 
                totalProperty: 'total', 
                successProperty: 'success' 
            }
        },
    }
});
