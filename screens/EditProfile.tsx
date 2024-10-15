import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import ImagePicker from "react-native-image-crop-picker";
import { alert } from "@baronha/ting";
export default function EditProfile({ navigation }: any) {
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
    let unsubscribe: any;
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

  const handleUpdate = async () => {
    try {
      await firestore()
        .collection("TournamentManager")
        .doc(user?.email)
        .update(profile);
      alert({
        title: "Thành công",
        message: "Cập nhật thông tin thành công",
        haptic: "success",
      });
      navigation.goBack();
    } catch (error) {
      // console.log("Update error:", error);
      alert({
        title: "Lỗi",
        message: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        preset: "error",
      });
    }
  };

  const pickImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
    }).then(async (image) => {
      const uploadUri = Platform.OS === "ios" ? image.path : image.path;
      const response = await fetch(uploadUri);
      const blob = await response.blob();
      const storageRef = storage().ref(`user_${user?.email}.png`);
      const uploadTask = storageRef.put(blob);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error(error);
          alert({
            title: "Lỗi",
            message: "Không thể tải lên ảnh. Vui lòng thử lại.",
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarPlaceholder}>Upload Avatar</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
        placeholderTextColor="#777"
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={profile.age}
        onChangeText={(text) => setProfile({ ...profile, age: text })}
        keyboardType="numeric"
        placeholderTextColor="#777"
      />

      {user?.role === "player" && (
        <TextInput
          style={styles.input}
          placeholder="Position"
          value={profile.position}
          onChangeText={(text) => setProfile({ ...profile, position: text })}
          placeholderTextColor="#777"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Experience"
        value={profile.experience}
        onChangeText={(text) => setProfile({ ...profile, experience: text })}
        placeholderTextColor="#777"
      />

      <TextInput
        style={styles.input}
        placeholder="Achievements"
        value={profile.achievements}
        onChangeText={(text) => setProfile({ ...profile, achievements: text })}
        multiline
        placeholderTextColor="#777"
      />

      {(user?.role === "coach" || user?.role === "organizer") && (
        <TextInput
          style={styles.input}
          placeholder="Specialization"
          value={profile.specialization}
          onChangeText={(text) =>
            setProfile({ ...profile, specialization: text })
          }
          placeholderTextColor="#777"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Contact Information"
        value={profile.contactInfo}
        onChangeText={(text) => setProfile({ ...profile, contactInfo: text })}
        placeholderTextColor="#777"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    fontSize: 14,
    color: "#aaa",
  },
});
