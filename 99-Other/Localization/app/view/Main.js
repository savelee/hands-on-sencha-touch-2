Ext.define('MyApp.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.Video'
    ],
    TAB_ONE_TITLE_SHORT: 'Hello',
    TAB_ONE_TITLE: 'Hello Sencha Touch 2',
    TAB_ONE_HTML: 'This app was written in English.',
    config: {
        tabBarPosition: 'bottom',
    },
    initialize: function() {

        var items = [{
                title: this.TAB_ONE_TITLE_SHORT,
                iconCls: 'home',

                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: this.TAB_ONE_TITLE
                },

                html: this.TAB_ONE_HTML
            },{
                docked: 'top',
                xtype: 'toolbar',
                items: [{
                    xtype: 'button',
                    text: 'Toggle pirate language',
                    handler: function(){
                        if(localStorage.getItem("language")) {
                            localStorage.removeItem("language");
                        } else {
                            localStorage.setItem("language", "MyApp.utils.pirate.Main");
                        }
                        window.location.reload();
                    }
                }]
            }
        ];

        this.add(items);
        this.callParent();
    }
});
