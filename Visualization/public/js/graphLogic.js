/** Utility **/

Object.values = function(obj){
	var keys = Object.keys(obj);
	var values = [];
	keys.forEach(function(key){
		values.push(obj[key]);
	})
	return values;
}

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

/** Collaborative Graph **/

//Vale true se occorre cambiare il primo grafo, false se il secondo
var isCollaborativeGraphToChange = false;

var collaborativeNode2Miner = {};
var miner2collaborativeNode = {};
var collaborativeNodes = [];
var collaborativeLinks = [];

var time2CollaborativeMiners = {};
var times = [];

var edgesTotalMap = {};
var edgesList = [];

var blocksNodesList = [];
var blocksEdgesList = [];

function addNewNode(list, num, x, y, size, color){
	if (color === "green")
		list.push({'number':num, 'x':x, 'y':y, 'size':size, 'color':color});
	else
		list.push({'number':num, 'x':x, 'y':y, 'size':size, 'color':color});
}


function generateAllCollaborativeLinks(newNodes){

	for(var i=0; i<newNodes.length; i++){
		for(var j=i+1; j<newNodes.length; j++){
			//console.log("{"+newNodes[i]+", "+newNodes[j]+"}")
			//console.log(edgesList)
			if(newNodes[i] !== newNodes[j])
				if(edgesList.indexOf( "{"+newNodes[i]+", "+newNodes[j]+"}") === -1  && edgesList.indexOf("{"+newNodes[j]+", "+newNodes[i]+"}") === -1 ){
					edgesTotalMap["{"+newNodes[i]+", "+newNodes[j]+"}"] = 1;
					edgesList.push("{"+newNodes[i]+", "+newNodes[j]+"}");
//					addCollaborativeLink(newNodes[i], newNodes[j], "red");
				}else{
					if(edgesList.indexOf( "{"+newNodes[i]+", "+newNodes[j]+"}") > -1)
						edgesTotalMap["{"+newNodes[i]+", "+newNodes[j]+"}"] += 1;
					else
						edgesTotalMap["{"+newNodes[j]+", "+newNodes[i]+"}"] += 1;
				}
		}
	}
}


// function generateAllBlocksLinks(){
	
// 	addLink(blocksEdgesList, time, num, "black");
// }


function addLink(list, source, target, color){
	var link = {"source": parseInt(source), "target": parseInt(target), "color":color};
	list.push(link);
}

function drawAllCollaborativeLinks(){
	function addCollaborativeLink(source, target, color){
		//var color = calculateColor();
//		var color = calculateColor(txCount);
		var link = {"source": parseInt(source), "target": parseInt(target), "color":color};
		collaborativeLinks.push(link);
	}


	var minCooperations = parseInt( $( "#slider-minerCollaborations" ).slider( "value" ) );
	
	for(var i=0; i<edgesList.length; i++){
		var edge = edgesList[i];
		if(edgesTotalMap[edge] >= minCooperations){
			var splitted = edge.split(/{|}|, /);
			var source = splitted[1];
			var target = splitted[2];
			var color = "red";
			addCollaborativeLink(source, target, color);
		}
	}

}


