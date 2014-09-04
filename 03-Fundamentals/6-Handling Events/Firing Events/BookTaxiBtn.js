Ext.define('BookTaxiBtn', {
    extend: 'Ext.Button',
    xtype: 'booktaxibtn',
    config: {
        text: 'Book a Taxi - listeners',
        margin: 5,
        listeners: {
            tap: 'bookTaxiEventHandler'
        },
    },
    bookTaxiEventHandler: function(b){
        console.log('You tapped the ' + b.getText() + 'button');
    }
});