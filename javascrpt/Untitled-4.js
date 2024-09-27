/*************  ✨ Codeium Command 🌟  *************/
document.querySelector(".tableBody").innerHTML = ``;
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
            console.log(`Response for ${doctype}:`, response);
            if (doctype === 'Property Location' || doctype === 'Room Type') {
                const selectElement = document.getElementById(doctype === 'Property Location' ? 'location' : 'room_type');
                selectElement.innerHTML = '<option value="">Select</option>'; // Clear previous options
                response.message.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[field];
                    option.textContent = item[field];
                    selectElement.appendChild(option);
                });
                // If location, populate from local storage if available
                if (doctype === 'Property Location') {
                    const storedLocation = localStorage.getItem('selectedLocation');
                    if (storedLocation) {
                        selectElement.value = storedLocation;
                        console.log(`Restored location from localStorage: ${storedLocation}`);
                    }
                }
            } else if (doctype === 'Rooms') {  // Corrected else block
                const roomSelectElement = document.getElementById('room');
                roomSelectElement.innerHTML = '<option value="">Select Room</option>'; // Clear previous room options
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
    console.log('Page loaded, fetching locations and room types...');
    fetchFormData('Property Location', 'name'); // Fetch locations
    fetchFormData('Room Type', 'name'); // Fetch room types
});

// Event listener for location and room type changes to fetch rooms based on filters
document.getElementById('location').addEventListener('change', function () {
    const selectedLocation = this.value;
    const selectedRoomType = document.getElementById('room_type').value;
    console.log(`Location changed: ${selectedLocation}, Room Type: ${selectedRoomType}`);

    // Store selected location in localStorage
    localStorage.setItem('selectedLocation', selectedLocation);
    console.log(`Stored location in localStorage: ${selectedLocation}`);

    fetchRooms(selectedLocation, selectedRoomType);
});

document.getElementById('room_type').addEventListener('change', function () {
    const selectedLocation = document.getElementById('location').value;
    const selectedRoomType = this.value;
    console.log(`Room Type changed: ${selectedRoomType}, Location: ${selectedLocation}`);
    fetchRooms(selectedLocation, selectedRoomType);
});

// Function to fetch rooms based on selected location and room type
function fetchRooms(location, roomType) {
    console.log(`Fetching rooms for location: ${location} and room type: ${roomType}`);

    const filters = [
        ['location', '=', location],
        ['room_type', '=', roomType]
    ];

    fetchFormData('Rooms', 'room_name', filters);  // Pass filters correctly
}

// Set booking date to the current date
let currentDate = new Date().toJSON().slice(0, 10);
console.log(currentDate); // "2022-06-17"
document.getElementById("booking_date").value = currentDate;



// Fetching booking data (pending records)
async function fetchData(pagePending, checkData = false) {

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Room Booking slot",
            fields: ['name', 'status', 'customer', 'location', 'room_type', 'booking_date', 'booking_time', 'block_temp'],
            limit_start: (pagePending - 1) * itemsPerPage,
            limit_page_length: itemsPerPage,
            filters: [['status', '=', 'Pending'], ['block_temp', '=', '0']] // Fetch pending records only with block_temp = 0
        },
        callback: function (response) {
            if (response.message.length === 0 && checkData) {
                currentPagePending--;
                return;
            }

            document.querySelector(".tableBody").innerHTML = "";

            response.message.forEach((res, index) => {
                constructTable(res, index + 1, "tableBody");
            });

            togglePaginationButtons('pending', response.message.length);
        }
    });
}

function showDetails(bookingId) {
    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Room Booking slot",
            name: bookingId,
            fields: ['name', 'customer', 'location', 'room_type', 'booking_date', 'booking_time',]
        },
        callback: function (response) {
            console.log(response);
            if (response.message) {
                const data = response.message;
                const modalBody = document.querySelector(".modal-body");
                modalBody.innerHTML = ``;
                modalBody.innerHTML += `
    <p>Booking ID: ${data.name}</p>
    <p>Customer: ${data.customer}</p>
    <p>Location: ${data.location}</p>
    <p>Room Type: ${data.room_type}</p>
    <p>Booking Date: ${data.booking_date}</p>
    <p>Booking Time: ${data.booking_time}</p>
function showDetails() {
    const location = document.getElementById('location').value;
    const roomType = document.getElementById('room_type').value;
    const room = document.getElementById('room').value;
    const dates = document.getElementById('booking_date').value;

    if (location && roomType && room && dates) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Room Booking slot",
                fields: ['name', 'customer', 'location', 'room_type', 'booking_date', 'booking_time',],
                filters: [['status', '=', 'Pending'], ['block_temp', '=', '0'], ['location', '=', location], ['room_type', '=', roomType], ['room', '=', room], ['booking_date', '=', dates]]
            },
            callback: function (response) {
                console.log(response);
                if (response.message.length === 0) {
                    alert("No data found.");
                } else {
                    // Utility function to create tables
                    function constructTable(data, slNo, tableName) {
                        let tableBody = document.querySelector(`.${ tableName } `);
                        //    console.log(data);

                        let tableRow = document.createElement("tr");
                        tableRow.classList.add("hover", "tableRow");

                        // Create the row with the provided data
                        tableRow.setAttribute("onClick", `showDetails('${data.name}')`);
                        tableRow.innerHTML = `
                    < td > ${ slNo }</td >
        <td>${data.name}</td>
        <td>${data.customer}</td>
        <td>${data.status}</td>
        <td>${data.location}</td>
        <td>${data.room_type}</td>
                `;
            } else {
                alert("No data found.");
            }
        }
    });
}

                        tableBody.appendChild(tableRow);
                    }


                    // Function to toggle pagination buttons
                    function togglePaginationButtons(type, dataLength) {
                        if (type === 'pending') {
                            document.querySelector(".prev-page-pending").disabled = currentPagePending === 1;
                            document.querySelector(".next-page-pending").disabled = currentPagePending === totalPagesPending;
                        }
                    }


/******  574fd1dc-a452-4cc3-98d6-fa6d282cd702  *******/