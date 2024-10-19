// Initialize the map and set the view to BYU-Idaho's coordinates
const map = L.map('map', { scrollWheelZoom: false }).setView([43.8186, -111.7836], 16);

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch event data from a JSON file and highlight relevant buildings
async function fetchData(file) {
    const response = await fetch(file);
    const events = await response.json();
    return events;
}

// Function to highlight buildings based on event data
async function highlightBuildings() {
    let events = await fetchData('events.json');
    let buildings = await fetchData('buildings.json');

    buildings.forEach(building => {
        const buildingEvents = events.filter(event => event.building === building.id);
        let polygonStyle;

        // Set default polygon style
        polygonStyle = {
            color: '#1F271B',   // Default dark border
            fillColor: '#1F271B',  // Default dark fill
            fillOpacity: 0.35,
            weight: 2
        };

        // Set polygon style based on events
        if (buildingEvents.length > 0) {
            polygonStyle.fillColor = '#1F271B'; // Default color for buildings with events
        } else {
            polygonStyle.fillColor = '#4A4A4A'; // Darker gray for buildings without events
        }

        // Draw the polygon with the appropriate style
        const polygon = L.polygon(building.coordinates, polygonStyle).addTo(map);
        
        // Prepare the popup content, limiting to the first three events
        const limitedEvents = buildingEvents.slice(0, 3); // Get only the first three events
        const eventDetails = limitedEvents.length > 0
            ? limitedEvents.map(event => `
                <strong>${event.name}</strong><br>
                Time: ${new Date(event.date).toLocaleString()}<br>
                <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
            `).join('<hr>')
            : "No events available";

        // Track popup state
        let popupOpen = false;
        let popup; // Variable to hold the popup reference

        // Add mouseover and mouseout event listeners for hover effect
        polygon.on('mouseover', function(e) {
            // Set the popup position without shifting the map
            if (!popupOpen) {
                popup = L.popup()
                    .setLatLng(e.latlng) // Use the latitude and longitude of the polygon
                    .setContent(`${building.name}<br>${eventDetails}`)
                    .openOn(map);
            }
            this.setStyle({
                fillColor: buildingEvents.length > 0 ? '#0E541A' : '#3C3C3C', // Green if has events, darker gray if not
                fillOpacity: 0.8
            });
        });

        polygon.on('mouseout', function() {
            if (!popupOpen) { // Only close if the popup is not open
                this.setStyle(polygonStyle); // Reset to original style
                if (popup) {
                    map.closePopup(popup); // Close the popup
                }
            }
        });

        // Add click event listener
        polygon.on('click', function() {
            if (popupOpen) {
                map.closePopup(popup); // Close the popup if it is already open
            } else {
                popup = L.popup()
                    .setLatLng(this.getBounds().getCenter()) // Position the popup at the center of the polygon
                    .setContent(`${building.name}<br>${eventDetails}`)
                    .openOn(map);
            }
            popupOpen = !popupOpen; // Toggle the popup state
        });
    });
}






// Function to populate sidebar with events from events.json
async function populateSidebar() {
    try {
        const events = await fetchData('events.json');
        const sidebar = document.getElementById('sidebar');

        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <img class="event-image" src="${event.image}" alt="${event.name}">
                <h3>${event.name}</h3>
                <p>${new Date(event.date).toLocaleString()}</p>
                <p>${event.category}</p>
                <p>${event.location}</p>
                <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
                <p>${event.info}</p>
            `;
            sidebar.appendChild(eventItem);
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}


// Helper function to check if an event is happening today
function isEventToday(eventDate) {
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
}

// Helper function to check if an event is happening sometime during the week
function isEventThisWeek(eventDate) {
    const today = new Date();
    const endOfWeek = new Date(today);
    console.log(`
        Today: ${today}
        End of the week: ${endOfWeek}
        `);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // End of the current week (Sunday)
    return eventDate >= today && eventDate <= endOfWeek;
}

// Call highlightBuildings and populateSidebar when the page loads
highlightBuildings(); 
populateSidebar();
