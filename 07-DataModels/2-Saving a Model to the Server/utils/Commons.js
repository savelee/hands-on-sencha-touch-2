Ext.define('Utils.Commons', {
    statics: {
        YELP_API: 'http://api.yelp.com/business_review_search?',
        YELP_KEY: 'ftPpQUCgfSA3yV98-uJn9g',
        YELP_TERM: 'Taxi',
        LOCATION: 'Amsterdam NL',

        getUrl: function(){
        	return this.YELP_API + "term=" + this.YELP_TERM + "&ywsid=" + this.YELP_KEY + "&location=" + this.LOCATION;
        }
    }
});

