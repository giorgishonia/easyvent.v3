const firebaseConfigCreate = {
    apiKey: "AIzaSyB5Cb1X6xrpKTullZZDV1S8A700uIzm3Ws",
    authDomain: "easyvent-85031.firebaseapp.com",
    projectId: "easyvent-85031",
    storageBucket: "easyvent-85031.appspot.com",
    messagingSenderId: "496483041148",
    appId: "1:496483041148:web:e7410ac120211c05232ef9",
    measurementId: "G-XMEKKNRMG7"
};

firebase.initializeApp(firebaseConfigCreate);

const db = firebase.firestore();
const storage = firebase.storage();

const eventTitleInput = document.getElementById('eventTitle');
const eventDescriptionInput = document.getElementById('eventDescription');
const eventDateTimeInput = document.getElementById('eventDateTime');
const eventLocationInput = document.getElementById('eventLocation');
const eventImageUploadInput = document.getElementById('eventImageUpload');
const eventCategoryInput = document.getElementById('eventCategory');
const saveEventButton = document.getElementById('saveEventButton');
const uploadStatus = document.getElementById('uploadStatus');
const previewTitle = document.getElementById('previewTitle');
const previewDescription = document.getElementById('previewDescription');
const previewDateTime = document.getElementById('previewDateTime');
const previewLocation = document.getElementById('previewLocation');
const previewCategory = document.getElementById('previewCategory');
const previewImage = document.getElementById('previewImage');
const dragDropContainer = document.getElementById('dragDropContainer');
const dragDropText = document.getElementById('dragDropText');
const notification = document.getElementById('notification');

let currentImageUrl = '';

// Category options with icons
const categories = {
    'Music': '🎵',
    'Sports': '⚽',
    'Technology': '💻',
    'Art': '🎨',
    'Education': '📚',
    'Fun': '🥳',
    'Gaming': '🎮',
    'Food': '🍽️',
    'Movies': '🎬',
    'Theater': '🎭',
    'Fashion': '👗',
    'Health': '💪',
    'For Kids': '🧒',
    'For Pets': '🐾',
    'Charity': '🤲',
    'Travel': '✈️'
};

// Function to populate category dropdown
function populateCategoryDropdown() {
    eventCategoryInput.innerHTML = ''; // Clear existing options

    for (const [category, icon] of Object.entries(categories)) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${icon} ${category}`;
        eventCategoryInput.appendChild(option);
    }
}

populateCategoryDropdown();

// Event listener for file input change
eventImageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
});

// Event listener for dragover
dragDropContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
    dragDropContainer.classList.add('drag-over');
    dragDropText.textContent = 'Drop the file to upload';
});

// Event listener for dragleave
dragDropContainer.addEventListener('dragleave', () => {
    dragDropContainer.classList.remove('drag-over');
    dragDropText.textContent = 'Choose a file, or drag it here';
});

// Event listener for drop
dragDropContainer.addEventListener('drop', (event) => {
    event.preventDefault();
    dragDropContainer.classList.remove('drag-over');
    dragDropText.textContent = 'Choose a file, or drag it here';

    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
});

// Event listener for click on dragDropContainer to trigger file input
dragDropContainer.addEventListener('click', () => {
    eventImageUploadInput.click(); // Simulate click on file input
});

// Function to handle file upload with progress tracking
function handleFileUpload(file) {
    const fileName = file.name;
    const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
    const displayName = fileName.length > 16 ? fileName.slice(0, 16) + '...' + fileExtension : fileName;
    uploadStatus.textContent = `Uploading... 0%`;
    dragDropText.style.display = 'none';

    const storageRef = storage.ref();
    const fileRef = storageRef.child('eventImages/' + file.name);
    const uploadTask = fileRef.put(file);

    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadStatus.textContent = `Uploading... ${Math.round(progress)}%`;
        },
        (error) => {
            console.error('Error uploading image:', error);
            uploadStatus.textContent = 'Upload failed. Please try again.';
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                previewImage.src = downloadURL;
                previewImage.style.display = 'block';
                uploadStatus.textContent = `Upload finished! ${displayName}`;
                currentImageUrl = downloadURL;
            });
        }
    );
}

// Event listeners for form inputs to update preview in real-time
eventTitleInput.addEventListener('input', () => {
    previewTitle.textContent = eventTitleInput.value;
});

eventDescriptionInput.addEventListener('input', () => {
    previewDescription.textContent = eventDescriptionInput.value;
});

eventDateTimeInput.addEventListener('input', () => {
    previewDateTime.textContent = eventDateTimeInput.value;
});

eventLocationInput.addEventListener('input', () => {
    previewLocation.textContent = eventLocationInput.value;
});

eventCategoryInput.addEventListener('change', () => {
    previewCategory.textContent = eventCategoryInput.options[eventCategoryInput.selectedIndex].text;
});

// Function to show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000); // 2 seconds
}

let isSubmitting = false;

saveEventButton.addEventListener('click', (event) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    isSubmitting = true;
    saveEvent();
    setTimeout(() => isSubmitting = false, 3000); // Reset after 3 seconds
});

function saveEvent() {
    console.log('saveEvent function called');

    const eventTitle = eventTitleInput.value.trim();
    const eventDescription = eventDescriptionInput.value.trim();
    const eventDateTime = eventDateTimeInput.value.trim();
    const eventLocation = eventLocationInput.value.trim();
    const eventCategory = eventCategoryInput.value;
    const eventImageURL = currentImageUrl;

    if (!eventTitle || !eventDescription || !eventDateTime || !eventLocation || !eventCategory || !eventImageURL) {
        showNotification('Please fill in all fields.', 'error');
        isSubmitting = false; // Allow future submissions
        return;
    }

    const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;

    if (!userId) {
        showNotification('User not authenticated. Please log in.', 'error');
        isSubmitting = false; // Allow future submissions
        return;
    }

    db.collection('events').add({
        title: eventTitle,
        description: eventDescription,
        dateTime: firebase.firestore.Timestamp.fromDate(new Date(eventDateTime)),
        location: eventLocation,
        category: eventCategory,
        imageUrl: eventImageURL,
        createdBy: userId,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date()) // Add this line
    })
    .then((docRef) => {
        console.log('Event saved with ID:', docRef.id);
        showNotification('Event posted successfully!', 'success');
        // Clear form and preview
        eventTitleInput.value = '';
        eventDescriptionInput.value = '';
        eventDateTimeInput.value = '';
        eventLocationInput.value = '';
        eventCategoryInput.value = '';
        eventImageUploadInput.value = '';
        uploadStatus.textContent = '';
        previewImage.style.display = 'none';
        currentImageUrl = '';
        isSubmitting = false; // Allow future submissions
    })
    .catch((error) => {
        console.error('Error adding event:', error);
        showNotification('An error occurred. Please try again later.', 'error');
        isSubmitting = false; // Allow future submissions
    });
}
