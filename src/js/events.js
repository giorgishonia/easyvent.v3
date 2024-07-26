const firebaseConfigEvents = {
  apiKey: "AIzaSyB5Cb1X6xrpKTullZZDV1S8A700uIzm3Ws",
  authDomain: "easyvent-85031.firebaseapp.com",
  projectId: "easyvent-85031",
  storageBucket: "easyvent-85031.appspot.com",
  messagingSenderId: "496483041148",
  appId: "1:496483041148:web:e7410ac120211c05232ef9",
  measurementId: "G-XMEKKNRMG7"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfigEvents);
}

const firestore = firebase.firestore();
const db = firebase.firestore();
const auth = firebase.auth();

let currentEventId = null;
let currentCategory = 'all'; // To keep track of the currently selected category
let selectedCategories = [];
let uid = null; // Define uid variable


function formatCreationDate(date) {
  if (!date || !date.seconds) {
      console.error('Invalid date format:', date);
      return 'Unknown date';
  }

  const creationDate = new Date(date.seconds * 1000);
  const currentDate = new Date();
  const options = { day: 'numeric', month: 'long' };
  let formattedDate = creationDate.toLocaleDateString('en-US', options);

  if (creationDate.getFullYear() !== currentDate.getFullYear()) {
      formattedDate = `${creationDate.getDate()} ${creationDate.toLocaleDateString('en-US', { month: 'short' })} ${creationDate.getFullYear()}`;
  }

  return formattedDate;
}

function getCategoryClass(category) {
  switch (category) {
    case 'Music':
      return 'category-music';
    case 'Sports':
      return 'category-sports';
    case 'Technology':
      return 'category-technology';
    case 'Art':
      return 'category-art';
    case 'Education':
      return 'category-education';
    case 'Fun':
      return 'category-fun';
    case 'Gaming':
      return 'category-gaming';
    case 'Food':
      return 'category-food';
    case 'Movies':
      return 'category-movies';
    case 'Theater':
      return 'category-theater';
    case 'Fashion':
      return 'category-fashion';
    case 'Health':
      return 'category-health';
    case 'For Kids':
      return 'category-kids';
    case 'For Pets':
      return 'category-pets';
    case 'Charity':
      return 'category-charity';
    case 'Travel':
      return 'category-travel';
    default:
      return '';
  }
}

function getCategoryIcon(category) {
  switch (category) {
    case 'Music':
      return '🎵';
    case 'Sports':
      return '⚽';
    case 'Technology':
      return '💻';
    case 'Art':
      return '🎨';
    case 'Education':
      return '📚';
    case 'Fun':
      return '🥳';
    case 'Gaming':
      return '🎮';
    case 'Food':
      return '🍽️';
    case 'Movies':
      return '🎬';
    case 'Theater':
      return '🎭';
    case 'Fashion':
      return '👗';
    case 'Health':
      return '💪';
    case 'For Kids':
      return '🧒';
    case 'For Pets':
      return '🐾';
    case 'Charity':
      return '🤲';
    case 'Travel':
      return '✈️';
    default:
      return '';
  }
}

