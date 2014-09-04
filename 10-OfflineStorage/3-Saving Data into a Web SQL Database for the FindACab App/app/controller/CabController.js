// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-1
Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',

    config: {
        models: ['Cab'],
        stores: ['Cabs']
    },

// END OFFLINESTORAGE-CAB-CONTROLLER-1 

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-2

    launch: function() {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            indicator: true,
            message: 'Fetching Data...'
        });

        this.loadLocal();
    },

// END OFFLINESTORAGE-CAB-CONTROLLER-2

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-3
    loadLocal: function() {
        var me = this;
        Ext.getStore('Cabs').load(function(item) {
            var count = Ext.getStore('Cabs').getCount();
            if (count < 1) {
                me.downloadData();
            } else {
                Ext.Viewport.unmask();
            }
        });
    },
// END OFFLINESTORAGE-CAB-CONTROLLER-3

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-4
    downloadData: function(location) { 
        var me = this;
        location = Utils.Commons.LOCATION;

// END OFFLINESTORAGE-CAB-CONTROLLER-4

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-5
        if (!location) {
            Ext.getStore('Settings').load(function() {
                try {
                    var data = Ext.getStore('Settings').getAt(0);
                    var loc = data.get('city') + " " + data.get('country');
                    me.downloadData(loc);
                } catch (e) {
                    Ext.Viewport.unmask();

                    Ext.Msg.confirm(
                        "No location saved",
                        "Please prefill your location" + 
                        "to detect nearby Taxiservices.",
                        function(buttonId) {
                            if (buttonId === 'yes') {
            
            me.getApplication
            ().getController
            ('SettingsController')
            .toggleSettings();
                            
                            }
                        }
                    );
                }
            });

        } 

// END OFFLINESTORAGE-CAB-CONTROLLER-5

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-6

        else {
            //<1>
            var store = Ext.getStore('Cabs'); 
            store.setProxy({
                type: 'jsonp',
                url: Utils.Commons.YELP_API,
                extraParams: {
                    term: Utils.Commons.YELP_TERM,
                    ywsid: Utils.Commons.YELP_KEY,
                    location: location
                },
                //<2>
                reader: {
                    type: 'json',
                    rootProperty: 'businesses',
                }
            });

            //<3>
            store.load(function(records) {
                me.syncRecords(records, location);
            });
            
        }
    }, //end downloadData

// END OFFLINESTORAGE-CAB-CONTROLLER-6

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-7
    syncRecords: function(records, userinput) {
        /* 
         * Loop through all the items that are downloaded
         * and add these to the items array.
         */
      var items = [],
            me = this,
            total = records.length,
            i = 0,
            store = Ext.getStore('Cabs');

        for(i;i<total;i++) {
            var item = records[i];
            items.push({
                'name': item.get('name'),
                'latitude': item.get('latitude'),
                'longitude': item.get('longitude'),
                'address1': item.get('address1'),
                'phone': item.get('phone'),
                'state_code': item.get('state_code'),
                'zip': item.get('zip'),
                'city': item.get('city'),
                'country_code': item.get('country_code'),
                'avg_rating': item.get('avg_rating'),
                'distance': item.get('distance'),
                'userinput': userinput
            });

        };

// END OFFLINESTORAGE-CAB-CONTROLLER-7

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-8
        store.setProxy({
            type: 'sql',
            database: "FindACab",
            table: 'Cabs'
        });

// END OFFLINESTORAGE-CAB-CONTROLLER-8

// BEGIN OFFLINESTORAGE-CAB-CONTROLLER-9
        store.removeAll();
        store.sync({
            success: function(batch){
                /* 
                 * Add the downloaded items array to the Cabs Store
                 * and sync() the store to start saving the
                 * records locally.
                 * When it is done, we can remove the Loading mask.
                 */
                store.add(items);
                store.sync({
                    success: function(batch){
                        //me.setTitleCount(store.getCount());
                        store.load();
                        Ext.Viewport.unmask();
                    }
                });
            }
        });

    }
});
// END OFFLINESTORAGE-CAB-CONTROLLER-9