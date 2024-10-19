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

let activePolygon = null; // Track the currently active building
let events = [];

// Function to highlight buildings based on event data
async function highlightBuildings() {
    let events = await fetchData('events.json');
    let buildings = await fetchData('buildings.json');

    buildings.forEach(building => {
        const buildingEvents = events.filter(event => event.building === building.id);
        let polygonStyle = {
            color: '#1F271B',
            fillColor: buildingEvents.length > 0 ? '#3D9B47' : '#4A4A4A',
            fillOpacity: 0.35,
            weight: 2
        };

        const polygon = L.polygon(building.coordinates, polygonStyle).addTo(map);
        
        // Store the events with the polygon for later use
        polygon.events = buildingEvents;

        // Prepare the popup content, limiting to the first three events
        const limitedEvents = buildingEvents.slice(0, 3);
        const eventDetails = limitedEvents.map(event => `
            <strong>${event.name}</strong><br>
            Time: ${new Date(event.date).toLocaleString()}<br>
            <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
        `).join('<hr>') || "No events available";

        // Add "View More" button if there are more than 3 events
        const viewMoreButton = buildingEvents.length > 3 
    ? `<button onclick="showAllEvents('${building.id}')">View More</button>` 
    : '';


        // Track popup state
        let popupOpen = false;
        let popup; // Variable to hold the popup reference

        // Add mouseover and mouseout event listeners for hover effect
        polygon.on('mouseover', function(e) {
            if (this !== activePolygon) {
                this.setStyle({
                    fillColor: this.events.length > 0 ? '#66B27A' : '#3C3C3C', // Lighter green/gray on hover
                    fillOpacity: 0.8
                });
            }
        
            // Show the popup
            if (!popupOpen) {
                popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(`${building.name}<br>${eventDetails}<br>${viewMoreButton}`)
                    .openOn(map);
            }
        });
        
        polygon.on('mouseout', function() {
            if (this !== activePolygon) {
                this.setStyle({
                    fillColor: this.events.length > 0 ? '#3D9B47' : '#4A4A4A', // Reset to original style if it's not active
                    fillOpacity: 0.35
                });
            }
        });
        
        // Add click event listener
        polygon.on('click', function() {
            // Close the currently open popup if it exists
            if (popupOpen) {
                map.closePopup(popup);
            }
        
            // Reset the previously active building's style
            if (activePolygon && activePolygon !== this) {
                activePolygon.setStyle({
                    fillColor: activePolygon.events.length > 0 ? '#3D9B47' : '#4A4A4A', // Reset to original style
                    fillOpacity: 0.35
                });
            }
        
            // Open a new popup for the clicked building
            popup = L.popup()
                .setLatLng(this.getBounds().getCenter())
                .setContent(`${building.name}<br>${eventDetails}<br>${viewMoreButton}`)
                .openOn(map);
            
            // Shade the currently clicked building darker
            this.setStyle({
                fillColor: this.events.length > 0 ? '#1F5D3B' : '#2A2A2A', // Darker green/gray when clicked
                fillOpacity: 0.8
            });
        
            // Update the activePolygon reference
            activePolygon = this; // Set this building as the active one
            popupOpen = true; // Mark popup as open
        });
    });
}

function showAllEvents(buildingId) {
    const buildingEvents = events.filter(event => event.building === buildingId);
    
    // Check if events are available for this building
    if (buildingEvents.length === 0) {
        alert("No events available for this building.");
        return;
    }

    // Prepare all event details
    const allEventDetails = buildingEvents.map(event => `
        <strong>${event.name}</strong><br>
        Time: ${new Date(event.date).toLocaleString()}<br>
        <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
    `).join('<hr>');

    // Update the popup content to show all events
    popup.setContent(`${building.name}<br>${allEventDetails}`);
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
    console.log(`
        Today: ${today}
        Event date: ${eventDate}
        `);
    return eventDate.toDateString() === today.toDateString();
}

// Helper function to check if an event is happening sometime during the week
function isEventThisWeek(eventDate) {
    const today = new Date();
    const endOfWeek = new Date(today);
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