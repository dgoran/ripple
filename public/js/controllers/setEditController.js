RIPPLE.namespace('set');
// Set up session components
RIPPLE.set.controller = new SetEditController();
RIPPLE.activeController = "set";

function SetEditController(){
	var that = this
		, UTIL = new Util()
		, popoverOpen = false
		, popoverID = ""
		, setQID = []
		, addPosition = ""
		, positionRef = ""
		, popovers = $('#btn-question-choice, .btn-add-prepend, .btn-add-append');

  // console.log(RIPPLE);
  // console.log(GLOBALS.questionTypes);
  var initialParams = {
    qNumTotal:0,
    editpkID:null
  }
  var params = GLOBALS.cloneObj( initialParams );
  // Expose function to set and get params
  this.params = function(param, value, option){
    var that = this;
    
    var get = function(){
      // console.log("Params ["+param+"] get :: ",params[param])
      return params[param];
    }
    var set = function(){
      // console.log("Params ["+param+"] set :: ",value)
      params[param] = value;
    }

    if(typeof value !== 'undefined') set()
    else return get();
  };

	/**
	 * Add a new question of type defined in params
	 * @param {string} qType [The question type to create]
	 * @param {jQuery element} jElem [The element to add html to]
	 */
	this.addNewQuestion = function(qType, jElem, position, callback){
		//console.log("Elem: ", jElem);
		//console.log("qType: ", qType);
		//console.log("Position", position);
		
		var that = this
      , postData = 'process=new-question&qType='+qType
      , UID = UTIL.createAlphaNumeric(6)
      , outputHTML = "";
		
		UTIL.postData(document.URL, postData)
      .success(function(json){
      	console.log(UID + "-" + json.returnData);
        $('#' + UID).html(outputHTML).prop('id',json.returnData);
			  callback(json.returnData);
      });

		// Add Container 
		outputOptions = "<form id='" + UID + "' class='well question-set-section'><img src='/img/loader.gif'/></form>";

		switch(position){
			case 'append':
				jElem.append(outputOptions);
				break;
			case 'prepend':
				jElem.prepend(outputOptions);
				break;
			case 'before':
				jElem.before(outputOptions);
				break;
			case 'after':
				jElem.after(outputOptions);
				break;				
			default:
				jElem.append(outputOptions);
		}

		//Create Question Info;
		outputHTML = that.newQuestionDisplay(qType);
	}

  this.newQuestionDisplay = function(qType, qTxt, qOptions){
    // console.log("newQuestionDisplay args :: ", arguments)
    
    // Check for properties
    var hasType = GLOBALS.questionTypes.hasOwnProperty(qType);
    if(!hasType) qType = 'open-response';

		params.qNumTotal++;
		var outputOptions = ""
      , qTypeTitle = GLOBALS.questionTypes[qType].title || ""
			, qIcon = GLOBALS.questionTypes[qType].icon || ""
			, qIconTxt = GLOBALS.questionTypes[qType].iconTxt || ""
			, qTxt = (qTxt) ? qTxt : ""
			, qTxtlabel = (qTxt) ? qTxt : "Write question here...";
		
    // Adjust for Unknown Question Types
    if( !hasType ) {
      qIcon = "";
      qIconTxt = "???"
      qTypeTitle = "???"
    }

		// Add Controls
		outputOptions += that.createAddButton("prepend", params.qNumTotal);
		outputOptions += "<button class='remove-question-wrap show-focus' rel='tooltip' data-placement='left' title='Remove Question' tabindex='0'><i class='icon icon-remove icon-large'></i><span class='accessibility-label'>Remove Question</span></button>"
		
		// Icon
		outputOptions += "<div class='question-icon'><i class='icon " + qIcon + " icon-large'>" + qIconTxt + "</i></div>";
		outputOptions += "<a class='sort-icon icon-white btn btn-inverse show-focus clickevent' rel='tooltip' data-placement='right' title='Drag to Reorder' tabindex='0'><i class='icon icon-sort icon-large'></i><span class='accessibility-label'>Sort button</span></a>";

		// Question Box
    outputOptions += "<div class='question-core'>"
		outputOptions += "<div class='row start-question-content'><div class='span1'></div><div class='span10'>";
		outputOptions += "<label for='qTxt" + params.qNumTotal + "' class='pull-left label-highlight question-label'>Q? - " + qTypeTitle + " </label>";
		outputOptions += "<div>";
    outputOptions += "<a href='#' id='qTxt" + params.qNumTotal + "' class='editable' data-name='qTxt' data-type='wysihtml5' data-emptytext='Write question here...'>"+ qTxt + "</a>";
		// outputOptions += "<span class='span10 qTxtLabel show-focus' data-type='editable' data-for='#qTxt" + params.qNumTotal + "' tabindex='0'>" + qTxtlabel + "</span>";
 	  // 	outputOptions += "<input type='text' id='qTxt" + params.qNumTotal + "' class='question-text' data-dbKey='qTxt' value='" + qTxt + "' tabindex='0'/>";
		outputOptions += "</div>";
		outputOptions += "</div><div class='span1'></div></div>";

    // Check for Class, Methods, & Params
    var passCheck = RIPPLE.checkClass(qType); 
    if( passCheck ) {
      // Add qOptions if function is available
      var hasOptions = RIPPLE.questionType[qType].hasOwnProperty("displaySetEditFn");
      if( hasOptions ) {
        outputOptions += "<hr />";
        outputOptions += RIPPLE.questionType[qType].displaySetEditFn(qTxt, qOptions);
      }
    }

    // Close Question Core Div
    outputOptions += "</div><!-- End .question-core -->";
    
		// Add Controls
		outputOptions += that.createAddButton("append", params.qNumTotal);

		return outputOptions;
  };

  this.createAddButton = function(type, count){
    var html = ""
      , panelPosition, placement;
    // Set default type
    type = type || "append";

    switch(type){
      case "prepend":
        panelPositon = "before";
        placement = "Above";
        break;
      case "append":
        panelPosition = "after";
        placement = "Below";
        break;
    }
    var btnTitle = "Add New Question " + placement
      , btnClasses = "btn-add-" + type + " btn-add-question icon icon-signin icon-large pull-right show-focus"
      , popoverData = "data-placement='left'"
      , tooltip = "rel='tooltip' title='" + btnTitle + "'";
    
    html += "<button id='add-" + type + "-" + count + "' class='" + btnClasses + "' " + popoverData + " data-panel-position='" + panelPosition + "' tabindex='0' " + tooltip + ">";
    html += "<span class='accessibility-label'>" + btnTitle + "</span></button>";
    return html
  }

  this.saveQuestionData = function(elem){
  	//console.log('SC.saveQuestionData', $(elem));
  	// Make sure that the elem has a value
  	if( !elem || elem.val() === "")	return false;

  	// Create data object
		var data = {};
		// Get Question ID from Form ID
		var pk = $(elem).closest('form').prop('id');
		data["pk"] = pk;

		// Data for Question Options
		data['value'] = encodeURIComponent( elem.val() );
    data['name'] = encodeURIComponent( $(elem).attr('data-name') );

		// Postback Routing
  	data.process = "update-question";
  	// Turn Object into serialized string
  	console.log("postData",data);

  	data = $.param(data);
  	// Postback Data
  	UTIL.postData(document.URL, data);
  };

  this.saveSetData = function(elem){
    console.log('SC.saveSetData', $(elem));
    // Make sure that the elem has a value
    if( !elem || elem.val() === "") return false;

    // // Create data object
    var data = {};
    // Get Question ID from Form ID
    var qSetID = $("#qSetID").val();
    data["qSetID"] = qSetID;
    //console.log("qID",qID)
    // Get the dbKey
    var dbKey = $(elem).attr('data-dbKey');
    data[dbKey] = elem.val().toString();

    // Postback Routing
    data.process = "update-set";
    // Turn Object into serialized string
    console.log("postData",data);

    data = $.param(data);
    // Postback Data
    UTIL.postData(document.URL, data);
  };

  this.displayPrevQuestion = function(qData, callback){
  	// console.log("displayPrevQuestion qData:", qData);
  	// console.log("displayPrevQuestion: qTxt", qData['qTxt'] );
  	// console.log("displayPrevQuestion: qOptions",qData["qOptions"] );
  	qContent = that.newQuestionDisplay( qData['type'], qData['qTxt'], qData["qOptions"] );
    if( !qContent ) return false;
		qContent = "<form id='" + qData['_id'] + "' class='well question-set-section'>" + qContent + "</form>";
		$('#questions').append( qContent );
		callback;
  };

  this.deleteQuestion = function(qID, qSetID, callback){
  	console.log("Delete This", qID);
  	console.log("qSetID This", qSetID);
  	var data = {};
  	data.process = 'remove-question';
  	data.qID = qID;
  	data.qSetID = qSetID;

  	// Convert to serialized string
  	data = $.param(data);

  	//Postback Data
  	UTIL.postData(document.URL, data);

  	callback;
  };

  this.updateOrder = function(qSetID, qOrderArr){
    console.log("qSetID", qSetID);
    console.log("qOrderArrqOrderArr", qOrderArr);

    var data = {};
    data.process = 'update-order';
    data.qSetID = qSetID;
    data.qOrderArr = qOrderArr;

    // Convert to serialized string
    data = $.param(data);

    //Postback Data
    UTIL.postData(document.URL, data);
  };

  this.removeSet = function(qSetID, callback){
  	var data ={};
  	data.process = 'remove-set';
  	data.qSetID = qSetID;
  	UTIL.postData(document.URL, data)
  		.success(function(json){
      	if( json.success === "1") callback();
      	else $.jGrowl('Error Deleting Set :: ' + jqXHR.message);
      });;
  };
}