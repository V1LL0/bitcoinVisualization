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

function addNewNode(list, num, color){
	list.push({'number':num, 'x':100, 'y':100, 'size':4, 'color':color});
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


function getData(callback){
	printLoading()

	var collaborativeGraphCall = '/time2CollaborativeMiners';

	try{
		collaborativeGraphCall = '/time2CollaborativeMiners'
			+'?minTS='+$( "#slider-timeStampBlock" ).slider( "option", "values" )[0]
		+'&maxTS='+$( "#slider-timeStampBlock" ).slider( "option", "values" )[1]
		+'&minMiningCount='+$( "#slider-miningCountAddress" ).slider( "option", "values" )[0]
		+'&maxMiningCount='+$( "#slider-miningCountAddress" ).slider( "option", "values" )[1]
		+'&minMinersInBlock='+$( "#slider-minersCountInBlock" ).slider( "option", "values" )[0]
		+'&maxMinersInBlock='+$( "#slider-minersCountInBlock" ).slider( "option", "values" )[1];
	}catch(err){
		collaborativeGraphCall = '/time2CollaborativeMiners';
	}
	callGet(collaborativeGraphCall, function(data){
		time2CollaborativeMiners = getJSONFromString(data);
		times = Object.keys(time2CollaborativeMiners);

		setLists();

		console.log(blocksEdgesList[0]);
		// initGraph(collaborativeGraphVisulization, collaborativeNodes, collaborativeLinks);
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
					addNewNode(collaborativeNodes, num, "black");
					addNewNode(blocksNodesList, num, "green");
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

	times.forEach(function(time){
		addNewNode(blocksNodesList, num, "red");
		
		if (time2CollaborativeMiners[time]['miners'].length > 1){
			time2CollaborativeMiners[time]['miners'].forEach(function(miner){
				console.log(num);
				console.log(miner2collaborativeNode[miner]);
				addLink(blocksEdgesList, num, miner2collaborativeNode[miner], "black");
			});
		}
		num++;



	});

	console.log("miner2collaborativeNode: ");
	console.log(miner2collaborativeNode);
	
	console.log("blocksEdgesList: ");
	console.log(blocksEdgesList);



	drawAllCollaborativeLinks();

	

}


function initGraph(graphVisulization, nodes, links){
	

	//console.log(num)

	graphVisulization.setNode2Miner(collaborativeNode2Miner);
	graphVisulization.setNodes(nodes);
	console.log(links)
	graphVisulization.setLinks(links);
	graphVisulization.redraw();
}


/******DA ELIMINARE*********/
// function initCollaborativeWithBlocksGraph(){
// 	times.forEach(function(time){
// 		addNewCollaborativeNode(num, "black");
// 	});
// }

/*var graphVisulization = new GraphD3Visualization("#visualization");
graphVisulization.init();
initGraphNodes(graphVisulization);*/

var collaborativeGraphVisulization;
var collaborativeWithBlocksGraphVisulization;
function createGraph(){
	collaborativeGraphVisulization = new GraphD3Visualization("#collaborativeGraph");
	collaborativeWithBlocksGraphVisulization = new GraphD3Visualization("#collaborativeGraphWithBlocks");
	
	collaborativeGraphVisulization.init();
	collaborativeWithBlocksGraphVisulization.init();	
	getData();
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

function recallCollaborativeGraph(){
	cleanGraph(collaborativeGraphVisulization);
	cleanGraph(collaborativeWithBlocksGraphVisulization);

	getData();
}

function printStatistics(){
	var statistics = "#Node: " + collaborativeNodes.length + "<br>" +
		"#Links: " + collaborativeLinks.length;
	$("#statistics").html("<p>"+statistics+"</p>");
}

function printLoading(){
	$("#statistics").html("<p>Loading...</p>");
}
