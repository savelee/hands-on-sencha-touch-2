Ext.define('FindACab.controller.SettingsController', {
    extend: 'Ext.app.Controller',
    requires: ['FindACab.view.SettingsView'],
    config: {
        models:['Setting'],
        stores: ['Settings'],

        refs: { 
            'settingsView': 'settingsview'
        },
        control: { 
            'detailview #settingsbtn': {
                tap: 'toggleSettings'
            },
            'settingsview #close': {
                tap: 'toggleSettings'
            }
        }
    },

    init: function(){

        if (!this.overlay) {
            this.overlay = Ext.Viewport.add({
                xtype: 'settingsview',
                modal: true,
                hideOnMaskTap: true,
                centered: true,
                width: 320,
                height: 380,
                hidden: true,
                showAnimation: {
                    type: 'popIn',
                    duration: 250,
                    easing: 'ease-out'
                },
                hideAnimation: {
                    type: 'popOut',
                    duration: 250,
                    easing: 'ease-out'
                }
            });
        }      
    },

    toggleSettings: function(){
        if(this.getSettingsView().getHidden()) {
            this.getSettingsView().show();
        } else {
            this.getSettingsView().hide();
        }
    }

});