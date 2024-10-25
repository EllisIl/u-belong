import requests
import json

# URL of the API to fetch events
url = 'https://ibelong.byui.edu/mobile_ws/v17/mobile_events_list'

# Send a request to the API
response = requests.get(url)

# Check if the response is successful
if response.status_code == 200:
    try:
        # Parse the JSON response directly
        events_data = response.json()
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        events_data = []
else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")
    events_data = []

# Extracting specific fields for each event
events = []

for event in events_data:
    if event.get('listingSeparator') is None:  # Filtering out separators
        location = event.get('p6', '')
        
        # Extracting the building name from the location before the comma
        building = location.split(',')[0] if ',' in location else location
        

        event_details = {
            'id': event.get('p1'),
            'name': event.get('p3'),
            'date': event.get('p4'),
            'category': event.get('p5'),
            'location': location,
            'building': building.strip(),
            'image': event.get('p11'),
            'rsvp': event.get('p18'),
            'info': event.get('p29')
        }
        events.append(event_details)

# Saving the extracted events to the events.json file
with open('events.json', 'w') as file:
    json.dump(events, file, indent=2)

print(f"Events successfully saved to events.json")
