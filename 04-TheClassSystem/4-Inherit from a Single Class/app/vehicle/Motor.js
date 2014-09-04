Ext.define('VehicleApp.vehicle.Motor', {
    extend: 'VehicleApp.vehicle.Vehicle',
    
    config: {
        nrOfWheels: 2 //<1>
    },

    constructor: function (config) {
        this.initConfig(config); //<2> 
    },

    drive: function(speed) { //<3>
        
        if(this.getNrOfWheels() < 3) { //<4>
            console.log(this.$className + 
                ": Vrrroom, vrrroom on " + this.getNrOfWheels() +
                     " wheels.");
        } else {
            this.callParent([60]); //<5>
        }
    }
});