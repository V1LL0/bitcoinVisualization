function getJSONFromString(string){
	return jQuery.parseJSON( string );
}

function callGet(path, callback){
  $.ajax({
    type: 'get',
    url: path,
    success: function(data){ callback(data); }
  });
}


//Data must be a matrix of dependencies. The first item must be the main package.
//For instance, if the main package depends on packages A and B, and package A
//also depends on package B, you should build the data as follows:
var data; /*{
		packageNames: ['A', 'B', 'C', 'D', 'E', 'F'],
		matrix: [[0, 1, 1, 1, 1, 1], // Main depends on A and B
		         [0, 0, 1, 1, 0, 1], // A depends on B
		         [0, 0, 0, 0, 0, 0],
		         [0, 0, 1, 0, 0, 1],
		         [1, 1, 0, 0, 0, 0],
		         [1, 1, 0, 1, 1, 0]] // B doesn't depend on A or Main
};
*/



callGet('/wheelData', function(dataWheel){
	data = getJSONFromString(dataWheel);
	start();
});




function start(){
//Dependency wheel chart for d3.js

//Usage:
	var chart = d3.chart.dependencyWheel()
	.width(700)
	.margin(150)
	.padding(.02);

	d3.select('#chord')
	.datum(data)
	.call(chart);


	//You can customize the chart width, margin (used to display package names),
	//and padding (separating groups in the wheel)
	//var chart = d3.chart.dependencyWheel().width(700).margin(150).padding(.02);
}