function displayEvents(uid) {
  const eventsContainer = document.getElementById('eventsContainer');
  eventsContainer.innerHTML = '';

  let query = db.collection('events').orderBy('dateTime', 'asc');

  if (selectedCategories.length > 0) {
    query = query.where('category', 'in', selectedCategories);
  }

  query.get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const event = doc.data();
      const eventId = doc.id;
      const categoryClass = getCategoryClass(event.category);
      const categoryIcon = getCategoryIcon(event.category);
      const formattedCreationDate = formatRelativeTime(event.createdAt || { seconds: Date.now() / 1000 });

      const eventCard = document.createElement('div');
      eventCard.classList.add('event-card');
      eventCard.id = `event-card-${eventId}`;

      if (document.body.classList.contains('dark-theme')) {
        eventCard.classList.add('dark-theme');
      }

      const editIndicatorHTML = event.editedAt ? `
      <div class="edit-indicator-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
          <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
        </svg>
        <div class="tooltip">This event has been edited</div>
      </div>` : '';
    

      eventCard.innerHTML = `
        <div class="left-panel">
          <img id="event-image-${eventId}" class="event-image" src="${event.imageUrl}" alt="${event.title}">
        </div>
        <div class="right-panel">
          <div class="upper-panel">
            <p class="category-text ${categoryClass}">${categoryIcon} ${event.category}</p>
            <div id="event-creation-date">${formattedCreationDate}</div> <!-- Show creation date -->
            <div id="edit-indicator" class="${event.editedAt ? 'show' : 'hidden'}">${editIndicatorHTML}</div>
          </div>
          <h2 class="event-title">${event.title}</h2>
          <div class="lower-panel">
            <p id="event-date">${event.dateTime.toDate().toLocaleString()}</p>
            <p id="event-location">${event.location}</p>
            <div id="like-container-${eventId}">
              <button class="like-button" data-id="${eventId}">
                <svg id="like-icon-${eventId}" class="like-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                </svg>
                <span class="like-count">${event.likeCount || 0}</span>
              </button>
            </div>
            <button class="comment-button" data-id="${eventId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-dots-fill" viewBox="0 0 16 16">
  <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
</svg></button>
          </div>
        </div>
        <div class="dropdown">
          <button class="dropbtn">...</button>
          <div class="dropdown-content" id="dropdown-${eventId}">
            <!-- Edit and Delete buttons will be added dynamically -->
          </div>
        </div>
      `;
      eventsContainer.appendChild(eventCard);

      const dropdownContent = document.getElementById(`dropdown-${eventId}`);
      dropdownContent.innerHTML = '';

      if (event.createdBy === uid) {
        dropdownContent.insertAdjacentHTML('afterbegin', `
          <button class="edit-button" data-id="${eventId}">Edit</button>
          <button class="delete-button" data-id="${eventId}">Delete</button>
        `);
      }

      dropdownContent.insertAdjacentHTML('beforeend', `
        <button class="report-button" data-id="${eventId}">Report</button>
      `);

      const horizontalLine = document.createElement('hr');
      eventsContainer.appendChild(horizontalLine);

      // Check if user has liked the event
      const likeIcon = document.querySelector(`#like-icon-${eventId}`);
      if (likeIcon && event.userLikes && event.userLikes[uid]) {
        likeIcon.classList.add('liked');
      } else {
        likeIcon.classList.remove('liked');
      }
    });

    console.log('Events displayed successfully.');

    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const eventId = button.getAttribute('data-id');
        handleLikeEvent(eventId);
      });
    });

    attachEventListeners();
  }).catch(error => {
    console.error('Error fetching events:', error);
  });
}



function formatRelativeTime(date) {
  if (!date || !date.seconds) {
      console.error('Invalid date format:', date);
      return 'Unknown date';
  }

  const now = new Date();
  const createdAt = new Date(date.seconds * 1000);
  const diffInSeconds = Math.floor((now - createdAt) / 1000);

  if (diffInSeconds < 60) {
      return '0m ago'; // Less than a minute
  }

  const intervals = [
      { label: 'd', value: 86400 },  // 24 * 60 * 60
      { label: 'h', value: 3600 },   // 60 * 60
      { label: 'm', value: 60 }       // 60
  ];

  for (const interval of intervals) {
      const value = Math.floor(diffInSeconds / interval.value);
      if (value >= 1) {
          return `${value}${interval.label} ago`;
      }
  }

  return 'Just now';
}
document.addEventListener('DOMContentLoaded', () => {
  const editIndicator = document.getElementById('edit-indicator');

  function showEditIndicator() {
    editIndicator.classList.remove('hidden');
    editIndicator.classList.add('show');
    editIndicator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
      </svg>`;
  }

  function hideEditIndicator() {
    editIndicator.classList.remove('show');
    editIndicator.classList.add('hidden');
  }

  // Example usage
  // Call showEditIndicator() when an event is edited
});

function handleLikeEvent(eventId) {
  const userId = firebase.auth().currentUser.uid;

  if (!userId) {
    console.error('User is not authenticated.');
    return;
  }

  const eventRef = firestore.collection('events').doc(eventId);

  eventRef.get().then(doc => {
    if (!doc.exists) {
      throw "Event does not exist!";
    }

    const eventData = doc.data();
    const userLikes = eventData.userLikes || {};
    const likeCount = eventData.likeCount || 0;

    let newLikeCount;
    if (userLikes[userId]) {
      delete userLikes[userId];
      newLikeCount = likeCount - 1;
    } else {
      userLikes[userId] = true;
      newLikeCount = likeCount + 1;
    }

    return eventRef.update({
      likeCount: newLikeCount,
      userLikes: userLikes
    }).then(() => {
      // Update the UI with the new like count
      const likeCountElement = document.querySelector(`#like-container-${eventId} .like-count`);
      if (likeCountElement) {
        likeCountElement.innerText = newLikeCount;
      } else {
        console.error(`Like count element not found for event ID: ${eventId}`);
      }

      // Toggle the liked class on the heart icon
      const likeIcon = document.querySelector(`#like-icon-${eventId}`);
      if (likeIcon) {
        if (userLikes[userId]) {
          likeIcon.classList.add('liked');
        } else {
          likeIcon.classList.remove('liked');
        }
      } else {
        console.error(`Like icon not found for event ID: ${eventId}`);
      }

      return newLikeCount;
    });
  }).catch(error => {
    console.error('Error updating like:', error);
  });
}

