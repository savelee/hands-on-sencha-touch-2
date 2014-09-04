Ext.define('VehicleApp.vehicle.Vehicle', {
    unit: "mph", 
    drive: function(speed) {
        console.log(this.$className + ": Vrrroom: " + speed + " " + this.unit);
    }
});