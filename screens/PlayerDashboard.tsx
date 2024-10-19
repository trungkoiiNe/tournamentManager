import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
import CustomModal from "../components/CustomModal";
import { toast } from "@baronha/ting";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
// import { Icon } from "react-native-vector-icons/Icon";

const { width } = Dimensions.get("window");

export default function PlayerDashboard({ navigation }: { navigation: any }) {
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // const renderSettingsButton = () => {
  //   return (
  //     <TouchableOpacity
  //       style={{ position: "absolute", top: 10, right: 10 }}
  //       onPress={navigation.navigate("Settings")}
  //     >
  //       <Icon name="settings-outline" size={24} color="#000" />
  //     </TouchableOpacity>
  //   );
  // };
  useEffect(() => {
    let unsubscribe: () => void;
    if (user) {
      unsubscribe = firestore()
        .collection("TournamentManager")
        .doc(user?.email)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setProfile(doc.data() as any);
          }
        });
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const getAvatar = async () => {
    try {
      const storageRef =await storage().ref(`user_${user?.email}.png`);
      const url = await storageRef.getDownloadURL();
      console.log(url)
      return url;
    } catch (error) {
      console.log("cantt");
      return null;
    }
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      const url = await getAvatar();
      // if(!url){
      //   setAvatarUrl()
      // }
      setAvatarUrl(url);
    };
    fetchAvatar();
  }, []);

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

  const getAvatarSource = () => {
    console.log(user);
    if (avatarUrl) {
      return { uri: avatarUrl };
    } else if (user?.avatar) {
      return { uri: user?.avatar };
    } else {
      return require("../assets/messi.png");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/football-field-blur.jpg")}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image source={getAvatarSource()} style={styles.profileImage} />
            <Text style={styles.title}>
              Welcome, {profile?.name || user?.email}
            </Text>
          </View>

          <View style={styles.card}>
            <Ionicons
              name="person"
              size={24}
              color="#4a69bd"
              style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <Text style={styles.info}>Role: {user?.role}</Text>
              <Text style={styles.info}>Age: {profile?.age}</Text>
              {user?.role === "player" && (
                <Text style={styles.info}>Position: {profile?.position}</Text>
              )}
              <Text style={styles.info}>Experience: {profile?.experience}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Ionicons
              name="trophy"
              size={24}
              color="#4a69bd"
              style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Achievements</Text>
              <Text style={styles.info}>{profile?.achievements}</Text>
            </View>
          </View>

          {(user?.role === "coach" || user?.role === "organizer") && (
            <View style={styles.card}>
              <Ionicons
                name="school"
                size={24}
                color="#4a69bd"
                style={styles.cardIcon}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Specialization</Text>
                <Text style={styles.info}>{profile?.specialization}</Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Ionicons
              name="call"
              size={24}
              color="#4a69bd"
              style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Contact Information</Text>
              <Text style={styles.info}>{profile?.contactInfo}</Text>
            </View>
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
        </ScrollView>

        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Change Password"
        >
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
        </CustomModal>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    marginRight: 16,
    alignSelf: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
    color: "#555",
  },
  button: {
    backgroundColor: "#4a69bd",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: "#eb4d4b",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#4a69bd",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