function getQuery(){
	if (isCollaborativeGraphToChange)
		return collaborativeGraphCall = '/time2CollaborativeMiners'
			+'?minTS='+$( "#slider-timeStampBlock" ).slider( "option", "values" )[0]
		+'&maxTS='+$( "#slider-timeStampBlock" ).slider( "option", "values" )[1]
		+'&minMiningCount='+$( "#slider-miningCountAddress" ).slider( "option", "values" )[0]
		+'&maxMiningCount='+$( "#slider-miningCountAddress" ).slider( "option", "values" )[1]
		+'&minMinersInBlock='+$( "#slider-minersCountInBlock" ).slider( "option", "values" )[0]
		+'&maxMinersInBlock='+$( "#slider-minersCountInBlock" ).slider( "option", "values" )[1];

	var date_timestamp = new Date($( "#blocksDate" ).val() + " 0:0:0").getTime();
	var timestamp_min = parseInt( $( "#slider-dateTimeBlocks" ).slider( "option", "values" )[0] );
	var timestamp_max = parseInt( $( "#slider-dateTimeBlocks" ).slider( "option", "values" )[1] );
	//calcolare i parametri dello slider
	var newDate_min = new Date(date_timestamp + timestamp_min*1000);
	var newDate_max = new Date(date_timestamp + timestamp_max*1000);
	var newTimestamp_min = parseInt(newDate_min.getTime() / 1000);
	var newTimestamp_max = parseInt(newDate_max.getTime() / 1000);

	return '/time2CollaborativeMiners'
			+'?minTS2='+ newTimestamp_min
		+'&maxTS2='+newTimestamp_max
		+'&minMiningCount='+$( "#slider-miningCountAddress" ).slider( "option", "values" )[0]
		+'&maxMiningCount='+$( "#slider-miningCountAddress" ).slider( "option", "values" )[1]
		+'&minMinersInBlock='+$( "#slider-minersCountInBlock" ).slider( "option", "values" )[0]
		+'&maxMinersInBlock='+$( "#slider-minersCountInBlock" ).slider( "option", "values" )[1]
		+ '&hourMin=' + timestamp_min + '&hourMax=' + timestamp_max;
}

function getData(callback){
	printLoading()

	var collaborativeGraphCall;

	try {
		collaborativeGraphCall = getQuery();		
	} catch (err) {
		collaborativeGraphCall = '/time2CollaborativeMiners';
	}
	callGet(collaborativeGraphCall, function(data){
		time2CollaborativeMiners = getJSONFromString(data);
		times = Object.keys(time2CollaborativeMiners);

		setLists();
		if (isCollaborativeGraphToChange)
			initGraph(collaborativeGraphVisulization, collaborativeNodes, collaborativeLinks);
		else
			initGraph(collaborativeWithBlocksGraphVisulization, blocksNodesList, blocksEdgesList);

		printStatistics();
		//Cache collaborations value
		var collaborations_value = $( "#slider-minerCollaborations" ).slider( "option", "value" );
		callGet("/setCollaborationValue/?collaborations=" + collaborations_value, function(data){});
	});
}

function setLists(){
	function isNewMiner(miner){
		return Object.values(collaborativeNode2Miner).indexOf(miner) === -1;
	}	
	var num = 0;

	times.forEach(function(time){
		if (time2CollaborativeMiners[time]['miners'].length > 1){
			var newNodesList=[];
			//addNewNode(blocksNodesList, time, "red");
			time2CollaborativeMiners[time]['miners'].forEach(function(miner){
				if (isNewMiner(miner)){
					collaborativeNode2Miner[num] = miner;
					miner2collaborativeNode[miner] = num;
					addNewNode(collaborativeNodes, 100, 100, num, 4, "black");
					addNewNode(blocksNodesList, num, 100, 100, 40, "red");
					// addLink(blocksEdgesList, time, num, "black");

					newNodesList.push(num);
					num++;
				}
				else{
					newNodesList.push(miner2collaborativeNode[miner]);
					// addLink(blocksEdgesList, time, miner2collaborativeNode[miner], "black");

				}

			})

			//Mettere i link
			generateAllCollaborativeLinks(newNodesList);
			// generateAllBlocksLinks(newNodesList);
		}
	});

	var height = collaborativeWithBlocksGraphVisulization.getSVGHeight();

	times.forEach(function(time){			
		if (time2CollaborativeMiners[time]['miners'].length > 1){
			collaborativeNode2Miner[num] = time;
			miner2collaborativeNode[time] = num;
			addNewNode(blocksNodesList, num, 100, height/2, 70, "green");
			time2CollaborativeMiners[time]['miners'].forEach(function(miner){
				addLink(blocksEdgesList, num, miner2collaborativeNode[miner], "black");
			});
			num++;
		}
	});

	drawAllCollaborativeLinks();

}


