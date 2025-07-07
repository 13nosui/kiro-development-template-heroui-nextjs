import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BookPost } from "@/types/bookPost";

export async function getPostsByUserId(userId: string): Promise<BookPost[]> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }
  const q = query(collection(db, "posts"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<BookPost, "id">),
  }));
}
