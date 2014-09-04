Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',

    config: {
        models: ['Cab'],
        stores: ['Cabs'],

// BEGIN COMPONENTS-CAB-CONTROLLER-1
        markers: [], //1
        
        refs: {
            'titlebar': 'overview titlebar',
            'overview': 'overview',
            'detailView': 'detailview' //2
        },
// END COMPONENTS-CAB-CONTROLLER-1

// BEGIN COMPONENTS-CAB-CONTROLLER-2
        control: {
            'overview toolbar button': {
                filtername: 'setFilterName',
                filterdistance: 'setFilterDistance'
            },
            'map': {
                maprender: 'loadMarkers' //3
            },
            'overview': {
                select: 'prefillDetail' //4
            },
            'detailview button[action=close]': {
                close: 'onDetailClose' //5
            },
        }
// END COMPONENTS-CAB-CONTROLLER-2
    },

    launch: function() {
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            indicator: true,
            message: 'Fetching Data...'
        });

        this.loadLocal();
    },

    loadLocal: function() {
        /*
         * Load the data from the local database and
         * check if database has some records.
         * if not, then download data else hide the loading mask.
         */
        var me = this;
        Ext.getStore('Cabs').load(function(item) {
            var count = Ext.getStore('Cabs').getCount();
            if (count < 1) {
                me.downloadData();
            } else {
// BEGIN COMPONENTS-CAB-CONTROLLER-3
                var lat = item[0].get('latitude');
                var lng = item[0].get('longitude');
                var position = new google.maps.LatLng(lat,lng);
                var map = Ext.ComponentQuery.query('map')[0];
                map.getMap().setCenter(position); //6

                me.loadMarkers(map, map.getMap()); //7
                me.setTitleCount(count); //8

                Ext.Viewport.unmask();;
// END COMPONENTS-CAB-CONTROLLER-3
            }
        });
    },

    downloadData: function(location) {
        var me = this;

        //hardcode location to make sure the script won't fail
        location = Utils.Commons.LOCATION

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
                        "Please prefill your location, to detect nearby Taxiservices.",
                        function(buttonId) {
                            if (buttonId === 'yes') {
                    me.getApplication().getController('SettingsController').toggleSettings();
                            }
                        }
                    );
                }
            });

        } else {
            var store = Ext.getStore('Cabs');
            /* switch my client proxy to a server proxy */
            store.setProxy({
                type: 'jsonp',
                url: Utils.Commons.YELP_API,
                //type: "ajax",
                //url : "data/data.json",
                //noCache: false,
                extraParams: {
                    term: Utils.Commons.YELP_TERM,
                    ywsid: Utils.Commons.YELP_KEY,
                    location: location
                },
                reader: {
                    type: 'json',
                    rootProperty: 'businesses',
                }
            });


            /* and download the data, on the success callback
             * I will run the syncRecords() controller function */
            store.load(function(records) {
                me.syncRecords(records, location);
            });
            
        }
    },

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

        /* 
         * Switch the Cabs Store proxy back to the
         * SQL local proxy
         */
        store.setProxy({
            type: 'sql',
            database: "FindACab",
            table: 'Cabs'
        });

         /*
         * remove current items from the database.
         * and sync this first.
         */
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
                        // BEGIN COMPONENTS-CAB-CONTROLLER-4
                        me.loadMarkers(Ext.ComponentQuery.query('map')[0]);
                        // END COMPONENTS-CAB-CONTROLLER-4
                        me.setTitleCount(store.getCount());
                        store.load();
                        Ext.Viewport.unmask();
                    }
                });
            }
        });

    },

    setFilterName: function() {
        Ext.getStore('Cabs').sort('name');
        Ext.getStore('Cabs').load();
    },
    setFilterDistance: function() {
        Ext.getStore('Cabs').sort('distance');
        Ext.getStore('Cabs').load();
    },
    setTitleCount: function(count) {
        var t = Ext.String.format('Cabs ({0})', count);
        this.getTitlebar().setTitle(t);
    },

// BEGIN COMPONENTS-CAB-CONTROLLER-5
    removeMarkers: function() {
        var me = this,
            markers = me.getMarkers(),
            total = markers.length;

        for (var i = 0; i < total; i++) {
            markers[i].setMap(null); //10
        }
        markers.splice(0, total);
        me.setMarkers(markers);
    },
// END COMPONENTS-CAB-CONTROLLER-5

// BEGIN COMPONENTS-CAB-CONTROLLER-6
    loadMarkers: function(comp, map) { 
        var me = this,
            store = Ext.getStore('Cabs'),
            markers = me.getMarkers(),
            gm = comp.getMap(),
            list = me.getOverview(); 

        //clear markers when stored
        if (markers.length > 0) me.removeMarkers(); //11

        store.each(function(item, index, length) {
            var latlng = new google.maps.LatLng(item.get('latitude'),
                item.get('longitude')); //12

            //center the map based on the latlng of the first item.
            if (index === 0) comp.setMapCenter(latlng); //13

            var marker = new google.maps.Marker({ //14
                map: gm,
                position: latlng,
                icon: 'resources/images/marker.png'
            });
            markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() { //15
                var i = store.indexOf(item);
                list.select(i);
            });

            me.setMarkers(markers); //16
        });
    },
// END COMPONENTS-CAB-CONTROLLER-6

// BEGIN COMPONENTS-CAB-CONTROLLER-7
    prefillDetail: function(list, record) { //17
        this.getDetailView().getLayout().setAnimation({
            type: 'slide',
            direction: 'up'
        });
        this.getDetailView().setActiveItem(1);
        this.getDetailView().getActiveItem().setData(record.getData()); 
    },
// END COMPONENTS-CAB-CONTROLLER-7

// BEGIN COMPONENTS-CAB-CONTROLLER-8
    onDetailClose: function() { //18
        this.getDetailView().getLayout().setAnimation({
            type: 'slide',
            direction: 'down'
        });
        this.getDetailView().setActiveItem(0);
        this.getOverview().deselectAll();
    }
// END COMPONENTS-CAB-CONTROLLER-8

});