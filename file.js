const fs = require('fs').promises;

async function getEvents(){
    let eventsJSON = '';
    fs.readFile('events.json', 'utf8')
    .then(data => {
        const events = JSON.parse(data); // Parse the JSON string into an object

        if (Array.isArray(events)) { // Ensure events is an array
            events.forEach(event => {
                let eventInfo = '';
                eventInfo += event.p1 || '';  // Use || to avoid undefined values
                eventInfo += event.p3 || '';
                eventInfo += event.p4 || '';
                eventInfo += event.p5 || '';
                eventInfo += event.p6 || '';
                eventInfo += event.p11 || '';
                eventInfo += event.p18 || '';
                eventInfo += event.p22 || '';
                eventInfo += event.p30 || '';
                eventsJSON += eventInfo; // Assuming eventsJSON is declared outside
            });
        } else {
            console.error('Events is not an array:', events);
        }
    })
    .catch(error => {
        console.error('Error reading file:', error);
    });
    console.log("WORKED!!!!!")
    console.log(eventsJSON);
}

getEvents();