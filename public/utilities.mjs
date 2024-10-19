export async function getEvents() {
    const response = await axios.get('https://cors-anywhere.herokuapp.com/https://ibelong.byui.edu/mobile_ws/v17/mobile_events_list');
    const data = await response.json();
    return data;
}