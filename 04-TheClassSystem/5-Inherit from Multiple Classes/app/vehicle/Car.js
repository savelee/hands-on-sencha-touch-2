Ext.define('VehicleApp.vehicle.Car', {
  mixins: {
    canBrake: 'VehicleApp.mixins.Brake',
    canDrive: 'VehicleApp.mixins.Drive'
  }
});
