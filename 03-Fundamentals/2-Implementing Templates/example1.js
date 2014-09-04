Ext.onReady(function() {

	var data = { 
	   name: 'Taxi Amsterdam',  
	   description: 'The only taxi in Amsterdam that does not circle around' 
	};

    Ext.create('Ext.Component', {
        tpl: '<h1>{name}</h1><p>{description}</p>',
        data: data,
        styleHtmlContent: true,
        cls: 'box',
        renderTo: Ext.getBody()
    });

});