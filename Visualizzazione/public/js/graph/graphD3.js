var GraphD3Visualization = function(div_name){

  var node2Miner = {}

  var width = 1024
  var height = 768
  //var fill = d3.scale.category20()

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
        .attr("pointer-events", "all");
  }

  var addInteractionEvents = function(){
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

  var initLayout = function(){
    // init force layout
    force = d3.layout.force()
        .size([width, height])
        // .nodes([{x:100, y:100},{x:100,y:100},{x:100,y:100},{x:100,y:100},{x:100,y:100}]) // initialize with a single node
        .nodes(nodesList) // initialize with a single node
        .linkDistance(50)
        .charge(-200)
        .on("tick", tick);
  }

  var completeSVG = function(){
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
            redraw(); 
          })

    link.exit().remove();

    link.classed("link_selected", function(d) { return d === selected_link; });

    node = node.data(nodes);
    node.enter().insert("circle")
        .attr("class", "node")
        .attr("r", function(d) { return d.size; })
        .on("mousedown", function(d) { 
            // disable zoom
            vis.call(d3.behavior.zoom().on("zoom"), null);

            mousedown_node = d;
            if (mousedown_node == selected_node) selected_node = null;
            else selected_node = mousedown_node; 
            selected_link = null; 

            console.log("selezionato il nodo " + selected_node['number'] + " " + JSON.stringify(node2Miner[selected_node['number']]))

            // reposition drag line
            // drag_line
            //     .attr("class", "link")
            //     .attr("x1", mousedown_node.x)
            //     .attr("y1", mousedown_node.y)
            //     .attr("x2", mousedown_node.x)
            //     .attr("y2", mousedown_node.y);

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
        //.attr("r", 6.5);

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

  this.redraw = function(){
    redraw();
  }

  this.setNode2Miner = function(dictionary){
    node2Miner = dictionary;
  }

}









