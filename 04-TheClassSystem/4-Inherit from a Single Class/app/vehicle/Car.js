Ext.define('VehicleApp.vehicle.Car', {
    extend: 'VehicleApp.vehicle.Vehicle',
    drive: function(speed) {
        console.log(this.$className + ": Vrrroom, vrrroom: " + speed + this.unit);
    }
});