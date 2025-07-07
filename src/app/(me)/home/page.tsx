// src/app/(me)/home/page.tsx
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookPost } from "@/types/bookPost";
import PostPageWrapper from "@/components/PostPageWrapper";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"; // ✅ 追加

export default function HomePage() {
  const [posts, setPosts] = useState<BookPost[] | null>(null);
  useFirebaseAuth(); // ✅ 呼び出しだけでOK

  useEffect(() => {
    const fetchPosts = async () => {
      if (!db) return;
      const snapshot = await getDocs(collection(db, "posts"));
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<BookPost, "id">),
      }));
      setPosts(fetched);
    };

    fetchPosts();
  }, []);

  if (posts === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <PostPageWrapper posts={posts} screen="home" />;
}
