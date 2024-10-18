"use strict";
const rssUrl = './events.rss';  // Assuming events.rss is in the same directory
const cardHolder = document.getElementById('card-holder');
let eventObjs = [];
let filteredEventObjs = [];
let currentPage = 1;
let eventsPerPage = 'all'; // Default number of events per page set to total events

// Add filterEvents Function
function filterEvents(events, filterValue, filterFunction) {
  if (!filterValue) return events;  // If no value is specified, return all events
  return filterFunction(events, filterValue);  // Apply the filter function
}

// Filter by title
function filterByTitle(events, title) {
  if (!title) return events; // Return all events if title is empty
  return events.filter(eventItem => eventItem.title.toLowerCase().includes(title.toLowerCase()));
}

// filter by date
function filterByDate(events, date) {
  const parsedDate = Date.parse(date);
  if (isNaN(parsedDate)) return events;  // Skip invalid date filters
  const formattedDate = new Date(parsedDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  return events.filter(event => event.startDate === formattedDate);
}

// isValidDate Function
function isValidDate(dateString) {
  // Use Date.parse to check if the date is valid
  const parsedDate = Date.parse(dateString);
  return !isNaN(parsedDate); // Returns true if the date is valid
}

// Filter events by description
function filterByDesc(events, desc) {
  if (!desc) return events;
  return events.filter(eventItem => eventItem.desc.toLowerCase().includes(desc.toLowerCase()));
}

// Clear filters and resent event display
function clearFilters() {
  // Reset the filtered event objects to all events, current page, and events per page
  filteredEventObjs = [...eventObjs]; // Or simply filteredEventObjs = eventObjs; if direct reference is enough
  currentPage = 1; // Reset to the first page
  eventsPerPage = 'all'; // Reset to show all events

  // Update the event count display
  document.getElementById('event-count').textContent = `Showing ${filteredEventObjs.length}/${eventObjs.length} events`;
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
  console.log(event.desc)
  descriptionElement.innerHTML = event.desc
  descriptionElement.style.display = 'none';
  card.querySelector('.card-content').appendChild(descriptionElement);
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

// Function to update events per page and reset current page
function updateEventsPerPage(value) {
  eventsPerPage = value === 'all' ? 'all' : Number(value); // Convert to number if not 'all'
  currentPage = 1; // Reset to the first page
  displayPaginatedEvents(); // Refresh displayed events after change

  // Synchronize both dropdowns
  document.getElementById('events-per-page').value = value;
  document.getElementById('events-per-page-bottom').value = value;
}

// Function to display events based on the current page and events per page
function displayPaginatedEvents() {
  cardHolder.innerHTML = '';  // Clear the current display

  // Use filteredEventObjs if there are active filters, otherwise use all events
  const dataSource = filteredEventObjs.length > 0 ? filteredEventObjs : eventObjs;
  const totalItems = dataSource.length;

  // Calculate start and end indices based on current page and events per page
  const startIndex = (currentPage - 1) * (eventsPerPage === 'all' ? totalItems : eventsPerPage);
  const endIndex = eventsPerPage === 'all' ? totalItems : startIndex + eventsPerPage;
  const paginatedEvents = dataSource.slice(startIndex, endIndex);

  // Display paginated events
  paginatedEvents.forEach(event => createEventCard(event));

  // Update page info
  const totalPages = eventsPerPage === 'all' ? 1 : Math.ceil(totalItems / eventsPerPage);
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('page-info-bottom').textContent = `Page ${currentPage} of ${totalPages}`;

  // Update event count to show filtered results
  document.getElementById('event-count').textContent = `Showing ${totalItems}/${eventObjs.length} events`;
}

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
      // console.log(description)
      const enclosure = item.querySelector('enclosure');
      const imgSrc = enclosure ? enclosure.getAttribute('url') : 'learning.jpg';

      const eventObj = {
        title: title,
        startDate: formattedDate,
        location: location,
        desc: description,
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
      descriptionElement.style.display = 'none';

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
    document.getElementById('event-count').textContent = `Showing ${eventObjs.length}/${eventObjs.length} events`; // Initial count
  })
  .catch(error => console.error('Error fetching or parsing RSS feed:', error));

// Chain Filters in the submit-btn Event Listener
document.getElementById('submit-btn').addEventListener('click', () => {
  const descriptionFilter = document.getElementById('Desc-text').value;
  const dateFilter = document.getElementById('Date-text').value;
  const titleFilter = document.getElementById('Title-text').value;

  // Start by filtering through all events
  filteredEventObjs = eventObjs;  // Start with the full event list

  // Apply each filter if there is a value entered by the user
  filteredEventObjs = filterEvents(filteredEventObjs, titleFilter, filterByTitle);
  filteredEventObjs = filterEvents(filteredEventObjs, descriptionFilter, filterByDesc);

  // Validate and apply date filter
  if (dateFilter && isValidDate(dateFilter)) {
    filteredEventObjs = filterEvents(filteredEventObjs, dateFilter, filterByDate);
  } else if (dateFilter) {
    alert("Please enter a valid date in a recognizable format.");
  }

  if (filteredEventObjs.length === 0){
    alert("No events to display."); // Optional alert
    // Update the event count to show 0 events
    document.getElementById('event-count').textContent = `Showing 0/${eventObjs.length} events`;
    const eventContainer = document.getElementById("card-holder"); // Make sure this ID matches your HTML
    eventContainer.innerHTML = ""; // Clear the container
  } else {
    // Reset pagination to the first page after filtering
    currentPage = 1;
    updateEventsPerPage('all'); // Reset the events per page to 'all'

    // Update pagination and display filtered events
    displayPaginatedEvents();
  }
});

// listening for clear button
document.getElementById('clear-btn').addEventListener('click', clearFilters);

// Event listener for events per page selection (top)
document.getElementById('events-per-page').addEventListener('change', (event) => {
  updateEventsPerPage(event.target.value); // Call the shared function
});

// Event listener for events per page selection (bottom)
document.getElementById('events-per-page-bottom').addEventListener('change', (event) => {
  updateEventsPerPage(event.target.value); // Call the shared function
});

// Next button functionality
document.getElementById('next-btn').addEventListener('click', () => {
  const totalItems = filteredEventObjs.length > 0 ? filteredEventObjs.length : eventObjs.length;
  const totalPages = eventsPerPage === 'all' ? 1 : Math.ceil(totalItems / eventsPerPage);
  if (totalPages > 1 && currentPage < totalPages) {
    currentPage++;
    displayPaginatedEvents();
  }
});

// Previous button functionality
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPaginatedEvents();
  }
});

// Next button functionality (bottom)
document.getElementById('next-btn-bottom').addEventListener('click', () => {
  const totalItems = filteredEventObjs.length > 0 ? filteredEventObjs.length : eventObjs.length;
  const totalPages = eventsPerPage === 'all' ? 1 : Math.ceil(totalItems / eventsPerPage);
  if (totalPages > 1 && currentPage < totalPages) {
    currentPage++;
    displayPaginatedEvents();
  }
});

// Previous button functionality (bottom)
document.getElementById('prev-btn-bottom').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPaginatedEvents();
  }
});
