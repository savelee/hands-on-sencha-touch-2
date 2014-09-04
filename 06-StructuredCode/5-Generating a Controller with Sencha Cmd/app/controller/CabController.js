Ext.define('FindACab.controller.CabController', {
    extend: 'Ext.app.Controller',
    
    config: {
        models: ['Cab'],
        stores: ['Cabs'],
        
        refs: {
            
        },
        control: {
            
        }
    },
    
    //called when the application is launched; remove if not needed
    launch: function(app) {
        
    }
});