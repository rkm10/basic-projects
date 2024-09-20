const closeModalBtn = document.querySelector('.closeBtn');
const modal = document.getElementById('my_modal_3'); // Assuming this is your modal element

// Add event listener to close the modal
closeModalBtn.addEventListener('click', function () {
    modal.close(); // Close the modal (if you're using a dialog element)
    resetModalContent(); // Reset the modal content if necessary
});

// You can reset the modal content, if needed
function resetModalContent() {
    document.querySelector(".pass-id").innerHTML = '';
    document.querySelector("#leadId").innerHTML = '';
    document.querySelector(".card").innerHTML = '';
    document.getElementById("email-field").innerHTML = '';
    document.getElementById("fullname-field").innerHTML = '';
    document.getElementById("alternative-field").innerHTML = '';
    document.getElementById("company-field").innerHTML = '';
    document.getElementById("date-field").innerHTML = '';
    document.getElementById("myDate").value = '';
    document.getElementById("fullday-field").innerHTML = '';
    document.querySelector(".status").innerHTML = '';
}




// Global Variables
let allBookings = []; // Store all bookings globally
let currentRecord = null; // Store the current record globally
let PassId = ""; // Store the ID of the current booking
let selectedTimes = []; // Store selected times

// DOM Elements
const dashboardBtn = document.getElementById("dashboard-btn");
const newBookingBtn = document.getElementById("newbooking-btn");
const firstSection = document.getElementById('first-section');
const secondSection = document.getElementById('second-section');
const submitBtn = document.querySelector(".submitBtn");
const toast = document.querySelector(".toast");
const slotsContainer = document.getElementById('slotsContainer');
const myDateInput = document.getElementById('myDate');

// Pagination Variables
let currentPagePending = 1; // Current page number for pending bookings
let totalPagesPending = 1; // Total pages for pending bookings
const itemsPerPage = 10; // Number of items per page for pending bookings

// Event Listeners for Navigation Buttons
dashboardBtn.addEventListener("click", function () {
    firstSection.style.display = 'block';
    secondSection.style.display = 'none';
});

newBookingBtn.addEventListener("click", function () {
    firstSection.style.display = 'none';
    secondSection.style.display = 'block';
});

// Event Listener for Date Change
myDateInput.addEventListener('change', function () {
    const selectedDate = this.value;
    let bookingTimesForCurrentRecord = [];

    // If the selected date is the same as the current record's date, use its booking times
    if (currentRecord && selectedDate === currentRecord.booking_date) {
        if (currentRecord.booking_time === "Full Day") {
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

// Fetch all bookings with booking_date and booking_time
async function fetchAllBookings() {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Room Booking slot",
                fields: ['name', 'booking_date', 'booking_time'], // Include 'name' field
                filters: [] // No filters to get all records
            },
            callback: function (response) {
                if (response && response.message) {
                    allBookings = response.message; // Store all bookings globally
                    console.log("All bookings fetched:", allBookings);
                    resolve();
                } else {
                    reject("Failed to fetch bookings.");
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

    const timeSlots = [];
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

        if (date === currentRecordDate) {
            if (isCurrentRecordSlot) {
                // Grey slots for current record's booking times
                slotElement.classList.add('selected');
                slotElement.style.backgroundColor = 'grey';

                // Allow toggling (modification) for current record's slots
                slotElement.addEventListener('click', () => {
                    slotElement.classList.toggle('selected');
                    slotElement.style.backgroundColor = slotElement.classList.contains('selected') ? 'grey' : '';
                });
            } else if (isGloballyBooked) {
                // Red slots for globally booked times not part of current record
                slotElement.classList.add('disabled');
                slotElement.style.backgroundColor = 'red';
            } else {
                // Available slots on the current record's date
                // Allow selection
                slotElement.addEventListener('click', () => {
                    slotElement.classList.toggle('selected');
                    slotElement.style.backgroundColor = slotElement.classList.contains('selected') ? '#4caf50' : '';
                });
            }
        } else {
            // For other dates
            if (isGloballyBooked) {
                // Red slots for globally booked times
                slotElement.classList.add('disabled');
                slotElement.style.backgroundColor = 'red';
            } else {
                // Available slots on other dates
                // Allow selection
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
        callback: function (response) {
            const record = response.message;

            // Store the current record's ID
            PassId = id;

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
    document.getElementById("alternative-field").innerHTML = data.email_cc_admin;
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

// Call fetchAllBookings when the page loads
window.onload = async function () {
    await fetchAllBookings(); // Fetch all globally booked times
};

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
            fields: ['name', 'status', 'customer', 'location', 'room_type', 'booking_date', 'booking_time'],
            limit_start: (pagePending - 1) * itemsPerPage,
            limit_page_length: itemsPerPage,
            filters: [['status', '=', 'Pending']] // Fetch pending records only
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
                "booking_time": selectedTimes.length === 48 ? "Full Day" : JSON.stringify(selectedTimes),
                "booking_date": bookingDate // Include the booking date
            }
        },
        callback: function (response) {
            showToast("Successfully updated!");
            setTimeout(() => {
                location.reload(); // Reload the page after the toast
            }, 2000);
        }
    });
}
