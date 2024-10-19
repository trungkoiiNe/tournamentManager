import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import ImagePicker from "react-native-image-crop-picker";
import { alert } from "@baronha/ting";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfile({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    position: "",
    experience: "",
    achievements: "",
    specialization: "",
    contactInfo: "",
    avatar: null,
  });

  useEffect(() => {
    let unsubscribe;
    if (user) {
      unsubscribe = firestore()
        .collection("TournamentManager")
        .doc(user?.email)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setProfile(doc.data());
          }
        });
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const handleUpdate = async () => {
    try {
      await firestore()
        .collection("TournamentManager")
        .doc(user?.email)
        .update(profile);
      alert({
        title: "Success",
        message: "Profile updated successfully",
        haptic: "success",
      });
      navigation.goBack();
    } catch (error) {
      alert({
        title: "Error",
        message: "Unable to update profile. Please try again.",
        preset: "error",
      });
    }
  };

  const pickImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
    }).then(async (image) => {
      const uploadUri = Platform.OS === "ios" ? image.sourceURL : image.path;
      const response = await fetch(uploadUri);
      const blob = await response.blob();
      const storageRef = storage().ref(`user_${user?.email}.png`);
      const uploadTask = storageRef.put(blob);
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error(error);
          alert({
            title: "Error",
            message: "Unable to upload image. Please try again.",
            preset: "error",
          });
        },
        async () => {
          const downloadURL = await storageRef.getDownloadURL();
          setProfile({ ...profile, avatar: downloadURL });
        }
      );
    });
  };

  const renderInput = (placeholder, value, onChangeText, keyboardType = "default", multiline = false) => (
    <View style={styles.inputContainer}>
      <Icon name={getIconName(placeholder)} size={24} color="#6200ee" style={styles.inputIcon} />
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );

  const getIconName = (placeholder) => {
    switch (placeholder) {
      case "Name": return "account";
      case "Age": return "calendar";
      case "Position": return "soccer-field";
      case "Experience": return "briefcase";
      case "Achievements": return "trophy";
      case "Specialization": return "star";
      case "Contact Information": return "phone";
      default: return "pencil";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={['#6200ee', '#9900ff']}
            style={styles.header}
          >
            <Text style={styles.title}>Edit Profile</Text>
          </LinearGradient>

          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="camera" size={40} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {renderInput("Name", profile.name, (text) => setProfile({ ...profile, name: text }))}
          {renderInput("Age", profile.age, (text) => setProfile({ ...profile, age: text }), "numeric")}
          {user?.role === "player" && renderInput("Position", profile.position, (text) => setProfile({ ...profile, position: text }))}
          {renderInput("Experience", profile.experience, (text) => setProfile({ ...profile, experience: text }))}
          {renderInput("Achievements", profile.achievements, (text) => setProfile({ ...profile, achievements: text }), "default", true)}
          {(user?.role === "coach" || user?.role === "organizer") && renderInput("Specialization", profile.specialization, (text) => setProfile({ ...profile, specialization: text }))}
          {renderInput("Contact Information", profile.contactInfo, (text) => setProfile({ ...profile, contactInfo: text }))}

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <LinearGradient
              colors={['#6200ee', '#9900ff']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Update Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginTop: -60,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#9900ff",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
