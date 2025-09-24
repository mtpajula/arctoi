# Arctoi Map

A modular JavaScript mapping platform for surveying and geospatial data processing.

**Demo:** [https://mtpajula.github.io/arctoi/](https://mtpajula.github.io/arctoi/)

## Overview

Arctoi is a web-based mapping application designed for handling survey data and geospatial measurements. It provides tools for coordinate transformation, point averaging, right-angle calculations, and various file format support.

## Features

### Core Functionality
- **Interactive Mapping** - Leaflet-based map with multiple tile layers
- **Coordinate Systems** - Support for various coordinate systems via Proj4js
- **File Format Support** - Import/export in multiple formats (GT, CSV, DXF, PRN)
- **Point Management** - Create, edit, and manage survey points
- **Manual Point Adding** - Add points directly on the map using drawing tools
- **Point Editing** - Edit point names, coordinates, and altitude
- **Points Table** - View all points in a comprehensive scrollable table

### Surveying Tools
- **Pointify Module** - GPS position collection and averaging
- **RightAnglify Module** - Right-angle measurement calculations
- **Point Management** - Comprehensive point storage and manipulation

### Technical Features
- **Modular Architecture** - Extensible plugin system
- **Cross-Browser Support** - Works in all modern browsers

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for local development)

### Quick Start
1. Clone or download the repository
2. Serve the files using a web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## Usage

### Basic Workflow
1. **Load Data** - Import survey data from supported file formats OR add points manually
2. **Set Coordinate System** - Choose appropriate coordinate system for point adding
3. **Manage Points** - Edit point names, coordinates, and view all points in table
4. **Process Data** - Use various modules for data processing
5. **Export Results** - Save processed data in desired format

### Modules

#### Pointify
- **GPS Collection** - Collect real-time GPS positions
- **Point Averaging** - Create averaged points from multiple observations
- **Accuracy Weighting** - Weight points based on GPS accuracy

#### RightAnglify
- **Right Angle Measurements** - Calculate perpendicular distances
- **Survey Line Creation** - Define measurement lines
- **Intersection Calculations** - Find intersection points
- **Interactive Buttons** - Color-coded buttons showing measurement state

### Point Management Features

#### Manual Point Adding
- **Drawing Tools** - Use Leaflet.Draw to add points on the map
- **Coordinate System Selection** - Choose coordinate system for new points
- **Automatic Transformation** - Points are transformed to selected coordinate system

#### Point Editing
- **Comprehensive Editing** - Edit point name, coordinates, and altitude
- **Click-to-Edit** - Click on coordinate table in point popup to edit
- **Real-time Updates** - Changes are immediately reflected on the map

#### Points Table
- **Complete Overview** - View all points in a scrollable table
- **All Data Fields** - Shows all point information except UI elements
- **Responsive Design** - Works on all screen sizes

### File Formats

#### Supported Input Formats
- **GT** - Finnish survey data format
- **CSV** - Comma-separated values
- **DXF** - AutoCAD drawing format
- **PRN** - Print format

#### Supported Output Formats
- **GT** - Finnish survey data format
- **CSV** - Comma-separated values

## Technical Details

### Architecture
- **Modular Design** - Each feature is a separate module
- **Event-Driven** - Module communication via events
- **Plugin System** - Easy to extend with new modules

### Dependencies
- **Leaflet 1.9.4** - Interactive maps
- **Leaflet.Draw 1.0.4** - Drawing tools for point adding
- **Bootstrap 5.3.2** - UI framework
- **Proj4js** - Coordinate transformations

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Project Structure
```
arctoi/
├── css/
│   ├── arctoi-main.css    # Custom styles
│   └── full.css          # Layout styles
├── js/
│   ├── arctoi-map.js     # Map initialization
│   ├── arctoi-ui.js      # UI interactions
│   ├── arctoi-message.js # Message system
│   ├── arctoi-point-manager.js # Point adding functionality
│   ├── surveyor-main.js  # Core surveyor class
│   ├── surveyor-fileformats.js # File format handlers
│   └── surveyor-module-*.js # Feature modules
├── index.html            # Main application
└── README.md            # This file
```

### Adding New Modules
1. Create a new module file: `surveyor-module-*.js`
2. Define a class with required methods:
   - `constructor()` - Initialize the module
   - `runCommand(cmd)` - Handle commands
   - `setTransform(t)` - Set coordinate transformation
   - `setStorage(s)` - Set data storage
3. Register the module in `surveyor-main.js`

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Credits

### Libraries
- **[Leaflet](https://leafletjs.com/)** - Interactive maps
- **[Bootstrap](https://getbootstrap.com/)** - UI framework
- **[Proj4js](https://proj4js.org/)** - Coordinate transformations

### Original Development
- **Start Bootstrap** - Initial template and layout
- **Vladimir Agafonkin** - Leaflet library
- **Bootstrap Team** - UI framework
