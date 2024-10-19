// Initialize the map and set the view to BYU-Idaho's coordinates (example coordinates)
const map = L.map('map').setView([43.8186, -111.7836], 16);

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample building polygon coordinates (replace these with actual building outlines)
const buildings = [
    {
        name: "Ricks Building",
        coordinates: [
            [43.8181, -111.7824],
            [43.8182, -111.7818],
            [43.8179, -111.7819],
            [43.8178, -111.7825]
        ],
        id: "ricks"
    },
    {
        name: "Smith Building",
        coordinates: [
            [43.8192, -111.7848],
            [43.8193, -111.7842],
            [43.8190, -111.7843],
            [43.8189, -111.7849]
        ],
        id: "smith"
    },
    {
        name: "Taylor Building",
        coordinates: [
            [43.8183, -111.7803],
            [43.8184, -111.7797],
            [43.8181, -111.7798],
            [43.8180, -111.7804]
        ],
        id: "taylor"
    }
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
