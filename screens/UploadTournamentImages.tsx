import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";

const UploadTournamentImages = ({ route, navigation }) => {
  const { tournamentId } = route.params;
  const [bannerImage, setBannerImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);

  const pickImage = useCallback(async (type) => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        mediaType: "photo",
      });
      type === "banner" ? setBannerImage(image) : setLogoImage(image);
    } catch (error) {
      console.log("ImagePicker Error: ", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, []);

  const uploadImage = useCallback(
    async (uri, type) => {
      if (!uri) return null;

      const filename = `${tournamentId}_${type}_${Date.now()}.jpg`;
      const reference = storage().ref(`tournaments/${filename}`);

      try {
        await reference.putFile(uri);
        const url = await reference.getDownloadURL();
        console.log(`${type} image uploaded successfully:`, url);
        return url;
      } catch (error) {
        console.error(`Error uploading ${type} image:`, error);
        throw error;
      }
    },
    [tournamentId]
  );

  const handleUpload = useCallback(async () => {
    try {
      let updates = {};
      if (bannerImage) {
        updates.bannerUrl = await uploadImage(bannerImage.path, "banner");
      }
      if (logoImage) {
        updates.logoUrl = await uploadImage(logoImage.path, "logo");
      }

      await firestore()
        .collection("tournaments")
        .doc(tournamentId)
        .update(updates);
      Alert.alert("Success", "Images uploaded successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error uploading images:", error);
      Alert.alert("Error", "Failed to upload images. Please try again.");
    }
  }, [bannerImage, logoImage, uploadImage, tournamentId, navigation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => pickImage("banner")}
      >
        <Text style={styles.buttonText}>Select Banner Image</Text>
      </TouchableOpacity>
      {bannerImage && (
        <Image source={{ uri: bannerImage.path }} style={styles.image} />
      )}

      <TouchableOpacity style={styles.button} onPress={() => pickImage("logo")}>
        <Text style={styles.buttonText}>Select Logo Image</Text>
      </TouchableOpacity>
      {logoImage && (
        <Image source={{ uri: logoImage.path }} style={styles.image} />
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload Images</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... add your styles here
});

export default UploadTournamentImages;
