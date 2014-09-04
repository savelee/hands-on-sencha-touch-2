Ext.define('SaveTest.model.Car', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: 'id', type: 'int'},
			{ name: 'brand'},
		],
		proxy: {
            type: 'rest',
            //url : '/cars',
		    format: 'php', 
		    api: {
		        create: 'cars/addcar',
		        update: 'cars/editcar',
		        read: 'cars/loadcar',
		        destroy: 'cars/deletecar'
		    }	
        }
	}
});