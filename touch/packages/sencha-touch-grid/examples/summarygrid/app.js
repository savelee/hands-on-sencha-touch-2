/**
 * This simple example shows the ability of the Ext.List component.
 *
 * In this example, it uses a grouped store to show group headers in the list. It also
 * includes an indicator so you can quickly swipe through each of the groups. On top of that
 * it has a disclosure button so you can disclose more information for a list item.
 */

//define the application
Ext.application({
    name: 'SummaryGrid',
    //define the startupscreens for tablet and phone, as well as the icon
    startupImage: {
        '320x460': 'resources/startup/Default.jpg', // Non-retina iPhone, iPod touch, and all Android devices
        '640x920': 'resources/startup/640x920.png', // Retina iPhone and iPod touch
        '640x1096': 'resources/startup/640x1096.png', // iPhone 5 and iPod touch (fifth generation)
        '768x1004': 'resources/startup/768x1004.png', //  Non-retina iPad (first and second generation) in portrait orientation
        '748x1024': 'resources/startup/748x1024.png', //  Non-retina iPad (first and second generation) in landscape orientation
        '1536x2008': 'resources/startup/1536x2008.png', // : Retina iPad (third generation) in portrait orientation
        '1496x2048': 'resources/startup/1496x2048.png' // : Retina iPad (third generation) in landscape orientation
    },

    isIconPrecomposed: false,
    icon: {
        57: 'resources/icons/icon.png',
        72: 'resources/icons/icon@72.png',
        114: 'resources/icons/icon@2x.png',
        144: 'resources/icons/icon@144.png'
    },

    //require any components/classes what we will use in our example
    requires: [
        'Ext.data.Store',
        'Ext.grid.Grid',
        'Ext.grid.HeaderGroup',
        'Ext.grid.plugin.ViewOptions',
        'Ext.grid.plugin.ColumnResizing',
        'Ext.grid.plugin.SummaryRow',
        'Ext.grid.plugin.PagingToolbar'
    ],

    /**
     * The launch method is called when the browser is ready, and the application can launch.
     *
     * Inside our launch method we create the list and show in in the viewport. We get the lists configuration
     * using the getListConfiguration method which we defined below.
     *
     * If the user is not on a phone, we wrap the list inside a panel which is centered on the page.
     */
    launch: function() {
        //create a store instance
        var store = Ext.create('Ext.data.Store', {
            //give the store some fields
            fields: [
                {name: 'id'},
                {name: 'name', type: 'string'},
                {name: 'registered', type: 'date', dateFormat: 'F jS, Y'},
                {name: 'age', type: 'integer'},
                {name: 'rating', type: 'integer'},
                {name: 'postCount', type: 'integer'},
                {name: 'friendCount', type: 'integer'}
            ],

            //autoload the data from the server
            autoLoad: true,

            //setup the proxy for the store to use an ajax proxy and give it a url to load
            //the local contacts.json file
            proxy: {
                type: 'ajax',
                url: 'contacts.json',
                reader: {
                    rootProperty: 'results'
                }
            }
        });

        var grid = Ext.create('Ext.grid.Grid', {
            store: store,
            title: 'Friends',
            plugins: [
                {type: 'gridviewoptions'},
                {type: 'gridcolumnresizing'},
                {type: 'gridsummaryrow'},
                {type: 'gridpagingtoolbar'}
            ],
            columns: [
                {
                    text: 'Name',
                    dataIndex: 'name',
                    width: 200,
                    editable: true,
                    summaryType: 'count',
                    summaryRenderer: function(value) {
                        return value + ' Friends';
                    }
                },
                {
                    text: 'Registered',
                    dataIndex: 'registered',
                    width: 120,
                    xtype: 'datecolumn'
                },
                {
                    text: 'Miscellaneous',
                    xtype: 'gridheadergroup',
                    items: [
                        {
                            text: 'Age',
                            align: 'center',
                            width: 150,
                            dataIndex: 'age',
                            summaryType: 'average',
                            summaryRenderer: function(value) {
                                return 'Avg: ' + Math.round(value) + '';
                            }
                        },
                        {
                            text: 'Rating',
                            align: 'center',
                            width: 150,
                            dataIndex: 'rating',
                            summaryType: 'min',
                            summaryRenderer: function(value) {
                                return 'Min: ' + value + '';
                            }
                        },
                        {
                            text: '# Posts',
                            tpl: '{age} years',
                            align: 'center',
                            width: 150,
                            dataIndex: 'postCount',
                            summaryType: 'max',
                            summaryRenderer: function(value) {
                                return 'Max: ' + Math.round(value) + '';
                            }
                        },
                        {
                            text: '# Friends',
                            align: 'center',
                            width: 150,
                            dataIndex: 'friendCount',
                            summaryType: 'average',
                            summaryRenderer: function(value) {
                                return 'Avg: ' + Math.round(value) + '';
                            }
                        }
                    ]
                }
            ]
        });

        Ext.Viewport.add(grid);
    }
});
