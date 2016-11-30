
/*
ARCTOI UI
--------
File includes code to create dynamic ui -elements and
various ui actions

*/

var surveyor = new Surveyor();
setAxisReadOrder();
currentSettings();

$(function() {

    // Select file -field stylizer
    // We can attach the `fileselect` event to all file inputs on the page
    $(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
    });

    // We can watch for our custom `fileselect` event like this
    $(document).ready( function() {
        /*
        ==========================================================================
        Input-Output
        */
        $('body').on('click', '#arctoi-dropdown a', function() {
        //$( "a" ).click(function() {
          var astr = $(this).text();
          //console.log($(this).attr('id') + " - " + astr);
          var mc = $(this).attr('id').split(";");
          console.log(mc);
          if (mc[0] === 'arctoi-clear-all') {
              surveyor.clear();
              points.clearLayers();
          } else {
              surveyor.runModuleCommand(mc[0],mc[1]);
          }
        });

        $( "#actoi-input-button" ).click(function() {
          fileInput();
        });

        $( "#actoi-output-button" ).click(function() {
          fileOutput();
        });
        /*
        ==========================================================================
        Create dynamic ui elements
        */

        // Clear all messages
        $( "#arctoi-m-clear" ).click(function() {
          clearArctoiMessage();
        });

        // Message modal open event
        $( "#arctoi-messageModal" ).click(function() {
          ArctoiMessageModalOpen();
        });

        // Message modal close event
        $( ".arctoi-m-close" ).click(function() {
          ArctoiMessageModalClose();
        });

        // Create module dropdown content
        $("#arctoi-dropdown").append(
          '<li><a id="arctoi-clear-all" href="#">Tyhjennä kaikki</a></li>'
        );

        for (m in surveyor.modules) {
          $("#arctoi-dropdown").append(
              '<li role="separator" class="divider"></li>'
          );

          for (c in surveyor.modules[m].commands) {
              $("#arctoi-dropdown").append(
                  '<li><a id="'+m+";"+c+'" href="#">'+surveyor.modules[m].commands[c]+'</a></li>'
              );
          }
        };

        // Add coordinate systems to selector
        for (coordinatesys in surveyor.t.projs) {
          $(".arctoi-coordinates").append(
              '<option value="'+coordinatesys+'">'+surveyor.t.projs[coordinatesys].title+'</option>'
          );
        };

        // Add input-filetypes to selector
        for (sf in surveyor.formats) {
          if (surveyor.formats[sf].isInput) {
              $("#input-filetype").append(
                  '<option value="'+sf+'">'+surveyor.formats[sf].title+'</option>'
              );
          }

          // Add output-filetypes to selector
          if (surveyor.formats[sf].isOutput) {
              $("#output-filetype").append(
                  '<option value="'+sf+'">'+surveyor.formats[sf].title+'</option>'
              );
          }
        };

        // input axis change event
        $( "#input-axis" ).change(function() {
          if ($(this).val() === 'xIse') {
              surveyor.formats[surveyor.currentInputFormat].xIse = true;
          } else {
              surveyor.formats[surveyor.currentInputFormat].xIse = false;
          }
          setAxisReadOrder();
        });

        // output axis change event
        $( "#output-axis" ).change(function() {
          if ($(this).val() === 'xIse') {
              surveyor.formats[surveyor.currentOutputFormat].xIse = true;
          } else {
              surveyor.formats[surveyor.currentOutputFormat].xIse = false;
          }
          setAxisReadOrder();
        });

        // input Filetype change -event
        $('body').on('change', '#input-filetype', function() {
          surveyor.setInputFormat($(this).val());
          setAxisReadOrder();
        });

        // output Filetype change -event
        $('body').on('change', '#output-filetype', function() {
          surveyor.setOutputFormat($(this).val());
          setAxisReadOrder();
        });

        // Coordiatesystem change -event
        $('body').on('change', '.arctoi-coordinates', function() {
          surveyor.t.setCartesian($(this).val());
          $(".arctoi-coordinates").val($(this).val());
        });
        /*
        ==========================================================================
        Select file -field stylizer
        */

        $(':file').on('fileselect', function(event, numFiles, label) {

          var input = $(this).parents('.input-group').find(':text'),
              log = numFiles > 1 ? numFiles + ' files selected' : label;

          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }

        });
        /*
        ==========================================================================
        */
    });
});


