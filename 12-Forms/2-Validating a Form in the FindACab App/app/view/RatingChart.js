Ext.define('FindACab.view.RatingChart', {
	extend: 'Ext.chart.SpaceFillingChart',
	xtype: 'ratingchart',
	requires: [
		'Ext.chart.series.Gauge',
		'Ext.chart.series.sprite.PieSlice',
	],
	config: {
		series: [{
			type: 'gauge',
			field: 'avg_rating',
			labelField: 'Rating',
			minimum: 0,
			value: 0,
			field: 'value',
			maximum: 5,
			donut: 80,
			colors: ["#ffb13a", "lightgrey"]
		}]
	}
});