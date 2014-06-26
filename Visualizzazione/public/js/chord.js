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
	var numHashM;
	var hashto_HashList;


function initializeData(createDataCallback, startCallback){
	callGet('/minerList', function(data){
									numHashM = data;
									callGet('/minerInteractionsList', function(data){
																		hashto_HashList = data
																		createDataCallback(numHashM, hashto_HashList, startCallback);
																	});
									});
	//{'1':'abc', '2':'bdfg', '3':'casfg', '4':'dasfg', '5':'ekiuj', '6':'fertey'};
	//{'abc':['bdfg', 'casfg'], 'dasfg':['casfg', 'ekiuj', 'bdfg'], 'casfg':['fertey', 'abc', 'bdfg'], 
	//'dasfg':['abc'], 'ekiuj':['abc', 'bdfg'], 'fertey':['abc', 'bdfg', 'ekiuj']};

	

}



function createData(numberHashMap, hashto_HashList, startCallback){
	data={
			packageNames:[],
			matrix: []
	}
	// console.log(numberHashMap);
	// console.log(hashto_HashList);

	numberHashMap = getJSONFromString(numberHashMap);
	hashto_HashList = getJSONFromString(hashto_HashList);

	data.packageNames = Object.keys(numberHashMap);
		
	var row = [];

	data.packageNames.forEach(function(item){
		row = []
		data.packageNames.forEach(function(item2){	
			if (item !== item2){
				if(hashto_HashList[numberHashMap[item]]===undefined)
					row.push(0);
				else
					if(hashto_HashList[numberHashMap[item]].indexOf(numberHashMap[item2]) > -1)
						row.push(1);
					else
						row.push(0);
			}
			else
				row.push(0);
			
		});

		data.matrix.push(row);			

	});

	start();

}



initializeData(createData, start);


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