var geoserverUrl = "http://127.0.0.1:8082/geoserver";
var selectedPoint = null;

var source = null;
var target = null;

// initialize our map
var map = L.map("map", {
	center: [27.78895,83.48372],
	zoom: 12 //set the zoom level
});

//add openstreet map baselayer to the map
var OpenStreetMap = L.tileLayer(
	"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	{
		maxZoom: 30,
		attribution:
			'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}
).addTo(map);
var studyarea = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
	layers: "Project:finalstudyarea",
	transparent:true,

  });
  studyarea.addTo(map);

  var landslidepoint = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
	layers: "Project:Landslidepoint",
	transparent:true,
	
  });
  landslidepoint.addTo(map);

  var nonlandslidepoint = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
	layers: "Project:Nonlandslidepoint",
	transparent:true,
	
  });
  nonlandslidepoint.addTo(map);
  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);
// map.addLayer(osm)

// dark map 
var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 30
});
// dark.addTo(map)

// google street 
googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
	maxZoom: 30,
	subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
// googleStreets.addTo(map);

//google satellite
googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
	maxZoom: 30,
	subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
// googleSat.addTo(map)


var baseMaps = {
	"OSM": osm,
	'Dark': dark,
	'Google Street': googleStreets,
	"Google Satellite": googleSat,
};

var legend = {
    "Landslide Point": L.icon({
        iconUrl: 'slide.png',
        iconSize: [25, 25], // adjust the size as needed
    }),
    "Non-Landslide Point": L.icon({
        iconUrl: 'non.png', // replace with the correct path
        iconSize: [25, 25], // adjust the size as needed
    })
};
var overlayMaps = {
    'Study Area': studyarea,
    "Landslide Points": landslidepoint,  // Change here to match HTML
    'Non-Landslide Points': nonlandslidepoint // Change here to match HTML
};

map.removeLayer(studyarea)
 map.removeLayer(landslidepoint)
 map.removeLayer(nonlandslidepoint)
 
 L.control.scale({
	position: 'bottomright',
    maxWidth: 70, // Set the maximum width of the control in pixels
    metric: true,  // Show the metric scale line (m/km)
    imperial: true, // Show the imperial scale line (mi/ft)
    updateWhenIdle: true // Update the control on move (default)
}).addTo(map);

// Event listener for base layers
// Base layer toggle
document.querySelectorAll('.base-layer-option').forEach(function (element) {
    element.addEventListener('click', function (event) {
        event.preventDefault();
        var layerName = element.querySelector('.sub-item').textContent.trim();
        
        // Remove all base layers, retain overlays
        Object.keys(baseMaps).forEach(function (key) {
            map.removeLayer(baseMaps[key]);
        });
        
        // Add the selected base layer
        if (baseMaps[layerName]) {
            baseMaps[layerName].addTo(map);
        }
    });
});

// Overlay layer toggle
document.querySelectorAll('.overlay-layer-option').forEach(function (element) {
    element.addEventListener('click', function (event) {
        event.preventDefault(); {
        var layerName = element.querySelector('.sub-item').textContent.trim();
        
        // Check if layer exists in overlayMaps
        if (overlayMaps[layerName]) {
            // Toggle visibility for each overlay
            if (map.hasLayer(overlayMaps[layerName])) {
                map.removeLayer(overlayMaps[layerName]);
            } else {
                overlayMaps[layerName].addTo(map);
            }
        }
    }
    });
});

var Lulc = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
    layers: "Project:lulcc",
    transparent: true,
});

var geology = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
    layers: "Project:geology",
    transparent: true,
});

var soil = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
    layers: "Project:soil",
    transparent: true,
});
var ndvi = L.Geoserver.wms("http://localhost:8080/geoserver/Project/wms", {
    layers: "Project:ndvi",
    transparent: true,
});
var factors = [
    { name: 'LULC', layer: Lulc, legend: 'LULC' }, // Adjusted to match your HTML
    { name: 'Geology', layer: geology, legend: 'Geology' },
    { name: 'Soil', layer: soil, legend: 'Soil' },
    { name: 'NDVI', layer: ndvi, legend: 'NDVI' }
];

