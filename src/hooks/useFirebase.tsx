import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, QueryConstraint } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_FIREBASE_APPID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID
};

// デバッグ用にfirebaseConfigをログ出力
console.log("Firebase Config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestore document hook
export function useDocument(collectionName: string, docId: string) {
    const [data, setData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const docRef = doc(db, collectionName, docId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setData(null);
                }
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            }
        };

        fetchDocument();
    }, [collectionName, docId]);

    return { data, loading, error };
}

export function useDocumentRealtime(collectionName: string, docId: string) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, collectionName, docId);

    // onSnapshot を使って「リアルタイムリスナー」を登録
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    );

    // クリーンアップでリスナー解除
    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
}

/**
 * useUpdateField
 *
 * @param collectionName - 更新したいコレクション名
 * @returns updateField - (id, fieldName, value) を呼ぶと単一フィールドを更新する関数
 */
export function useUpdateField(collectionName: string) {
  /**
   * updateField
   *
   * @param id - ドキュメントID
   * @param fieldName - 更新したいフィールド名
   * @param value - 設定したい値
   */
  const updateField = async (
    id: string,
    fieldName: string,
    value: any
  ): Promise<{ id: string; [key: string]: any }> => {
    const docRef = doc(db, collectionName, id);
    // 動的キーでフィールドを更新
    await updateDoc(docRef, { [fieldName]: value } as Partial<DocumentData>);
    return { id, [fieldName]: value };
  };

  return { updateField };
}

// Firestore collection hook
export function useCollection(collectionName: string, ...queryConstraints: QueryConstraint[]) {
    const [data, setData] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const q = query(collection(db, collectionName), ...queryConstraints);
        
        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const documents: DocumentData[] = [];
                querySnapshot.forEach((doc) => {
                    documents.push({ id: doc.id, ...doc.data() });
                });
                setData(documents);
                setLoading(false);
            },
            (err) => {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, ...queryConstraints]);

    return { data, loading, error };
}

// Firestore operations hook
export function useFirestore(collectionName: string) {
    const addDocument = async (data: DocumentData, customId?: string) => {
        try {
            if (customId) {
                const docRef = doc(db, collectionName, customId);
                await setDoc(docRef, data);
                return { id: customId, ...data };
            } else {
                const docRef = doc(collection(db, collectionName));
                await setDoc(docRef, data);
                return { id: docRef.id, ...data };
            }
        } catch (error) {
            throw error;
        }
    };

    const updateDocument = async (id: string, data: DocumentData) => {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data);
            return { id, ...data };
        } catch (error) {
            throw error;
        }
    };

    const deleteDocument = async (id: string) => {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            throw error;
        }
    };

    return {
        addDocument,
        updateDocument,
        deleteDocument
    };
}

export default app;
