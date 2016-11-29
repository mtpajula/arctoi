
var dummyDrop = {
        "idbar" : "bar",
        "idfoo" : "foo"
    };

var surveyor = new Surveyor();
setAxisReadOrder();
currentSettings();

$(function() {

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
          console.log($(this).attr('id') + " - " + astr);
      });

      $( "#actoi-input-button" ).click(function() {
          fileInput();
      });
      /*
      ==========================================================================
      Create dynamic ui elements
      */
      $("#arctoi-dropdown").append(
          '<li><a id="arctoi-clear-all" href="#">Tyhjennä kaikki</a></li><li role="separator" class="divider"></li>'
      );
      for (m in surveyor.modules) {
          for (c in surveyor.modules[m].commands) {
              $("#arctoi-dropdown").append(
                  '<li><a id="'+m+";"+c+'" href="#">'+surveyor.modules[m].commands[c]+'</a></li>'
              );
          }
          if (surveyor.modules.length-1 != m) {
              $("#arctoi-dropdown").append(
                  '<li role="separator" class="divider"></li>'
              );
          }
      };

      for (coordinatesys in surveyor.t.projs) {
          $(".arctoi-coordinates").append(
              '<option value="'+coordinatesys+'">'+surveyor.t.projs[coordinatesys].title+'</option>'
          );
      };

      for (sf in surveyor.formats) {
          if (surveyor.formats[sf].isInput) {
              $("#input-filetype").append(
                  '<option value="'+sf+'">'+surveyor.formats[sf].title+'</option>'
              );
          }

          if (surveyor.formats[sf].isOutput) {
              $("#output-filetype").append(
                  '<option value="'+sf+'">'+surveyor.formats[sf].title+'</option>'
              );
          }
      };

      $( "#input-axis" ).change(function() {
          if ($(this).val() === 'xIse') {
              surveyor.formats[surveyor.currentInputFormat].xIse = true;
          } else {
              surveyor.formats[surveyor.currentInputFormat].xIse = false;
          }
          setAxisReadOrder();
      });

      $( "#output-axis" ).change(function() {
          if ($(this).val() === 'xIse') {
              surveyor.formats[surveyor.currentOutputFormat].xIse = true;
          } else {
              surveyor.formats[surveyor.currentOutputFormat].xIse = false;
          }
          setAxisReadOrder();
      });

      $('body').on('change', '#input-filetype', function() {
          surveyor.setInputFormat($(this).val());
          setAxisReadOrder();
      });

      $('body').on('change', '#output-filetype', function() {
          surveyor.setOutputFormat($(this).val());
          setAxisReadOrder();
      });

      $('body').on('change', '.arctoi-coordinates', function() {
          surveyor.t.setCartesian($(this).val());
          $(".arctoi-coordinates").val($(this).val());
      });
      /*
      ==========================================================================
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
  });

});


function fileInput() {
	console.log('fileInput');
    var file = document.getElementById('actoi-input-file').files[0];

    var reader = new FileReader();
    reader.onload = function(progressEvent){

        console.log(" File format selected: " + surveyor.formats[surveyor.currentInputFormat].title);
        console.log(" Coordinate system selected: " + surveyor.t.cartesian.title);
        console.log(" Coordinate order X is E: " + surveyor.formats[surveyor.currentInputFormat].xIse);

        var poi = surveyor.input(this.result);

        if (poi.length < 1) {
        	console.log('No points from file');
        	return;
        }

        //findImages();
        drawPointMarkers(poi);
        map.fitBounds(points.getBounds());

        console.log(this.result);
    };
    reader.readAsText(file);
};

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

function currentSettings() {
    console.log(" Input file format selected: " + surveyor.formats[surveyor.currentInputFormat].title);
    console.log(" Input file format X is E: " + surveyor.formats[surveyor.currentInputFormat].xIse);
    console.log(" Output file format selected: " + surveyor.formats[surveyor.currentOutputFormat].title);
    console.log(" Output file format X is E: " + surveyor.formats[surveyor.currentOutputFormat].xIse);
    console.log(" Coordinate system selected: " + surveyor.t.cartesian.title);

};



function drawPointMarkers(poi) {
	for (var p in poi) {
		pointMarker(poi[p]);
	}
    console.log("Points: " + surveyor.s.points.length);
}

function pointMarker(id) {

	var p = surveyor.s.points[id];

	if (p.ui === null) {
		var popup = 'pisteitä: ' + p.measurements + ' kpl';
		popup = popup + '<br />Nimi: <b>' + p.name + '</b>';
		popup = popup + '<br />Korkeus: ' + p.altitude;
		popup = popup + '<br /><br /><button class="btn btn-primary" onclick=rightangle1('+id+') value="test">mittalinjan alku</button>';
		popup = popup + '<br /><br /><button class="btn btn-primary" onclick=rightangle2('+id+') value="test">mittalinjan loppu</button>';
		popup = popup + '<br /><br /><button class="btn btn-primary" onclick=perpendicular('+id+') value="test">mittaa tähän</button>';
		if (p.image) {
			popup = popup + '<br /><button onclick=openImage('+p.name+') value="test">Avaa kuva</button>';
		}

		L.circleMarker([p.lat,p.lon]).bindPopup(popup).addTo(points);
		surveyor.s.points[id].ui = "leaflet";
	}
}
