Ext.define('FindACab.view.DetailView', {
    extend: 'Ext.Container',
    xtype: 'detailview',
    requires: [
        'Ext.TitleBar',
        'Ext.Button',
        'Ext.layout.Card',
        'Ext.Map',
        'FindACab.view.RatingChart'
    ],
    config: {
        layout: 'card',
        items: [{
                xtype: 'titlebar',
                ui: 'light',
                docked: 'top',
                title: 'FindACab',
                items: [{
                    iconCls: 'settings',
                    itemId: 'settingsbtn',
                    ui: 'plain',
                    align: 'right'
                }]
            },

            {
                xtype: 'map',
                mapOptions: {
                    overviewMapControl: false,
                    panControl: false,
                    rotateControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    zoom : 12,
                    mapTypeId : google.maps.MapTypeId.ROADMAP
                },
                useCurrentLocation: false
            }, {
                padding: '20',
                cls: 'taxitpl',
                tpl: Ext.create('Ext.XTemplate', '<h1>{name}</h1>' +
                    '<address>{address1}<br/>' +
                    '{zip} {city} {state_code} {country_code}' +
                    '</address>' +
                    '<a href="tel:{phone}" class="x-button callnow">' +
                    'Call now: {phone} </a><p>Distance: {distance}</p>'),

                items: [{ 
                    docked: 'right',
                    xtype: 'button',
                    action: 'close',
                    cls: 'closebtn',
                    iconCls: 'delete',
                    padding: 20,
                    height: 50,
                    handler: function() {
                        this.fireEvent('close');
                    },
                    ui: 'plain'
                }, {
                    docked: 'bottom',
                    xtype: 'ratingchart',
                    height: '30%'
                }, {
                    docked: 'bottom',
                    xtype: 'component',
                    html: '<h1>User Rating:</h1>',
                    padding: '0 20'
                }],
            }
        ]
    }
});