const provider = new firebase.auth.GoogleAuthProvider();

// Function to check and save user data
function checkAndSaveUserData(user) {
  const userData = {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL, // Add the photoURL field
      createdAt: firebase.firestore.Timestamp.fromDate(new Date())
  };

  db.collection('users').doc(user.uid).set(userData, { merge: true })
      .then(() => {
          console.log('User data saved successfully.');
      })
      .catch((error) => {
          console.error('Error saving user data:', error);
      });
}


function formatEventDate(date) {
  const eventDate = new Date(date.seconds * 1000);
  const currentDate = new Date();
  const options = { day: 'numeric', month: 'long' };
  let formattedDate = eventDate.toLocaleDateString('en-US', options);

  if (eventDate.getFullYear() !== currentDate.getFullYear()) {
    formattedDate = `${eventDate.getDate()} ${eventDate.toLocaleDateString('en-US', { month: 'short' })} ${eventDate.getFullYear()}`;
  }

  return formattedDate;
}


function attachEventListeners() {
  document.querySelectorAll('.edit-button').forEach(button => {
    button.removeEventListener('click', handleEdit);
    button.addEventListener('click', handleEdit);
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.removeEventListener('click', handleDelete);
    button.addEventListener('click', handleDelete);
  });

  document.querySelectorAll('.report-button').forEach(button => {
    button.removeEventListener('click', handleReport);
    button.addEventListener('click', handleReport);
  });


  document.querySelectorAll('.event-image').forEach(img => {
    img.removeEventListener('click', handleFullscreenImage);
    img.addEventListener('click', handleFullscreenImage);
  });
}

function handleFullscreenImage(event) {
  const eventId = event.target.id.split('-').pop();
  window.location.href = `eventPage.html?eventId=${eventId}`;
}


function handleCategoryClick(category) {
  const index = selectedCategories.indexOf(category);

  if (index === -1) {
    selectedCategories.push(category);
  } else {
    selectedCategories.splice(index, 1);
  }

  console.log('Selected categories:', selectedCategories); // Debugging
  displayEvents(uid);
  updateCategoryButtonClasses();
}

function updateCategoryButtonClasses() {
  document.querySelectorAll('#category-buttons .category-button').forEach(button => {
    const category = button.getAttribute('data-category');
    if (selectedCategories.includes(category)) {
      button.classList.add('selected-category');
    } else {
      button.classList.remove('selected-category');
    }
  });
}

document.querySelectorAll('#category-buttons .category-button').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-category');
    handleCategoryClick(category);
  });
});



updateCategoryButtonClasses();

function fetchEvents() {
  let query = firestore.collection('events');

  if (selectedCategories.length > 0) {
    // Use a compound query if there are multiple categories
    query = query.where('category', 'in', selectedCategories);
  }

  query
    .orderBy('dateTime', 'asc')
    .get()
    .then(querySnapshot => {
      const events = [];
      querySnapshot.forEach(doc => {
        events.push(doc.data());
      });
      displayEvents(events);
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
}



function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.display = 'block'; // Ensure the notification is visible
    setTimeout(() => {
      notification.style.animation = 'fade-out 0.5s forwards'; // Apply fade-out animation
      setTimeout(() => {
        notification.remove(); // Remove the notification after fade-out animation completes
      }, 500); // Adjust timing as needed to match CSS animation duration
    }, 2500); // Adjust timing as needed to match CSS animation delay
  }, 100); // Delay added to ensure animation starts properly
}


