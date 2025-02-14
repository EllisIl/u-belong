const map = L.map("map", { scrollWheelZoom: false }).setView([43.816, -111.783], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);


async function fetchData(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

let activePolygon = null;
let events = [];
let buildings = [];
let popup;

const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

searchButton.addEventListener('click', handleSearch);

export function handleSearch() {
  const filterCriteria = searchInput.value;
  populateSidebar(filterCriteria);
}

async function highlightBuildings() {
  events = await getEvents();
  buildings = await fetchData("buildings.json");

  buildings.forEach((building) => {
    const buildingEvents = events.filter((event) => event.building === building.name);

    const polygonStyle = {
      color: "#1F271B",
      fillColor: buildingEvents.length > 0 ? "#3D9B47" : "#4A4A4A",
      fillOpacity: 0.35,
      weight: 2,
    };

    const polygon = L.polygon(building.coordinates, polygonStyle).addTo(map);
    polygon.events = buildingEvents;
    polygon.buildingInfo = building;

    addPolygonEventListeners(polygon);
  });
}

function addPolygonEventListeners(polygon) {
  polygon.on("mouseover", function (e) {
    if (this !== activePolygon) {
      this.setStyle({ fillColor: this.events.length > 0 ? "#66B27A" : "#3C3C3C", fillOpacity: 0.8 });
    }
    showPopup(this, e.latlng);
  });

  polygon.on("mouseout", function () {
    if (this !== activePolygon) {
      this.setStyle({ fillColor: this.events.length > 0 ? "#3D9B47" : "#4A4A4A", fillOpacity: 0.35 });
    }
  });

  polygon.on("click", function (e) {
    if (activePolygon && activePolygon !== this) {
      activePolygon.setStyle({ fillColor: activePolygon.events.length > 0 ? "#3D9B47" : "#4A4A4A", fillOpacity: 0.35 });
    }
    this.setStyle({ fillColor: this.events.length > 0 ? "#1F5D3B" : "#2A2A2A", fillOpacity: 0.8 });
    activePolygon = this;
    showPopup(this, this.getBounds().getCenter());
  });
}

function showPopup(polygon, latlng) {
  const building = polygon.buildingInfo;
  const buildingEvents = polygon.events;
  const limitedEvents = buildingEvents.slice(0, 3);
  const eventDetails = getEventDetailsHTML(limitedEvents);

  const viewMoreButton = buildingEvents.length > 3
    ? `<button onclick="showAllEvents('${building.id}', {lat: ${latlng.lat}, lng: ${latlng.lng}})">View More</button>`
    : "";

  const content = `${building.name}<br>${eventDetails}<br>${viewMoreButton}`;

  if (popup) map.closePopup(popup);
  popup = L.popup().setLatLng(latlng).setContent(content).openOn(map);
}

window.showAllEvents = function (buildingId, latlng) {
  const building = buildings.find((b) => b.id === buildingId);
  const buildingEvents = events.filter((e) => e.building === buildingId);

  if (buildingEvents.length === 0) {
    alert("No events available for this building.");
    return;
  }

  const allEventDetails = getEventDetailsHTML(buildingEvents);

  if (popup) map.closePopup(popup);
  popup = L.popup().setLatLng(latlng).setContent(`${building.name}<br>${allEventDetails}`).openOn(map);
};

function getEventDetailsHTML(events) {
  return events.map(event => `
    <strong>${event.name}</strong><br>
    Time: ${event.date}<br>
    <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
  `).join("<hr>") || "No events available";
}

async function populateSidebar(filterCriteria = "") {
  try {
    const eventList = await getEvents();
    const sidebar = document.getElementById("sidebarContent");
    sidebar.innerHTML = ""; // Clear previous results

    eventList
      .filter((event) =>
        event.name.toLowerCase().includes(filterCriteria.toLowerCase())
      )
      .forEach((event) => {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `
          <img class="event-image" src="https://static7.campusgroups.com${event.image}" alt="${event.name}">
          <h3>${event.name}</h3>
          <p>${event.date}</p>
          <p>${event.category}</p>
          <p>${event.building}</p>
          <a href="https://ibelong.byui.edu${event.rsvp}" target="_blank">RSVP</a>
          <p>${event.info}</p>
        `;
        sidebar.appendChild(eventItem);
      });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}


async function getEvents() {
  try {
    const response = await fetch('https://u-belong.onrender.com/api/');
    if (!response.ok) throw new Error(`Failed to fetch events: ${response.statusText}`);
    
    const eventsData = await response.json();

    // Parse and transform the events data
    const parsedEvents = eventsData.map(event => {
      if (!event.listingSeparator) {  // Equivalent to filtering out separators
        const location = event.p6 || '';
        const building = location.includes(',') ? location.split(',')[0].trim() : location;

        return {
          id: event.p1,
          name: event.p3,
          date: event.p4,
          category: event.p5,
          location: location,
          building: building,
          image: event.p11,
          rsvp: event.p18,
          info: event.p29
        };
      }
      return null;  // This will be filtered out
    }).filter(event => event !== null);  // Remove null entries from the list

    return parsedEvents;

  } catch (error) {
    console.error("Error in getEvents:", error);
    return [];
  }
}

highlightBuildings();
populateSidebar();