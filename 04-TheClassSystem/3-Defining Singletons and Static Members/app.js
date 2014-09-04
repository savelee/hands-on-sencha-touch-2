Ext.Loader.setPath({
    'Ext': '../../touch/src',
    'VehicleApp': 'app'
});

Ext.application({
    name: 'VehicleApp',
    requires: ['VehicleApp.utils.Commons'],
    launch: function() {

        var mySettings = Ext.create('VehicleApp.utils.Commons');
        //It is possible to create an instance of a class with statics:
        console.log(mySettings); 
        //But getting access to a static from an object fails:
        console.log(mySettings.getUrl()); 
        //Uncaught TypeError: Object [object Object] has no method 'getUrl' 
    }
});