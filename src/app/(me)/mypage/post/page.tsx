"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePostImageStore } from "@/store/postImage";
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import FixedBottomContainer from "@/components/FixedBottomContainer";
import PlusIcon from "@/icons/size40/add.svg";
import TagDialog from "./TagDialog";
import ImageCropper from "@/components/ImageCropper";

// 認証が必要なページはSSRとプリレンダリングを無効化
export const dynamic = 'force-dynamic';

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  // SSR時にはauth使用を避け、クライアントサイド専用でuseAuthStateを使用
  const [user] = useAuthState(auth!);
  const { croppedImage, imageFile, setCroppedImage, setImageFile, clearAll } =
    usePostImageStore();

  // クライアントサイドでのみマウント状態を管理
  useEffect(() => {
    setMounted(true);
  }, []);

  // トリミング完了時
  const handleCropComplete = (croppedFile: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCroppedImage(reader.result as string);
      setImageFile(null); // トリミング後はimageFileをクリア
    };
    reader.readAsDataURL(croppedFile);
  };

  // トリミングキャンセル時
  const handleCropCancel = () => {
    setImageFile(null);
  };

  const handlePost = async () => {
    if (!mounted || !croppedImage || !user || !storage || !db) {
      alert("画像が選択されていないか、ログインしていません。");
      return;
    }

    setIsUploading(true);

    try {
      // Base64データからBlobを作成
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // 一意なファイル名を生成
      const timestamp = Date.now();
      const fileName = `posts/${user.uid}/${timestamp}.jpg`;

      // Firebase Storageにアップロード
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);

      // ダウンロードURLを取得
      const imageUrl = await getDownloadURL(storageRef);

      // Firestoreに投稿データを保存
      await addDoc(collection(db, "posts"), {
        title: title.trim() || "",
        comment: description.trim() || "",
        tags: tags,
        imageUrls: [imageUrl],
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // 投稿後にstoreをクリア
      clearAll();

      alert("投稿が完了しました！");
      router.push("/mypage");
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsUploading(false);
    }
  };

  // クライアントサイドでマウントされるまでローディング表示
  if (!mounted) {
    return (
      <div className="min-h-screen w-full max-w-[480px] mx-auto flex items-center justify-center">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (imageFile) {
    return (
      <ImageCropper
        image={URL.createObjectURL(imageFile)}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col items-center">
      {/* 画像エリア */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative pb-[24px]">
        {croppedImage ? (
          <Image
            src={croppedImage}
            alt="投稿画像"
            width={480}
            height={480}
            className="w-full max-w-[480px] aspect-square object-contain mx-auto"
          />
        ) : (
          <div className="w-full max-w-[480px] aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
            画像がありません
          </div>
        )}
        {/* 画像追加ボタン */}
        <div className="absolute right-[16px] bottom-[40px]">
          <IconButton icon={<PlusIcon />} />
        </div>
      </div>
      <div className="w-full pb-[120px] flex flex-col gap-[36px]">
        {/* 入力エリア */}
        <div className="w-full px-[24px] flex flex-col gap-[36px]">
          {/* タイトル */}
          <div>
            <TextField label="タイトル" value={title} onChange={setTitle} />
          </div>
          {/* ひとこと */}
          <div>
            <TextField
              label="ひとこと"
              value={description}
              maxLength={32}
              onChange={setDescription}
            />
          </div>
        </div>
        <div className="w-full flex flex-col">
          {/* タグ */}
          <div>
            <Button
              variant="text-secondary"
              onClick={() => setShowTagDialog(true)}
            >
              タグ {tags.length > 0 && `(${tags.length})`}
            </Button>
            {/* 追加されたタグを表示 */}
            {tags.length > 0 && (
              <div className="mt-2 px-6 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 投稿ボタン（下部固定） */}
      <FixedBottomContainer>
        <Button
          variant="primary"
          fullWidth
          onClick={handlePost}
          disabled={isUploading || !croppedImage}
        >
          {isUploading ? "投稿中..." : "投稿"}
        </Button>
      </FixedBottomContainer>

      {/* タグ追加ダイアログ */}
      {showTagDialog && (
        <TagDialog
          onClose={() => setShowTagDialog(false)}
          onAddTags={(newTags) => {
            setTags(newTags);
            setShowTagDialog(false);
          }}
          initialTags={tags}
        />
      )}
    </div>
  );
};

export default PostForm;
