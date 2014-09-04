Ext.define('VehicleApp.vehicle.Cab', {
    // The default config
    config: {
        driver: 'John Doe',
        driver2: {
          firstName: 'John',
          lastName: 'Doe'
        }
    },

    constructor: function(config) {
        this.initConfig(config);
    },
    
    applyDriver: function(newVal){
      if(newVal === 'The Pope') {
        console.log(newVal + " is an invalid taxi driver.");
        return;
      }
      return newVal;
    },
    updateDriver: function(newVal, oldVal){
      console.log('The owner has been changed from ' + oldVal + ' to ' + newVal);
    }
});