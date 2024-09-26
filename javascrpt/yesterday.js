// Global Variables
let allBookings = []; // Store all bookings globally
let currentRecord = null; // Store the current record globally
let PassId = ""; // Store the ID of the current booking
let selectedTimes = []; // Store selected times
const submitBtn = document.querySelector(".submitBtn");

// Pagination Variables
let currentPagePending = 1; // Current page number for pending bookings
let totalPagesPending = 1; // Total pages for pending bookings
const itemsPerPage = 10; // Number of items per page for pending bookings

// DOM Elements
const slotsContainer = document.getElementById('slotsContainer');
const myDateInput = document.getElementById('myDate');
// DOM Elements
const dashboardBtn = document.getElementById("dashboard-btn");
const newBookingBtn = document.getElementById("newbooking-btn");
const firstSection = document.getElementById('first-section');
const secondSection = document.getElementById('second-section');
const toast = document.querySelector(".toast");
const closeModalBtn = document.querySelector('.closeBtn');
const modal = document.getElementById('my_modal_3'); // Assuming this is your modal element

//toggle for nav bar
// Event Listeners for Navigation Buttons
dashboardBtn.addEventListener("click", function () {
    firstSection.style.display = 'block';
    secondSection.style.display = 'none';
});

newBookingBtn.addEventListener("click", function () {
    firstSection.style.display = 'none';
    secondSection.style.display = 'block';
});



// Add event listener to close the modal
closeModalBtn.addEventListener('click', function () {
    modal.close(); // Close the modal (if you're using a dialog element)
    resetModalContent(); // Reset the modal content if necessary
});

// Reset the modal content, if needed
function resetModalContent() {
    document.querySelector(".pass-id").innerHTML = '';
    document.querySelector("#leadId").innerHTML = '';
    document.querySelector(".card").innerHTML = '';
    document.getElementById("email-field").innerHTML = '';
    document.getElementById("fullname-field").innerHTML = '';
    document.getElementById("company-field").innerHTML = '';
    document.getElementById("date-field").innerHTML = '';
    document.getElementById("myDate").value = '';
    document.getElementById("fullday-field").innerHTML = '';
    document.querySelector(".status").innerHTML = '';
}


// Event Listener for Date Change
myDateInput.addEventListener('change', function () {
    const selectedDate = this.value;
    let bookingTimesForCurrentRecord = [];

    // If the selected date is the same as the current record's date, use its booking times
    if (currentRecord && selectedDate === currentRecord.booking_date) {
        if (currentRecord.booking_time === "Full Day") {
            fetc
            bookingTimesForCurrentRecord = generateFullDayTimeSlots();
        } else {
            try {
                bookingTimesForCurrentRecord = JSON.parse(currentRecord.booking_time);
            } catch (error) {
                console.error("Error parsing booking_time for current record:", error);
            }
        }
    }

    // Regenerate time slots based on the newly selected date
    generateTimeSlots(selectedDate, bookingTimesForCurrentRecord, currentRecord ? currentRecord.booking_date : null);

});

// Function to fetch all bookings for a specific location, room type, and room based on the current record
async function fetchAllBookingsForRecord(record) {
    const filters = [
        ['location', '=', record.location],
        ['room_type', '=', record.room_type],
        ['room', '=', record.room]
    ];

    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Room Booking slot",
                fields: ['name', 'booking_date', 'booking_time'], // Include 'name' field
                filters: filters // Fetch bookings based on location, room type, and room
            },
            callback: function (response) {
                if (response && response.message) {
                    allBookings = response.message; // Store all relevant bookings globally
                    console.log("Filtered bookings fetched:", allBookings);
                    resolve();
                } else {
                    reject("Failed to fetch filtered bookings.");
                }
            }
        });
    });
}