function initGraph(graphVisulization, nodes, links){
	graphVisulization.setNode2Miner(collaborativeNode2Miner);
	graphVisulization.setNodes(nodes);
	graphVisulization.setLinks(links);
	graphVisulization.redraw();
}

var collaborativeGraphVisulization;
var collaborativeWithBlocksGraphVisulization;
var forceValueGraphC = -100000;
var linkDistanceValueGraphC = 50;
var forceValueGraphCWB = -100000;
var linkDistanceValueGraphCWB = 50;
function createGraph(){
	createCollaborativeGraph();
	createCollaborativeWithBlocksGraphVisulization();
}

function createCollaborativeGraph(){
	collaborativeGraphVisulization = new GraphD3Visualization("#collaborativeGraph",forceValueGraphC,linkDistanceValueGraphC);
	collaborativeGraphVisulization.init();
}

function createCollaborativeWithBlocksGraphVisulization(){
	collaborativeWithBlocksGraphVisulization = new GraphD3Visualization("#collaborativeGraphWithBlocks",forceValueGraphCWB,linkDistanceValueGraphCWB);
	collaborativeWithBlocksGraphVisulization.init();	
	
}

function cleanGraph(graph){
	collaborativeNode2Miner={};
	miner2collaborativeNode={};
	collaborativeNodes=[];
	collaborativeLinks=[];
	time2CollaborativeMiners = {};
	times = [];
	edgesTotalMap = {};
	edgesList = [];
	blocksNodesList = [];
	blocksEdgesList = [];	


	//Clean D3Object
	graph.setNodes(collaborativeNodes);
	graph.setNode2Miner(collaborativeNode2Miner);
	graph.setLinks(collaborativeLinks);
	graph.redraw();
}

function changeCollaborativeGraph(){
	isCollaborativeGraphToChange = true;
	recallCollaborativeGraph();
}

function changeCollaborativeWithBlocksGraph(){
	isCollaborativeGraphToChange = false;
	recallCollaborativeGraph();
}

function recallCollaborativeGraph(){
	if (isCollaborativeGraphToChange)
		cleanGraph(collaborativeGraphVisulization);
	else
		cleanGraph(collaborativeWithBlocksGraphVisulization);

	getData();
}

function printLoading(){
	if (isCollaborativeGraphToChange){
		$('#loading1').css('display','block')
		$("#statistics-graph1").html("<p>/p>");
	} else {
		$('#loading2').css('display','block')
		$("#statistics-graph2").html("<p></p>");
	}
}

function printStatistics(){
	if (isCollaborativeGraphToChange){
		var statistics = "#Node: " + collaborativeNodes.length + "<br>" + "#Links: " + collaborativeLinks.length;
		$('#loading1').css('display','none')
		$("#statistics-graph1").html("<p>"+statistics+"</p>");
	} else {
		var statistics = "#Node: " + blocksNodesList.length + "<br>" + "#Links: " + blocksEdgesList.length;
		$('#loading2').css('display','none')
		$("#statistics-graph2").html("<p>"+statistics+"</p>");
	}
}

function setForceAndLinkDistanceGraphCollaborative(){
	forceValueGraphC = parseInt($('#inputForce').val());
	linkDistanceValueGraphC = parseInt($('#inputLinkDistance').val());
	$('#collaborativeGraph').children().remove();
	createCollaborativeGraph();
	changeCollaborativeGraph();
}

function setForceAndLinkDistanceGraphCWB(){
	forceValueGraphCWB = parseInt($('#inputForce2').val());
	linkDistanceValueGraphCWB = parseInt($('#inputLinkDistance2').val());
	$('#collaborativeGraphWithBlocks').children().remove();
	createCollaborativeWithBlocksGraphVisulization();
	changeCollaborativeWithBlocksGraph();
}