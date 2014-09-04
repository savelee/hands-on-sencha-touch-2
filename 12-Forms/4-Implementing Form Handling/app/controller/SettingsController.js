Ext.define('FindACab.controller.SettingsController', {
    extend: 'Ext.app.Controller',
    requires: [
            'FindACab.view.SettingsView',
            'Ext.MessageBox'
    ],
    config: {
        models: ['Setting'],
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
            },
            'button[action=submit]': {
                tap: 'onSubmitTap'
            }
        }
    },

    init: function() {
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
                    type: 'popIn', //fadeIn, fadeOut, popIn, popOut, flip, slideIn, slideOut,
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

    toggleSettings: function() {
        if (this.getSettingsView().getHidden()) {
            this.getSettingsView().show();
        } else {
            this.getSettingsView().hide();
        }
    },

    onSubmitTap: function() {
        //reset cls
        var t = Ext.ComponentQuery.query('textfield').length;
        var i = 0;
        for(i;i<t;i++){
            Ext.ComponentQuery.query('textfield')[i].removeCls('error');
        }

        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            indicator: true,
            message: 'Save Settings...'
        });

        var errorstring = "";
        var model = Ext.create("FindACab.model.Setting", {});
        this.getSettingsView().updateRecord(model);

        //start validating
        var validationObj = model.validate();

        if (!validationObj.isValid()) {
            validationObj.each(function(errorObj) {
                errorstring += errorObj.getMessage() + "<br />";
                Ext.ComponentQuery.query('textfield[name='+errorObj.getField()+']')[0].addCls('error');
            });

            Ext.Msg.alert("Oops", errorstring);
        } else {
            var me = this;
            //remove all current Settings and save new
            var settingsStore = Ext.getStore('Settings');
            try{
                var oldLocation = Ext.getStore('Settings').getAt(0).get('city') + ' ' + Ext.getStore('Settings').getAt(0).get('country');
            } catch(e){
                var oldLocation = "";
            }    
            settingsStore.removeAll();
            settingsStore.add(model.getData());
            settingsStore.sync();

            //remove all Cabs from store and database
            this.getApplication().getController('CabController').removeOldData(oldLocation, function(){
                //remove all Markers from the map
                me.getApplication().getController('CabController').removeMarkers();
                //load new data
                me.getApplication().getController('CabController').loadLocal();
                //hide loading mask
                me.getSettingsView().hide();
            });

        }

        Ext.Viewport.unmask();
    }

});