// Function to generate full day time slots
function generateFullDayTimeSlots() {
    const fullDaySlots = [];
    const start = new Date("1970-01-01T00:00:00");
    const end = new Date("1970-01-01T23:30:00");

    while (start <= end) {
        const hours = String(start.getHours()).padStart(2, '0');
        const minutes = String(start.getMinutes()).padStart(2, '0');
        const timeSlot = `${hours}:${minutes}`;
        fullDaySlots.push(timeSlot);

        // Increment the time by 30 minutes
        start.setMinutes(start.getMinutes() + 30);
    }
    return fullDaySlots;
}

// Function to generate time slots for a selected date
function generateTimeSlots(date, bookingTimesForCurrentRecord, currentRecordDate) {
    slotsContainer.innerHTML = ''; // Clear existing slots

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:30:00`); // Adjusted to include the last slot at 23:30

    // Exclude the current record from globally booked times
    const globallyBookedTimes = allBookings
        .filter(booking => booking.booking_date === date && booking.name !== (currentRecord ? currentRecord.name : ''))
        .flatMap(booking => {
            try {
                if (booking.booking_time === "Full Day") {
                    return generateFullDayTimeSlots();
                }
                return JSON.parse(booking.booking_time);
            } catch (error) {
                console.error("Error parsing booking_time:", error);
                return [];
            }
        });

    while (start <= end) {
        const hours = String(start.getHours()).padStart(2, '0');
        const minutes = String(start.getMinutes()).padStart(2, '0');
        const timeSlot = `${hours}:${minutes}`;

        // Create slot element
        const slotElement = document.createElement('div');
        slotElement.classList.add('time-slot');
        slotElement.textContent = timeSlot;

        // Check if the slot is globally booked
        const isGloballyBooked = globallyBookedTimes.includes(timeSlot);
        // Check if the slot is part of the current record's booking time
        const isCurrentRecordSlot = bookingTimesForCurrentRecord.includes(timeSlot);
        // Check if the slot is in both globally booked times and the current record
        const isCommonSlot = isGloballyBooked && isCurrentRecordSlot;

        if (date === currentRecordDate) {
            if (isCommonSlot) {
                // Red slots for common slots (globally booked + current record)
                slotElement.classList.add('selected');
                slotElement.style.backgroundColor = 'red';
                slotElement.style.color = 'white';

                // Allow deselection for common slots, and mark as globally booked (disabled) when deselected
                slotElement.addEventListener('click', () => {
                    slotElement.classList.toggle('selected');

                    if (!slotElement.classList.contains('selected')) {
                        // When deselected, mark as globally booked (disabled)
                        slotElement.classList.add('disabled');
                        slotElement.style.backgroundColor = '#999999b8'; // Grey color
                        slotElement.style.color = 'white';
                        slotElement.style.cursor = 'not-allowed';
                    } else {
                        // Re-select (if needed)
                        slotElement.style.backgroundColor = 'red';
                    }
                });
            } else if (isCurrentRecordSlot) {
                // Blue slots for current record's booking times
                slotElement.classList.add('selected');
                slotElement.style.backgroundColor = '#2f41ec';

                // Allow toggling (modification) for current record's slots
                slotElement.addEventListener('click', () => {
                    slotElement.classList.toggle('selected');
                    slotElement.style.backgroundColor = slotElement.classList.contains('selected') ? '#2f41ec' : '';
                });
            } else if (isGloballyBooked) {
                // Grey slots for globally booked times not part of the current record
                slotElement.classList.add('disabled');
                slotElement.style.backgroundColor = '#999999b8';
                slotElement.style.color = 'white';
                slotElement.style.cursor = 'not-allowed';
            } else {
                // Available slots on the current record's date
                slotElement.addEventListener('click', () => {
                    slotElement.classList.toggle('selected');
                    slotElement.style.backgroundColor = slotElement.classList.contains('selected') ? '#4caf50' : '';
                });
            }
        } else {
            // For other dates
            if (isGloballyBooked) {
                // Grey slots for globally booked times
                slotElement.classList.add('disabled');
                slotElement.style.backgroundColor = '#999999b8';
                slotElement.style.color = 'white';
                slotElement.style.cursor = 'not-allowed';
            } else {
                // Available slots on other dates
                slotElement.addEventListener('click', () => {
                    slotElement.classList.toggle('selected');
                    slotElement.style.backgroundColor = slotElement.classList.contains('selected') ? '#4caf50' : '';
                });
            }
        }

        // Append the slot element to the container
        slotsContainer.appendChild(slotElement);

        // Increment the time by 30 minutes
        start.setMinutes(start.getMinutes() + 30);
    }
}



// Function to handle a record being opened
function handleRecordOpen(record) {
    currentRecord = record; // Store the current record globally

    const recordBookingDate = record.booking_date;
    let bookingTimesForCurrentRecord = [];

    if (record.booking_time === "Full Day") {
        // Generate all time slots for the full day
        bookingTimesForCurrentRecord = generateFullDayTimeSlots();
    } else {
        try {
            bookingTimesForCurrentRecord = JSON.parse(record.booking_time);
        } catch (error) {
            console.error("Error parsing booking_time for current record:", error);
        }
    }

    // Generate time slots for the record's booking date with the record's booking times
    generateTimeSlots(recordBookingDate, bookingTimesForCurrentRecord, recordBookingDate);
}

// Fetch single room booking record data for display
function fetchSingleData(id) {
    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Room Booking slot",
            name: id,
        },
        callback: async function (response) {
            const record = response.message;

            // Store the current record's ID
            PassId = id;

            // Fetch all bookings based on location, room type, and room of the current record
            await fetchAllBookingsForRecord(record);

            // Call handleRecordOpen() to process the booking times and slots
            handleRecordOpen(record);

            // Also, display the record's details (populate modal, etc.)
            appendDetails(record);
        }
    });
}

// Inserting booking data into modal
function appendDetails(data) {
    console.log(data);
    document.querySelector(".pass-id").innerHTML = data.name;
    document.querySelector("#leadId").innerHTML = data.room_type;
    document.querySelector(".card").innerHTML = data.status;
    document.getElementById("email-field").innerHTML = data.email;
    document.getElementById("fullname-field").innerHTML = data.customer;
    document.getElementById("company-field").innerHTML = data.location;
    document.getElementById("date-field").innerHTML = data.room;
    document.getElementById("myDate").value = data.booking_date;

    const bookTime = data.booking_time;

    if (bookTime === "Full Day") {
        document.getElementById("fullday-field").innerHTML = "Full Day Booked";
    } else {
        document.getElementById("fullday-field").innerHTML = "Booked slots";
    }

    let statusDiv = document.querySelector(".status");
    statusDiv.innerHTML = data.status;

    // Set status color based on status
    switch (data.status) {
        case "Pending":
            statusDiv.style.backgroundColor = "#ff7300";
            break;
        case "Approved":
            statusDiv.style.backgroundColor = "green";
            break;
        default:
            statusDiv.style.backgroundColor = "red";
            break;
    }
}

// Assuming the user clicks on a row in the table to open a record
function showDetails(id) {
    resetModalContent();
    my_modal_3.showModal(); // Open the modal
    fetchSingleData(id); // Fetch and open the record
}


// Toast Notification
const toastStyle = document.createElement('style');
toastStyle.innerHTML = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        display: none; /* Hidden by default */
        transition: opacity 0.5s;
    }
`;
document.head.appendChild(toastStyle);

function showToast(message) {
    toast.style.display = "block";
    toast.innerHTML = message;

    // Fade out after 3 seconds
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.style.display = "none";
            toast.style.opacity = 1; // Reset for next use
        }, 500);
    }, 3000);
}

