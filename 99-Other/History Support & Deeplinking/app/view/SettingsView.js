Ext.define('FindACab.view.SettingsView', {
    extend: 'Ext.form.Panel',
    xtype: 'settingsview',
    requires: [
            'Ext.TitleBar',
            'Ext.form.FieldSet'
    ],
    config: {
        title: 'SettingsView',
        items: [{
                xtype: 'titlebar',
                ui: 'light',
                docked: 'top',
                title: 'Settings',
                items: [{
                        iconCls: 'delete',
                        itemId: 'close',
                        ui: 'decline',
                        align: 'right'
                    }
                ]
            }, {
                xtype: 'fieldset',
                title: 'Your location',
                instructions: "Please enter your city and country. (For US addresses please provide city + statecode and country, for example: Naperville IL, USA).",
                items: [{
                        name: 'city',
                        xtype: 'textfield',
                        label: 'City'
                    }, {
                        name: 'country',
                        xtype: 'textfield',
                        label: 'Country'
                    }
                ]

            },
            {
                xtype: 'button',
                text: 'Submit',
                action: 'submit',
                margin: 10,
                ui: 'confirm'
            }

        ]
    }
});