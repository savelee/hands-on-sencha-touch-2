Ext.application({
    name: 'PointersTraversing',
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
        
        console.log("Ext.ComponentQuery.query('button')[0].up('formpanel')",Ext.ComponentQuery.query('button')[0].up('formpanel'));
        console.log("Ext.ComponentQuery.query('fieldset')[0].up('formpanel').down('button')",Ext.ComponentQuery.query('button')[0].up('formpanel').down('button'));
    
    }
});