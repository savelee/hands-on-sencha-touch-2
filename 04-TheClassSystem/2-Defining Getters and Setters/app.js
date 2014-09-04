Ext.Loader.setPath({
    'Ext': '../../touch/src',
    'VehicleApp': 'app'
});

Ext.application({
    name: 'VehicleApp',
    requires: ['VehicleApp.vehicle.Cab'],
    launch: function() {

        var taxi = Ext.create("VehicleApp.vehicle.Cab", {
            driver: "John Doe"
        });
        alert(taxi.getDriver()); //alerts('John Doe');

        taxi.setDriver('The Pope');
        alert(taxi.getDriver()); //alerts('John Doe');

        taxi.setDriver('Lee Boonstra');
        alert(taxi.getDriver()); //alerts('Lee Boonstra');
        
        //alert(taxi.getDriver().firstName); //alerts('John')


    }
});