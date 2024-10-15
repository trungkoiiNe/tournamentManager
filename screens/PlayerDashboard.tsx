import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
import CustomModal from "../components/CustomModal";
import { toast } from "@baronha/ting";
// import { useStore } from "../store/store";

export default function PlayerDashboard({
  navigation,
}: Readonly<{ navigation: any }>) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const { updatePassword } = useAuthStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    let unsubscribe: () => void;
    if (user) {
      unsubscribe = firestore()
        .collection("TournamentManager")
        .doc(user?.email)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setProfile(doc.data() as any);
            // getAvatar();
          }
        });
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const getAvatar = async () => {
    try {
      const storageRef = storage().ref(`user_${user?.email}.png`);
      // console.log(storageRef)
      const url = await storageRef.getDownloadURL();
      console.log(url);
      return url;
    } catch (error) {
      // console.log("Error getting avatar URL:", error);
      return null;
    }
  };
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const url = await getAvatar();
      setAvatarUrl(url as any);
    };
    fetchAvatar();
  }, [user]);
  const validatePassword = (password: string) => {
    const minLength = 5;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 6 characters long";
    } else if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
      return "Password must contain an uppercase letter, lowercase letter, number, and special character";
    }
    return "";
  };
  const handleChangePassword = async () => {
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;

    if (oldPassword.length === 0) {
      setOldPasswordError("Old password is required");
      isValid = false;
    }

    const newPasswordValidation = validatePassword(newPassword);
    if (newPasswordValidation) {
      setNewPasswordError(newPasswordValidation);
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    if (isValid) {
      try {
        setIsLoading(true);
        await updatePassword(newPassword);
        setIsLoading(false);
        setModalVisible(false);
        toast({
          title: "Password changed successfully",
          message: "Password changed successfully",
          preset: "done",
        });
      } catch (error) {
        setIsLoading(false);
        console.log(error);
        toast({
          title: "Error",
          message: "Error changing password",
          preset: "error",
        });
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            avatarUrl ? { uri: avatarUrl } : require("../assets/messi.png")
          }
          style={styles.profileImage}
        />
        <Text style={styles.title}>
          Welcome, {profile?.name || user?.email}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <Text style={styles.info}>Role: {user?.role}</Text>
        <Text style={styles.info}>Age: {profile?.age}</Text>
        {user?.role === "player" && (
          <Text style={styles.info}>Position: {profile?.position}</Text>
        )}
        <Text style={styles.info}>Experience: {profile?.experience}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Achievements</Text>
        <Text style={styles.info}>{profile?.achievements}</Text>
      </View>
      {(user?.role === "coach" || user?.role === "organizer") && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specialization</Text>
          <Text style={styles.info}>{profile?.specialization}</Text>
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <Text style={styles.info}>{profile?.contactInfo}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Edit profile")}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Change Password"
      >
        {isLoading ? (
          <FootballLoadingIndicator color="black" size="big" />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            {oldPasswordError && (
              <Text style={styles.errorText}>{oldPasswordError}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            {newPasswordError && (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {confirmPasswordError && (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.modalButtonText}>Change Password</Text>
            </TouchableOpacity>
          </>
        )}
      </CustomModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#444",
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // backgroundColor: "white",
    // padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%", // adjust as needed
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
