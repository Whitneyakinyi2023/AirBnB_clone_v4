#!/usr/bin/node
// Write a JavaScript script (static/scripts/4-hbnb.js):

document.addEventListener('DOMContentLoaded', (event) => {
    const amenityDict = {};

    $('input:checkbox').change(function () {
        const dataId = $(this).attr('data-id');
        const dataName = $(this).attr('data-name');

        if ($(this).is(':checked')) {
            amenityDict[dataId] = dataName;
        } else {
            delete amenityDict[dataId];
        }

        const vals = Object.values(amenityDict);
        $('DIV.amenities h4').text(vals.join(', '));
    });

    function updateApiStatus() {
        $.ajax({
            type: 'GET',
            url: 'http://0.0.0.0:5001/api/v1/status/',
            success: function (data) {
                if (data.status === 'OK') {
                    $('DIV#api_status').addClass('available');
                } else {
                    $('DIV#api_status').removeClass('available');
                }
            }
        });
    }

    function fetchPlaces(dataFilter = {}) {
        $.ajax({
            type: 'POST',
            url: 'http://0.0.0.0:5001/api/v1/places_search/',
            data: JSON.stringify(dataFilter),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                const $placesSection = $('section.places');
                $placesSection.empty();

                data.forEach(place => {
                    const placeHTML = `
                        <article>
                            <div class="title_box">
                                <h2>${place.name}</h2>
                                <div class="price_by_night">$${place.price_by_night}</div>
                            </div>
                            <div class="information">
                                <div class="max_guest">${place.max_guest} Guest(s)</div>
                                <div class="number_rooms">${place.number_rooms} Bedroom(s)</div>
                                <div class="number_bathrooms">${place.number_bathrooms} Bathroom(s)</div>
                            </div>
                            <div class="description">${place.description}</div>
                        </article>`;
                    $placesSection.append(placeHTML);
                });
            },
            error: function (error) {
                console.error('Error fetching places:', error);
            }
        });
    }

    // Initial fetch for places and API status
    updateApiStatus();
    fetchPlaces();

    // Fetch places with amenities filter on button click
    $('button').click(function () {
        const amenityIds = Object.keys(amenityDict);
        fetchPlaces({ amenities: amenityIds });
    });
});
