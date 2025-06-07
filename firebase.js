// Import the functions you need from the SDKs you need
// Use require instead of import
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbr5Iv-24WOtG0ZkJihDv3rW8yHZbJZYA",
  authDomain: "seeksb-f9c24.firebaseapp.com",
  projectId: "seeksb-f9c24",
  storageBucket: "seeksb-f9c24.firebasestorage.app",
  messagingSenderId: "157841855028",
  appId: "1:157841855028:web:38d849fa812f69019bb061",
  measurementId: "G-WY2H14FRQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

// Function to upload data to Firestore
async function uploadData() {
  try {
    const docRef = await addDoc(collection(db, "annonse"), {
        Beskrivelse: "Sample description",  // Replace with your data
        Kategori: "Sample category",        // Replace with your data
        Tilstand: "New",                    // Replace with your data
        tittel: "Sample title"              // Replace with your data
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Call the function to upload data
uploadData();
