var GraphD3Visualization = function(div_name){

  var node2Miner = {};

  var width = 1024;
  var height = 768;
  var r = 4;

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

  var nodesList = []
  var nodes = null,
      links = [],
      node = null,
      link = null;


  this.getForce = function(){ return force;}

  // init svg
  var initSvg = function(){
    outer = d3.select(div_name)
      .append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        //.attr("transform", "translate(" + width / 4 + "," + height / 3 + ")")
        .attr("pointer-events", "all");

    outer.call(d3.behavior.zoom().scaleExtent([0, 1000]).on("zoom", rescale))
        .on("dblclick.zoom", null)

    outer.append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 3);
  }

  var addInteractionEvents = function(){
    vis = outer
      .append('svg:g')
      //.call(d3.behavior.zoom().scaleExtent([0, 1000]).on("zoom", rescale))
       // .on("dblclick.zoom", null)
      .append('svg:g')
        // .on("mousedown", removeSelected)
  }
  
  // var charge=-100000;
  // var linkDistance = 50;
  var linkDistance = 50;
  var charge=-100000;
  function removeSelected(){
    console.log("removeSelected");
    redraw();
  }

  var initLayout = function(){
    force = d3.layout.force()
        .size([width*=20, height*=20])
        .nodes(nodesList) 
        .linkDistance(linkDistance)
        .gravity(0.16)
        .charge(charge)
        .on("tick", tick);
  }

  var completeSVG = function(){
    nodes = force.nodes();
    links = force.links();
    node = vis.selectAll(".node");
    link = vis.selectAll(".link");
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
//per nodi circolari
    node.attr("cx", function(d) { return d.x = Math.max(r, Math.min(width - r, d.x)); })
    	.attr("cy", function(d) { 
        // if (d.color === "green") 
        //   return height/2;
        return d.y = Math.max(r, Math.min(height - r, d.y)); });
   // node.attr("cx", function(d) { return d.x; })
   //     .attr("cy", function(d) { return d.y; });
    
//per nodi quadrati
    /*
    node.attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; });
*/
    
  }

  function rescale() {
    console.log("zoom del grafo")
    vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    var trans=d3.event.translate;
    var scale=d3.event.scale;
   vis.attr("transform",
       "translate(" + trans + ")"
       + " scale(" + scale + ")");
  }

  function redraw(){
    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link")      
        .style("stroke", function(d) { return d.color; })
        .on("mousedown", 
          function(d) { 
            mousedown_link = d; 
            if (mousedown_link == selected_link) selected_link = null;
            else selected_link = mousedown_link; 
            selected_node = null; 
            console.log("selezionato l'arco (" + selected_link['source']['number'] + ", " + selected_link['target']['number'] + ")")

           // redraw(); 
          })

    link.exit().remove();

    link.classed("link_selected", function(d) { return d === selected_link; });


    node = node.data(nodes);
    node.enter().insert("circle")
        .attr("class", "node")
        .attr("r", function(d) { return d.size; })
        .style("fill", function(d) { return d.color; })
//        .attr("width", 10)
//        .attr("height", 10)
        .on("mousedown", function(d) { 
            // disable zoom
            // vis.call(d3.behavior.zoom().on("zoom"), null);

            mousedown_node = d;
            if (mousedown_node == selected_node) selected_node = null;
            else selected_node = mousedown_node;
            selected_link = null; 

            if (d.color === "green"){
              var date = new Date(parseInt(node2Miner[selected_node['number']] - 3600)*1000); //Creazione della data in GMT+00
              console.log("selezionata la minata del " + date.toLocaleString())
            }
            else 
              console.log("selezionato il nodo " + selected_node['number'] + " " + JSON.stringify(node2Miner[selected_node['number']]))

            //redraw(); 
          })
//        .on("mousedrag",
//          function(d) {
//        	
//          })
//        .on("mouseup", 
//          function(d) { 
//            
//          })
          .call(force.drag)
      .transition()
        .duration(750)
        .ease("elastic")

    node.exit().transition()
        .attr("r", 0)
      .remove();

    node
      .classed("node_selected", function(d) { return d === selected_node; });

    

    if (d3.event) {
      d3.event.preventDefault();
    }

  force.start();
  }


  this.setNodes = function(newNodes){
    nodes = newNodes;
    force.nodes(nodes);
  }

  this.setLinks = function(newLinks){
    links = newLinks;
    force.links(links);
  }

  this.getNodes = function(){
    return nodes;
  }

  this.init = function(){
    initSvg();
    addInteractionEvents();
    initLayout();
    completeSVG();
    redraw();
  }

  this.initLayout = function(){
	  initLayout();
  }
  
  this.redraw = function(){
    redraw();
  }

  this.setNode2Miner = function(dictionary){
    node2Miner = dictionary;
  }

  this.getSVGHeight = function(){
    return height;
  }


}