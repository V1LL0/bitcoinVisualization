var width = 2024
var height = 800
var fill = d3.scale.category20()

var node2Miner = {}
var node2Miner_inverted = {}
var nodesList = []
var MINER_NUM = 50

/** Funzioni **/
function startD3JS(){
  redraw();
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

function initNodes(){
  callGet('/minerList', function(data){
    json = getJSONFromString(data)
    //console.log(json)
    node2Miner = json
    Object.keys(json).forEach(function(num){
      nodes.push({'number':num, 'x':100, 'y':100})
      node2Miner_inverted[ node2Miner[num]] = num
    });
    console.log(nodes)
    // startD3JS();
    //initLinks();
  });
}

function addLink(source, target){
    var link = {"source": parseInt(source), "target": parseInt(target)};
    links.push(link);
}

function initLinks(){
  

  callGet('/minerInteractionsList', function(data){
    json = getJSONFromString(data);
    console.log(json)
    hash_keys = Object.keys(json);
    hash_keys.forEach(function(hash_pay){
      hash_credit_list = json[hash_pay]
      hash_credit_list.forEach(function(hash_credit){
        console.log("addLink(" + node2Miner_inverted[hash_pay] + ", " + node2Miner_inverted[hash_credit] + ")")
        addLink(node2Miner_inverted[hash_pay], node2Miner_inverted[hash_credit]);
        startD3JS();
      });
    })
    // addLink(19, 30);
    console.log(links);
    // startD3JS();
  });

}




/** Fine **/


// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

var outer = null;
var vis = null;
var force = null;
var drag_line = null;
var nodes = null,
    links = [],
    node = null,
    link = null;

// init svg
function initSvg(){
  outer = d3.select("#visualization")
    .append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .attr("pointer-events", "all");
}

function addInteractionEvents(){
  vis = outer
    .append('svg:g')
      .call(d3.behavior.zoom().on("zoom", rescale))
      .on("dblclick.zoom", null)
    .append('svg:g')
      //.on("mousemove", mousemove)
      .on("mousedown", mousedown)
      //.on("mouseup", mouseup);

  vis.append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white');
}


function initLayout(){
  // init force layout
  force = d3.layout.force()
      .size([width, height])
      // .nodes([{x:100, y:100},{x:100,y:100},{x:100,y:100},{x:100,y:100},{x:100,y:100}]) // initialize with a single node
      .nodes(nodesList) // initialize with a single node
      .linkDistance(50)
      .charge(-200)
      .on("tick", tick);
}


function completeSVG(){
// line displayed when dragging new nodes
  drag_line = vis.append("line")
      .attr("class", "drag_line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0);

  // get layout properties
  nodes = force.nodes();
  links = force.links();
  node = vis.selectAll(".node");
  link = vis.selectAll(".link");

  // // add keyboard callback
  // d3.select(window)
  //     .on("keydown", keydown);
}

function mousedown() {
  if (!mousedown_node && !mousedown_link) {
    // allow panning if nothing is selected
    vis.call(d3.behavior.zoom().on("zoom"), rescale);
    return;
  }
}

function mousemove() {
  if (!mousedown_node) return;

  // update drag line
  drag_line
      .attr("x1", mousedown_node.x)
      .attr("y1", mousedown_node.y)
      .attr("x2", d3.svg.mouse(this)[0])
      .attr("y2", d3.svg.mouse(this)[1]);

}

function mouseup() {
  // if (mousedown_node) {
  //   //// hide drag line
  //   drag_line
  //     .attr("class", "drag_line_hidden")

  //   if (!mouseup_node) {
  //     // add node
  //     var point = d3.mouse(this),
  //       node = {x: point[0], y: point[1]},
  //       n = nodes.push(node);

  //     // select new node
  //     selected_node = node;
  //     selected_link = null;
      
  //     // add link to mousedown node
  //     links.push({source: mousedown_node, target: node});
  //   }

  //   redraw();
  // }
  // // clear mouse event vars
  // resetMouseVars();
}

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// rescale g
function rescale() {
  console.log("zoom del grafo")
  trans=d3.event.translate;
  scale=d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

// redraw force layout
function redraw() {

  link = link.data(links);

  link.enter().insert("line", ".node")
      .attr("class", "link")
      .on("mousedown", 
        function(d) { 
          mousedown_link = d; 
          if (mousedown_link == selected_link) selected_link = null;
          else selected_link = mousedown_link; 
          selected_node = null; 
          redraw(); 
        })

  link.exit().remove();

  link.classed("link_selected", function(d) { return d === selected_link; });

  node = node.data(nodes);

  node.enter().insert("circle")
      .attr("class", "node")
      .attr("r", 5)
      .on("mousedown", function(d) { 
          // disable zoom
          vis.call(d3.behavior.zoom().on("zoom"), null);

          mousedown_node = d;
          if (mousedown_node == selected_node) selected_node = null;
          else selected_node = mousedown_node; 
          selected_link = null; 

          console.log("selezionato il nodo " + selected_node['number'])

          // reposition drag line
          drag_line
              .attr("class", "link")
              .attr("x1", mousedown_node.x)
              .attr("y1", mousedown_node.y)
              .attr("x2", mousedown_node.x)
              .attr("y2", mousedown_node.y);

          redraw(); 
        })
      .on("mousedrag",
        function(d) {
          // redraw();
        })
      .on("mouseup", 
        function(d) { 
          if (mousedown_node) {
            mouseup_node = d; 
            if (mouseup_node == mousedown_node) { resetMouseVars(); return; }

            // add link
            var link = {source: mousedown_node, target: mouseup_node};
            links.push(link);

            // select new link
            selected_link = link;
            selected_node = null;

            // enable zoom
            vis.call(d3.behavior.zoom().on("zoom"), rescale);
            redraw();
          } 
        })
    .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

  node.exit().transition()
      .attr("r", 0)
    .remove();

  node
    .classed("node_selected", function(d) { return d === selected_node; });

  

  if (d3.event) {
    // prevent browser's default behavior
    d3.event.preventDefault();
  }

  force.start();

}

function spliceLinksForNode(node) {
  toSplice = links.filter(
    function(l) { 
      return (l.source === node) || (l.target === node); });
  toSplice.map(
    function(l) {
      links.splice(links.indexOf(l), 1); });
}

function keydown() {
  if (!selected_node && !selected_link) return;
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: { // delete
      if (selected_node) {
        // nodes.splice(nodes.indexOf(selected_node), 1);
        // spliceLinksForNode(selected_node);
      }
      else if (selected_link) {
        // links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      redraw();
      break;
    }
  }
}



initNodes();
initSvg();
addInteractionEvents();
initLayout();
completeSVG();

redraw();
initLinks();