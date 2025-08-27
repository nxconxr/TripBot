const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });

    console.log('✅ Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

const getFirebaseApp = () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
};

const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
    });

    // Set custom claims if needed
    if (userData.role) {
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: userData.role,
      });
    }

    return userRecord;
  } catch (error) {
    console.error('Firebase user creation failed:', error);
    throw error;
  }
};

const updateUser = async (uid, userData) => {
  try {
    const updateData = {};
    
    if (userData.displayName) updateData.displayName = userData.displayName;
    if (userData.photoURL) updateData.photoURL = userData.photoURL;
    if (userData.email) updateData.email = userData.email;

    const userRecord = await admin.auth().updateUser(uid, updateData);
    return userRecord;
  } catch (error) {
    console.error('Firebase user update failed:', error);
    throw error;
  }
};

const deleteUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    return { success: true };
  } catch (error) {
    console.error('Firebase user deletion failed:', error);
    throw error;
  }
};

const getUserByUid = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Firebase get user failed:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error('Firebase get user by email failed:', error);
    throw error;
  }
};

// Firestore operations for user data
const getUserData = async (uid) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Firestore get user data failed:', error);
    throw error;
  }
};

const setUserData = async (uid, userData) => {
  try {
    const db = admin.firestore();
    await db.collection('users').doc(uid).set(userData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Firestore set user data failed:', error);
    throw error;
  }
};

const updateUserData = async (uid, updates) => {
  try {
    const db = admin.firestore();
    await db.collection('users').doc(uid).update(updates);
    return { success: true };
  } catch (error) {
    console.error('Firestore update user data failed:', error);
    throw error;
  }
};

const deleteUserData = async (uid) => {
  try {
    const db = admin.firestore();
    await db.collection('users').doc(uid).delete();
    return { success: true };
  } catch (error) {
    console.error('Firestore delete user data failed:', error);
    throw error;
  }
};

// Favorites operations
const getUserFavorites = async (uid) => {
  try {
    const db = admin.firestore();
    const favoritesSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('favorites')
      .get();
    
    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return favorites;
  } catch (error) {
    console.error('Firestore get favorites failed:', error);
    throw error;
  }
};

const addToFavorites = async (uid, favoriteData) => {
  try {
    const db = admin.firestore();
    const docRef = await db
      .collection('users')
      .doc(uid)
      .collection('favorites')
      .add({
        ...favoriteData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    
    return { id: docRef.id, ...favoriteData };
  } catch (error) {
    console.error('Firestore add to favorites failed:', error);
    throw error;
  }
};

const removeFromFavorites = async (uid, favoriteId) => {
  try {
    const db = admin.firestore();
    await db
      .collection('users')
      .doc(uid)
      .collection('favorites')
      .doc(favoriteId)
      .delete();
    
    return { success: true };
  } catch (error) {
    console.error('Firestore remove from favorites failed:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getFirebaseApp,
  verifyFirebaseToken,
  createUser,
  updateUser,
  deleteUser,
  getUserByUid,
  getUserByEmail,
  getUserData,
  setUserData,
  updateUserData,
  deleteUserData,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
};