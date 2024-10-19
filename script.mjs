// Initialize the map and set the view to BYU-Idaho's coordinates
const map = L.map('map', { scrollWheelZoom: false }).setView([43.8186, -111.7836], 16);

// Hamburger menu functionality using the eye button
let eye = document.getElementById("eye");
let links = document.querySelector(".links");
let sidebar = document.getElementById("sidebar");

// Ensure the eye starts closed
eye.classList.add('closed');
links.classList.remove("open"); // Ensure the links are hidden initially
sidebar.classList.remove("open"); // Ensure the sidebar is hidden initially

// Toggle the eye opening/closing and the menu list visibility
eye.addEventListener('click', () => {
    // Toggle the eye open/close animation
    if (eye.classList.contains('open')) {
        eye.classList.remove('open');
        eye.classList.add('closed');
        links.classList.remove("open"); // Hide the menu when closing the eye
        sidebar.classList.remove("open"); // Hide the sidebar when closing the eye
    } else {
        eye.classList.remove('closed');
        eye.classList.add('open');
        links.classList.add("open"); // Show the menu when opening the eye
        sidebar.classList.add("open"); // Show the sidebar when opening the eye
    }
});

// Add a tile layer (Map data from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch event data from a JSON file and highlight relevant buildings
async function fetchData(file) {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(`Failed to load ${file}`);
    }
    const data = await response.json();
    return data;
}

let activePolygon = null; // Track the currently active building

export function handleSearch() {
    const filterCriteria = document.getElementById('searchInput').value;
    populateSidebar(filterCriteria);
}

// Function to highlight buildings based on event data
async function highlightBuildings() {
    try {
        let events = await fetchData('events.json');
        let buildings = await fetchData('buildings.json');

        // Convert event dates to Date objects
        events = convertDates(events);

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
                ? `<button id='viewMore">View More</button>` 
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
    } catch (error) {
        console.error('Error highlighting buildings:', error);
    }
}

export async function showAllEvents(buildingId) {
    try {
        const events = await fetchData('events.json');
        const buildings = await fetchData('buildings.json');
        const buildingEvents = events.filter(event => event.building === buildingId);
        const allEventDetails = buildingEvents.map(event => `
            <strong>${event.name}</strong><br>
            Time: ${new Date(event.date).toLocaleString()}<br>
            <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
        `).join('<hr>');

        const building = buildings.find(b => b.id === buildingId);

        // Assuming there's a global reference to the popup
        if (popup) {
            popup.setContent(`${building.name}<br>${allEventDetails}`);
        }
    } catch (error) {
        console.error('Error showing all events:', error);
    }
}

async function populateSidebar(filterCriteria) {
    try {
        const events = await fetchData('events.json');
        const buildings = await fetchData('buildings.json');
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

            // Find the building that matches the event's building ID
            const building = buildings.find(b => b.id === event.building);

            // Format the location
            let location = 'Off-Campus'; // Default to Off-Campus if building is not found
            if (event.location.includes('Online')) {
                location = 'Online';
            } else if (building) {
                location = building.name; // Use the building name if found
            }

            // Format the event date
            const formattedDate = new Date(event.date).toLocaleString();

            eventItem.innerHTML = `
                <img class="event-image" src="${event.image}" alt="${event.name}">
                <h3>${event.name}</h3>
                <p>${formattedDate}</p>
                <p>${event.category}</p>
                <p>${location}</p>
                <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
                <p>${event.info}</p>
            `;

            // Set a data attribute for the building ID
            eventItem.setAttribute('data-building-id', event.building);

            // Add click event to focus on the building
            eventItem.addEventListener('click', () => {
                focusBuilding(event.building);
            });

            sidebarContent.appendChild(eventItem);
        });

        // Check if any events matched the filter
        if (filteredEvents.length === 0) {
            sidebarContent.innerHTML = '<p>No events match the selected criteria.</p>';
        }
    } catch (error) {
        console.error('Error populating sidebar:', error);
    }
}
async function focusBuilding(buildingId) {
    const buildings = await fetchData('buildings.json');
    
    // Find the building by its ID
    const building = buildings.find(b => b.id === buildingId);
    
    if (building && Array.isArray(building.coordinates) && building.coordinates.length > 0) {
        // Calculate the centroid of the polygon
        const centroid = getPolygonCentroid(building.coordinates);
        
        if (centroid && typeof centroid[0] === 'number' && typeof centroid[1] === 'number') {
            // Focus the map on the centroid of the building's polygon
            map.setView(centroid, 18);  // Adjust zoom level as needed
        } else {
            console.warn('Invalid centroid:', centroid);
            alert('Invalid building coordinates.');
        }
    } else {
        console.warn('Building not found or coordinates missing:', buildingId);
        alert("This is an online event or the location is unavailable.");
    }
}
// Function to calculate the centroid of a polygon
function getPolygonCentroid(coords) {
    let x = 0, y = 0, n = coords.length;
    coords.forEach(coord => {
        x += coord[0];
        y += coord[1];
    });
    return [x / n, y / n];  // Return the average lat/lng
}
// Function to convert string dates to Date objects
function convertDates(events) {
    return events.map(event => ({
        ...event,
        date: new Date(event.date)
    }));
}

highlightBuildings(); // Initialize building highlighting when the map is loaded
populateSidebar('');  // Populate the sidebar with all events initially
