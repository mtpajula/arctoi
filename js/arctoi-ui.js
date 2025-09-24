
/*
ARCTOI UI
--------
File includes code to create dynamic ui -elements and
various ui actions
*/

// Global surveyor instance
let surveyor;

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        surveyor = new Surveyor();
        setAxisReadOrder();
        currentSettings();
    } catch (error) {
        arctoiMessage('System', 'alert', 'Failed to initialize surveyor: ' + error.message);
    }
        /*
        ==========================================================================
        Input-Output
        */
        document.addEventListener('click', function(e) {
            if (e.target.matches('#arctoi-dropdown a')) {
                const astr = e.target.textContent;
                const mc = e.target.id.split(";");
                console.log(mc);
                if (mc[0] === 'arctoi-clear-all') {
                    surveyor.clear();
                    points.clearLayers();
                } else {
                    surveyor.runModuleCommand(mc[0], mc[1]);
                }
            }
        });

        document.getElementById('actoi-input-button').addEventListener('click', fileInput);
        document.getElementById('actoi-output-button').addEventListener('click', fileOutput);
        /*
        ==========================================================================
        Create dynamic ui elements
        */

        // Clear all messages
        document.getElementById('arctoi-m-clear').addEventListener('click', clearArctoiMessage);

        // Message modal open event
        document.getElementById('arctoi-messageModal').addEventListener('click', ArctoiMessageModalOpen);

        // Message modal close event
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('arctoi-m-close')) {
                ArctoiMessageModalClose();
            }
        });

        // Create module dropdown content
        const dropdown = document.getElementById('arctoi-dropdown');
        dropdown.insertAdjacentHTML('beforeend', '<li><a class="dropdown-item" id="arctoi-clear-all" href="#">Tyhjennä kaikki</a></li>');

        for (const m in surveyor.modules) {
            dropdown.insertAdjacentHTML('beforeend', '<li><hr class="dropdown-divider"></li>');

            for (const c in surveyor.modules[m].commands) {
                dropdown.insertAdjacentHTML('beforeend', 
                    `<li><a class="dropdown-item" id="${m};${c}" href="#">${surveyor.modules[m].commands[c]}</a></li>`
                );
            }
        }

        // Add coordinate systems to selector
        try {
            const coordinateSelectors = document.querySelectorAll('.arctoi-coordinates');
            for (const coordinatesys in surveyor.t.projs) {
                coordinateSelectors.forEach(selector => {
                    const isSelected = coordinatesys === 'EPSG:3067' ? 'selected' : '';
                    selector.insertAdjacentHTML('beforeend', 
                        `<option value="${coordinatesys}" ${isSelected}>${surveyor.t.projs[coordinatesys].title}</option>`
                    );
                });
            }
        } catch (error) {
            arctoiMessage('UI', 'alert', 'Failed to load coordinate systems');
        }

        // Add input-filetypes to selector
        try {
            for (const sf in surveyor.formats) {
                if (surveyor.formats[sf].isInput) {
                    document.getElementById('input-filetype').insertAdjacentHTML('beforeend',
                        `<option value="${sf}">${surveyor.formats[sf].title}</option>`
                    );
                }

                // Add output-filetypes to selector
                if (surveyor.formats[sf].isOutput) {
                    document.getElementById('output-filetype').insertAdjacentHTML('beforeend',
                        `<option value="${sf}">${surveyor.formats[sf].title}</option>`
                    );
                }
            }
        } catch (error) {
            arctoiMessage('UI', 'alert', 'Failed to load file formats');
        }

        // input axis change event
        document.getElementById('input-axis').addEventListener('change', function() {
            if (this.value === 'xIse') {
                surveyor.formats[surveyor.currentInputFormat].xIse = true;
            } else {
                surveyor.formats[surveyor.currentInputFormat].xIse = false;
            }
            setAxisReadOrder();
        });

        // output axis change event
        document.getElementById('output-axis').addEventListener('change', function() {
            if (this.value === 'xIse') {
                surveyor.formats[surveyor.currentOutputFormat].xIse = true;
            } else {
                surveyor.formats[surveyor.currentOutputFormat].xIse = false;
            }
            setAxisReadOrder();
        });

        // input Filetype change -event
        document.getElementById('input-filetype').addEventListener('change', function() {
            surveyor.setInputFormat(this.value);
            setAxisReadOrder();
        });

        // output Filetype change -event
        document.getElementById('output-filetype').addEventListener('change', function() {
            surveyor.setOutputFormat(this.value);
            setAxisReadOrder();
        });

        // Coordinate system change -event
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('arctoi-coordinates')) {
                // If it's the point manager coordinates selector, don't change the main coordinate system
                if (e.target.id === 'point-manager-coordinates') {
                    // Store the selected coordinate system for point manager
                    window.pointManagerCoordinateSystem = e.target.value;
                    arctoiMessage('Settings', 'success', `Point manager coordinate system set to: ${surveyor.t.projs[e.target.value].title}`);
                } else {
                    // For other coordinate selectors, update the main coordinate system
                    surveyor.t.setCartesian(e.target.value);
                    document.querySelectorAll('.arctoi-coordinates:not(#point-manager-coordinates)').forEach(selector => {
                        selector.value = e.target.value;
                    });
                }
            }
        });
        /*
        ==========================================================================
        Select file -field stylizer (simplified for Bootstrap 5)
        */
        // File input change handler
        document.getElementById('actoi-input-file').addEventListener('change', function() {
            const numFiles = this.files ? this.files.length : 1;
            const label = this.value.replace(/\\/g, '/').replace(/.*\//, '');
            const log = numFiles > 1 ? `${numFiles} files selected` : label;
            console.log(log);
        });
        /*
        ==========================================================================
        */
    });


