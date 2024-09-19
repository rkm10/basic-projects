const dashboardBtn = document.getElementById("dashboard-btn");
const newBookingBtn = document.getElementById("newbooking-btn");
const firstSection = document.getElementById('first-section');
const secondSection = document.getElementById('second-section');

dashboardBtn.addEventListener("click", function () {
    console.log("working");
    firstSection.style.display = 'block';
    secondSection.style.display = 'none';
});

newBookingBtn.addEventListener("click", function () {
    firstSection.style.display = 'none';
    secondSection.style.display = 'block';
});

// Calendar script starts here
const daysTag = document.querySelector(".days"),
    currentDate = document.querySelector(".current-date"),
    prevNextIcon = document.querySelectorAll(".icons span");

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday = i === date.getDate() && currMonth === new Date().getMonth()
            && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
}
renderCalendar();

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if (currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date();
        }
        renderCalendar();
    });
});
// Calendar script ends here

// Slot picker script starts here
document.getElementById('myDate').addEventListener('change', function () {
    const selectedDate = this.value;
    const bookingTime = getBookingTimeForDate(selectedDate);
    generateTimeSlots(selectedDate, bookingTime);
});


// Generate time slots for the default date when the page loads
window.onload = function () {
    const defaultDate = document.getElementById('myDate').value;
    const bookingTimes = getBookingTimeForDate(defaultDate);
    generateTimeSlots(defaultDate, bookingTimes);
};
// Slot picker script ends here

let submitBtn = document.querySelector(".submitBtn");
let toast = document.querySelector(".toast");
let PassId = "";
let selectedTimes = []; // Store selected times
let currentPagePending = 1; // Current page number for pending gate passes
let totalPagesPending = 1; // Total pages for pending gate passes
let currentPageApproved = 1; // Current page number for approved gate passes
let totalPagesApproved = 1; // Total pages for approved gate passes
const itemsPerPage = 10; // Number of items per page for pending gate passes
const itemsPerApprovedPage = 5; // Number of items per page for approved gate passes

frappe.ready(function () {
    console.clear();
    user = frappe.session.user;
    if (user === "Guest" || user === "guest") {
        my_modal_1.showModal();
        return;
    }
    main();
});

function main() {
    fetchTotalPages(); // Fetch total pages first
    fetchData(currentPagePending, currentPageApproved);

    submitBtn.addEventListener("click", updateStatus);

    document.querySelector(".prev-page-pending").addEventListener("click", () => {
        if (currentPagePending > 1) {
            currentPagePending--;
            fetchData(currentPagePending, currentPageApproved);
            document.querySelector("#current-page-pending").innerHTML = currentPagePending;
        }
    });

    document.querySelector(".next-page-pending").addEventListener("click", () => {
        if (currentPagePending < totalPagesPending) {
            currentPagePending++;
            fetchData(currentPagePending, currentPageApproved, true);
            document.querySelector("#current-page-pending").innerHTML = currentPagePending;
        }
    });
}

// Fetch total pages for pending and approved gate passes
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

// Fetching gate pass data
async function fetchData(pagePending, pageApproved, checkData = false) {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Room Booking slot",
            fields: ['name', 'status', 'customer', 'location', 'room_type'],
            limit_start: (pagePending - 1) * itemsPerPage,
            limit_page_length: itemsPerPage,
            filters: [['status', '=', 'Pending']]
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

// Toggle pagination buttons
function togglePaginationButtons(type, dataLength) {
    if (type === 'pending') {
        document.querySelector(".prev-page-pending").disabled = currentPagePending === 1;
        document.querySelector(".next-page-pending").disabled = currentPagePending === totalPagesPending;
    } else if (type === 'approved') {
        document.querySelector(".prev-page-approved").disabled = currentPageApproved === 1;
        document.querySelector(".next-page-approved").disabled = currentPageApproved === totalPagesApproved;
    }
}

// Show single gate pass data
function showDetails(id) {
    my_modal_3.showModal();
    submitBtn.disabled = false;
    toast.style.display = "none";
    PassId = id;
    fetchSingleData(id);
}

function fetchSingleData(id) {
    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Room Booking slot",
            name: id,
        },
        callback: function (response) {
            appendDetails(response.message);
            const bookingTimes = getBookingTimeForDate(response.message);
            generateTimeSlots(response.message.booking_date, bookingTimes);
        }
    });
}

