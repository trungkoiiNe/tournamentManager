import React, {useEffect, useState} from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {useAuthStore} from "../store/authStore";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

export default function PlayerDashboard({ navigation }: { navigation: any }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [profile, setProfile] = useState<any>(null);

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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={
                        avatarUrl ? {uri: avatarUrl} : require("../assets/messi.png")
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
                style={[styles.button, styles.logoutButton]}
                onPress={logout}
            >
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            {/* <DraggableNotificationButton /> */}
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
        shadowOffset: {width: 0, height: 2},
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
});
