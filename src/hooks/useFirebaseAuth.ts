// src/hooks/useFirebaseAuth.ts
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

export const useFirebaseAuth = () => {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("📍 useFirebaseAuth - session:", session);
    console.log("📍 Firebase currentUser:", auth?.currentUser);

    const doLogin = async () => {
      if (session?.idToken && auth && !auth.currentUser) {
        try {
          const credential = GoogleAuthProvider.credential(session.idToken);
          await signInWithCredential(auth, credential);
          console.log("✅ Firebase sign-in success");
        } catch (error) {
          console.error("❌ Firebase sign-in error:", error);
        }
      }
    };

    doLogin();
  }, [session]);
};
