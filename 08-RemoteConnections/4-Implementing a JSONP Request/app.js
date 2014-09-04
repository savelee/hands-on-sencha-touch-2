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

        Ext.data.JsonP.request({
            url: 'somescript.php',
            callbackKey: 'callback',
            params: {
                location: "Amsterdam NL"
            },
            success: function(response, request){
                //remove loading mask
                Ext.Viewport.unmask();
                console.log(response);
            },
            failure: function(e){
                //remove loading mask
                Ext.Viewport.unmask();
                console.error(e);
            }
        });

    }
});