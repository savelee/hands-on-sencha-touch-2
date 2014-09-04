Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',

    config: {
        models: ['Cab'],
        stores: ['Cabs'],
        markers: [], //1

        refs: {
            'titlebar': 'overview titlebar',
            'overview': 'overview',
            'detailView': 'detailview' //2
        },
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
    },

    launch: function() { },

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
                var lat = item[0].get('latitude');
                var lng = item[0].get('longitude');
                var position = new google.maps.LatLng(lat,lng);
                var map = Ext.ComponentQuery.query('map')[0];
                map.getMap().setCenter(position); //6

                me.loadMarkers(map, map.getMap()); //7
                me.setTitleCount(count); //8

                Ext.Viewport.unmask();;
            }
        });
    },

    downloadData: function(location) { },

    syncRecords: function(records, userinput) {
        /* 
         * Loop through all the items that are downloaded
         * and add these to the items array.
         */
         //...
        
        /* 
         * Switch the Cabs store proxy back to the
         * SQL local proxy
         */
        //...
        
        /*
         * remove current items from the database.
         * and sync this first.
         */
        store.removeAll();
        store.sync({
            success: function(batch){
                /* 
                 * Add the downloaded items array to the Cabs store
                 * and sync() the store to start saving the
                 * records locally.
                 * When it is done, we can remove the loading mask.
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

    setFilterName: function() { },
    setFilterDistance: function() { },
    setTitleCount: function(count) { },

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

    prefillDetail: function(list, record) { //17
        this.getDetailView().getLayout().setAnimation({
            type: 'slide',
            direction: 'up'
        });
        this.getDetailView().setActiveItem(1);
        this.getDetailView().getActiveItem().setData(record.getData());
    },
    onDetailClose: function() { //18
        this.getDetailView().getLayout().setAnimation({
            type: 'slide',
            direction: 'down'
        });
        this.getDetailView().setActiveItem(0);
        this.getOverview().deselectAll();
    }

});