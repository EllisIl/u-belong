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
        
        if (buildingEvents.length > 0) {
            buildingEvents.forEach(event => {
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
                }
            });
        }

        // Draw the polygon with the appropriate style
        const polygon = L.polygon(building.coordinates, polygonStyle).addTo(map).bindPopup(building.name);

        // If any events are associated with the building, show event details in the popup
        if (buildingEvents.length > 0) {
            const eventDetails = buildingEvents.map(event => `
                <strong>${event.name}</strong><br>
                Time: ${new Date(event.date).toLocaleString()}<br>
                <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
            `).join('<hr>');

            polygon.bindPopup(`${building.name}<br>${eventDetails}`);
        }
    });
}

async function populateSidebar(filterCriteria) {
    try {
        const events = await fetchData('events.json');
        const sidebarContent = document.getElementById('sidebarContent');
        
        // Clear existing sidebar content
        sidebarContent.innerHTML = '';

        // Filter events based on the provided criteria
        const filteredEvents = events.filter(event => {
            return event.name.toLowerCase().includes(filterCriteria.toLowerCase());
        });

        // Populate the sidebar with the filtered events
        filteredEvents.forEach(event => {
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
            sidebarContent.appendChild(eventItem);
        });

        // Check if any events matched the filter
        if (filteredEvents.length === 0) {
            sidebarContent.innerHTML = '<p>No events match the selected criteria.</p>';
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

export function handleSearch() {
    const filterCriteria = document.getElementById('searchInput').value;
    populateSidebar(filterCriteria);
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
populateSidebar("");

const convertDates = (events) => {
    return events.map(event => {
      return {
        ...event,
        date: new Date(event.date)  // Convert the date string to a Date object
      };
    });
  };