frappe.ready(function () {
    console.clear();
    const user = frappe.session.user;
    if (user === "Guest" || user === "guest") {
        my_modal_1.showModal();
        return;
    }
    main();
});

function main() {
    fetchTotalPages(); // Fetch total pages first
    fetchData(currentPagePending);

    submitBtn.addEventListener("click", updateStatus);

    document.querySelector(".prev-page-pending").addEventListener("click", () => {
        if (currentPagePending > 1) {
            currentPagePending--;
            fetchData(currentPagePending);
            document.querySelector("#current-page-pending").innerHTML = currentPagePending;
        }
    });

    document.querySelector(".next-page-pending").addEventListener("click", () => {
        if (currentPagePending < totalPagesPending) {
            currentPagePending++;
            fetchData(currentPagePending, true);
            document.querySelector("#current-page-pending").innerHTML = currentPagePending;
        }
    });
}

// Fetch total pages for pending bookings
async function fetchTotalPages() {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Room Booking slot",
            fields: ['name'],
            filters: [['status', '=', 'Pending']],
            limit_page_length: 0
        },
        callback: function (response) {
            let totalPendingRecords = response.message.length;
            totalPagesPending = Math.ceil(totalPendingRecords / itemsPerPage);
            document.querySelector("#total-pages-pending").innerHTML = totalPagesPending;
        }
    });
}

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

