Ext.application({
    name: 'References',
    launch: function() {

        //create the references
        //#1
        console.log("Ext.get('title')", Ext.get('title'));
        console.log("Ext.get('description')", Ext.get('description'));
        console.log("---");
        //#2
        console.log("Ext.select('p')", Ext.select('p'));
        console.log("Ext.select('p').elements[0]", Ext.select('p').elements[0]);
        console.log("---");
        //#3
        console.log("Ext.getDom('title')", Ext.getDom('title'));
        
        
    }
});