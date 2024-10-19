// Initialize the map and set the view to BYU-Idaho's coordinates (example coordinates)
const map = L.map('map').setView([43.8186, -111.7836], 16);

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample building polygon coordinates (replace these with actual building outlines)


const buildings = [
    { name: "Ricks", coordinates: [
        [43.8149, -111.7818],
        [43.8146, -111.7818],
        [43.8146, -111.7807],
        [43.8151, -111.7807],
        [43.8151, -111.7806],
        [43.8149, -111.7810],
        [43.8149, -111.7818]
    ], id: "ricks" },
    { name: "Smith", coordinates: [
        [43.8189, -111.7812],
        [43.8194, -111.7813],
        [43.8194, -111.7816],
        [43.8189, -111.7816]
    ], id: "smith" },
    { name: "Taylor", coordinates: [
        [43.8171, -111.7828],
        [43.8167, -111.7828],
        [43.8167, -111.7821],
        [43.8172, -111.7821]
    ], id: "taylor" },
    { name: "Manwaring Center", coordinates: [
        [43.8188, -111.7834],
        [43.8180, -111.7834],
        [43.8181,-111.7817],
        [43.8188, -111.7817]
    ], id: "Manwaring Center"  },
    { name: "Snow", coordinates: [
        [43.8208, -111.7843],
        [43.8215, -111.7843],
        [43.8214, -111.7829],
        [43.8208, -111.7828]
    ], id: "snow"  },
    { name: "Spori", coordinates: [
        [43.8209, -111.7826],
        [43.8206, -111.7826],
        [43.8207, -111.7821],
        [43.8209, -111.7821]
    ], id: "spori"  },
    { name: "Visual Arts Studio", coordinates: [
        [43.8210, -111.7819],
        [43.8206, -111.7818],
        [43.8206, -111.7814],
        [43.8210, -111.7814]
    ], id: "visual-arts"  },
    { name: "Clarke", coordinates: [
        [43.8205, -111.7815],
        [43.8199, -111.7814],
        [43.8199, -111.7820],
        [43.8205, -111.7820]
    ], id: "clarke"  },
    { name: "Romney", coordinates: [
        [43.8199, -111.7835],
        [43.8204, -111.7835],
        [43.8204, -111.7828]
        [43.8199, -111.7828]
    ], id: "romney"  },
    { name: "Heart", coordinates: [
        [43.8197, -111.7863],
        [43.8192, -111.7863],
        [43.8192, -111.7841],
        [43.8197, -111.7841]
    ], id: "heart"  },
    { name: "BYU Idaho Center", coordinates: [
        [43.8190, -111.7862],
        [43.8179, -111.7862],
        [43.8179, -111.7839],
        [43.8190, -111.7840]
    ], id: "byu-idaho-center"  },
    { name: "Mckay Library", coordinates: [
        [43.8196, -111.7835],
        [43.8190, -111.7835],
        [43.8190, -111.7828],
        [43.8196, -111.7829]
    ], id: "mckay"  },
    { name: "Kimball", coordinates: [
        [43.8166, -111.7812],
        [43.8166, -111.7817],
        [43.8175, -111.7817],
        [43.8175, -111.7813]
    ], id: "kimball"  },
    { name: "Hinckley", coordinates: [
        [43.8161, -111.7801],
        [43.8161, -111.7796],
        [43.8155, -111.7796],
        [43.8156, -111.7802]], id: "hinckley"  },
    { name: "Benson", coordinates: [
        [43.8149, -111.7826],
        [43.8149, -111.7834],
        [43.8159, -111.7834],
        [43.8159, -111.7827]
    ], id: "benson"  },
    { name: "Austin", coordinates: [
        [43.8153, -111.7841],
        [43.8153, -111.7850],
        [43.8162, -111.7850],
        [43.8162, -111.7841]
    ], id: "austin"  },
    { name: "Rigby", coordinates: [
        [43.8167, -111.7848],
        [43.8174, -111.7843],
        [43.8173, -111.7841],
        [43.816, -111.7846]
    ], id: "rigby"  },
    { name: "Biddulph", coordinates: [
        [43.8167, -111.7854],
        [43.8166, -111.7852],
        [43.8174, -111.7848],
        [43.8174, -111.7849]
    ], id: "biddulph"  },
    { name: "Heat Plant", coordinates: [
        [43.8174, -111.7855],
        [43.8174, -111.7861],
        [43.8168, -111.7861],
        [43.8167, -111.7856]
    ], id: "heat-plant"  },
    { name: "Stadium", coordinates: [
        []
    ], id: "stadium"  },
    { name: "Taylor Quad", coordinates: [
        [43.8212, -111.7862],
        [43.8212, -111.7858],
        [43.8206, -111.7858],
        [43.8206, -111.7862]
    ], id: "taylor-quad"  },
    { name: "Science and Technology", coordinates: [
        [43.8143, -111.7842],
        [43.8148, -111.7842],
        [43.8148, -111.7852],
        [43.8143, -111.7851]
    ], id: "science-and-technology"  },
    { name: "Engineering Technology Center", coordinates: [
        [43.8138, -111.7827],
        [43.8143, -111.7828],
        [43.8144, -111.7834],
        [43.8138, -111.7834]
    ], id: "engineering-technology-center"  },
    { name: "Agricultural Engineering", coordinates: [
        [43.8134, -111.7834],
        [43.8130, -111.7834],
        [43.8130, -111.7829],
        [43.8134, -111.7828]
    ], id: "agricultural-engineering"  },
    { name: "Upper Playfields", coordinates: [
        [43.8133, -111.7863],
        [43.8116, -111.7864],
        [43.8116, -111.7840],
        [43.8133, -111.784]
    ], id: "upper-feilds"  },
];

// Fetch event data from a JSON file and highlight relevant buildings
async function fetchEvents() {
    const response = await fetch('events.json');
    const events = await response.json();
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