function handleEdit(event) {
  const eventId = event.target.getAttribute('data-id');
  currentEventId = eventId; // Set the currentEventId when editing

  // Fetch event data and populate the form
  db.collection('events').doc(eventId).get()
      .then(doc => {
          if (doc.exists) {
              const event = doc.data();
              document.getElementById('eventTitle').value = event.title;
              document.getElementById('eventDescription').value = event.description;
              document.getElementById('eventDateTime').value = new Date(event.dateTime.seconds * 1000).toISOString().slice(0, 10);
              document.getElementById('eventLocation').value = event.location;
              currentImageUrl = event.imageUrl; // Store the current image URL

              const eventModal = document.getElementById('eventModal');
              eventModal.style.display = 'flex';

              // Display the current image URL if it exists
              if (currentImageUrl) {
                  uploadStatus.innerHTML = `<strong> Current Image: </strong> <p>${getFileNameFromUrl(currentImageUrl)}</p>`;
                  dragDropText.style.display = 'none'; // Hide dragDropText when image is present
                  uploadImg.style.display = 'none'; // Hide the default image
              }

          } else {
              console.error('No such event document!');
          }
      })
      .catch(error => {
          console.error('Error fetching event:', error);
      }); 

  const eventCard = document.getElementById(`event-card-${eventId}`);
  if (document.body.classList.contains('dark-theme')) {
      eventCard.classList.add('dark-theme');
  }
}



// Function to extract file name from URL
function getFileNameFromUrl(url) {
  let decodedUrl = decodeURIComponent(url); // Decode the URL
  let fileName = decodedUrl.split('/').pop(); // Get the last part after splitting by '/'
  fileName = fileName.split('?')[0]; // Remove query parameters if present
  return fileName;
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  
  // Apply dark theme to all event cards
  const eventCards = document.querySelectorAll('.event-card');
  eventCards.forEach(card => {
      card.classList.toggle('dark-theme');
  });
}



function handleDelete(event) {
  const eventId = event.target.getAttribute('data-id');
  firestore.collection('events').doc(eventId).delete()
    .then(() => {
      displayEvents(firebase.auth().currentUser.uid);
      showNotification('Event deleted successfully.', 'success');
    })
    .catch(error => {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event.', 'error');
    });
    const eventCard = document.getElementById(`event-card-${eventId}`);
    if (document.body.classList.contains('dark-theme')) {
        eventCard.classList.add('dark-theme');
    }
}

function handleReport(event) {
  const eventId = event.target.getAttribute('data-id');
  const reason = prompt('Please provide a reason for reporting this event:');
  if (reason) {
    firestore.collection('reports').add({
      eventId: eventId,
      reason: reason,
      reportedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      showNotification('Event reported successfully.', 'success');
    })
    .catch(error => {
      console.error('Error reporting event:', error);
      showNotification('Failed to report event.', 'error');
    });
    const eventCard = document.getElementById(`event-card-${eventId}`);
    if (document.body.classList.contains('dark-theme')) {
        eventCard.classList.add('dark-theme');
    }
  }
}


function throttleButton(button, timeout) {
  button.disabled = true;
  setTimeout(() => {
    button.disabled = false;
  }, timeout);
}

