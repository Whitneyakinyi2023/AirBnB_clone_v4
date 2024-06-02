#!/usr/bin/node
// JS code that listens for changes on each input checkbox tag

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
});
