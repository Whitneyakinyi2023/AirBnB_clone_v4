$(document).ready(init);

const HOST = '0.0.0.0';
const amenitySelections = {};
const stateSelections = {};
const citySelections = {};
let currentSelections = {};

function init() {
    $('.amenities .popover input').change(function () { handleSelectionChange(amenitySelections, 1); });
    $('.state_input').change(function () { handleSelectionChange(stateSelections, 2); });
    $('.city_input').change(function () { handleSelectionChange(citySelections, 3); });
    updateApiStatus();
    fetchAndDisplayPlaces();
}

function handleSelectionChange(selectionObj, selectionType) {
    const $this = $(this);
    const name = $this.attr('data-name');
    const id = $this.attr('data-id');

    if ($this.is(':checked')) {
        selectionObj[name] = id;
    } else {
        delete selectionObj[name];
    }

    displaySelectedNames(selectionObj, selectionType);
}

function displaySelectedNames(selectionObj, selectionType) {
    const names = Object.keys(selectionObj).sort().join(', ');
    if (selectionType === 1) {
        $('.amenities h4').text(names);
    } else if (selectionType === 2) {
        $('.locations h4').text(names);
    }
}

function updateApiStatus() {
    const API_URL = `http://${HOST}:5001/api/v1/status/`;
    $.get(API_URL, (data, textStatus) => {
        if (textStatus === 'success' && data.status === 'OK') {
            $('#api_status').addClass('available');
        } else {
            $('#api_status').removeClass('available');
        }
    });
}

function fetchAndDisplayPlaces() {
    const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
    $.ajax({
        url: PLACES_URL,
        type: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
            amenities: Object.values(amenitySelections),
            states: Object.values(stateSelections),
            cities: Object.values(citySelections)
        }),
        success: renderPlaces,
        error: function (error) {
            console.error(error);
        }
    });
}

function renderPlaces(places) {
    const $placesSection = $('SECTION.places');
    $placesSection.empty();

    places.forEach(place => {
        const article = createPlaceArticle(place);
        $placesSection.append(article);
    });
}

function createPlaceArticle(place) {
    const { id, name, price_by_night, max_guest, number_rooms, number_bathrooms, description } = place;
    return `
    <article>
      <div class="title_box">
        <h2>${name}</h2>
        <div class="price_by_night">$${price_by_night}</div>
      </div>
      <div class="information">
        <div class="max_guest">${max_guest} Guest(s)</div>
        <div class="number_rooms">${number_rooms} Bedroom(s)</div>
        <div class="number_bathrooms">${number_bathrooms} Bathroom(s)</div>
      </div>
      <div class="description">
        ${description}
      </div>
      <div class="reviews">
        <h2>
          <span id="${id}n" class="review-count">Reviews</span>
          <span id="${id}" class="toggle-reviews" onclick="toggleReviews(this)">Show</span>
        </h2>
        <ul id="${id}r"></ul>
      </div>
    </article>`;
}

function toggleReviews(element) {
    const $element = $(element);
    const id = element.id;
    const $reviewList = $(`#${id}r`);

    if ($element.text() === 'Show') {
        $element.text('Hide');
        fetchReviews(id, $reviewList);
    } else {
        $element.text('Show');
        $(`#${id}n`).text('Reviews');
        $reviewList.empty();
    }
}

function fetchReviews(placeId, $reviewList) {
    const REVIEWS_URL = `http://${HOST}:5001/api/v1/places/${placeId}/reviews`;
    $.get(REVIEWS_URL, (reviews, textStatus) => {
        if (textStatus === 'success') {
            $(`#${placeId}n`).text(`${reviews.length} Reviews`);
            reviews.forEach(review => {
                renderReview(review, placeId, $reviewList);
            });
        }
    });
}

function renderReview(review, placeId, $reviewList) {
    const date = new Date(review.created_at);
    const formattedDate = formatDate(date);
    fetchUser(review.user_id, formattedDate, review.text, placeId, $reviewList);
}

function fetchUser(userId, date, reviewText, placeId, $reviewList) {
    if (userId) {
        const USER_URL = `http://${HOST}:5001/api/v1/users/${userId}`;
        $.get(USER_URL, (user, textStatus) => {
            if (textStatus === 'success') {
                $reviewList.append(createReviewHtml(user, date, reviewText));
            }
        });
    }
}

function createReviewHtml(user, date, reviewText) {
    return `
    <li>
      <h3>From ${user.first_name} ${user.last_name} on ${date}</h3>
      <p>${reviewText}</p>
    </li>`;
}

function formatDate(date) {
    const month = date.toLocaleString('en', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    const ordinal = getOrdinalSuffix(day);
    return `${day}${ordinal} ${month} ${year}`;
}

function getOrdinalSuffix(day) {
    if ([1, 21, 31].includes(day)) return 'st';
    if ([2, 22].includes(day)) return 'nd';
    if ([3, 23].includes(day)) return 'rd';
    return 'th';
}