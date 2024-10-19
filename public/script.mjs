// Initialize the map and set the view to BYU-Idaho's coordinates (example coordinates)
const map = L.map('map').setView([43.8186, -111.7836], 16);

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample building polygon coordinates (replace these with actual building outlines)


const buildings = [
    { name: "Ricks", coordinates: [43.8181, -111.7821], id: "ricks" },
    { name: "Smith", coordinates: [43.8191, -111.7814], id: "smith" },
    { name: "Taylor", coordinates: [43.8183, -111.7800], id: "taylor" },
    { name: "Manwaring Center", coordinates: [43.8183, -111.78], id: "Manwaring Center"  },
    { name: "Snow", coordinates: [
        [43.8208, -111.7842],
        [43.8208, -111.7832],
        [43.8208, -111.7832],
        [42.8212, -111.7832],
        [43.8212, -111.7829],
        [43.8216, -111.7829],
        [43.8216, -111.7834],
        [43.8214, -111.7834],
        [43.8215, -111.7843]
    ], id: "snow"  },
    { name: "Spori", coordinates: [43.8208, -111.7825], id: "spori"  },
    { name: "Visual Arts Studio", coordinates: [43.8208, -111.7817], id: "visual-arts"  },
    { name: "Clarke", coordinates: [43.8202, -111.7817], id: "clarke"  },
    { name: "Romney", coordinates: [43.8202, -111.7831], id: "romney"  },
    { name: "Heart", coordinates: [43.8194, -111.7851], id: "heart"  },
    { name: "BYU Idaho Center", coordinates: [43.8185, -111.7853], id: "byu-idaho-center"  },
    { name: "Mckay Library", coordinates: [43.8194, -111.7831], id: "mckay"  },
    { name: "Kimball", coordinates: [43.8171, -111.7815], id: "kimball"  },
    { name: "Hinckley", coordinates: [43.8158, -111.7799], id: "hinckley"  },
    { name: "Ricks", coordinates: [43.8148, -111.7815], id: "ricks"  },
    { name: "Benson", coordinates: [43.8151, -111.7830], id: "benson"  },
    { name: "Austin", coordinates: [43.8157, -111.7847], id: "austin"  },
    { name: "Rigby", coordinates: [43.8170, -111.7845], id: "rigby"  },
    { name: "Biddulph", coordinates: [43.8170, -111.7851], id: "biddulph"  },
    { name: "Heat Plant", coordinates: [43.8170, -111.7858], id: "heat-plant"  },
    { name: "Stadium", coordinates: [43.8210, -111.7859], id: "stadium"  },
    { name: "Taylor Quad", coordinates: [43.8175, -111.7825], id: "taylor-quad"  },
    { name: "Science and Technology", coordinates: [43.8145, -111.7846], id: "science-and-technology"  },
    { name: "Engineering Technology Center", coordinates: [43.8140, -111.7829], id: "engineering-technology-center"  },
    { name: "Agricultural Engineering", coordinates: [43.8132, -111.7831], id: "agricultural-engineering"  },
    { name: "Upper Playfields", coordinates: [43.8123, -111.7856], id: "upper-feilds"  },
];

// Fetch event data from a JSON file and highlight relevant buildings
async function fetchEvents() {
    const response = await fetch('events.json');
    const events = await response.json();
    console.log(events);
    events.forEach(element => {
        if (!element.listingSeparator){
            console.log(element.p3);
        }
    });
    highlightBuildings(events);
}

// Function to highlight buildings based on event data
function highlightBuildings(events) {
    buildings.forEach(building => {
        const event = events.find(event => event.buildingId === building.id);

        // Draw a polygon around the building's outline coordinates
        const polygon = L.polygon(building.coordinates, {
            color: '#d2d7df',   // Base border color
            fillColor: '#d2d7df',  // Base fill color
            fillOpacity: 0.5,  // Adjust the opacity
            weight: 2          // Border thickness
        }).addTo(map).bindPopup(building.name);

        // Change color on hover
        polygon.on('mouseover', () => {
            polygon.setStyle({
                color: '#1F271B',   // Hover border color
                fillColor: '#1F271B'  // Hover fill color
            });
        });

        // Revert to original color when mouse leaves
        polygon.on('mouseout', () => {
            polygon.setStyle({
                color: '#d2d7df',
                fillColor: '#d2d7df'
            });
        });

        // Highlight the building if it has an event
        if (event) {
            polygon.setStyle({
                color: '#1F271B',   // Event highlight border color
                fillColor: '#1F271B'  // Event highlight fill color
            });
            polygon.bindPopup(`<strong>${building.name}</strong><br>Event: ${event.name}<br>Time: ${event.time}`);
        }
    });
}

// Call fetchEvents to highlight buildings when the page loads
fetchEvents();
