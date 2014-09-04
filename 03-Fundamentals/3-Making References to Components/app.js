Ext.application({
    name: 'PointersComponents',
    requires: ['Ext.Button', 'Ext.form.Panel'],
    launch: function() {

        //just for testing purposes
        var button1 = Ext.create('Ext.Button', {
            text: 'Button with ID',
            id: 'mybutton',
            margin: 5
        });
        var button2 = Ext.create('Ext.Button', {
            text: 'Button',
            margin: 5
        });

        Ext.create('Ext.form.Panel', {
            fullscreen: true,
            padding: 10,
            items: [button1, button2]

        });

        //create the pointers
        //#1
        console.log("Ext.getCmp('mybutton')", Ext.getCmp('mybutton'));
        
        //#2
        console.log("Ext.ComponentQuery.query('button')", Ext.ComponentQuery.query('button'));
        console.log("Ext.ComponentQuery.query('button, formpanel')", Ext.ComponentQuery.query('button, formpanel'));
        
        //#3
        console.log("Ext.ComponentQuery.query('#mybutton')", Ext.ComponentQuery.query('#mybutton'));
        
        //#4
        console.log("Ext.ComponentQuery.query('formpanel > button[text='Button with ID']')", Ext.ComponentQuery.query('formpanel > button[text="Button with ID"]'));

    }
});