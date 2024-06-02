#!/usr/bin/node
// JS code that listens for changes on each input checkbox tag and updates API status

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

        const amenityNames = Object.values(amenityDict).join(', ');
        $('DIV.amenities h4').text(amenityNames);
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
            },
            error: function () {
                $('DIV#api_status').removeClass('available');
            }
        });
    }

    // Initial update for API status
    updateApiStatus();
});
