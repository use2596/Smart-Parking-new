// SmartPark - Smart Parking System JavaScript

// Global State
let currentUser = null;
let currentZone = 'car';
let selectedSlot = null;
let bookings = [];
let parkingData = {
    car: { total: 50, occupied: 38, slots: [] },
    bike: { total: 80, occupied: 52, slots: [] },
    bicycle: { total: 100, occupied: 55, slots: [] }
};

// Location Configuration - Can be customized for any parking location
let locationConfig = {
    name: 'College Campus Parking',
    pricing: {
        amount: 20,
        duration: 7, // hours
        label: '₹20 for 7 Hours'
    },
    surveillance: true,
    description: 'Full 24/7 CCTV Surveillance'
};

// Initialize data
function initializeData() {
    // Generate slots for each zone
    ['car', 'bike', 'bicycle'].forEach(type => {
        parkingData[type].slots = [];
        for (let i = 1; i <= parkingData[type].total; i++) {
            const isOccupied = i <= parkingData[type].occupied;
            parkingData[type].slots.push({
                id: `${type.toUpperCase()}-${String(i).padStart(3, '0')}`,
                number: i,
                occupied: isOccupied,
                reserved: false,
                vehicleNumber: isOccupied ? generateVehicleNumber(type) : null
            });
        }
    });

    // Load bookings from localStorage
    const savedBookings = localStorage.getItem('smartpark_bookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }

    // Load parking data from localStorage
    const savedParkingData = localStorage.getItem('smartpark_parking');
    if (savedParkingData) {
        parkingData = JSON.parse(savedParkingData);
    }

    // Load location config from localStorage
    const savedConfig = localStorage.getItem('smartpark_config');
    if (savedConfig) {
        locationConfig = JSON.parse(savedConfig);
    }

    // Apply location config to UI
    applyLocationConfig();
}

function applyLocationConfig() {
    // Update pricing display
    const pricingElements = document.querySelectorAll('.pricing-info span');
    pricingElements.forEach(el => {
        if (el.innerHTML.includes('₹')) {
            el.innerHTML = `<strong>${locationConfig.pricing.label}</strong> - All Vehicle Types`;
        }
    });

    // Update surveillance badge
    const surveillanceBadge = document.querySelector('.surveillance-badge');
    if (surveillanceBadge) {
        surveillanceBadge.style.display = locationConfig.surveillance ? 'inline-flex' : 'none';
    }

    // Update admin panel surveillance status
    const surveillanceStatus = document.getElementById('surveillanceStatus');
    if (surveillanceStatus) {
        surveillanceStatus.textContent = locationConfig.surveillance ? 'Active' : 'Inactive';
        surveillanceStatus.className = locationConfig.surveillance ? 'admin-number active' : 'admin-number';
    }

    // Update location name in admin panel if exists
    const locationNameInput = document.getElementById('locationName');
    if (locationNameInput) {
        locationNameInput.value = locationConfig.name;
    }

    const pricingAmountInput = document.getElementById('pricingAmount');
    if (pricingAmountInput) {
        pricingAmountInput.value = locationConfig.pricing.amount;
    }

    const surveillanceToggle = document.getElementById('surveillanceEnabled');
    if (surveillanceToggle) {
        surveillanceToggle.checked = locationConfig.surveillance;
    }
}

function generateVehicleNumber(type) {
    const prefix = 'AP';
    const num = Math.floor(Math.random() * 99) + 1;
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                   String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const suffix = Math.floor(Math.random() * 9999) + 1;
    return `${prefix} ${num} ${letters} ${suffix}`;
}

function saveData() {
    localStorage.setItem('smartpark_bookings', JSON.stringify(bookings));
    localStorage.setItem('smartpark_parking', JSON.stringify(parkingData));
    localStorage.setItem('smartpark_config', JSON.stringify(locationConfig));
}

// Location Configuration Functions
function saveLocationConfig() {
    const name = document.getElementById('locationName').value;
    const pricing = parseInt(document.getElementById('pricingAmount').value);
    const surveillance = document.getElementById('surveillanceEnabled').checked;

    if (!name || !pricing) {
        alert('Please fill all fields');
        return;
    }

    locationConfig = {
        name: name,
        pricing: {
            amount: pricing,
            duration: 7,
            label: `₹${pricing} for 7 Hours`
        },
        surveillance: surveillance,
        description: surveillance ? 'Full 24/7 CCTV Surveillance' : 'No Surveillance'
    };

    saveData();
    applyLocationConfig();
    alert('Location configuration saved successfully!');
}

function configurePricing() {
    const newPrice = prompt('Enter new price for 7 hours (₹):', locationConfig.pricing.amount);
    if (newPrice && !isNaN(newPrice) && newPrice > 0) {
        locationConfig.pricing.amount = parseInt(newPrice);
        locationConfig.pricing.label = `₹${newPrice} for 7 Hours`;
        saveData();
        applyLocationConfig();
        alert(`Pricing updated to ₹${newPrice} for 7 hours`);
    }
}

// Login Function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;

    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    currentUser = {
        name: username,
        type: userType,
        id: 'user_' + Date.now()
    };

    // Show admin options if admin
    if (userType === 'admin') {
        document.body.classList.add('is-admin');
    }

    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    
    initializeData();
    updateStats();
    renderParkingGrid();
    renderActivityList();
    renderBookingsList();
    renderHistoryList();
    updateTime();
    setInterval(updateTime, 1000);
}

