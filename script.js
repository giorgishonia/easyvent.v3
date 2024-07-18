// Firebase configuration remains the same
const firebaseConfig = {
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
    firebase.initializeApp(firebaseConfig);
}

// Select necessary DOM elements
const bodyElement = document.querySelector('body');
const sidebar = bodyElement.querySelector('nav');
const toggle = sidebar.querySelector(".toggle");
const searchBtn = sidebar.querySelector(".search-box");
const loginButton = document.getElementById("loginButton");
const userImg = document.getElementById("userImg");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const modeSwitch = sidebar.querySelector(".toggle-switch");
const modeText = sidebar.querySelector(".mode-text");

// Function to display user info
function displayUserInfo(user) {
    if (user) {
        userImg.src = user.photoURL || "/images/default-profile-picture.jpg";
        userEmail.innerText = user.email || "No email";
        userName.innerText = user.displayName || "No name";
        loginButton.innerHTML = `<a href="#"><i class='bx bx-log-out icon'></i><span class="text nav-text">Logout</span></a>`;
    } else {
        userImg.src = "/images/profile-picture.jpg";
        userEmail.innerText = "john.doe@example.com";
        userName.innerText = "John Doe";
        loginButton.innerHTML = `<a href="#"><i class='bx bx-log-in icon'></i><span class="text nav-text">Login</span></a>`;
    }
}

// Toggle between dark and light mode
modeSwitch.addEventListener("click", () => {
    const isDarkMode = bodyElement.classList.toggle("dark");
    const currentTheme = isDarkMode ? "dark" : "light";
    modeText.innerText = isDarkMode ? "Light mode" : "Dark mode";
    saveUserThemePreference(currentTheme);
});

// Toggle sidebar visibility
toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

// Ensure sidebar opens on search click
searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
});

// Log in/out event listener
loginButton.addEventListener("click", () => {
    const user = firebase.auth().currentUser;
    if (user) {
        firebase.auth().signOut().then(() => {
            displayUserInfo(null);
        }).catch((error) => {
            console.log(error);
        });
    } else {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((result) => {
            displayUserInfo(result.user);
            loadUserThemePreference(result.user); // Load theme preference after login
        }).catch((error) => {
            console.log("Sign-in error: ", error);
        });
    }
});

// Display user info on page load and handle theme
firebase.auth().onAuthStateChanged((user) => {
    displayUserInfo(user);
    if (user) {
        loadUserThemePreference(user); // Load theme preference if user is logged in
    } else {
        loadUserThemePreference(); // Load theme preference from localStorage if user is not logged in
    }
});

// Save user theme preference in Firebase
function saveUserThemePreference(theme) {
    const user = firebase.auth().currentUser;
    if (user) {
        firebase.firestore().collection('users').doc(user.uid).set({
            theme: theme
        }, { merge: true });
    }
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

// Load user theme preference
function loadUserThemePreference(user = null) {
    if (user) {
        firebase.firestore().collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists && doc.data().theme) {
                const theme = doc.data().theme;
                applyTheme(theme);
            } else {
                loadThemeFromLocalStorage();
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
            loadThemeFromLocalStorage();
        });
    } else {
        loadThemeFromLocalStorage();
    }
}

// Load theme preference from localStorage
function loadThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

// Apply the theme based on preference
function applyTheme(theme) {
    if (theme === 'dark') {
        bodyElement.classList.add('dark');
        bodyElement.classList.remove('light');
        modeText.innerText = "Light mode";
    } else {
        bodyElement.classList.remove('dark');
        bodyElement.classList.add('light');
        modeText.innerText = "Dark mode";
    }
    updateSelectedElementsBackground(theme);
    updateEventCardStyles(theme);
}

// Update the background color and icon color of selected elements based on the theme
function updateSelectedElementsBackground(theme) {
    const selectedElements = document.querySelectorAll('.nav-link.selected');
    selectedElements.forEach((element) => {
        if (theme === 'dark') {
            element.style.backgroundColor = '#3a3b3c';
            const icons = element.querySelectorAll('i');
            icons.forEach((icon) => {
                icon.style.color = '#FFFFFF'; // Set icon color to white for dark theme
            });
        } else {
            element.style.backgroundColor = '#695CFE';
            const icons = element.querySelectorAll('i');
            icons.forEach((icon) => {
                icon.style.color = '#FFFFFF'; // Set icon color to white for light theme
            });
        }
    });
}

// Update event card styles based on the theme
function updateEventCardStyles(theme) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach((card) => {
        if (theme === 'dark') {
            card.style.backgroundColor = '#242526';
            card.style.color = '#FFFFFF'; // Set text color to white for dark theme
        } else {
            card.style.backgroundColor = '#FFFFFF';
            card.style.color = '#000000'; // Set text color to black for light theme
        }
    });
}

// Apply the theme and display user info on initial load
document.addEventListener('DOMContentLoaded', () => {
    const user = firebase.auth().currentUser;
    if (user) {
        loadUserThemePreference(user);
    } else {
        loadThemeFromLocalStorage();
    }
    // Also apply styles to event cards on initial load
    const currentTheme = bodyElement.classList.contains('dark') ? 'dark' : 'light';
    updateEventCardStyles(currentTheme);
});

// Navigate to profile page on user image click
userImg.addEventListener("click", () => {
    window.location.href = "/pages/profile.html"; // Replace with your actual profile page URL
});
