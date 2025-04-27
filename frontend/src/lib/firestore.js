import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// User collections
const USERS_COLLECTION = 'users';
const STUDY_GROUPS_COLLECTION = 'study_groups';
const STUDY_SESSIONS_COLLECTION = 'study_sessions';
const NOTES_COLLECTION = 'notes';

/**
 * Get a document by reference
 */
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new document with auto-generated ID
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Set a document with a specific ID
 */
export const setDocument = async (collectionName, documentId, data, merge = true) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge });
    
    return { success: true, id: documentId };
  } catch (error) {
    console.error('Error setting document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a document
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: documentId };
  } catch (error) {
    console.error('Error updating document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Query documents in a collection
 */
export const queryDocuments = async (collectionName, conditions = [], sortBy = null, limitTo = null) => {
  try {
    let q = collection(db, collectionName);
    
    // Add query conditions
    if (conditions && conditions.length > 0) {
      const constraints = conditions.map(cond => where(cond.field, cond.operator, cond.value));
      q = query(q, ...constraints);
    }
    
    // Add sorting
    if (sortBy) {
      q = query(q, orderBy(sortBy.field, sortBy.direction || 'asc'));
    }
    
    // Add limit
    if (limitTo) {
      q = query(q, limit(limitTo));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: documents };
  } catch (error) {
    console.error('Error querying documents:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to a document
 */
export const listenToDocument = (collectionName, documentId, callback) => {
  const docRef = doc(db, collectionName, documentId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to document:', error);
    callback(null, error);
  });
};

/**
 * Listen to a query
 */
export const listenToQuery = (collectionName, conditions = [], sortBy = null, limitTo = null, callback) => {
  let q = collection(db, collectionName);
  
  // Add query conditions
  if (conditions && conditions.length > 0) {
    const constraints = conditions.map(cond => where(cond.field, cond.operator, cond.value));
    q = query(q, ...constraints);
  }
  
  // Add sorting
  if (sortBy) {
    q = query(q, orderBy(sortBy.field, sortBy.direction || 'asc'));
  }
  
  // Add limit
  if (limitTo) {
    q = query(q, limit(limitTo));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    callback(documents);
  }, (error) => {
    console.error('Error listening to query:', error);
    callback([], error);
  });
}; 