/*
file output -action
*/
function fileOutput(){

    if (surveyor.s.points.length < 1) {
        arctoiMessage('ui','alert','No points to output');
        return;
    }

	var textFileAsBlob = new Blob([surveyor.output()], {type:'text/plain'});

	var downloadLink = document.createElement("a");
	downloadLink.download = "points.txt";
	downloadLink.innerHTML = "Download File";
	if (window.URL !== null)
	{
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);

		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		//downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
    arctoiMessage('ui','success','File exported');
}

/*
for file output
*/
function destroyClickedElement(event) {
	document.body.removeChild(event.target);
}

/*
file input -action
*/
function fileInput() {
	console.log('fileInput');
    var file = document.getElementById('actoi-input-file').files[0];

    if (!file) {
        arctoiMessage('ui','alert','No file set');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(progressEvent) {

        console.log(" File format selected: " + surveyor.formats[surveyor.currentInputFormat].title);
        console.log(" Coordinate system selected: " + surveyor.t.cartesian.title);
        console.log(" Coordinate order X is E: " + surveyor.formats[surveyor.currentInputFormat].xIse);

        var poi = surveyor.input(this.result);

        if (poi.length < 1) {
            arctoiMessage('ui','warning','No points from file');
        	return;
        }

        //findImages();
        drawPointMarkers(poi);
        map.fitBounds(points.getBounds());


        arctoiMessage('ui','success','File imported');
        console.log(surveyor.s);
    };
    reader.readAsText(file);
};

/*
axis read order option
*/
function setAxisReadOrder() {
	if (surveyor.formats[surveyor.currentInputFormat].xIse) {
        $("#input-axis").val("xIse");
    } else {
        $("#input-axis").val("xIsn");
    }

    if (surveyor.formats[surveyor.currentOutputFormat].xIse) {
        $("#output-axis").val("xIse");
    } else {
        $("#output-axis").val("xIsn");
    }
};

/*
Print current input-output settings
*/
function currentSettings() {
    console.log(" Input file format selected: " + surveyor.formats[surveyor.currentInputFormat].title);
    console.log(" Input file format X is E: " + surveyor.formats[surveyor.currentInputFormat].xIse);
    console.log(" Output file format selected: " + surveyor.formats[surveyor.currentOutputFormat].title);
    console.log(" Output file format X is E: " + surveyor.formats[surveyor.currentOutputFormat].xIse);
    arctoiMessage('ui','neutral',"Current coordinate system: " + surveyor.t.cartesian.title);
};

/*
MAP draw points -loop
*/
function drawPointMarkers(poi) {
	for (var p in poi) {
		pointMarker(poi[p]);
	}
    arctoiMessage('ui','neutral',"Points: " + surveyor.s.points.length);
}

/*
MAP draw point
*/
function pointMarker(id) {

	var p = surveyor.s.points[id];

	if (p.ui === null) {
		var popup = 'pisteitä: ' + p.measurements + ' kpl';
		popup = popup + '<br />Nimi: <b>' + p.name + '</b>';
		popup = popup + '<br />Korkeus: ' + p.altitude;
        if (surveyor.modules.hasOwnProperty('ArctoiRightAnglify')) {
    		popup = popup + '<br /><br /><button class="btn btn-primary" onclick=rightangle1('+id+') value="test">mittalinjan alku</button>';
    		popup = popup + '<br /><br /><button class="btn btn-primary" onclick=rightangle2('+id+') value="test">mittalinjan loppu</button>';
    		popup = popup + '<br /><br /><button class="btn btn-primary" onclick=perpendicular('+id+') value="test">mittaa tähän</button>';
        }
		if (p.image) {
			popup = popup + '<br /><button onclick=openImage('+p.name+') value="test">Avaa kuva</button>';
		}

		L.circleMarker([p.lat,p.lon]).bindPopup(popup).addTo(points);
		surveyor.s.points[id].ui = "leaflet";
	}
}
