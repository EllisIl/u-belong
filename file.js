async function getEvents(){
    const response = await fetch("events.json");
    const events = await response.json();
    console.log(events);
    let eventsJSON;
    
    events.forEach(event => {
        console.log(event);
        let eventInfo;
        eventInfo += event.p1;
        eventInfo += event.p3;
        eventInfo += event.p4;
        eventInfo += event.p5;
        eventInfo += event.p6;
        eventInfo += event.p11;
        eventInfo += event.p18;
        eventInfo += event.p22;
        eventInfo += event.p30;
        eventsJSON += eventInfo;
    });
    
    console.log(eventsJSON);
}

getEvents();