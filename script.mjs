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
let events = [];
let buildings = [];
let popup;

export function handleSearch() {
    const filterCriteria = document.getElementById('searchInput').value;
    populateSidebar(filterCriteria);
}

// Function to highlight buildings based on event data
async function highlightBuildings() {
    events = await fetchData('events.json');
    buildings = await fetchData('buildings.json');

    buildings.forEach(building => {
        const buildingEvents = events.filter(event => event.building === building.id);
        let polygonStyle = {
            color: '#1F271B',
            fillColor: buildingEvents.length > 0 ? '#3D9B47' : '#4A4A4A',
            fillOpacity: 0.35,
            weight: 2
        };

        const polygon = L.polygon(building.coordinates, polygonStyle).addTo(map);
        
        // Store the events and building info with the polygon for later use
        polygon.events = buildingEvents;
        polygon.buildingInfo = building;

        // Add event listeners
        addPolygonEventListeners(polygon);
    });
}

function addPolygonEventListeners(polygon) {
    // Mouseover event
    polygon.on('mouseover', function(e) {
        if (this !== activePolygon) {
            this.setStyle({
                fillColor: this.events.length > 0 ? '#66B27A' : '#3C3C3C',
                fillOpacity: 0.8
            });
        }
        showPopup(this, e.latlng);
    });

    // Mouseout event
    polygon.on('mouseout', function() {
        if (this !== activePolygon) {
            this.setStyle({
                fillColor: this.events.length > 0 ? '#3D9B47' : '#4A4A4A',
                fillOpacity: 0.35
            });
        }
    });


    // Click event
    polygon.on('click', function(e) {
        if (activePolygon && activePolygon !== this) {
            activePolygon.setStyle({
                fillColor: activePolygon.events.length > 0 ? '#3D9B47' : '#4A4A4A',
                fillOpacity: 0.35
            });
        }

        this.setStyle({
            fillColor: this.events.length > 0 ? '#1F5D3B' : '#2A2A2A',
            fillOpacity: 0.8
        });

        activePolygon = this;
        showPopup(this, this.getBounds().getCenter());
    });
}

function showPopup(polygon, latlng) {
    const building = polygon.buildingInfo;
    const buildingEvents = polygon.events;

    // Prepare the popup content, limiting to the first three events
    const limitedEvents = buildingEvents.slice(0, 3);
    const eventDetails = getEventDetailsHTML(limitedEvents);


    // Add "View More" button if there are more than 3 events
    const viewMoreButton = buildingEvents.length > 3 
    ? `<button onclick="showAllEvents('${building.id}', {lat: ${latlng.lat}, lng: ${latlng.lng}})">View More</button>` 
    : '';


    const content = `${building.name}<br>${eventDetails}<br>${viewMoreButton}`;

    if (popup) {
        map.closePopup(popup);
    }

    popup = L.popup()
        .setLatLng(latlng)
        .setContent(content)
        .openOn(map);
}

// Make showAllEvents globally accessible
window.showAllEvents = function(buildingId, latlng) {
    const building = buildings.find(b => b.id === buildingId);
    const buildingEvents = events.filter(e => e.building === buildingId);

    if (buildingEvents.length === 0) {
        alert("No events available for this building.");
        return;
    }

    const allEventDetails = getEventDetailsHTML(buildingEvents);

    if (popup) {
        map.closePopup(popup);
    }

    popup = L.popup()
        .setLatLng(latlng)
        .setContent(`${building.name}<br>${allEventDetails}`)
        .openOn(map);
};


function getEventDetailsHTML(events) {
    return events.map(event => `
        <strong>${event.name}</strong><br>
        Time: ${new Date(event.date).toLocaleString()}<br>
        <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
    `).join('<hr>') || "No events available";
}



// Call highlightBuildings when the page loads
highlightBuildings();