// Function to toggle pagination buttons
function togglePaginationButtons(type, dataLength) {
    if (type === 'pending') {
        document.querySelector(".prev-page-pending").disabled = currentPagePending === 1;
        document.querySelector(".next-page-pending").disabled = currentPagePending === totalPagesPending;
    }
}

// Utility function to create tables
function constructTable(data, slNo, tableName) {
    let tableBody = document.querySelector(`.${tableName}`);
    console.log(data);

    let tableRow = document.createElement("tr");
    tableRow.classList.add("hover", "tableRow");

    // Create the row with the provided data
    tableRow.setAttribute("onClick", `showDetails('${data.name}')`);
    tableRow.innerHTML = `
        <td>${slNo}</td>
        <td>${data.name}</td>
        <td>${data.customer}</td>
        <td>${data.status}</td>
        <td>${data.location}</td>
        <td>${data.room_type}</td>
    `;

    tableBody.appendChild(tableRow);
}

// Update booking status
function updateStatus() {
    const selectedSlots = document.querySelectorAll('.time-slot.selected');
    selectedTimes = Array.from(selectedSlots).map(slot => slot.textContent);

    if (selectedTimes.length === 0) {
        showToast("Please select at least one time slot!");
        return;
    }

    const selectedStatus = document.querySelector(".statusDropdown").value;
    const bookingDate = document.getElementById("myDate").value;

    // Update the booking in the database
    frappe.call({
        method: "frappe.client.set_value",
        args: {
            doctype: "Room Booking slot",
            name: PassId,
            fieldname: {
                "status": selectedStatus,
                "booking_time": JSON.stringify(selectedTimes),
                "booking_date": bookingDate, // Include the booking date
                "block_temp": 0
            }
        },
        callback: function (response) {
            console.log(response);
            // showToast("Successfully updated!");
            setTimeout(() => {
                location.reload(); // Reload the page after the toast
            }, 2000);
        }
    });
}


// starting here second-section || new booking //
// DOM Elements
const bookingDateInput = document.getElementById('booking_date');
const newSlotsContainer = document.getElementById('newSlotsContainer');

// Event Listener for Booking Date Change
bookingDateInput.addEventListener('change', function () {
    const selectedDate = this.value;

    // Generate new time slots for the selected date
    generateNewTimeSlots(selectedDate);
});

async function fetchBookedSlots(location, roomType, room, bookingDate) {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Room Booking slot",
                fields: ['booking_time'],
                filters: [
                    ['location', '=', location],
                    ['room_type', '=', roomType],
                    ['room', '=', room],
                    ['booking_date', '=', bookingDate],
                    ['status', '=', 'Approved'] // Only fetch booked slots
                ]
            },
            callback: function (response) {
                if (response.message) {
                    const bookedSlots = response.message.map(slot => slot.booking_time);
                    resolve(bookedSlots);
                } else {
                    resolve([]); // No booked slots found
                }
            },
            error: function (err) {
                console.error("Error fetching booked slots:", err);
                reject(err);
            }
        });
    });
}


