Ext.application({
    name: 'Events',
    requires: ['BookTaxiBtn'],

    launch: function() {

        var callTaxiEventHandler = function(b) {
            console.log('You tapped the ' + b.getText() + 'button');
        };

        var callTaxiBtn1 = Ext.create('Ext.Button', {
            text: '1: Call a Taxi - handler',
            margin: 5,
            handler: callTaxiEventHandler
        });

        var callTaxiBtn2 = Ext.create('Ext.Button', {
            margin: 5,
            text: '2: Call a Taxi - addListener'
        });
        callTaxiBtn2.addListener('tap', callTaxiEventHandler);

        var callTaxiBtn3 = Ext.create('Ext.Button', {
            margin: 5,
            text: '3: Call a Taxi - on'
        });
        callTaxiBtn3.on('tap', callTaxiEventHandler);

        //Display the buttons, for testing purposes
        Ext.create('Ext.Container', {
            fullscreen: true,
            padding: 10,
            items: [
                callTaxiBtn1, 
                callTaxiBtn2, 
                callTaxiBtn3, 
                { xtype: 'booktaxibtn'}
            ]
        });

    }
});