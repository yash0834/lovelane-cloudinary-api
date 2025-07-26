import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  limit,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useFirestoreCollection = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
};

export const addFirestoreDocument = async (
  collectionName: string,
  data: DocumentData
) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

export const updateFirestoreDocument = async (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
) => {
  try {
    await updateDoc(doc(db, collectionName, docId), data);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const getFirestoreDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    const items: T[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as T);
    });
    return items;
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};
