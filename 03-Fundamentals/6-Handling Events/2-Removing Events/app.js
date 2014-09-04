Ext.application({
    name: 'Events',

    launch: function() {

        var callTaxiEventHandler = function(b) {
            console.log('You tapped the ' + b.getText() + 'button');
            this.removeListener('tap', callTaxiEventHandler);
            console.log('From now on, you can not call again.');
        };

        var callTaxi = Ext.create('Ext.Button', {
            text: 'Call the Taxi',
            margin: 5,
            listeners: {
                tap: callTaxiEventHandler
            }
        });

        //just for testing purposes
        Ext.create('Ext.Container', {
            fullscreen: true,
            padding: 10,
            items: [callTaxi]
        });

    }
});