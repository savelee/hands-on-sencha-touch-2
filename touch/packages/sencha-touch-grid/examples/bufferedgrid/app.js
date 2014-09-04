/**
 * This simple example shows the ability of the Ext.List component.
 *
 * In this example, it uses a grouped store to show group headers in the list. It also
 * includes an indicator so you can quickly swipe through each of the groups. On top of that
 * it has a disclosure button so you can disclose more information for a list item.
 */

//define the application
Ext.application({
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
        'Ext.grid.plugin.MultiSelection',
        'Ext.grid.plugin.PagingToolbar',
        'Ext.grid.plugin.ColumnResizing',
        'Ext.data.plugin.Buffered',
        'Ext.plugin.BufferedList'
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
            plugins: [
                {type: 'storebuffered'}
            ],

            //give the store some fields
            fields: [
                {name: 'id'},
                {name: 'guid', type: 'string'},
                {name: 'picture', type: 'string'},
                {name: 'name', type: 'string'},
                {name: 'gender', type: 'string'},
                {name: 'age', type: 'integer'},
                {name: 'company', type: 'string'},
                {name: 'email', type: 'string'},
                {name: 'address', type: 'string'},
                {name: 'about', type: 'string'},
                {name: 'registered', type: 'date'}
            ],

            //setup the proxy for the store to use an ajax proxy and give it a url to load
            //the local contacts.json file
            proxy: {
                type: 'ajax',
                url: 'http://localhost:8084/',
                reader: {
                    rootProperty: 'results'
                }
            }
        });

        var grid = Ext.create('Ext.grid.Grid', {
            store: store,
            title: 'Sample Grid',
            plugins: [
                {type: 'gridviewoptions'},
                {type: 'gridmultiselection'},
                {type: 'gridpagingtoolbar'},
                {type: 'gridcolumnresizing'},
                {type: 'bufferedlist'}
            ],
            columns: [
                {
                    text: 'Name',
                    dataIndex: 'name',
                    width: 200
                },
                {
                    text: 'Miscellaneous',
                    xtype: 'gridheadergroup',
                    items: [
                        {
                            text: 'Age',
                            tpl: '{age} years',
                            align: 'center',
                            width: 110,
                            xtype: 'templatecolumn',
                            dataIndex: 'age'
                        },
                        {
                            text: 'Gender',
                            dataIndex: 'gender',
                            width: 120,
                            align: 'center'
                        }
                    ]
                },
                {
                    text: 'Identifiers',
                    xtype: 'gridheadergroup',
                    items: [
                        {
                            text: 'Guid',
                            dataIndex: 'guid',
                            width: 300
                        },
                        {
                            text: 'Email',
                            dataIndex: 'email',
                            width: 300
                        }
                    ]
                },
                {
                    text: 'Address',
                    dataIndex: 'address',
                    width: 300
                },
                {
                    text: 'About',
                    dataIndex: 'about',
                    width: 200
                },
                {
                    text: 'Company',
                    dataIndex: 'company',
                    width: 200
                },
                {
                    text: 'Registered',
                    dataIndex: 'registered',
                    width: 120,
                    xtype: 'datecolumn',
                    format: 'd-m-Y'
                }
            ]
        });

        Ext.Viewport.add(grid);
    }
});
