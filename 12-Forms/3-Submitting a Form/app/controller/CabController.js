Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',

    config: {
        models: ['Cab'],
        stores: ['Cabs', 'Settings'],
        markers: [],

        refs: {
            'titlebar': 'overview titlebar',
            'overview': 'overview',
            'detailView': 'detailview'
        },
        control: {
            'overview toolbar button': {
                filtername: 'setFilterName',
                filterdistance: 'setFilterDistance'
            },
            'map': {
                maprender: 'loadMarkers'
            },
            'overview': {
                select: 'prefillDetail'
            },
            'detailview button[action=close]': {
                close: 'onDetailClose'
            },
        }
    },

    launch: function() {
        Ext.Viewport.mask({
            xtype: 'loadmask',
            message: 'loading...'
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
                me.setTitleCount(count);
                var position = new google.maps.LatLng(item[0].get('latitude'), item[0].get('longitude'));
                var map = Ext.ComponentQuery.query('map')[0];
                map.getMap().setCenter(position);
                me.loadMarkers(map, map.getMap());
                Ext.Viewport.unmask();
            }
        });
    },

    downloadData: function(location) {
        var me = this;

        //hardcode location to make sure the script won't fail
        location = Utils.Commons.LOCATION;

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
            Ext.getStore('Cabs').load(function(records) {
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
                        me.loadMarkers(Ext.ComponentQuery.query('map')[0]);
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
    setTitleCount: function(count){
        var t = Ext.String.format('Cabs ({0})', count);
        this.getTitlebar().setTitle(t);
    },

    removeMarkers: function() {
        var me = this,
            markers = me.getMarkers(),
            total = markers.length;

        for (var i = 0; i < total; i++) {
            markers[i].setMap(null);
        }
        markers.splice(0, total);
        me.setMarkers(markers);
    },

    loadMarkers: function(comp, map) {
        var me = this,
            store = Ext.getStore('Cabs'),
            markers = me.getMarkers(),
            gm = comp.getMap(),
            list = me.getOverview();

        //clear markers when stored
        if (markers.length > 0) me.removeMarkers();

        store.each(function(item, index, length) {

            var latlng = new google.maps.LatLng(item.get('latitude'),
                item.get('longitude'));

            //center the map based on the latlng of the first item.
            if (index === 0) comp.setMapCenter(latlng);

            var marker = new google.maps.Marker({
                map: gm,
                position: latlng,
                icon: 'resources/images/marker.png'
            });

            markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {
                var i = store.indexOf(item);
                list.select(i);
            });

            me.setMarkers(markers);
        });
    },

    prefillDetail: function(list, record) {
        this.getDetailView().getLayout().setAnimation({
            type: 'slide',
            direction: 'up'
        });
        this.getDetailView().setActiveItem(1);
        this.getDetailView().getActiveItem().setData(record.getData());
        
        Ext.ComponentQuery.query('ratingchart')[0].getSeries()[0].setValue(record.get('avg_rating'));
    },
    onDetailClose: function() {
        this.getDetailView().getLayout().setAnimation({
            type: 'slide',
            direction: 'down'
        });
        this.getDetailView().setActiveItem(0);
        this.getOverview().deselectAll();
    }

});