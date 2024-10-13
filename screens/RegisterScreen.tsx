import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  ImageBackground,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuthStore } from "../store/authStore";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
import { alert } from "@baronha/ting";
interface User {
  id: string;
  role: string;
  name: string;
  teamId: string;
  stats: any;
  email: string;
}

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("player");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const validateEmail = (email: string) => {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/igm;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await register(email, password, role);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error && "code" in error) {
        switch (error.code) {
          case "auth/email-already-in-use":
            alert({
              title: "Lỗi",
              message: "Email đã được sử dụng",
              preset: "error",
            });
            break;
          case "auth/too-many-requests":
            alert({
              title: "Lỗi",
              message: "Quá nhiều lần thử đăng ký, vui lòng thử lại sau",
              preset: "error",
            });
            break;
          default:
            alert({
              title: "Lỗi",
              message: "An unknown error occurred",
              preset: "error",
            });
        }
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/football-field-2.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={require("../assets/football-jersey.png")}
            style={styles.icon}
          />
          <Text style={styles.title}>Join the Team</Text>
          {loading ? (
            <FootballLoadingIndicator />
          ) : (
            <>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError("");
                }}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                secureTextEntry
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={role}
                  style={styles.picker}
                  onValueChange={(itemValue) => setRole(itemValue)}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Player" value="player" />
                  <Picker.Item label="Coach" value="coach" />
                  <Picker.Item label="Organizer" value="organizer" />
                </Picker>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.buttonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#333",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    overflow: "hidden",
  },
  picker: {
    color: "#333",
  },
  button: {
    backgroundColor: "#4a69bd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: "#60a3bc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
