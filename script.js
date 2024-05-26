const firebaseConfig = {
    apiKey: "AIzaSyB5Cb1X6xrpKTullZZDV1S8A700uIzm3Ws",
    authDomain: "easyvent-85031.firebaseapp.com",
    projectId: "easyvent-85031",
    storageBucket: "easyvent-85031.appspot.com",
    messagingSenderId: "496483041148",
    appId: "1:496483041148:web:e7410ac120211c05232ef9",
    measurementId: "G-XMEKKNRMG7"
  };
  
  // Ensure Firebase is initialized only once
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Initialize Firestore
  const firestore = firebase.firestore();
  
  // Initialize persistence
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      console.log("Firebase persistence initialized successfully");
    })
    .catch((error) => {
      console.error("Error initializing Firebase persistence:", error);
    });
  
  // Google Sign-In Provider
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  
  // Function to handle Google login
  function signInWithGoogle() {
    firebase.auth().signInWithPopup(googleProvider)
      .then((result) => {
        const user = result.user;
        displayUserInfo(user);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  // Function to display user info after successful login
  function displayUserInfo(user) {
    const displayName = user.displayName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
    document.getElementById('user-img').src = user.photoURL;
    document.getElementById('username').textContent = displayName;
    document.getElementById('email').textContent = user.email;
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
  }
  
  // Function to handle sign-out
  function signOut() {
    firebase.auth().signOut()
      .then(() => {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  // Add event listener to Google login button
  document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const logOutButton = document.getElementById('logOut');
  
    if (loginButton) {
      loginButton.addEventListener('click', signInWithGoogle);
    }
  
    if (logOutButton) {
      logOutButton.addEventListener('click', signOut);
    }
  
    // Listen for authentication state changes
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        displayUserInfo(user);
        displayEvents();
        checkNotifications();
      } else {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
      }
    });
  
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const userImg = document.getElementById('user-img');
    const userDetails = document.getElementById('userDetails');
    const createEventButton = document.getElementById('createEventButton');
    const eventForm = document.getElementById('eventForm');
    const postEventButton = document.getElementById('postEventButton');
    const eventPage = document.getElementById('event-page');
  
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        toggleButton.classList.toggle('mirrored');
      });
    }
  
    if (userImg) {
      userImg.addEventListener('click', () => {
        window.location.href = '/profile.html'; // Replace with the actual path to your profile page
      });
    }
  
    if (userDetails) {
      userDetails.addEventListener('click', () => {
        window.location.href = '/profile.html'; // Replace with the actual path to your profile page
      });
    }
  
    if (createEventButton) {
      createEventButton.addEventListener('click', () => {
        eventForm.style.display = 'flex';
      });
    }
  
    // Add event listener to post event button
    if (postEventButton) {
      postEventButton.addEventListener('click', postEventHandler);
    }
  
    // Function to handle event posting
    function postEventHandler() {
      postEventButton.disabled = true; // Disable the button to prevent multiple submissions
      const eventTitle = document.getElementById('eventTitle').value;
      const eventDescription = document.getElementById('eventDescription').value;
      const eventDate = document.getElementById('eventDate').value;
      const eventImage = document.getElementById('eventImage').files[0];
  
      if (eventImage) {
        const storageRef = firebase.storage().ref();
        const eventImageRef = storageRef.child(`eventImages/${eventImage.name}`);
  
        eventImageRef.put(eventImage).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            postEvent(eventTitle, eventDescription, eventDate, downloadURL);
            postEventButton.disabled = false; // Re-enable the button
          });
        }).catch((error) => {
          console.error("Error uploading image:", error);
        }).finally(() => {
          postEventButton.disabled = false; // Re-enable the button in case of error
        });
      } else {
        postEvent(eventTitle, eventDescription, eventDate, "");
        postEventButton.disabled = false; // Re-enable the button
      }
    }
  
    function postEvent(title, description, date, imageUrl) {
      const eventsCollection = firestore.collection('events');
      eventsCollection.add({
        title: title,
        description: description,
        date: date,
        imageUrl: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: firebase.auth().currentUser.displayName,
        likes: {}, // Initialize likes as an empty object
        comments: [] // Initialize comments array
      }).then(() => {
        alert("Event posted successfully!");
        eventForm.reset();
        eventForm.style.display = 'none';
        displayEvents();
        addNotification(title);
      }).catch((error) => {
        console.error("Error posting event:", error);
      });
    }
  
    function addNotification(eventTitle) {
      const notificationsCollection = firestore.collection('notifications');
      notificationsCollection.add({
        message: `${firebase.auth().currentUser.displayName} posted "${eventTitle}"`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  
    function checkNotifications() {
      const notificationsRef = firestore.collection('notifications');
      notificationsRef.orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
        const notificationCount = snapshot.size;
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationCount > 0) {
          notificationBadge.textContent = notificationCount;
          notificationBadge.style.display = 'block';
        } else {
          notificationBadge.style.display = 'none';
        }
      });
    }
  
    function displayNotifications() {
      const notificationsContainer = document.getElementById('notificationsContainer');
      const notificationsRef = firestore.collection('notifications');
      notificationsRef.orderBy('timestamp', 'desc').get().then((snapshot) => {
        notificationsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
          const notification = doc.data();
          const notificationElement = document.createElement('div');
          notificationElement.classList.add('notification');
          notificationElement.textContent = `${notification.message} - ${notification.timestamp.toDate().toLocaleString()}`;
          notificationsContainer.appendChild(notificationElement);
        });
      });
    }
  
    document.getElementById('notifications').addEventListener('click', () => {
      displayNotifications();
    });
  
    // Function to handle liking or unliking an event
    function likeEvent(eventId) {
      const userId = firebase.auth().currentUser.uid;
      const eventRef = firestore.collection('events').doc(eventId);
  
      eventRef.get().then((doc) => {
        if (doc.exists) {
          const eventData = doc.data();
          const likes = eventData.likes || {};
          if (likes[userId]) {
            delete likes[userId]; // Unlike the event
          } else {
            likes[userId] = true; // Like the event
          }
          const newLikesCount = Object.keys(likes).length;
          eventRef.update({ likes: likes, likesCount: newLikesCount });
        } else {
          console.error("No such document!");
        }
      }).catch((error) => {
        console.error("Error getting document:", error);
      });
    }
  
    // Function to retrieve and display events
    function displayEvents() {
      const eventsContainer = document.getElementById('eventsContainer');
      const eventsCollection = firestore.collection('events');
  
      eventsCollection.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        eventsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
          const event = doc.data();
          const eventId = doc.id;
          const eventCard = document.createElement('div');
          eventCard.classList.add('event-card');
  
          const eventImage = document.createElement('img');
          eventImage.classList.add('event-image');
          eventImage.src = event.imageUrl || 'default-event-image.png';
          eventImage.style.width = '200px';
          eventImage.style.height = 'auto';
          eventImage.style.backgroundSize = 'cover';
  
          const eventDetails = document.createElement('div');
          eventDetails.classList.add('event-details');
  
          const eventTitle = document.createElement('h2');
          eventTitle.classList.add('event-title');
          eventTitle.textContent = event.title;
  
          const eventDescription = document.createElement('p');
          eventDescription.classList.add('event-description');
          eventDescription.textContent = event.description;
  
          const eventDate = document.createElement('p');
          eventDate.classList.add('event-date');
          const eventDateObj = new Date(event.date);
          eventDate.textContent = eventDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  
          const eventAuthor = document.createElement('p');
          eventAuthor.classList.add('event-author');
          eventAuthor.textContent = `Author: ${event.author}`;
  
          const likeButton = document.createElement('button');
          likeButton.classList.add('like-button');
          likeButton.textContent = `Like (${Object.keys(event.likes).length})`;
          likeButton.addEventListener('click', () => {
            likeEvent(eventId);
          });
  
          const commentForm = document.createElement('form');
          commentForm.classList.add('comment-form');
          commentForm.innerHTML = `
            <input type="text" class="comment-input" placeholder="Write a comment..." required />
            <button type="submit" class="comment-button">Post</button>
          `;
          commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentInput = commentForm.querySelector('.comment-input');
            postComment(eventId, commentInput.value);
            commentInput.value = '';
          });
  
          const commentsContainer = document.createElement('div');
          commentsContainer.classList.add('comments-container');
  
          if (event.comments && event.comments.length > 0) {
            event.comments.forEach(comment => {
              const commentElement = document.createElement('div');
              commentElement.classList.add('comment');
  
              const commentText = document.createElement('span');
              commentText.classList.add('comment-text');
              commentText.textContent = comment;
  
              const editButton = document.createElement('button');
              editButton.classList.add('edit-comment');
              editButton.textContent = 'Edit';
              editButton.addEventListener('click', () => {
                const newComment = prompt('Edit your comment:', comment);
                if (newComment) {
                  editComment(eventId, comment, newComment);
                }
              });
  
              commentElement.appendChild(commentText);
              commentElement.appendChild(editButton);
              commentsContainer.appendChild(commentElement);
            });
          }
  
          eventDetails.appendChild(eventTitle);
          eventDetails.appendChild(eventDescription);
          eventDetails.appendChild(eventDate);
          eventDetails.appendChild(eventAuthor);
          eventDetails.appendChild(likeButton);
          eventDetails.appendChild(commentForm);
          eventDetails.appendChild(commentsContainer);
  
          eventCard.appendChild(eventImage);
          eventCard.appendChild(eventDetails);
  
          if (event.author === firebase.auth().currentUser.displayName) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-event');
            editButton.addEventListener('click', () => {
              editEvent(eventId, event);
            });
  
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-event');
            deleteButton.addEventListener('click', () => {
              deleteEvent(eventId);
            });
  
            eventDetails.appendChild(editButton);
            eventDetails.appendChild(deleteButton);
          }
  
          eventsContainer.appendChild(eventCard);
        });
      }, (error) => {
        console.error("Error in snapshot listener:", error);
      });
    }
  
    function postComment(eventId, comment) {
      const eventRef = firestore.collection('events').doc(eventId);
      eventRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment)
      }).catch((error) => {
        console.error("Error posting comment:", error);
      });
    }
  
    function editComment(eventId, oldComment, newComment) {
      const eventRef = firestore.collection('events').doc(eventId);
      eventRef.get().then((doc) => {
        if (doc.exists) {
          const comments = doc.data().comments;
          const commentIndex = comments.indexOf(oldComment);
          if (commentIndex > -1) {
            comments[commentIndex] = newComment;
            eventRef.update({ comments: comments });
          }
        }
      }).catch((error) => {
        console.error("Error updating comment:", error);
      });
    }
  
    function editEvent(eventId, eventData) {
      // Functionality to edit the event
      document.getElementById('eventTitle').value = eventData.title;
      document.getElementById('eventDescription').value = eventData.description;
      document.getElementById('eventDate').value = eventData.date;
      eventForm.style.display = 'block';
  
      postEventButton.removeEventListener('click', postEventHandler);
      postEventButton.addEventListener('click', () => updateEvent(eventId));
    }
  
    function updateEvent(eventId) {
      const updatedTitle = document.getElementById('eventTitle').value;
      const updatedDescription = document.getElementById('eventDescription').value;
      const updatedDate = document.getElementById('eventDate').value;
      const updatedImage = document.getElementById('eventImage').files[0];
  
      if (updatedImage) {
        const storageRef = firebase.storage().ref();
        const updatedImageRef = storageRef.child(`eventImages/${updatedImage.name}`);
  
        updatedImageRef.put(updatedImage).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            firestore.collection('events').doc(eventId).update({
              title: updatedTitle,
              description: updatedDescription,
              date: updatedDate,
              imageUrl: downloadURL,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
              alert("Event updated successfully!");
              eventForm.reset();
              eventForm.style.display = 'none';
              displayEvents();
            }).catch((error) => {
              console.error("Error updating event:", error);
            });
          });
        }).catch((error) => {
          console.error("Error uploading updated image:", error);
        });
      } else {
        firestore.collection('events').doc(eventId).update({
          title: updatedTitle,
          description: updatedDescription,
          date: updatedDate,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          alert("Event updated successfully!");
          eventForm.reset();
          eventForm.style.display = 'none';
          displayEvents();
        }).catch((error) => {
          console.error("Error updating event:", error);
        });
      }
    }
  
    function deleteEvent(eventId) {
      firestore.collection('events').doc(eventId).delete()
        .then(() => {
          alert("Event deleted successfully!");
          displayEvents();
        })
        .catch((error) => {
          console.error("Error deleting event:", error);
        });
    }
  
    // Sidebar navigation
    const homeButton = document.getElementById('homeButton');
    const eventsButton = document.getElementById('eventsButton');
    const calendarButton = document.getElementById('calendarButton');
    const tournamentsButton = document.getElementById('tournamentsButton');
  
    if (homeButton) {
      homeButton.addEventListener('click', () => {
        document.getElementById('home-content').style.display = 'block';
        document.getElementById('events-content').style.display = 'none';
        document.getElementById('calendar-content').style.display = 'none';
        document.getElementById('tournaments-content').style.display = 'none';
      });
    }
  
    if (eventsButton) {
      eventsButton.addEventListener('click', () => {
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('events-content').style.display = 'flex';
        document.getElementById('calendar-content').style.display = 'none';
        document.getElementById('tournaments-content').style.display = 'none';
        displayEvents();
      });
    }
  
    if (calendarButton) {
      calendarButton.addEventListener('click', () => {
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('events-content').style.display = 'none';
        document.getElementById('calendar-content').style.display = 'block';
        document.getElementById('tournaments-content').style.display = 'none';
      });
    }
  
    if (tournamentsButton) {
      tournamentsButton.addEventListener('click', () => {
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('events-content').style.display = 'none';
        document.getElementById('calendar-content').style.display = 'none';
        document.getElementById('tournaments-content').style.display = 'block';
      });
    }
  
    displayEvents();
  });
  