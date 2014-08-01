var width = 1024
var height = 768

var node2Miner = {}
var node2Miner_inverted = {}
var nodes = []


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


//Caricamento dei nodi dal server
function initNodes(){
  callGet('/minersList', function(data){
    var json = getJSONFromString(data);
    node2Miner = json;
    Object.keys(json).forEach(function(key){
      var miner_obj = json[key];
      var mining_count = miner_obj['miningCount'];
      //Da impostare il colore

      nodes.push({'num':key, 'x':100, 'y':100, 'color':'red'});
      node2Miner_inverted[ node2Miner[key]] = key;
    });
    
    redraw();
  	//initLinks();
  });
}

function initSVG(){
	var svg = d3.select("#visualization")
					   .append("svg")
					   .attr("width", width)
					   .attr("height", height);
}


function redraw() {

  //link = link.data(links);

  // link.enter().insert("line", ".node")
  //     .attr("class", "link")
  //     .on("mousedown", 
  //       function(d) { 
  //         mousedown_link = d; 
  //         if (mousedown_link == selected_link) selected_link = null;
  //         else selected_link = mousedown_link; 
  //         selected_node = null; 
  //         redraw(); 
  //       })

  // link.exit().remove();

  // link.classed("link_selected", function(d) { return d === selected_link; });

  node = node.data(node2Miner);

  // node.enter().insert("circle")
  //     .attr("class", "node")
  //     .attr("r", 5)
  //     .on("mousedown", function(d) { 
  //         // disable zoom
  //         vis.call(d3.behavior.zoom().on("zoom"), null);

  //         mousedown_node = d;
  //         if (mousedown_node == selected_node) selected_node = null;
  //         else selected_node = mousedown_node; 
  //         selected_link = null; 

  //         console.log("selezionato il nodo " + selected_node['number'])

  //         // reposition drag line
  //         drag_line
  //             .attr("class", "link")
  //             .attr("x1", mousedown_node.x)
  //             .attr("y1", mousedown_node.y)
  //             .attr("x2", mousedown_node.x)
  //             .attr("y2", mousedown_node.y);

  //         redraw(); 
  //       })
  //     .on("mousedrag",
  //       function(d) {
  //         // redraw();
  //       })
  //     .on("mouseup", 
  //       function(d) { 
  //         if (mousedown_node) {
  //           mouseup_node = d; 
  //           if (mouseup_node == mousedown_node) { resetMouseVars(); return; }

  //           // add link
  //           var link = {source: mousedown_node, target: mouseup_node};
  //           links.push(link);

  //           // select new link
  //           selected_link = link;
  //           selected_node = null;

  //           // enable zoom
  //           vis.call(d3.behavior.zoom().on("zoom"), rescale);
  //           redraw();
  //         } 
  //       })
  //   .transition()
  //     .duration(750)
  //     .ease("elastic")
  //     .attr("r", 6.5);

  // node.exit().transition()
  //     .attr("r", 0)
  //   .remove();

  // node
  //   .classed("node_selected", function(d) { return d === selected_node; });

  

  if (d3.event) {
    // prevent browser's default behavior
    d3.event.preventDefault();
  }

  force.start();

}





initSVG();
initNodes();