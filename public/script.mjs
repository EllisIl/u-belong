// Initialize the map and set the view to BYU-Idaho's coordinates (example coordinates)
const map = L.map('map', { scrollWheelZoom: false }).setView([43.8186, -111.7836], 16);

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample building polygon coordinates, including Snow Building with the new coordinates
const buildings = [
    
    {
        name: "Snow",
        coordinates: [
            [43.8208, -111.7842],
            [43.8208, -111.7832],
            [43.8208, -111.7832],
            [42.8212, -111.7832],
            [43.8212, -111.7829],
            [43.8216, -111.7829],
            [43.8216, -111.7834],
            [43.8214, -111.7834],
            [43.8215, -111.7843]
        ],
        id: "snow"
    },
    // Add more buildings with actual polygon coordinates
];

// Fetch event data from a JSON file and highlight relevant buildings
async function fetchEvents() {
    const response = await fetch('events.json');
    const events = await response.json();
    return events;
    
}

// Function to highlight buildings based on event data
function highlightBuildings(events) {
    buildings.forEach(building => {
        const event = events.find(event => event.buildingId === building.id);
        let polygonStyle;

        if (event) {
            const eventDate = new Date(event.date);

            if (isEventToday(eventDate)) {
                // Event happening today
                polygonStyle = {
                    color: '#0E541A',   // Green border
                    fillColor: '#0E541A',  // Green fill
                    fillOpacity: 0.8,
                    weight: 2
                };
            } else if (isEventThisWeek(eventDate)) {
                // Event happening this week
                polygonStyle = {
                    color: '#0C3872',   // Blue border
                    fillColor: '#0C3872',  // Blue fill
                    fillOpacity: 0.35,
                    weight: 2
                };
            } else {
                // Event not happening this week
                polygonStyle = {
                    color: '#1F271B',   // Default dark border
                    fillColor: '#1F271B',  // Default dark fill
                    fillOpacity: 0.35,
                    weight: 2
                };
            }
        } else {
            // No event at all
            polygonStyle = {
                color: '#1F271B',   // Default dark border
                fillColor: '#1F271B',  // Default dark fill
                fillOpacity: 0.35,
                weight: 2
            };
        }

        // Draw the polygon with the appropriate style
        const polygon = L.polygon(building.coordinates, polygonStyle).addTo(map).bindPopup(building.name);

        // If an event is associated with the building, show event details in the popup
        if (event) {
            polygon.bindPopup(`<strong>${building.name}</strong><br>Event: ${event.name}<br>Time: ${event.time}`);
        }
    });
}
// Function to populate sidebar with events from events.json
async function populateSidebar() {
    try {
         // Fetch the events JSON
        const events = await fetchEvents(); // Parse the JSON response
        console.log(events);
        const sidebar = document.getElementById('sidebar');

        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <img class="eventImg" src="${event.image}" alt="${event.name}">
                <h3>${event.name}</h3>
                <p>${event.date}</p>
                <p>${event.category}</p>
                <p>${event.location}</p>
                <p>${event.rsvp}</p>
                <p>${event.info}</p>
                `;
            sidebar.appendChild(eventItem); // Add the event item to the sidebar
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Call the function to populate the sidebar
populateSidebar();
// Helper function to check if an event is happening today
function isEventToday(eventDate) {
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
}

// Helper function to check if an event is happening sometime during the week
function isEventThisWeek(eventDate) {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // End of the current week (Sunday)
    return eventDate >= today && eventDate <= endOfWeek;
}

// Call fetchEvents to highlight buildings when the page loads
fetchEvents();
