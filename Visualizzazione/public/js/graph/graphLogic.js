var node2Miner = {}
var node2Miner_inverted = {}
var nodes = [],
links = [];


Object.values = function(obj){
	var keys = Object.keys(obj);
	var values = [];
	keys.forEach(function(key){
		values.push(obj[key]);
	})
	return values;
}


/** Grafo delle interazioni **/

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


function calculateSize(miningCount){
	var size = 0;
	var maxMiningCount = 70;
	var maxSize = 15;
	if (miningCount >= maxMiningCount) return maxSize;
	size = 1 + (miningCount/maxSize) * (maxSize-1);
	return size;
}


function initGraphNodes(graphVisulization){
	callGet('/minersList', function(data){
		json = getJSONFromString(data)
		node2Miner = json
		Object.keys(json).forEach(function(num){
			var size = calculateSize(json[num]['miningCount']);
			nodes.push({'number':num, 'x':100, 'y':100, 'size':size});
			node2Miner_inverted[ node2Miner[num]] = num;
		});
		graphVisulization.setNode2Miner(node2Miner);
		graphVisulization.setNodes(nodes);
		graphVisulization.redraw();
		initGraphLinks();
	});
}

function rgb2Hex(r,g,b){
	return "#" +
	("0" + parseInt(r,10).toString(16)).slice(-2) +
	("0" + parseInt(g,10).toString(16)).slice(-2) +
	("0" + parseInt(b,10).toString(16)).slice(-2);
}

function calculateColor(transactionCount){
//	var color = 0;
	// var lightestColorValue = 220;
	var r = 0;
	var g = 0;
	var maxTransactionCount = 100;
	if (transactionCount >= maxTransactionCount) return rgb2Hex(0,60,255);
	var r_lightest = 120;
	var g_lightest = 143;
	// color = lightestColorValue + (transactionCount/maxTransactionCount) * (255-lightestColorValue);
	r = 50 + r_lightest - transactionCount/maxTransactionCount * r_lightest;
	g = 100 + (g_lightest - transactionCount/maxTransactionCount * g_lightest);
	return rgb2Hex(r,g,255);
}

function addLink(source, target, txCount){
	//var color = calculateColor();
	var color = calculateColor(txCount);
	var link = {"source": parseInt(source), "target": parseInt(target), "color":color};
	links.push(link);
}

function initGraphLinks(){


	callGet('/minersInteractionsList', function(data){
		json = getJSONFromString(data);
//		console.log("json\n"+json);
		hash_keys = Object.keys(json);
		hash_keys.forEach(function(hash_pay){
			hash_credit_list = json[hash_pay]
			hash_credit_list.forEach(function(hash_credit){
				addLink(node2Miner_inverted[hash_pay], node2Miner_inverted[hash_credit]);
			});
		})

		addLink(5,2,100);
		addLink(5,1,1);
		addLink(1,2,50);

//		console.log("links:\n"+links);
		graphVisulization.setLinks(links);
		graphVisulization.redraw();
	});
}

/** Collaborative Graph **/

var collaborativeNode2Miner = {};
var miner2collaborativeNode = {};
var collaborativeNodes = [];
var collaborativeLinks = [];



function addNewCollaborativeNode(num){
	collaborativeNodes.push({'number':num, 'x':100, 'y':100, 'size':5});
}

function generateAllCollaborativeLinks(newNodes){

	function addCollaborativeLink(source, target, color){
		//var color = calculateColor();
//		var color = calculateColor(txCount);
		var link = {"source": parseInt(source), "target": parseInt(target), "color":color};
		collaborativeLinks.push(link);
	}


	for(var i=0; i<newNodes.length; i++){
		for(var j=i+1; j<newNodes.length; j++){
			addCollaborativeLink(newNodes[i], newNodes[j], "red")
		}
	}

}


function initCollaborativeGraph(graphVisulization){
	function isNewMiner(miner){
		return Object.values(collaborativeNode2Miner).indexOf(miner) === -1;
	}

	var num = 0;
	var collaborativeGraphCall = '/time2CollaborativeMiners';

	try{
		collaborativeGraphCall = '/time2CollaborativeMiners'+'?min='+$( "#slider-range" ).slider( "option", "values" )[0]+'&max='+$( "#slider-range" ).slider( "option", "values" )[1];
	}catch(err){
		collaborativeGraphCall = '/time2CollaborativeMiners';
	}
	callGet(collaborativeGraphCall, function(data){
		json = getJSONFromString(data);
		times = Object.keys(json);
		times.forEach(function(time){
			if (json[time]['miners'].length > 1){
				var newNodesList=[];

				json[time]['miners'].forEach(function(miner){
					if (isNewMiner(miner)){
						collaborativeNode2Miner[num] = miner;
						miner2collaborativeNode[miner] = num;
						addNewCollaborativeNode(num);
						newNodesList.push(num);
						num++;
					}
					else{
						newNodesList.push(miner2collaborativeNode[miner]);
					}
				})

				//Mettere i link
				generateAllCollaborativeLinks(newNodesList);


			}


		});
		console.log(num)
		graphVisulization.setNode2Miner(collaborativeNode2Miner);
		graphVisulization.setNodes(collaborativeNodes);
		graphVisulization.setLinks(collaborativeLinks);
		graphVisulization.redraw();
	});
}



/*var graphVisulization = new GraphD3Visualization("#visualization");
graphVisulization.init();
initGraphNodes(graphVisulization);*/

var collaborativeGraphVisulization = new GraphD3Visualization("#collaborativeGraph");
collaborativeGraphVisulization.init();
initCollaborativeGraph(collaborativeGraphVisulization);




function recallCollaborativeGraph(){
	collaborativeNode2Miner={};
	miner2collaborativeNode={};
	collaborativeNodes=[];
	collaborativeLinks=[];
	
	collaborativeGraphVisulization.setNodes(collaborativeNodes);
	collaborativeGraphVisulization.setNode2Miner(collaborativeNode2Miner);
	collaborativeGraphVisulization.setLinks(collaborativeLinks);
	
	
	collaborativeGraphVisulization.redraw();
	
	initCollaborativeGraph(collaborativeGraphVisulization);

}