// Function to generate new time slots
function generateNewTimeSlots(date) {
    newSlotsContainer.innerHTML = ''; // Clear existing slots
    const timeSlots = [];
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:30:00`); // Adjusted to include the last slot at 23:30

    while (start <= end) {
        const hours = String(start.getHours()).padStart(2, '0');
        const minutes = String(start.getMinutes()).padStart(2, '0');
        const timeSlot = `${hours}:${minutes}`;
        timeSlots.push(timeSlot);

        // Create slot element
        const slotElement = document.createElement('div');
        slotElement.classList.add('time-slot');
        slotElement.textContent = timeSlot;

        // Allow selection
        slotElement.addEventListener('click', () => {
            slotElement.classList.toggle('selected');
            slotElement.style.backgroundColor = slotElement.classList.contains('selected') ? '#4caf50' : '';
        });

        // Append the slot element to the new slots container
        newSlotsContainer.appendChild(slotElement);

        // Increment the time by 30 minutes
        start.setMinutes(start.getMinutes() + 30);
    }
}

// Function to fetch data for each doctype
function fetchFormData(doctype, field, suggestionsElementId, filters = []) {
    console.log(`Fetching data for: ${doctype} with filters:`, filters);

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
            } else if (doctype === 'Rooms') {
                const roomSelectElement = document.getElementById('room');
                roomSelectElement.innerHTML = '<option value="">Select Room</option>'; // Clear previous room options
                response.message.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[field];
                    option.textContent = item[field];
                    roomSelectElement.appendChild(option);
                });
            } else {
                const suggestionsElement = document.getElementById(suggestionsElementId);
                suggestionsElement.innerHTML = ''; // Clear previous suggestions
                response.message.forEach(item => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.textContent = item[field];

                    // Add click event to select the suggestion
                    suggestionItem.addEventListener('click', function () {
                        const inputField = doctype === 'Customer' ? 'customer' :
                            doctype === 'Lead' ? 'lead_id' : 'email';
                        document.getElementById(inputField).value = item[field];
                        suggestionsElement.innerHTML = ''; // Clear suggestions after selection
                    });

                    suggestionsElement.appendChild(suggestionItem);
                });
            }
        }
    });
}

// Fetch static data on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, fetching locations and room types...');
    fetchFormData('Property Location', 'name', null); // No suggestions needed
    fetchFormData('Room Type', 'name', null); // No suggestions needed
});

// Event listeners for customer, lead, and email search fields
document.getElementById('customer').addEventListener('input', function () {
    const query = this.value;
    fetchFormData('Customer', 'customer_name', 'customerSuggestions', [['customer_name', 'like', `%${query}%`]]);
});

document.getElementById('lead_id').addEventListener('input', function () {
    const query = this.value;
    fetchFormData('Lead', 'name', 'leadSuggestions', [['name', 'like', `%${query}%`]]);
});

document.getElementById('email').addEventListener('input', function () {
    const query = this.value;
    fetchFormData('User', 'name', 'emailSuggestions', [['name', 'like', `%${query}%`]]);
});

// Event listener for location and room type changes to fetch rooms based on filters
document.getElementById('location').addEventListener('change', function () {
    const selectedLocation = this.value;
    const selectedRoomType = document.getElementById('room_type').value;
    console.log(`Location changed: ${selectedLocation}, Room Type: ${selectedRoomType}`);
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

    fetchFormData('Rooms', 'room_name', null, filters); // No suggestions needed for rooms
}


// Handle form submission
document.getElementById('bookingForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = {
        customer: document.getElementById('customer').value,
        lead_id: document.getElementById('lead_id').value,
        status: document.getElementById('status').value,
        email: document.getElementById('email').value,
        location: document.getElementById('location').value,
        room_type: document.getElementById('room_type').value,
        room: document.getElementById('room').value,
        booking_date: document.getElementById('booking_date').value,
        booking_time: document.getElementById('booking_time').value
    };

    console.log('Form Data Submitted:', formData);

    // Here, you can send formData to the server
    // Example: fetch('/submit', { method: 'POST', body: JSON.stringify(formData) })
});

// ends here second-section || new booking //