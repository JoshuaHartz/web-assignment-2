"use strict";
const rssUrl = './events.rss';  // Assuming events.rss is in the same directory
const cardHolder = document.getElementById('card-holder');

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
