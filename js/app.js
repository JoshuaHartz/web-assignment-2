"use strict";
const rssUrl = './events.rss';  // Assuming events.rss is in the same directory
const cardHolder = document.getElementById('card-holder');
let eventObjs = [];

// Fetch and process the XML data
fetch(rssUrl)
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'application/xml');
    const items = xmlDoc.querySelectorAll('item');

    // Process each item from the RSS feed
    items.forEach(item => {
      const title = item.querySelector('title')?.textContent || 'No Title';

      // Get start date element from the 'events' namespace
      const startDateElem = item.getElementsByTagNameNS('events', 'start')[0];
      const startDateString = startDateElem ? startDateElem.textContent : null;

      // Parse and format the date
      const startDate = startDateString ? new Date(Date.parse(startDateString)) : 'No Date';
      const formattedDate = startDate instanceof Date && !isNaN(startDate)
        ? startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'Invalid Date';

      const locationElem = item.getElementsByTagNameNS('events', 'location')[0];
      const location = locationElem ? locationElem.textContent : 'No Location';
      const description = item.querySelector('description')?.textContent || 'No Description';
      const enclosure = item.querySelector('enclosure');
      const imgSrc = enclosure ? enclosure.getAttribute('url') : 'learning.jpg';

      const eventObj = {
        title: title,
        startDate: formattedDate,
        location: location,
        description: description,
        enclosure: enclosure,
        imgSrc: imgSrc,
        html: null
      }
      eventObjs.push(eventObj);

      // Create the event card element
      const card = document.createElement('article');
      card.classList.add('card');

      // Create HTML for the card without the description
      card.innerHTML = `
                <img src="${imgSrc}" alt="${title}">
                <div class="card-content">
                    <h2 class="card-title">${title}</h2>
                    <p class="card-content-date">Date: ${formattedDate}</p>
                    <p class="card-content-location">Location: ${location}</p>
                    <button class="learn-more">Learn more</button>
                </div>
            `;
      eventObj.html = card.innerHTML
      // Create the description element separately
      const descriptionElement = document.createElement('p');
      descriptionElement.classList.add('description');
      descriptionElement.innerHTML = description;
      descriptionElement.style.display = 'none'; // Ensure it's hidden initially

      // Append the description to the card
      card.querySelector('.card-content').appendChild(descriptionElement);

      // Attach the card to the cardholder
      cardHolder.appendChild(card);

      // Get reference to the 'Learn more' button
      const learnMoreBtn = card.querySelector('.learn-more');

      // Add click event listener to toggle description visibility
      learnMoreBtn.addEventListener('click', () => {
        // Toggle the visibility of the description
        if (descriptionElement.style.display === 'none') {
          descriptionElement.style.display = 'block';
          learnMoreBtn.textContent = 'Show less';
        } else {
          descriptionElement.style.display = 'none';
          learnMoreBtn.textContent = 'Learn more';
        }
      });
    });
  })
  .catch(error => console.error('Error fetching or parsing RSS feed:', error));
// Filter events by description
function filterByDesc(events, desc) {
  if (!desc) return events;
  return events.filter(eventItem => eventItem.description.toLowerCase().includes(desc.toLowerCase()));
}
// Clear filters and resent event display
function clearFilters() {
  document.getElementById('Title-text').value = '';
  document.getElementById('Desc-text').value = '';
  document.getElementById('Date-text').value = '';
  displayAllEvents();
}
// Repopulates UI with all events
function displayAllEvents() {
  cardHolder.innerHTML = '';
  eventObjs.forEach(event => createEventCard(event));
}
// Creates event card
function createEventCard(event) {
  const card = document.createElement('article');
  card.classList.add('card');
  card.innerHTML = event.html
  const descriptionElement = document.createElement('p');
  descriptionElement.classList.add('description');
  descriptionElement.innerHTML = event.description;
  descriptionElement.style.display = 'none'; // Ensure it's hidden initially

  cardHolder.appendChild(card);
  const learnMoreBtn = card.querySelector('.learn-more');
  learnMoreBtn.addEventListener('click', () => {
    if (descriptionElement.style.display === 'none') {
      descriptionElement.style.display = 'block';
      learnMoreBtn.textContent = 'Show less';
    } else {
      descriptionElement.style.display = 'none';
      learnMoreBtn.textContent = 'Learn more';
    }
  });
}
// Clear Filter and Submit Filter buttons
document.getElementById('submit-btn').addEventListener('click', () => {
  const descriptionFilter = document.getElementById('Desc-text').value;
  const filteredEvents = filterByDesc(eventObjs, descriptionFilter);
  cardHolder.innerHTML = '';
  console.log('submitted')
  filteredEvents.forEach(event => createEventCard(event));
})
// listening for clear button
document.getElementById('clear-btn').addEventListener('click', clearFilters);