document.querySelectorAll(".factor-layer-option").forEach(function (element) {
    element.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default anchor behavior

        var layerName = element.querySelector('.sub-item').textContent.trim();
        var factor = factors.find(f => f.name === layerName);

        if (factor) {
            // Toggle the clicked layer
            if (map.hasLayer(factor.layer)) {
                map.removeLayer(factor.layer); // Remove if it was already added
                element.classList.remove('active'); // Remove active class
                document.getElementById('legend').innerHTML = ''; // Clear the legend
            } else {
                // Remove all other factor layers from the map
                factors.forEach(f => {
                    if (f !== factor && map.hasLayer(f.layer)) {
                        map.removeLayer(f.layer); // Remove other layers
                        // Remove active class from other options
                        document.querySelector(`.factor-layer-option.active`).classList.remove('active');
                    }
                });

                factor.layer.addTo(map); // Add the clicked layer
                element.classList.add('active'); // Add active class to the clicked option


                // Update the legend
                var legend = document.getElementById('legend');
                if (factor.name === 'LULC') {
                    legend.innerHTML = `
                        <div>
                            <span style="font-weight: bold; color: red; font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-style: italic;">
                                ${factor.legend}
                            </span>
                        </div>
                        <div>
                            <span style="background-color: blue; width: 20px; height: 20px; display: inline-block;"></span>
                           Water
                        </div>
                        <div>
                            <span style="background-color: #5da243; width: 20px; height: 20px; display: inline-block;"></span>
                            Forest
                        </div>
                        <div>
                            <span style="background-color: #c1e028; width: 20px; height: 20px; display: inline-block;"></span>
                            Vegetation
                        </div>
                        <div>
                            <span style="background-color: #db5220; width: 20px; height: 20px; display: inline-block;"></span>
                            Built-Up
                        </div>
                    `;
                } else if (factor.name === 'Geology') {
                    legend.innerHTML = `
                        <div>
                            <span style="font-weight: bold; color: red; font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-style: italic;">
                                ${factor.legend}
                            </span>
                        </div>
                        <div>
                            <span style="background-color: #a58fe7; width: 20px; height: 20px; display: inline-block;"></span>
                            Neogene Sedimentary Rocks
                        </div>
                        <div>
                            <span style="background-color: #259240; width: 20px; height: 20px; display: inline-block;"></span>
                            Undivided Precambrian Rocks
                        </div>
                    `;
                } else if (factor.name === 'Soil') {
                    legend.innerHTML = `
                        <div>
                            <span style="font-weight: bold; color: red; font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-style: italic;">
                                ${factor.legend}
                            </span>
                        </div>
                        <div>
                            <span style="background-color: #d27d56; width: 20px; height: 20px; display: inline-block;"></span>
                            Eutric Cambisols
                        </div>
                        <div>
                            <span style="background-color: #4def47; width: 20px; height: 20px; display: inline-block;"></span>
                            Gleyic Cambisols
                        </div>
                        <div>
                            <span style="background-color: #5a1b7b; width: 20px; height: 20px; display: inline-block;"></span>
                            Chromic Cambisols
                        </div>
                        <div>
                            <span style="background-color: #1bcbdb; width: 20px; height: 20px; display: inline-block;"></span>
                            Eutric Fluvisols
                        </div>
                        <div>
                            <span style="background-color: #ffff11; width: 20px; height: 20px; display: inline-block;"></span>
                            Eutric Gleysols
                        </div>
                        <div>
                            <span style="background-color: #f600ac; width: 20px; height: 20px; display: inline-block;"></span>
                            Calcaric Phaeozems
                        </div>
                        <div>
                            <span style="background-color: #7e4fdc; width: 20px; height: 20px; display: inline-block;"></span>
                            Dystric Regosols
                        </div>
                    `;
                } else if (factor.name === 'NDVI') {
                    legend.innerHTML = `
                        <div>
                            <span style="font-weight: bold; color: red; font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-style: italic;">
                                ${factor.legend}
                            </span>
                        </div>
                       <div>
                     <img src="legend.png" alt="NDVI Legend" style="width:200px; height:auto;">
                         </div>
                    `;
                }
                legend.style.display = 'block'; // Ensure legend is visible
                legend.style.color = 'darkgreen'; // Set text color for legend
                legend.style.fontSize = '25px';
                legend.style.fontFamily= "Times New Roman, Times, serif";
            }
        }
    });
});

function downloadLegend(format) {
    const legendElement = document.getElementById('legend');

    // Use html2canvas to capture the legend as an image
    html2canvas(legendElement).then(canvas => {
        if (format === 'png' || format === 'jpg') {
            // Convert canvas to desired image format
            const imgData = canvas.toDataURL(`image/${format}`);
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `legend.${format}`;
            link.click();
        } else if (format === 'pdf') {
            // Convert to PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            pdf.addImage(canvas, 'PNG', 10, 10, 180, 0); // Adjust placement and size if needed
            pdf.save('legend.pdf');
        }
    });
}