function generateTimeSlots(date, bookingTimes) {
    const slotsContainer = document.getElementById('slotsContainer');
    slotsContainer.innerHTML = ''; // Clear any existing slots

    const timeSlots = [];
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    while (start <= end) {
        const hours = String(start.getHours()).padStart(2, '0');
        const minutes = String(start.getMinutes()).padStart(2, '0');
        const timeSlot = `${hours}:${minutes}`;
        timeSlots.push(timeSlot);

        // Create slot element
        const slotElement = document.createElement('div');
        slotElement.classList.add('time-slot');
        slotElement.textContent = timeSlot;

        // Mark slot as selected if it's already booked or for full day
        if (bookingTimes.includes("Full Day") || bookingTimes.includes(timeSlot)) {
            slotElement.classList.add('selected');
        }

        // Toggle slot selection on click
        slotElement.addEventListener('click', () => {
            slotElement.classList.toggle('selected');
        });

        slotsContainer.appendChild(slotElement);

        // Increment by 30 minutes for next slot
        start.setMinutes(start.getMinutes() + 30);
    }

    console.log("Slots Generated:", timeSlots);
    console.log("Selected Times:", bookingTimes);
}




// Get booking times for a date
function getBookingTimeForDate(data) {
    const bookingTime = data.booking_time;

    if (bookingTime === "Full Day") {
        return "Full Day"; // Indicate to select all slots
    } else {
        try {
            // Parse the JSON string to get an array of times
            const timesArray = JSON.parse(bookingTime);
            if (Array.isArray(timesArray)) {
                return timesArray; // Return array of times
            } else {
                console.error("Parsed booking_time is not an array:", timesArray);
                return [];
            }
        } catch (error) {
            console.error("Error parsing booking_time:", error);
            return []; // Return empty array if parsing fails
        }
    }
}

// Inserting gate pass data into modal
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


// Utility function to create tables
function constructTable(data, slNo, tableName) {
    let tableBody = document.querySelector(`.${tableName}`);
    console.log(data);

    let tableRow = document.createElement("tr");
    tableRow.classList.add("hover", "tableRow");


    // Set onClick attribute based on table name
    if (tableName === "tableBody" || tableName === "tableBodyAccOrReg") {
        tableRow.setAttribute("onClick", `showDetails('${data.name}')`);
        tableRow.innerHTML = `
            <td>${data.name}</td>
            <td>${data.customer}</td>
            <td>${data.status}</td>
            <td>${data.location}</td>
            <td>${data.room_type}</td>
        `;
    } else {

    }

    tableBody.appendChild(tableRow);
}

// update slots
function updateStatus() {
    // Gather the selected slots
    const selectedSlots = document.querySelectorAll('.time-slot.selected');
    selectedTimes = Array.from(selectedSlots).map(slot => slot.textContent);

    // Check if there are selected times, otherwise don't proceed
    if (selectedTimes.length === 0) {
        toast.style.display = "block";
        toast.innerHTML = "Please select at least one time slot!";
        return;
    }

    // Perform the update in the database
    frappe.call({
        method: "frappe.client.set_value",
        args: {
            doctype: "Room Booking slot",
            name: PassId,
            fieldname: {
                "status": "Approved",
                "booking_time": JSON.stringify(selectedTimes) // Store the selected slots as JSON
            }
        },
        callback: function (response) {
            toast.style.display = "block";
            toast.innerHTML = "Status updated successfully!";

            // Fetch the updated data for the modal and table
            fetchData(currentPagePending, currentPageApproved);
            fetchSingleData(PassId); // Refresh the modal with updated data
        }
    });
}

