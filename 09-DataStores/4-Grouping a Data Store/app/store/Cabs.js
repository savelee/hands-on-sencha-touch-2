Ext.define('FindACab.store.Cabs', {
    extend: 'Ext.data.Store',
    requires: ['Ext.data.proxy.JsonP'],
    config: {
        model: 'FindACab.model.Cab',
        autoLoad: false,

        //sort on Taxi name
		sorters: [{
		    property: "name",
		    direction: "ASC"
		}],

        //group on the first character of Taxi name
        grouper: {
		    groupFn: function(record) {
		        return record.get('name')[0].toUpperCase();
		    }
		},
        //groupField: 'name',
		//groupDir: 'DESC',

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

