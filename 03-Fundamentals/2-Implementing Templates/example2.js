var data = { 
    name: 'Taxi Amsterdam',  
    description: 'The only taxi in Amsterdam that does not circle around.' 
};

var c = null;

Ext.require('Ext.Component');
Ext.onReady(function() {

    c = Ext.create('Ext.Component', {
        tpl: '<h1>{name}</h1><p>{description}</p>',
        data: data,
        styleHtmlContent: true,
        cls: 'box',
        renderTo: Ext.getBody()
    });

    data.description = "We like tourists a lot!";

    c.setData(data);
});