auth.onAuthStateChanged(user => {
  if (user) {
    uid = user.uid; // Ensure uid is set
    displayEvents(uid);
  } else {
    uid = null;
    // Handle unauthenticated state
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const dragDropContainer = document.getElementById('dragDropContainer');
  const eventImageUpload = document.getElementById('eventImageUpload');
  const uploadStatus = document.createElement('p');
  const dragDropText = document.getElementById('dragDropText');
  const uploadImg = document.getElementById('uploadImg'); // Get the image element
  uploadStatus.id = 'uploadStatus';
  dragDropContainer.appendChild(uploadStatus);
  const createEventButton = document.getElementById('createEventButton');
  const eventModal = document.getElementById('eventModal');
  const closeModal = document.getElementById('closeModal');
  const saveEventButton = document.getElementById('saveEventButton');
  let currentImageUrl = ''; // Variable to store the current image URL

  dragDropContainer.addEventListener('click', () => {
    eventImageUpload.click();
  });

  dragDropContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropContainer.classList.add('dragover');
  });

  dragDropContainer.addEventListener('dragleave', () => {
    dragDropContainer.classList.remove('dragover');
  });

  dragDropContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropContainer.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) {
      eventImageUpload.files = files;
      handleFileUpload(files[0]);
    }
  });

  eventImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  });

  function handleFileUpload(file) {
    const fileName = file.name;
    const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
    const displayName = fileName.length > 16 ? fileName.slice(0, 16) + '...' + fileExtension : fileName;
    uploadStatus.innerHTML = `<strong>Image Uploaded!</strong><br>${displayName}`;
    uploadStatus.style.textAlign = 'center'; // Center align the text
    dragDropText.style.display = 'none'; // Hide dragDropText when image is uploaded
    currentImageUrl = ''; // Reset currentImageUrl to empty when a new file is uploaded
  }
  

  createEventButton.addEventListener('click', () => {
    eventModal.style.display = 'flex';
    currentEventId = null; // Reset currentEventId when creating a new event
    currentImageUrl = ''; // Reset currentImageUrl when creating a new event
  });

  closeModal.addEventListener('click', () => {
    eventModal.style.display = 'none';
    resetModal(); // Reset modal fields when it is closed
  });

  saveEventButton.addEventListener('click', () => {
    const eventTitle = document.getElementById('eventTitle').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventDateTime = new Date(document.getElementById('eventDateTime').value);
    const eventLocation = document.getElementById('eventLocation').value;
    const eventImageUploadFile = eventImageUpload.files[0];
  
    if (!eventTitle || !eventDescription || !eventDateTime || !eventLocation) {
      alert('All fields are required!');
      return;
    }
  
    // Fetch the current event data to retain unchanged fields
    db.collection('events').doc(currentEventId).get()
      .then(doc => {
        if (doc.exists) {
          const eventData = doc.data();
          const currentImageUrl = eventData.imageUrl || '';
  
          // Determine the imageUrl to use based on user action
          let imageUrlToUpdate = currentImageUrl;
          if (eventImageUploadFile) {
            // User uploaded a new image, update imageUrl to the new image's URL
            const storageRef = firebase.storage().ref();
            const uploadTask = storageRef.child(`events/${firebase.auth().currentUser.uid}/${eventImageUploadFile.name}`).put(eventImageUploadFile);
  
            uploadTask.on('state_changed',
              (snapshot) => {},
              (error) => {
                console.error('Error uploading image:', error);
              },
              () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                  saveEvent(eventTitle, eventDescription, eventDateTime, eventLocation, downloadURL, currentEventId);
                });
              }
            );
          } else {
            // Use currentImageUrl if no new image is uploaded
            saveEvent(eventTitle, eventDescription, eventDateTime, eventLocation, imageUrlToUpdate, currentEventId);
          }
        } else {
          console.error('No such event document!');
        }
      })
      .catch(error => {
        console.error('Error fetching event data:', error);
      });
  });
  

  firestore.collection('events')
  .orderBy('dateTime', 'asc')
  .get()
  .then(querySnapshot => {
    if (querySnapshot.empty) {
      console.log('No matching documents.');
      return;
    }
    querySnapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch(error => {
    console.error('Error fetching events:', error);
  });



  function saveEvent(title, description, dateTime, location, imageUrl, eventId) {
    const eventRef = eventId ? firestore.collection('events').doc(eventId) : firestore.collection('events').doc();
    const userId = firebase.auth().currentUser.uid;

    // Define the event data to be saved
    const eventData = {
        title,
        description,
        dateTime,
        location,
        imageUrl,
        editedAt: firebase.firestore.FieldValue.serverTimestamp(), // Set the editedAt timestamp
        createdBy: userId // Set the author ID
    };

    if (!eventId) {
        // Creating a new event
        eventData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); // Set the createdAt timestamp
    }

    eventRef.set(eventData, { merge: true })
        .then(() => {
            console.log('Event saved successfully');
            document.getElementById('eventModal').style.display = 'none';
            resetModal();
            displayEvents(userId);

            // Show success notification
            showNotification('Event edited successfully', 'success');
        })
        .catch(error => {
            console.error('Error saving event:', error);
            // Show error notification
            showNotification('Failed to edit event', 'error');
        });
}


  function resetModal() {
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventDateTime').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventImageUpload').value = '';
    document.getElementById('uploadStatus').textContent = '';
    document.getElementById('dragDropText').style.display = 'block';
    uploadImg.style.display = 'block'; // Show the image again if needed
    currentEventId = null; // Reset the currentEventId after saving
    currentImageUrl = ''; // Reset the currentImageUrl after saving
  }


});


