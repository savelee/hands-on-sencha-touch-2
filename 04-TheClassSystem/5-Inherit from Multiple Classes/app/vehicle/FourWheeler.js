Ext.define('VehicleApp.vehicle.FourWheeler', {
  mixins: {
    canBrake: 'VehicleApp.mixins.Brake',
    canDrive: 'VehicleApp.mixins.Drive',
    canJump: 'VehicleApp.mixins.Jump'
  }
});