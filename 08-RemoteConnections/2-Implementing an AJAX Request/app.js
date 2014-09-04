Ext.application({
    name: 'Test',

    launch: function() {

        //enable loading throbber
        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            indicator: true,
            message: 'Get results...'
        });
        Ext.Viewport.mask();

        Ext.Ajax.request({
            url: 'somescript.php',
            timeout: 60000,
            method: 'POST',
            params: {
                location: 'Amsterdam NL'
            },
            success: function(response){
                //remove loading mask
                Ext.Viewport.unmask();
                try {
                    var text = response.responseText;
                    var results = Ext.JSON.decode(text);
                    console.log(results.businesses);
                } catch (e) {
                    //you can never assume that data is the way you want.
                    console.error(e);
                }
            },
            failure: function(e){
                //remove loading mask
                Ext.Viewport.unmask();
                console.error(e);
            }
        });

    }
});