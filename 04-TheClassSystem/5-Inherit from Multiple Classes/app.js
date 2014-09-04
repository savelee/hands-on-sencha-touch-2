Ext.Loader.setPath({
    'Ext': '../../touch/src',
    'VehicleApp': 'app'
});

Ext.application({
    name: 'VehicleApp',
    requires: ['VehicleApp.vehicle.FourWheeler', 'VehicleApp.vehicle.Car'],
    launch: function() {

        var mercedes = Ext.create('VehicleApp.vehicle.Car');
        var honda = Ext.create('VehicleApp.vehicle.FourWheeler');

        mercedes.drive();
        mercedes.brake();

        honda.drive();
        honda.jump();
        honda.brake();

    }
});