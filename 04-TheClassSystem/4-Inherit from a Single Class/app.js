Ext.Loader.setPath({
    'Ext': '../../touch/src',
    'VehicleApp': 'app'
});

Ext.application({
    name: 'VehicleApp',
    requires: ['VehicleApp.vehicle.Vehicle', 'VehicleApp.vehicle.Car', 'VehicleApp.vehicle.Motor'],
    launch: function() {

        var vehicle = Ext.create("VehicleApp.vehicle.Vehicle");
        vehicle.drive(40); //logs "Vrrroom: 40 mph"

        var car = Ext.create("VehicleApp.vehicle.Car");
        car.drive(60); //logs "Vrrroom, vrrroom: 60 mph"

        var motor = Ext.create('VehicleApp.vehicle.Motor', {
            //nrOfWheels: 4
        });
        motor.drive();

    }
});