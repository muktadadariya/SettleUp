
jQuery(document).ready(function() {

	Highcharts.setOptions({
		 colors: ['#aa3863', '#f3e686', '#074e67', '#6fc6f7', '#6ca77c', '#967604', '#8b668b', '#f3e686', '#3b7d86']
		});
		
	var iOweDt = $.parseJSON($("#iOweOthers").html());
	var iOweData = [];
	
	for(var i=0; i < iOweDt.length; i++) {
		var tmp = { name: iOweDt[i].userName, y: iOweDt[i].amount};
		iOweData.push(tmp);
	}
	
	var theyOweDt = $.parseJSON($("#theyOweMe").html());
	var theyOweData = [];
	
	for(var i=0; i < theyOweDt.length; i++) {
		var tmp = { name: theyOweDt[i].userName, y: theyOweDt[i].amount};
		theyOweData.push(tmp);
	}

	$('#iOweOthers').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
		credits: {
			enabled: false
		},
        tooltip: {
            pointFormat: '{series.name}: <b>${point.y:.1f}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: ${point.y:.1f}',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Amount',
            colorByPoint: true,
            data : iOweData
        }]
    });
	
	$('#theyOweMe').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
		credits: {
			enabled: false
		},
        tooltip: {
            pointFormat: '{series.name}: <b>${point.y:.1f}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: ${point.y:.1f}',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Amount',
            colorByPoint: true,
            data : theyOweData
        }]
    });
	
});