function logout() {
    currentUser = null;
    document.body.classList.remove('is-admin');
    document.getElementById('dashboardScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.add('active');
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('onclick')?.includes(sectionName)) {
            item.classList.add('active');
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }

    // Refresh data
    if (sectionName === 'bookings') {
        renderBookingsList();
    } else if (sectionName === 'history') {
        renderHistoryList();
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function toggleProfileMenu() {
    // Simple alert for demo
    const options = ['Profile', 'Settings', 'Help'];
    const choice = confirm('Profile Menu\n\nClick OK for Profile\nClick Cancel for Settings');
}

// Time Update
function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Stats Update
function updateStats() {
    const carAvailable = parkingData.car.slots.filter(s => !s.occupied && !s.reserved).length;
    const bikeAvailable = parkingData.bike.slots.filter(s => !s.occupied && !s.reserved).length;
    const bicycleAvailable = parkingData.bicycle.slots.filter(s => !s.occupied && !s.reserved).length;

    document.getElementById('carStats').textContent = `${carAvailable} / ${parkingData.car.total}`;
    document.getElementById('bikeStats').textContent = `${bikeAvailable} / ${parkingData.bike.total}`;
    document.getElementById('bicycleStats').textContent = `${bicycleAvailable} / ${parkingData.bicycle.total}`;
}

// Zone Selection
function selectZone(zone) {
    currentZone = zone;
    selectedSlot = null;
    document.getElementById('selectedSlot').value = '';
    
    // Update tabs
    document.querySelectorAll('.zone-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-zone="${zone}"]`).classList.add('active');
    
    // Update zone info
    const zoneNames = {
        car: 'Car Parking Zone A',
        bike: 'Bike Parking Zone B',
        bicycle: 'Bicycle Parking Zone C'
    };
    document.getElementById('zoneTitle').textContent = zoneNames[zone];
    
    // Update vehicle type select
    document.getElementById('vehicleType').value = zone;
    
    renderParkingGrid();
    updateZoneStatus();
}

function updateZoneStatus() {
    const available = parkingData[currentZone].slots.filter(s => !s.occupied && !s.reserved).length;
    const occupied = parkingData[currentZone].slots.filter(s => s.occupied).length;
    
    const statusContainer = document.querySelector('.zone-status');
    statusContainer.innerHTML = `
        <span class="status-badge available">${available} Available</span>
        <span class="status-badge occupied">${occupied} Occupied</span>
    `;
}

// Parking Grid
function renderParkingGrid() {
    const grid = document.getElementById('parkingGrid');
    grid.innerHTML = '';
    
    const slots = parkingData[currentZone].slots;
    const userBookings = bookings.filter(b => b.userId === currentUser?.id && b.status === 'active');
    
    slots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = 'parking-slot';
        
        // Check if this slot is booked by current user
        const userBooking = userBookings.find(b => b.slotId === slot.id);
        
        if (userBooking) {
            slotElement.classList.add('reserved');
        } else if (slot.occupied) {
            slotElement.classList.add('occupied');
        } else {
            slotElement.classList.add('available');
        }
        
        if (selectedSlot === slot.id) {
            slotElement.classList.add('selected');
        }
        
        const iconClass = currentZone === 'car' ? 'fa-car' : 
                         currentZone === 'bike' ? 'fa-motorcycle' : 'fa-bicycle';
        
        slotElement.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${slot.number}</span>
        `;
        
        if (!slot.occupied && !userBooking) {
            slotElement.onclick = () => selectParkingSlot(slot.id);
        }
        
        grid.appendChild(slotElement);
    });
}

function selectParkingSlot(slotId) {
    selectedSlot = slotId;
    document.getElementById('selectedSlot').value = slotId;
    renderParkingGrid();
    calculateCost();
}

// Booking Functions
function calculateCost() {
    const fromTime = document.getElementById('fromTime').value;
    const toTime = document.getElementById('toTime').value;
    
    if (fromTime && toTime) {
        const from = new Date(`2000-01-01T${fromTime}`);
        const to = new Date(`2000-01-01T${toTime}`);
        
        let hours = (to - from) / (1000 * 60 * 60);
        if (hours < 0) hours += 24;
        
        // New pricing model: ₹20 for 7 hours (same for all vehicle types)
        const basePrice = locationConfig.pricing.amount;
        const baseDuration = locationConfig.pricing.duration;
        
        // Calculate cost based on duration
        let cost = basePrice;
        if (hours > baseDuration) {
            const extraHours = Math.ceil(hours - baseDuration);
            cost += (extraHours * 5); // ₹5 per extra hour
        }
        
        document.getElementById('duration').textContent = `${Math.ceil(hours)} hours`;
        document.getElementById('totalCost').textContent = `₹${cost}`;
    }
}

// Add event listeners for time inputs
document.addEventListener('DOMContentLoaded', function() {
    const fromTimeInput = document.getElementById('fromTime');
    const toTimeInput = document.getElementById('toTime');
    
    if (fromTimeInput && toTimeInput) {
        fromTimeInput.addEventListener('change', calculateCost);
        toTimeInput.addEventListener('change', calculateCost);
    }
    
    // Set default times
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const laterTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
    
    if (fromTimeInput) fromTimeInput.value = currentTime;
    if (toTimeInput) toTimeInput.value = laterTime;
});

function bookSlot() {
    if (!selectedSlot) {
        alert('Please select a parking slot');
        return;
    }
    
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const fromTime = document.getElementById('fromTime').value;
    const toTime = document.getElementById('toTime').value;
    const vehicleType = document.getElementById('vehicleType').value;
    
    if (!vehicleNumber || !fromTime || !toTime) {
        alert('Please fill all fields');
        return;
    }
    
    const from = new Date(`2000-01-01T${fromTime}`);
    const to = new Date(`2000-01-01T${toTime}`);
    let hours = (to - from) / (1000 * 60 * 60);
    if (hours < 0) hours += 24;
    
    // New pricing model: ₹20 for 7 hours (same for all vehicle types)
    const basePrice = locationConfig.pricing.amount;
    const baseDuration = locationConfig.pricing.duration;
    
    let cost = basePrice;
    if (hours > baseDuration) {
        const extraHours = Math.ceil(hours - baseDuration);
        cost += (extraHours * 5); // ₹5 per extra hour
    }
    
    const booking = {
        id: 'BK' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        slotId: selectedSlot,
        zone: vehicleType,
        vehicleNumber: vehicleNumber,
        fromTime: fromTime,
        toTime: toTime,
        duration: Math.ceil(hours),
        cost: cost,
        pricingModel: locationConfig.pricing.label,
        status: 'active',
        bookingTime: new Date().toISOString()
    };
    
    bookings.push(booking);
    
    // Mark slot as reserved
    const slot = parkingData[vehicleType].slots.find(s => s.id === selectedSlot);
    if (slot) {
        slot.reserved = true;
    }
    
    saveData();
    
    // Show success modal
    showSuccessModal(booking);
    
    // Reset form
    selectedSlot = null;
    document.getElementById('selectedSlot').value = '';
    document.getElementById('vehicleNumber').value = '';
    
    updateStats();
    renderParkingGrid();
    renderActivityList();
}

function showSuccessModal(booking) {
    const modal = document.getElementById('successModal');
    const details = document.getElementById('bookingDetails');
    
    const zoneNames = { car: 'Car', bike: 'Bike', bicycle: 'Bicycle' };
    
    details.innerHTML = `
        <div class="detail-row">
            <span>Booking ID:</span>
            <span>${booking.id}</span>
        </div>
        <div class="detail-row">
            <span>Slot:</span>
            <span>${booking.slotId}</span>
        </div>
        <div class="detail-row">
            <span>Zone:</span>
            <span>${zoneNames[booking.zone]} Parking</span>
        </div>
        <div class="detail-row">
            <span>Vehicle:</span>
            <span>${booking.vehicleNumber}</span>
        </div>
        <div class="detail-row">
            <span>Time:</span>
            <span>${booking.fromTime} - ${booking.toTime}</span>
        </div>
        <div class="detail-row">
            <span>Pricing:</span>
            <span>${booking.pricingModel || locationConfig.pricing.label}</span>
        </div>
        <div class="detail-row">
            <span>Total Amount:</span>
            <span>₹${booking.cost}</span>
        </div>
        ${locationConfig.surveillance ? '<div class="detail-row" style="color: #48bb78;"><span><i class="fas fa-video"></i> Under Surveillance</span></div>' : ''}
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Activity List
function renderActivityList() {
    const list = document.getElementById('activityList');
    const recentBookings = bookings.slice(-5).reverse();
    
    if (recentBookings.length === 0) {
        list.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }
    
    list.innerHTML = recentBookings.map(booking => {
        const time = new Date(booking.bookingTime);
        const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="activity-item">
                <div class="activity-icon booking">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="activity-details">
                    <h4>Slot ${booking.slotId} Booked</h4>
                    <p>${booking.vehicleNumber} • ${booking.zone}</p>
                </div>
                <span class="activity-time">${timeStr}</span>
            </div>
        `;
    }).join('');
}

// Bookings List
function renderBookingsList() {
    const list = document.getElementById('bookingsList');
    const userBookings = bookings.filter(b => b.userId === currentUser?.id && b.status === 'active');
    
    if (userBookings.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <p>No active bookings</p>
                <button onclick="showSection('zones')" class="btn-primary">Book a Slot</button>
            </div>
        `;
        return;
    }
    
    const zoneIcons = { car: 'fa-car', bike: 'fa-motorcycle', bicycle: 'fa-bicycle' };
    
    list.innerHTML = userBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-icon ${booking.zone}">
                <i class="fas ${zoneIcons[booking.zone]}"></i>
            </div>
            <div class="booking-details">
                <h4>Slot ${booking.slotId}</h4>
                <p><i class="fas fa-car"></i> ${booking.vehicleNumber}</p>
                <p><i class="fas fa-clock"></i> ${booking.fromTime} - ${booking.toTime}</p>
                <p><i class="fas fa-rupee-sign"></i> ₹${booking.cost}</p>
            </div>
            <span class="booking-status active">Active</span>
            <div class="booking-actions">
                <button onclick="cancelBooking('${booking.id}')" class="btn-small btn-danger">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `).join('');
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = 'cancelled';
        
        // Free up the slot
        const slot = parkingData[booking.zone].slots.find(s => s.id === booking.slotId);
        if (slot) {
            slot.reserved = false;
            slot.occupied = false;
        }
        
        saveData();
        renderBookingsList();
        updateStats();
        renderParkingGrid();
        
        alert('Booking cancelled successfully');
    }
}

// History List
function renderHistoryList() {
    const list = document.getElementById('historyList');
    const userHistory = bookings.filter(b => b.userId === currentUser?.id && b.status !== 'active');
    
    if (userHistory.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No parking history</p>
            </div>
        `;
        return;
    }
    
    const zoneIcons = { car: 'fa-car', bike: 'fa-motorcycle', bicycle: 'fa-bicycle' };
    
    list.innerHTML = userHistory.map(booking => `
        <div class="history-card">
            <div class="history-icon ${booking.zone}">
                <i class="fas ${zoneIcons[booking.zone]}"></i>
            </div>
            <div class="history-details">
                <h4>Slot ${booking.slotId}</h4>
                <p><i class="fas fa-car"></i> ${booking.vehicleNumber}</p>
                <p><i class="fas fa-calendar"></i> ${new Date(booking.bookingTime).toLocaleDateString()}</p>
                <p><i class="fas fa-clock"></i> ${booking.fromTime} - ${booking.toTime}</p>
            </div>
            <span class="booking-status ${booking.status}">${booking.status}</span>
        </div>
    `).join('');
}

// Admin Functions
function resetAllSlots() {
    if (!confirm('Are you sure you want to reset all parking slots? This will clear all bookings.')) return;
    
    ['car', 'bike', 'bicycle'].forEach(type => {
        parkingData[type].slots.forEach(slot => {
            slot.occupied = Math.random() > 0.7;
            slot.reserved = false;
            if (slot.occupied) {
                slot.vehicleNumber = generateVehicleNumber(type);
            }
        });
    });
    
    bookings = [];
    saveData();
    
    updateStats();
    renderParkingGrid();
    renderBookingsList();
    
    alert('All slots have been reset');
}

function exportData() {
    const data = {
        parkingData,
        bookings,
        exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpark-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully');
}

function addSlots() {
    const type = prompt('Enter vehicle type (car/bike/bicycle):');
    if (!type || !['car', 'bike', 'bicycle'].includes(type)) {
        alert('Invalid vehicle type');
        return;
    }
    
    const count = parseInt(prompt('Enter number of slots to add:'));
    if (!count || count <= 0) {
        alert('Invalid number');
        return;
    }
    
    const currentTotal = parkingData[type].total;
    for (let i = currentTotal + 1; i <= currentTotal + count; i++) {
        parkingData[type].slots.push({
            id: `${type.toUpperCase()}-${String(i).padStart(3, '0')}`,
            number: i,
            occupied: false,
            reserved: false,
            vehicleNumber: null
        });
    }
    parkingData[type].total += count;
    
    saveData();
    updateStats();
    renderParkingGrid();
    
    alert(`${count} slots added to ${type} zone`);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Pre-fill demo credentials
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.value = 'P.LohithaSri';
    }
});

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
        document.getElementById('overlay').classList.remove('active');
    }
});
