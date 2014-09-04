Ext.define('FindACab.store.Cabs', {
    extend: 'Ext.data.Store',
    requires: ['Ext.data.proxy.JsonP'],
    config: {
        model: 'FindACab.model.Cab',
        autoLoad: false,
        proxy: {
	        type: 'jsonp',
	        url: Utils.Commons.YELP_API,
            noCache: false,
	        extraParams: {
            	term: Utils.Commons.YELP_TERM,
            	ywsid: Utils.Commons.YELP_KEY,
            	location: Utils.Commons.LOCATION
            },
	        reader: {
	        	type: 'json',
	        	rootProperty: 'businesses',
	        }
	    },
    }
});

