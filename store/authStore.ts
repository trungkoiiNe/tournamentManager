import { create } from "zustand";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { toast } from "@baronha/ting";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

const playSound = async (soundFile: any) => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.log("Error playing sound", error);
  }
};
const speakGreeting = async (username: string) => {
  try {
    await Speech.speak(`Hello ${username}, have a good day!`, {
      language: "en",
      pitch: 1,
      rate: 0.8,
    });
  } catch (error) {
    console.log("Error speaking greeting", error);
  }
};
type User = {
  uid: string;
  email: string;
  role: "admin" | "coach" | "player" | "organizer";
  id: string;
  // role: string;
  name: string;
  teamId: string;
  stats: any;
  experience: string;
  position: string;
  // email: string;
};

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  alertError: (error: any) => void;
  updatePassword: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: (userData: any) => Promise<void>;
  facebookSingIn: (userData: any) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    try {
      const lowercaseEmail = email.toLowerCase();
      const userCredential = await auth().signInWithEmailAndPassword(
        lowercaseEmail,
        password
      );
      const { uid } = userCredential.user;
      const userDoc = await firestore()
        .collection("TournamentManager")
        .doc(lowercaseEmail)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        set({ user: { uid, email: lowercaseEmail, role: userData?.role } });

        await speakGreeting(userData?.name ? userData.name : "User");
        toast({
          title: "Đăng nhập thành công 😎",
          message: `Chào mừng ${email}`,
        });
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      await playSound(require("../assets/error.mp3"));
      // console.error("Login error:", error);
      throw error;
    }
  },

  register: async (email, password, role) => {
    try {
      const lowercaseEmail = email.toLowerCase();
      const userCredential = await auth().createUserWithEmailAndPassword(
        lowercaseEmail,
        password
      );
      const { uid } = userCredential.user;
      await firestore()
        .collection("TournamentManager")
        .doc(lowercaseEmail)
        .set({ role });
      set({
        user: {
          uid,
          email: lowercaseEmail,
          role: role as "admin" | "coach" | "player" | "organizer",
        },
      });
      await playSound(require("../assets/start.mp3"));

      toast({
        title: "Đăng ký thành công 😎",
        message: `Chào mừng ${email}`,
      });
    } catch (error) {
      await playSound(require("../assets/error.mp3"));

      // console.error("Register error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await auth().signOut();
      set({ user: null });
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await LoginManager.logOut();
      await playSound(require("../assets/out.mp3"));

      toast({
        title: "Đăng xuất thành công 😎",
        message: "Chúc bạn một ngày tốt lành!",
      });
      // console.log(user);
    } catch (error) {
      // await playSound(require("../assets/error.mp3"));
      // console.error('Logout error:', error);
      // throw error;
    }
  },
  alertError: (error) => {
    alert({
      title: "Lỗi",
      message: error.message,
    });
  },
  updatePassword: async (password) => {
    const user = auth().currentUser;
    if (user) {
      try {
        await user.updatePassword(password);
        await playSound(require("../assets/change.mp3"));

        toast({
          title: "Cập nhật mật khẩu thành công 😎",
          message: "Mật khẩu đã được cập nhật",
        });
      } catch (error) {
        await playSound(require("../assets/error.mp3"));

        toast({
          title: "Cập nhật mật khẩu thất bại 😎",
          message: "Mật khẩu đã được cập nhật",
        });
      }
    }
  },
  resetPassword: async (email) => {
    try {
      await auth().sendPasswordResetEmail(email);
      toast({
        title: "Đặt lại mật khẩu thành công 😎",
        message: "Mật khẩu đã được gửi đến email của bạn",
      });
    } catch (error) {
      toast({
        title: "Đặt lại mật khẩu thất bại 😎",
        message: "Mật khẩu đã được gửi đến email của bạn",
      });
    }
  },
  googleSignIn: async (userData: any) => {
    try {
      const lowercaseEmail = userData.user.email.toLowerCase();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userData.idToken
      );
      const userdata = (await auth().signInWithCredential(googleCredential))
        .user;
      console.log(userdata);
      const uid = userdata?.uid;
      const displayName = userdata?.displayName;
      const photoUrl = userdata?.photoURL;
      const familyName = userData?.user.familyName;
      const givenName = userData?.user.givenName;
      await firestore()
        .collection("TournamentManager")
        .doc(lowercaseEmail)
        .set({ role: "player", avatar: photoUrl, name: displayName });
      set({
        user: {
          uid,
          email: lowercaseEmail,
          role: "player",
          name: displayName,
        },
      });
      await playSound(require("../assets/start.mp3"));

      toast({
        title: "Đăng nhật thành công 😎",
        message: `Chào mừng ${displayName}`,
      });
      await speakGreeting(
        familyName ? `${familyName} ${givenName}` : "User"
      );
    } catch (error) {
      // await playSound(require("../assets/error.mp3"));
      // console.error("Register error:", error);
      // throw error;
    }
  },
  facebookSingIn: async (userData: any) => {
    try {
      // const lowercaseEmail = userData.email.toLowerCase();
      const facebookCredential = auth.FacebookAuthProvider.credential(
        userData.accessToken
      );
      const userdata = (await auth().signInWithCredential(facebookCredential))
        .user;
      console.log(userdata);
      const lowercaseEmail = userdata?.email?.toLowerCase();
      const uid = userdata?.uid;
      const displayName = userdata?.displayName;
      const photoUrl = userdata?.photoURL;
      await firestore()
        .collection("TournamentManager")
        .doc(lowercaseEmail)
        .set({ role: "player", avatar: photoUrl, name: displayName });
      set({
        user: {
          uid,
          email: lowercaseEmail,
          role: "player",
          name: displayName,
          avatar: photoUrl,
        },
      });
      await playSound(require("../assets/start.mp3"));

      toast({
        title: "Đăng nhật thành công 😎",
        message: `Chào mừng ${displayName}`,
      });
      await speakGreeting(displayName ? displayName : "User");
    } catch (error) {
      // await playSound(require("../assets/error.mp3"));

      console.error("Register error:", error);
      throw error;
    }
  },
}));
