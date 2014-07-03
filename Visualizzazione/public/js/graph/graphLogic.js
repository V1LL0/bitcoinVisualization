var node2Miner = {}
var node2Miner_inverted = {}
var nodesList = []
var nodes = null,
    links = [],
    node = null,
    link = null;


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


function rgb2Hex(r,g,b){
 return "#" +
  ("0" + parseInt(r,10).toString(16)).slice(-2) +
  ("0" + parseInt(g,10).toString(16)).slice(-2) +
  ("0" + parseInt(b,10).toString(16)).slice(-2);
}

function calculateColor(miningCount){
  var r = 0;
  var g = 0;
  var maxMiningCount = 50;
  if (miningCount >= maxMiningCount) return '#f00';
  var colorPercentage = miningCount/maxMiningCount;

  r = colorPercentage * 255;
  g = (1 - colorPercentage) * 255;

  return rgb2Hex(r,g,0)
}

function initNodes(){
  callGet('/minersList', function(data){
    json = getJSONFromString(data)
    node2Miner = json
    Object.keys(json).forEach(function(num){
      var color = calculateColor(json[num]['miningCount']);
      nodes.push({'number':num, 'x':100, 'y':100, 'color':color});
      node2Miner_inverted[ node2Miner[num]] = num;
    });
    redraw();
    initLinks();
  });
}

function addLink(source, target){
    var link = {"source": parseInt(source), "target": parseInt(target)};
    links.push(link);
}

function initLinks(){
  

  callGet('/minersInteractionsList', function(data){
    json = getJSONFromString(data);
//    console.log("json\n"+json);
    hash_keys = Object.keys(json);
    hash_keys.forEach(function(hash_pay){
      hash_credit_list = json[hash_pay]
      hash_credit_list.forEach(function(hash_credit){
        addLink(node2Miner_inverted[hash_pay], node2Miner_inverted[hash_credit]);
      });
    })
 
//    console.log("links:\n"+links);
    redraw();
  });

}






initNodes();
initSvg();
addInteractionEvents();
initLayout();
completeSVG();

redraw();
// initLinks();