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

function displayEvents(uid) {
  const eventsContainer = document.getElementById('eventsContainer');
  eventsContainer.innerHTML = '';

  firestore.collection('events').orderBy('dateTime', 'asc').get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const event = doc.data();
        const eventId = doc.id;
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        
        // Check and apply theme
        if (document.body.classList.contains('dark-theme')) {
          eventCard.classList.add('dark-theme');
      }

        eventCard.innerHTML = `
          <h3>${event.title}</h3>
          <img src="${event.imageUrl}" alt="${event.title}" style="width:100%; height:auto;">
          <p>${event.description}</p>
          <p>${formatEventDate(event.dateTime)}</p>
          <p>Location: ${event.location}</p>
          <div>
            <button class="vote-button upvote-button" data-id="${eventId}">Upvote</button>
            <button class="vote-button downvote-button" data-id="${eventId}">Downvote</button>
            <button class="fullscreen-button" data-id="${eventId}">
              <img src="fullscreen_icon.png" alt="Fullscreen" style="width:16px; height:16px;">
            </button>
            <span id="voteCount-${eventId}">${event.voteCount}</span>
          </div>
          <div class="dropdown">
            <button class="dropbtn">...</button>
            <div class="dropdown-content" id="dropdown-${eventId}">
              <!-- Edit and Delete buttons will be added dynamically -->
            </div>
          </div>
        `;

        eventsContainer.appendChild(eventCard);

        // Check if the current user is the author of the event
        if (event.createdBy === uid) {
          const dropdownContent = document.getElementById(`dropdown-${eventId}`);
          dropdownContent.insertAdjacentHTML('afterbegin', `
            <button class="edit-button" data-id="${eventId}">Edit</button>
            <button class="delete-button" data-id="${eventId}">Delete</button>
          `);
        } else {
        }

        // Add the report button for all users
        const dropdownContent = document.getElementById(`dropdown-${eventId}`);
        dropdownContent.insertAdjacentHTML('beforeend', `
          <button class="report-button" data-id="${eventId}">Report</button>
        `);
      });

      // Attach event listeners to upvote/downvote buttons
      document.querySelectorAll('.upvote-button').forEach(button => {
        button.addEventListener('click', handleUpvote);
      });

      document.querySelectorAll('.downvote-button').forEach(button => {
        button.addEventListener('click', handleDownvote);
      });

      // Attach event listeners to edit/delete/report/fullscreen buttons
      document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', handleEdit);
      });

      document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDelete);
      });

      document.querySelectorAll('.report-button').forEach(button => {
        button.addEventListener('click', handleReport);
      });

      document.querySelectorAll('.fullscreen-button').forEach(button => {
        button.addEventListener('click', handleFullscreen);
      });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
}

// Function to handle fullscreen button click
function handleFullscreen(event) {
  const eventId = event.target.closest('button').getAttribute('data-id');
  window.location.href = `eventPage.html?eventId=${eventId}`;
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

  // Replace 'db' with your actual Firestore instance (e.g., firestore.collection('events'))
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
  // Add your logic to report the event
  // Example logic to open a report modal
  showNotification('Event reported.', 'success');
}

// Voting logic
function handleVote(eventId, voteType) {
  const userId = firebase.auth().currentUser.uid;

  firestore.collection('votes').doc(`${userId}_${eventId}`).get()
    .then(doc => {
      if (!doc.exists) {
        return firestore.runTransaction(transaction => {
          const eventRef = firestore.collection('events').doc(eventId);
          return transaction.get(eventRef).then(eventDoc => {
            if (!eventDoc.exists) {
              throw "Event does not exist!";
            }

            let newVoteCount = eventDoc.data().voteCount;

            if (voteType === 'upvote') {
              newVoteCount += 1;
            } else {
              newVoteCount -= 1;
            }

            transaction.update(eventRef, {
              voteCount: newVoteCount
            });

            transaction.set(firestore.collection('votes').doc(`${userId}_${eventId}`), {
              eventId,
              userId,
              voteType
            });

            return Promise.resolve(newVoteCount);
          });
        });
      } else {
        const currentVoteType = doc.data().voteType;

        if (currentVoteType === voteType) {
          return Promise.reject("You have already voted this way.");
        }

        return firestore.runTransaction(transaction => {
          const eventRef = firestore.collection('events').doc(eventId);
          return transaction.get(eventRef).then(eventDoc => {
            if (!eventDoc.exists) {
              throw "Event does not exist!";
            }

            let newVoteCount = eventDoc.data().voteCount;

            if (voteType === 'upvote') {
              newVoteCount += 2;
            } else {
              newVoteCount -= 2;
            }

            transaction.update(eventRef, {
              voteCount: newVoteCount
            });

            transaction.update(firestore.collection('votes').doc(`${userId}_${eventId}`), {
              voteType
            });

            return Promise.resolve(newVoteCount);
          });
        });
      }
    })
    .then(newVoteCount => {
      document.getElementById(`voteCount-${eventId}`).textContent = newVoteCount;
    })
    .catch(error => {
      console.error('Error voting:', error);
    });
}

function handleUpvote(event) {
  const eventId = event.target.getAttribute('data-id');
  throttleButton(event.target, 5000); // Disable button for 5 seconds
  handleVote(eventId, 'upvote');
}

function handleDownvote(event) {
  const eventId = event.target.getAttribute('data-id');
  throttleButton(event.target, 5000); // Disable button for 5 seconds
  handleVote(eventId, 'downvote');
}

// Function to handle the throttling
function throttleButton(button, timeout) {
  button.disabled = true;
  setTimeout(() => {
    button.disabled = false;
  }, timeout);
}

auth.onAuthStateChanged(user => {
  if (user) {
    displayEvents(user.uid);
  } else {
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
  

  function saveEvent(title, description, dateTime, location, imageUrl, eventId) {
    const eventRef = eventId ? firestore.collection('events').doc(eventId) : firestore.collection('events').doc();
    const userId = firebase.auth().currentUser.uid;
  
    eventRef.set({
      title,
      description,
      dateTime,
      location,
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      voteCount: 0,
      createdBy: userId // Set the author ID
    }, { merge: true }).then(() => {
      console.log('Event saved successfully');
      document.getElementById('eventModal').style.display = 'none';
      resetModal();
      displayEvents(userId);
  
      // Show success notification
      showNotification('Event edited successfully', 'success');
    }).catch(error => {
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

