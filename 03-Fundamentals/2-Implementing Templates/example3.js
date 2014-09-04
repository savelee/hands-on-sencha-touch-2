Ext.require('Ext.Component');
Ext.onReady(function() {
    
    var data = { 
        name: 'Taxi Amsterdam',  
        description: 'The only taxi in Amsterdam that does not circle around.'
    };

    var myTpl = Ext.create(
        'Ext.XTemplate','<h1>{name}</h1><p>{description}</p>');

    Ext.create('Ext.Component', {
        tpl: myTpl,
        data: data,
        styleHtmlContent: true,
        cls: 'box',
        renderTo: Ext.getBody()
    });

});