/*
file output -action
*/
const fileOutput = () => {
    if (surveyor.s.points.length < 1) {
        arctoiMessage('ui', 'alert', 'No points to output');
        return;
    }

    const textFileAsBlob = new Blob([surveyor.output()], { type: 'text/plain' });
    const downloadLink = document.createElement("a");
    downloadLink.download = "points.txt";
    downloadLink.innerHTML = "Download File";
    
    if (window.URL !== null) {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    } else {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
    arctoiMessage('ui', 'success', 'File exported');
};

/*
for file output
*/
const destroyClickedElement = (event) => {
    document.body.removeChild(event.target);
};

/*
file input -action
*/
const fileInput = () => {
    console.log('fileInput');
    const file = document.getElementById('actoi-input-file').files[0];

    if (!file) {
        arctoiMessage('ui', 'alert', 'No file set');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(progressEvent) {
        console.log(` File format selected: ${surveyor.formats[surveyor.currentInputFormat].title}`);
        console.log(` Coordinate system selected: ${surveyor.t.cartesian.title}`);
        console.log(` Coordinate order X is E: ${surveyor.formats[surveyor.currentInputFormat].xIse}`);

        const poi = surveyor.input(this.result);

        if (poi.length < 1) {
            arctoiMessage('ui', 'warning', 'No points from file');
            return;
        }

        //findImages();
        drawPointMarkers(poi);
        map.fitBounds(points.getBounds());

        arctoiMessage('ui', 'success', 'File imported');
        console.log(surveyor.s);
    };
    reader.readAsText(file);
};

/*
axis read order option
*/
const setAxisReadOrder = () => {
    if (surveyor.formats[surveyor.currentInputFormat].xIse) {
        document.getElementById("input-axis").value = "xIse";
    } else {
        document.getElementById("input-axis").value = "xIsn";
    }

    if (surveyor.formats[surveyor.currentOutputFormat].xIse) {
        document.getElementById("output-axis").value = "xIse";
    } else {
        document.getElementById("output-axis").value = "xIsn";
    }
};

/*
Print current input-output settings
*/
const currentSettings = () => {
    console.log(` Input file format selected: ${surveyor.formats[surveyor.currentInputFormat].title}`);
    console.log(` Input file format X is E: ${surveyor.formats[surveyor.currentInputFormat].xIse}`);
    console.log(` Output file format selected: ${surveyor.formats[surveyor.currentOutputFormat].title}`);
    console.log(` Output file format X is E: ${surveyor.formats[surveyor.currentOutputFormat].xIse}`);
    arctoiMessage('ui', 'neutral', `Current coordinate system: ${surveyor.t.cartesian.title}`);
};

/*
MAP draw storagepoints
*/
const drawStoragePoints = () => {
    for (const p in surveyor.s.points) {
        pointMarker(p);
    }
    arctoiMessage('ui-drawStoragePoints', 'neutral', `Points: ${surveyor.s.points.length}`);
};

/*
MAP draw points -loop
*/
const drawPointMarkers = (poi) => {
    for (const p in poi) {
        pointMarker(poi[p]);
    }
    arctoiMessage('ui-drawPointMarkers', 'neutral', `Points: ${surveyor.s.points.length}`);
};

/*
MAP draw point
*/
const pointMarker = (id) => {
    const p = surveyor.s.points[id];
    //console.log('pointMarker '+p.name+' '+p.ui);
    if (p.ui === null) {
        let popup = `<table class="table table-bordered table-sm" style="cursor: pointer;" onclick="openEditCoordinatesModal(${id})"><tbody>`;
        popup = popup + `<tr><td>Nimi</td><td><b>${p.name}</b></td></tr>`;
        popup = popup + `<tr><td>N (m)</td><td>${p.n.toFixed(3)}</td></tr>`;
        popup = popup + `<tr><td>E (m)</td><td>${p.e.toFixed(3)}</td></tr>`;
        popup = popup + `<tr><td>Korkeus (m)</td><td>${p.altitude}</td></tr>`;
        popup = popup + `<tr><td>EPSG</td><td>${p.epsg}</td></tr>`;
        popup = popup + `</tbody></table>`;
        
        for (const m in surveyor.modules) {
            try {
                popup = popup + surveyor.modules[m].toMapPopup(id, p);
            } catch(err) {
                // Ignore errors
            }
        }

        const marker = L.circleMarker([p.lat, p.lon]).bindPopup(popup).addTo(points);
        marker.pointData = p; // Store reference to the point
        surveyor.s.points[id].ui = marker; // Store reference to the marker
    }
};

// Global variable to store the currently edited point ID
let currentEditingPointId = null;

// Function to open the edit coordinates modal
const openEditCoordinatesModal = (id) => {
    const p = surveyor.s.points[id];
    currentEditingPointId = id;
    
    // Set modal content
    document.getElementById('editPointName').textContent = p.name;
    document.getElementById('editN').value = p.n.toFixed(3);
    document.getElementById('editE').value = p.e.toFixed(3);
    document.getElementById('editAltitude').value = p.altitude;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editCoordinatesModal'));
    modal.show();
};

// Function to update a specific point marker
const updatePointMarker = (id) => {
    const p = surveyor.s.points[id];
    
    // Remove the old marker if it exists
    if (p.ui && typeof p.ui.remove === 'function') {
        points.removeLayer(p.ui);
    }
    
    // Reset UI flag so it can be redrawn
    p.ui = null;
    
    // Redraw the point marker
    pointMarker(id);
};

// Function to save edited coordinates
const saveEditedCoordinates = () => {
    if (currentEditingPointId === null) return;
    
    const p = surveyor.s.points[currentEditingPointId];
    const newN = parseFloat(document.getElementById('editN').value);
    const newE = parseFloat(document.getElementById('editE').value);
    const newAltitude = parseFloat(document.getElementById('editAltitude').value);
    
    // Validate inputs
    if (isNaN(newN) || isNaN(newE) || isNaN(newAltitude)) {
        arctoiMessage('Edit Coordinates', 'alert', 'Invalid coordinate values');
        return;
    }
    
    // Update point coordinates
    p.n = newN;
    p.e = newE;
    p.altitude = newAltitude;
    
    // Transform to lat/lon using the point's EPSG system
    const coords = surveyor.t.cartesianToPolar(p.e, p.n);
    p.lat = coords[1];
    p.lon = coords[0];
    
    // Update the specific point marker on the map
    updatePointMarker(currentEditingPointId);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editCoordinatesModal'));
    modal.hide();
    
    arctoiMessage('Edit Coordinates', 'success', `Point ${p.name} coordinates updated`);
};
