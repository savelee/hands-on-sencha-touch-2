Ext.define('FindACab.store.Cabs', {
    extend: 'Ext.data.Store',
    requires: ['Ext.data.proxy.Ajax'],
    config: {
        model: 'FindACab.model.Cab',
        autoLoad: true,
        proxy: {
	        type: "ajax",
	        url : "data/data.json",
	        reader: {
	            type: "json",
	            rootProperty: "businesses"
	        }
	    },
    }
});

