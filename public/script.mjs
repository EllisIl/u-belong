import { getEvents } from './utilities.mjs';

// Initialize the map and set the view to BYU-Idaho's coordinates (example coordinates)
const map = L.map('map').setView([43.8186, -111.7836], 16);

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample building coordinates for BYU-Idaho campus (you'll want to refine this with actual data)
const buildings = [
    { name: "Ricks Building", coordinates: [43.8181, -111.7821], id: "ricks" },
    { name: "Smith Building", coordinates: [43.8192, -111.7845], id: "smith" },
    { name: "Taylor Building", coordinates: [43.8183, -111.7800], id: "taylor" }
];

// Fetch event data from a JSON file and highlight relevant buildings
async function fetchEvents() {
    const events = await getEvents();
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
        const marker = L.marker(building.coordinates).addTo(map).bindPopup(building.name);
        
        if (event) {
            marker.getElement().classList.add('highlight'); // Highlight building
            marker.bindPopup(`<strong>${building.name}</strong><br>Event: ${event.name}<br>Time: ${event.time}`);
        }
    });
}

// Call fetchEvents to highlight buildings when the page loads
fetchEvents();
