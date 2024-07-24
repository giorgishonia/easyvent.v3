// Firebase configuration
const firebaseConfigEvents = {
    apiKey: "AIzaSyB5Cb1X6xrpKTullZZDV1S8A700uIzm3Ws",
    authDomain: "easyvent-85031.firebaseapp.com",
    projectId: "easyvent-85031",
    storageBucket: "easyvent-85031.appspot.com",
    messagingSenderId: "496483041148",
    appId: "1:496483041148:web:e7410ac120211c05232ef9",
    measurementId: "G-XMEKKNRMG7"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfigEvents);
}

// Firebase references
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const body = document.querySelector('body');
    const profileBanner = document.getElementById("profileBanner");
    const profilePicture = document.getElementById("profilePictureImg");
    const userNameProfile = document.getElementById("userNameProfile");
    const userEmailProfile = document.getElementById("userEmailProfile");
    const userEventsList = document.getElementById("userEventsList");
    const followersList = document.getElementById("followersList");
    const followedList = document.getElementById("followedList");
    const editBannerButton = document.getElementById("editBannerButton");
    const editProfilePictureButton = document.getElementById("editProfilePictureButton");
    const bannerInput = document.getElementById("bannerInput");
    const profilePictureInput = document.getElementById("profilePictureInput");
    const modeSwitch = document.querySelector(".toggle-switch");
    const modeText = document.querySelector(".mode-text");
    const followToggleButton = document.getElementById("followToggleButton");

    // Function to display user's profile info
    function displayUserProfile(user) {
        // Display basic user info
        userNameProfile.innerText = user.displayName || "No Name";
        userEmailProfile.innerText = user.email || "No Email";
        profilePicture.src = user.photoURL || "/images/profile-picture.jpg"; // Use a default picture if not provided

        // Fetch user details from Firestore
        db.collection("users").doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                profileBanner.src = userData.bannerURL || "/images/1352190.png";

                // Display followers
                if (userData.followers) {
                    followersList.innerHTML = ''; // Clear existing followers
                    userData.followers.forEach(followerId => {
                        db.collection("users").doc(followerId).get().then(followerDoc => {
                            if (followerDoc.exists) {
                                const followerData = followerDoc.data();
                                const followerItem = document.createElement("li");
                                followerItem.innerText = followerData.displayName || "No Name";
                                followersList.appendChild(followerItem);
                            }
                        });
                    });
                }

                // Display followed users
                if (userData.followed) {
                    followedList.innerHTML = ''; // Clear existing followed
                    userData.followed.forEach(followedId => {
                        db.collection("users").doc(followedId).get().then(followedDoc => {
                            if (followedDoc.exists) {
                                const followedData = followedDoc.data();
                                const followedItem = document.createElement("li");
                                followedItem.innerText = followedData.displayName || "No Name";
                                followedList.appendChild(followedItem);
                            }
                        });
                    });
                }

                // Update follow button text based on current user's follow status
                updateFollowButton(user, userData);
            }
        }).catch(error => {
            console.log("Error getting user data: ", error);
        });
    }

    // Function to update follow button text based on user's follow status
    function updateFollowButton(user, userData) {
        if (userData.followers && userData.followers.includes(user.uid)) {
            followToggleButton.innerText = "Unfollow";
        } else {
            followToggleButton.innerText = "Follow";
        }
    }

    // Function to handle follow/unfollow action
    function toggleFollow(user, userData) {
        const userRef = db.collection("users").doc(user.uid);

        // Toggle follow status
        if (userData.followers && userData.followers.includes(user.uid)) {
            // Already following, unfollow
            userRef.update({
                followers: firebase.firestore.FieldValue.arrayRemove(user.uid)
            }).then(() => {
                console.log("Unfollowed user:", user.displayName);
                updateFollowButton(user, userData);
            }).catch(error => {
                console.error("Error unfollowing user:", error);
            });
        } else {
            // Not following, follow
            userRef.update({
                followers: firebase.firestore.FieldValue.arrayUnion(user.uid)
            }).then(() => {
                console.log("Followed user:", user.displayName);
                updateFollowButton(user, userData);
            }).catch(error => {
                console.error("Error following user:", error);
            });
        }
    }

    // Authenticate and display user profile
    auth.onAuthStateChanged(user => {
        if (user) {
            displayUserProfile(user);
        } else {
            // Redirect to login page if not authenticated
            window.location.href = "/login.html"; // Replace with your login page URL
        }
    });

    // Event listener for follow/unfollow toggle button
    followToggleButton.addEventListener("click", () => {
        const user = firebase.auth().currentUser;
        if (user) {
            db.collection("users").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    toggleFollow(user, userData);
                } else {
                    console.log("No such document!");
                }
            }).catch(error => {
                console.error("Error getting user document:", error);
            });
        } else {
            console.log("User not logged in!");
        }
    });

    // Event listeners for edit buttons
    editBannerButton.addEventListener("click", () => {
        bannerInput.click(); // Trigger file input for banner
    });

    editProfilePictureButton.addEventListener("click", () => {
        profilePictureInput.click(); // Trigger file input for profile picture
    });

    // Handle banner image selection and upload
    bannerInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const user = firebase.auth().currentUser;
            const storageRef = firebase.storage().ref();
            const bannerRef = storageRef.child(`banners/${user.uid}/${file.name}`);
            
            bannerRef.put(file).then(() => {
                return bannerRef.getDownloadURL();
            }).then((url) => {
                // Update the user's bannerURL in Firestore
                return db.collection("users").doc(user.uid).update({
                    bannerURL: url
                });
            }).then(() => {
                // Update the banner image source
                profileBanner.src = url;
            }).catch(error => {
                console.error("Error uploading banner: ", error);
            });
        }
    });

    // Handle profile picture selection and upload
    profilePictureInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const user = firebase.auth().currentUser;
            const storageRef = firebase.storage().ref();
            const profilePicRef = storageRef.child(`profile_pictures/${user.uid}/${file.name}`);
            
            profilePicRef.put(file).then(() => {
                return profilePicRef.getDownloadURL();
            }).then((url) => {
                // Update the user's photoURL in Firebase Auth and Firestore
                return user.updateProfile({
                    photoURL: url
                }).then(() => {
                    return db.collection("users").doc(user.uid).update({
                        photoURL: url
                    });
                });
            }).then(() => {
                // Update the profile picture image source
                profilePicture.src = url;
            }).catch(error => {
                console.error("Error uploading profile picture: ", error);
            });
        }
    });
});
