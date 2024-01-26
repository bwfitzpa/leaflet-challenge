//URL for API query to USGS, querying all earthquakes for the past 7 day
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
//Performing a get request to the query url
d3.json(queryUrl).then(function(data){
    createFeatures(data.features);
});

let earthquakes = L.layerGroup();
//Adding a function to vary the bubble fill color, green to red, red is deeper
//looked up on stack overflow how to create the function for color scale 
function depthColor(quakeDepth) {
    return quakeDepth >= 90 ?     'rgb(255,0,0)':
        quakeDepth >= 70 ?   'rgb(255, 102, 0)':
        quakeDepth >= 50 ?  'rgb(230, 211, 107)':
        quakeDepth >= 30 ? 'rgb(201, 220, 119)':
        quakeDepth >= 10 ? 'rgb(173, 229, 131)':
        quakeDepth >= -10 ? 'rgb(144, 238, 144)':
            'rgb(144,238,144)';
} 
//I used the code from exercise 15.1.10 as a starter here to create the popup and map layers
//I used the code from exercise 15.1.6 as a start for displaying the bubbles
function createFeatures(earthquakeData) {

    //Adding in the bubble size using quake magnitude to determine bubble size
    function markerSize(quakeMagnitude) {
        return quakeMagnitude * 10000
    };

    //creating a marker limit
    let marker_limit = earthquakeData.length;
//Adding in the formatting and text for the popup  (magnitude, location, depth)
    for (let i = 0; i < marker_limit; i++) {
        L.circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: "black",
            weight: .5,
            fillColor: depthColor(earthquakeData[i].geometry.coordinates[2]),
            radius: markerSize(earthquakeData[i].properties.mag)
        }).bindPopup(
            `<h3>${earthquakeData[i].properties.place}</h3>
            <hr>
            <p>Magnitude: ${earthquakeData[i].properties.mag}</p>
            <p>Depth: ${earthquakeData[i].geometry.coordinates[2]}</p>`
        ).addTo(earthquakes);
    }
    createMap(earthquakes);
  }

//Setting up the legend, to create the legend 
//I used and modified code from leaflet legend documentation found at (https://leafletjs.com/examples/choropleth/)
let mapLegend = L.control({position: "bottomright"});
mapLegend.onAdd = function(){
    let div = L.DomUtil.create("div", "info legend"),
        grades = [-10, 10, 30, 50, 70, 90];
        // labels = [];
    for (let i=0; i<grades.length; i++) {
        div.innerHTML += 
            '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };

function createMap(earthquakes) {
//For this section I used code in exercise 15.1.10 as a starter for creating the map  
    // Create the base layer
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
  
    // Create the baseMap object
    let baseMap = {
      "Street Map": street,
    //   "Topographic Map": topo
    };
  
    // Adding in earthquakes as an overlay
    let overlayMap = {
      Earthquakes: earthquakes,
    };
  
    // Creating the map
    let myMap = L.map("map", {
      center: [
        50, -120
      ],
      zoom: 4,
      layers: [street, earthquakes]
    });
  
    // Putting a layer control on the map and adding the legend
    L.control.layers(baseMap, overlayMap, {
      collapsed: false
    }).addTo(myMap); 
    
    mapLegend.addTo(myMap);
  }
  
  
  
  