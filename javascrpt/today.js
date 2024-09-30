// Fetch form data for customer, location, room type, etc.
function fetchFormData(doctype, field, filters = []) {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: doctype,
            fields: [field],
            filters: filters,
        },
        callback: function (response) {
            if (doctype === 'Property Location' || doctype === 'Room Type') {
                const selectElement = document.getElementById(doctype === 'Property Location' ? 'location' : 'room_type');
                selectElement.innerHTML = '<option value="">Select</option>'; // Clear previous options
                response.message.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[field];
                    option.textContent = item[field];
                    selectElement.appendChild(option);
                });

                // Restore location from localStorage if available
                if (doctype === 'Property Location') {
                    const storedLocation = localStorage.getItem('selectedLocation');
                    if (storedLocation) {
                        selectElement.value = storedLocation;
                    }
                }

                // Store location in localStorage
                if (doctype === 'Property Location') {
                    selectElement.addEventListener('change', () => {
                        const selectedLocation = selectElement.value;
                        localStorage.setItem('selectedLocation', selectedLocation);
                        updateDetails(selectedLocation);
                    });
                }

            } else if (doctype === 'Rooms') {
                const roomSelectElement = document.getElementById('room');
                roomSelectElement.innerHTML = '<option value="">Select Room</option>';
                response.message.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[field];
                    option.textContent = item[field];
                    roomSelectElement.appendChild(option);
                });
            }
        }
    });
}

// Fetch static data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchFormData('Property Location', 'name'); // Fetch locations
    fetchFormData('Room Type', 'name'); // Fetch room types
});

// Set booking date to the current date
let currentDate = new Date().toJSON().slice(0, 10);
document.getElementById("booking_date").value = currentDate;

// Fetch rooms based on selected location and room type
function fetchRooms(location, roomType) {
    const filters = [
        ['location', '=', location],
        ['room_type', '=', roomType]
    ];
    fetchFormData('Rooms', 'room_name', filters);
}

// Event listener for location and date changes
function updateDetails(selectedLocation) {

    // const location = selectedLocation || localStorage.getItem('selectedLocation');
    const location = document.getElementById('location').value || localStorage.getItem('selectedLocation');
    const bookingDate = document.getElementById('booking_date').value;
    console.log("🚀 ~ updateDetails ~ bookingDate:", bookingDate)


    if (location && bookingDate) {
        showDetails(location, bookingDate);

    }
    console.log("🚀 ~ updateDetails ~ showDetails:", location, bookingDate)
}

document.getElementById('location').addEventListener('change', updateDetails);
document.getElementById('booking_date').addEventListener('change', updateDetails);

// Event listener for room type and room changes
document.getElementById('room_type').addEventListener('change', function () {
    const selectedLocation = document.getElementById('location').value;
    const selectedRoomType = this.value;
    fetchRooms(selectedLocation, selectedRoomType);
    updateDetails();
});

document.getElementById('room').addEventListener('change', updateDetails);

// Fetch booking data based on form fields
function showDetails(location, dates) {
    const roomType = document.getElementById('room_type').value;
    const room = document.getElementById('room').value;

    fetchBookings(location, roomType, room, dates);
}

// Utility function to fetch booking data
async function fetchBookings(location, roomType, room, dates) {
    const filters = [
        ['location', '=', location],
        ['booking_date', '=', dates]
    ];

    if (roomType) {
        filters.push(['room_type', '=', roomType]);
    }

    if (room) {
        filters.push(['room', '=', location + ' - ' + room]);
    }

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Room Booking slot",
            fields: ['name', 'customer', 'location', 'room_type', 'booking_date', 'booking_time', 'room', 'type_of_booking'],
            filters: filters
        },
        callback: function (response) {
            const data = response.message;
            console.log(data);
            const tableName = 'tableBody';
            constructTable(data, tableName);
        }
    });
}

// Construct table with provided data
function constructTable(data, tableName) {
    const tableBody = document.querySelector(`.${tableName}`);
    tableBody.innerHTML = ''; // Clear previous rows

    data.forEach((item, index) => {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("hover", "tableRow");
        // Function to add 30 minutes to a time string in HH:MM format
        function add30Minutes(time) {
            const [hours, minutes] = time.split(':').map(Number);
            let newMinutes = minutes + 30;
            let newHours = hours;

            if (newMinutes >= 60) {
                newMinutes -= 60;
                newHours += 1;
            }

            return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        }

        // Parse the booking_time JSON string into an array
        const bookingTime = JSON.parse(item.booking_time);
        const startTime = bookingTime[0];
        let endTime = bookingTime[bookingTime.length - 1];
        endTime = add30Minutes(endTime);

        // Add 30 minutes to the end time

        // Log the adjusted times
        console.log("Start Time:", startTime);
        console.log("End Time (plus 30 minutes):", endTime);

        tableRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.customer}</td>
            <td>${item.location}</td>
            <td>${item.room_type}</td>
            <td class="text-purple-800">${item.room}</td>
            <td class="text-purple-800">${item.type_of_booking}</td>
            <td class="text-green-800">${startTime}</td>
            <td class="text-red-800">${endTime}</td>
            `;

        tableBody.appendChild(tableRow);
    });
}

frappe.ready(function () {
    console.clear();
    const user = frappe.session.user;
    if (user === "Guest" || user === "guest") {
        my_modal_1.showModal();
        return;
    }
    updateDetails(); // Initial fetch on page load
});