async function fetchLeaderboardData() {
  const leaderboard = [];

  // Fetch all users
  const usersSnapshot = await db.collection('users').get();
  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  for (const user of users) {
    // Fetch events created by the user
    const eventsSnapshot = await db.collection('events').where('createdBy', '==', user.id).get();
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalLikes = events.reduce((sum, event) => sum + (event.likeCount || 0), 0);

    leaderboard.push({
      userId: user.id,
      userName: user.name || 'Anonymous', // Use user.name or fallback to 'Anonymous'
      displayName: user.displayName || 'Anonymous', // Use user.displayName or fallback to 'Anonymous'
      profilePicture: user.photoURL || 'default-profile.png',
      totalLikes
    });
  }

  return leaderboard.sort((a, b) => b.totalLikes - a.totalLikes);
}

async function displayLeaderboard() {
  const leaderboardData = await fetchLeaderboardData();
  const podiumContainer = document.getElementById('podiumContainer');
  const leaderboardBody = document.getElementById('leaderboardBody');

  if (!podiumContainer) {
    console.error('Podium container not found!');
    return;
  }

  podiumContainer.innerHTML = '';
  leaderboardBody.innerHTML = '';

  // Helper function to get the first name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  // Display top 3 users on the podium
  leaderboardData.slice(0, 3).forEach((user, index) => {
    let podiumClass;
    switch (index) {
      case 0: podiumClass = 'gold'; break; // 1st place - center
      case 1: podiumClass = 'silver'; break; // 2nd place - left
      case 2: podiumClass = 'bronze'; break; // 3rd place - right
    }

    // Determine which name to display
    const displayName = user.userName !== 'Anonymous' ? user.userName : user.displayName;
    const firstName = getFirstName(displayName);

    const podiumItem = `
      <div class="podium-item ${podiumClass}">
        <span class="podium-number">${index + 1}</span>
        <img src="${user.profilePicture}" alt="${firstName}'s profile picture" class="podium-img">
        <h3>${firstName}</h3>
        <p class="likes">${user.totalLikes} Likes</p>
      </div>
    `;
    podiumContainer.insertAdjacentHTML('beforeend', podiumItem);
  });

  // Display other users in the table
  leaderboardData.slice(3).forEach((user, index) => {
    // Determine which name to display
    const displayName = user.userName !== 'Anonymous' ? user.userName : user.displayName;
    const firstName = getFirstName(displayName);

    const row = `
      <tr>
        <td>${index + 4}</td> <!-- Rank starts from 4 for users after the top 3 -->
        <td>
        <div class="profile-container">
          <img src="${user.profilePicture}" alt="${firstName}'s profile picture" class="profile-pic">
          ${firstName}
          </div>
        </td>
        <td>${user.totalLikes}</td>
      </tr>
    `;
    leaderboardBody.insertAdjacentHTML('beforeend', row);
  });
}

// Call displayLeaderboard to show the data on page load
document.addEventListener('DOMContentLoaded', displayLeaderboard);

document.addEventListener('DOMContentLoaded', () => {
  const filterButton = document.getElementById('filterButton');
  const filterContainer = document.getElementById('filterContainer');
  const closeFilterButton = document.getElementById('closeFilterButton');

  filterButton.addEventListener('click', () => {
    filterContainer.style.display = 'block';
  });

  closeFilterButton.addEventListener('click', () => {
    filterContainer.style.display = 'none';
  });

  // Close the filter container when clicking outside of the filter content
  window.addEventListener('click', (event) => {
    if (event.target == filterContainer) {
      filterContainer.style.display = 'none';
    }
  });
});
