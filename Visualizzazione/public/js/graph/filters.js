var timestamp_min, timestamp_max, 
    mining_count_min, mining_count_max, 
    miners_in_block_min, miners_in_block_max,
    collaborations;


function getValuesFromCacheAndThenStart(){
  callGet("/getSlidersValues", function(data){
      //Return "value1 value2 ... valueN"
      array_values = data.split(" ");
      timestamp_min = parseInt(array_values[0]);
      timestamp_max = parseInt(array_values[1]);
      mining_count_min = parseInt(array_values[2]);
      mining_count_max = parseInt(array_values[3]);
      miners_in_block_min = parseInt(array_values[4]);
      miners_in_block_max = parseInt(array_values[5]);
      collaborations = parseInt(array_values[6]);

      renderSliders();
      createGraph();
  });
}


function renderSliders(){
/* Slider for Time Stamp Blocco*/
  $(function() {
    $( "#slider-timeStampBlock" ).slider({
      step: 2678400,
      range: true,
      min: 1263969665,
      max: 1405344382,
      //values: [ 1293002065, 1303969665 ],
      values: [ timestamp_min, timestamp_max ],
      slide: function( event, ui ) {
		    var date1 = new Date(parseInt(ui.values[ 0 ])*1000);
        var date2 = new Date(parseInt(ui.values[ 1 ])*1000);
		
        $( "#timeStampBlock" ).val( date1.getDate()+"/"+(date1.getMonth()+1)+"/"+date1.getFullYear()+"  -  "+date2.getDate()+"/"+(date2.getMonth()+1)+"/"+date2.getFullYear() );
      }
    /* ,

	  change: function(){
		  	recallCollaborativeGraph();
	  }
 */    
    });
      var date1 = new Date($( "#slider-timeStampBlock" ).slider( "values", 0 )*1000);
	  var date2 = new Date($( "#slider-timeStampBlock" ).slider( "values", 1 )*1000);
		

	  
    $( "#timeStampBlock" ).val(date1.getDate()+"/"+(date1.getMonth()+1)+"/"+date1.getFullYear()+"  -  "+date2.getDate()+"/"+(date2.getMonth()+1)+"/"+date2.getFullYear());
  });



  /* Slider for Mining Count Address*/
  $(function() {
    $( "#slider-miningCountAddress" ).slider({
      step: 1,
      range: true,
      min: 0,
      max: 1000,
      // values: [ 30, 100 ],
      values: [ mining_count_min, mining_count_max ],
      slide: function( event, ui ) {
        $( "#miningCountAddress" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }/* ,

	  change: function(){
		  	recallCollaborativeGraph();
	  }
 */    
    });
    $( "#miningCountAddress" ).val( $( "#slider-miningCountAddress" ).slider( "values", 0 ) +
      " - " + $( "#slider-miningCountAddress" ).slider( "values", 1 ) );
  });


  /* Slider for Miners Count In Block*/
  $(function() {
    $( "#slider-minersCountInBlock" ).slider({
      step: 1,
      range: true,
      min: 0,
      max: 1000,
      // values: [ 30, 100 ],
      values: [ miners_in_block_min, miners_in_block_max ],
      slide: function( event, ui ) {
        $( "#minersCountInBlock" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }/* ,
	  change: function(){
		  	recallCollaborativeGraph();
	  }
 */    
    });
    $( "#minersCountInBlock" ).val( $( "#slider-minersCountInBlock" ).slider( "values", 0 ) +
      " - " + $( "#slider-minersCountInBlock" ).slider( "values", 1 ) );
  });

  /* Slider for # Collaborations */
  $(function() {
	    $( "#slider-minerCollaborations" ).slider({
	      step: 1,
	      min: 1,
	      max: 1500,
        // value: 2,
	      value: collaborations,
	      slide: function( event, ui ) {
	        $( "#minerCollaborations" ).val( ui.value );
	      }/* ,

		  change: function(){
			  	recallCollaborativeGraph();
		  }
	 */    
	    });
	    $( "#minerCollaborations" ).val( $( "#slider-minerCollaborations" ).slider( "value" ) );
	  });
}


getValuesFromCacheAndThenStart();