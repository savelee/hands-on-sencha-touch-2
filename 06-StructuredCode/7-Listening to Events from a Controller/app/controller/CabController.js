Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',

    config: {
        models: ['Cab'],
        stores: ['Cabs'],

        refs: {
            main: 'mainview'
        },
        control: {
            'mainview': {
                initialize: 'onInitMain',
            },
            'button[action=press]': {
                tap: 'onTapMain'
            }
        }
    },

    onInitMain: function() {
        console.log("Initialize mainview");
    },
    onTapMain: function() {
        console.log("Tapped a button in mainview");
    }
});
