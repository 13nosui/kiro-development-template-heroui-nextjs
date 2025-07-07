// components/PostPageWrapper.tsx
import { useState, useCallback } from "react";
import { BookPost } from "@/types/bookPost";
import PostGridView from "@/components/PostGridView";
import PostFABMenu from "@/components/PostFABMenu";
import Image from "next/image";
import nidomy from "@/assets/nidomy/kyoton.png";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface Props {
  posts: BookPost[];
  screen?: "mypage" | "home";
}

export default function PostPageWrapper({
  posts: initialPosts,
  screen = "mypage",
}: Props) {
  const [posts, setPosts] = useState<BookPost[]>(
    [...initialPosts].sort((a, b) => {
      const aTime = a.createdAt?.toMillis() ?? 0;
      const bTime = b.createdAt?.toMillis() ?? 0;
      return bTime - aTime;
    })
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const handleLongPress = (postId: string) => {
    setIsSelecting(true);
    setSelectedPostIds([postId]);
  };

  const toggleSelect = (postId: string) => {
    setSelectedPostIds((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      if (next.length === 0) setIsSelecting(false);
      return next;
    });
  };

  const handleDelete = useCallback(async () => {
    if (!db || !storage) return;
    const targets = posts.filter((post) => selectedPostIds.includes(post.id));
    await Promise.all(
      targets.map(async (post) => {
        await deleteDoc(doc(db!, "posts", post.id));
        await Promise.all(
          post.imageUrls.map(async (url) => {
            const path = new URL(url).pathname.split("/o/")[1].split("?")[0];
            const decodedPath = decodeURIComponent(path);
            const fileRef = ref(storage!, decodedPath);
            try {
              await deleteObject(fileRef);
            } catch (error) {
              console.warn(`⚠️ Failed to delete file: ${decodedPath}`, error);
            }
          })
        );
      })
    );
    setPosts((prev) =>
      prev.filter((post) => !selectedPostIds.includes(post.id))
    );
    setSelectedPostIds([]);
    setIsSelecting(false);
  }, [posts, selectedPostIds]);

  const showEmptyState = screen === "mypage" && posts.length === 0;

  if (showEmptyState) {
    return (
      <div className="h-screen flex flex-col">
        <div className="w-full max-w-[480px] mx-auto flex flex-col gap-[12px] px-[24px] pt-[24px]">
          <div
            style={{
              fontSize: "var(--font-size-large)",
              lineHeight: "var(--line-height-large)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--on-surface)",
            }}
          >
            お気に入りのアートブックを並べよう
          </div>
          <div
            style={{
              fontSize: "var(--font-size-large)",
              lineHeight: "var(--line-height-large)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--on-surface-variant)",
            }}
          >
            撮影した写真や保存済みの画像を追加できます。またホーム画面でみんなのコレクションを眺めることもできます。
          </div>
        </div>
        <div className="w-full max-w-[480px] mx-auto flex flex-col h-screen">
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="aspect-square flex justify-center items-center w-full">
              <Image
                src={nidomy.src}
                alt="nidomy graphic"
                width={256}
                height={256}
                priority
                className="aspect-square"
              />
            </div>
          </div>
        </div>
        <PostFABMenu screen={screen} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[color:var(--surface)]">
      <PostGridView
        posts={posts}
        isSelecting={isSelecting}
        selectedPostIds={selectedPostIds}
        onLongPress={handleLongPress}
        onToggleSelect={toggleSelect}
      />
      <PostFABMenu
        screen={screen}
        isSelecting={isSelecting}
        onDeleteSelected={handleDelete}
      />
    </div>
  );
}
