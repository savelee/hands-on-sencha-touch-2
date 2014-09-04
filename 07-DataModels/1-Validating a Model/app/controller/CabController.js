Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',
    
    config: {
        models: ['Cab'],
        stores: ['Cabs'],
        
        refs: {
            main: 'mainview'
        }
    },
    
    init: function(){
        console.log("On init app found " 
            + Ext.ComponentQuery.query('mainview').length 
            + " mainviews: ", 
            Ext.ComponentQuery.query('mainview'));
        console.log("On init app found the reference: ", 
            this.getMain());
    },

    launch: function(app) {
        console.log("On launch app found " 
            + Ext.ComponentQuery.query('mainview').length 
            + " mainviews: ", 
            Ext.ComponentQuery.query('mainview'));
        console.log("On launch app found the reference: ", 
            this.getMain());
    }
});