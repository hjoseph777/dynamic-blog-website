import API_KEYS from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const addressInfo = document.getElementById('address-info');
    const coordinates = document.getElementById('coordinates');

    // Check if geolocation has been approved
    function checkGeolocationStatus() {
        return localStorage.getItem('geolocationApproved') === 'true';
    }

    // Request geolocation
    function requestGeolocation() {
        if ('geolocation' in navigator) {
            // Check if already approved
            if (checkGeolocationStatus()) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        coordinates.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
                        fetchAddress(latitude, longitude);
                    },
                    (error) => {
                        coordinates.textContent = 'Error retrieving location';
                        addressInfo.textContent = error.message;
                    }
                );
            } else {
                // Automatically request geolocation permission
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        coordinates.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
                        fetchAddress(latitude, longitude);
                        // Set local storage to remember approval
                        localStorage.setItem('geolocationApproved', 'true');
                    },
                    (error) => {
                        coordinates.textContent = 'Error retrieving location';
                        addressInfo.textContent = error.message;
                        // Set local storage to remember denial
                        localStorage.setItem('geolocationApproved', 'false');
                    }
                );
            }
        } else {
            coordinates.textContent = 'Geolocation not supported';
            addressInfo.textContent = 'Your browser does not support geolocation';
        }
    }

    // Fetch address using reverse geocoding
    function fetchAddress(latitude, longitude) {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEYS.GOOGLE_MAPS}`;
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    const address = data.results[0].formatted_address;
                    addressInfo.textContent = address;
                } else {
                    addressInfo.textContent = `Unable to retrieve address: ${data.status}`;
                }
            })
            .catch(error => {
                addressInfo.textContent = `Error retrieving address: ${error.message}`;
            });
    }

    // Call geolocation on page load if not already prompted in this session
    if (!sessionStorage.getItem('geolocationPrompted')) {
        requestGeolocation();
        sessionStorage.setItem('geolocationPrompted', 'true');
    }
});
