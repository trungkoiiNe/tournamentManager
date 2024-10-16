import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
import { alert } from "@baronha/ting";

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const login = useAuthStore((state) => state.login);
  const [modalVisible, setModalVisible] = useState(false);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const [isLoading, setIsLoading] = useState(false);
  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsLoading(false);
      setModalVisible(false);
    } catch (error) {
      setIsLoading(false);
      alert({
        title: "Lỗi",
        message: "An unknown error occurred",
        preset: "error",
      });
    }
  };
  // const user = useAuthStore((state) => state.user);
  const validateEmail = (email: string) => {
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rg = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim;
    return rg.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
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
      await login(email, password);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error && "code" in error) {
        switch (error.code) {
          case "auth/invalid-credential":
            alert({
              title: "Lỗi",
              message: "Email hoặc mật khẩu không đúng",
              preset: "error",
            });
            break;
          case "auth/too-many-requests":
            alert({
              title: "Lỗi",
              message: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau",
              preset: "error",
            });
            break;
        }
      } else {
        alert({
          title: "Lỗi",
          message: "An unknown error occurred",
          preset: "error",
        });
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/football-field.jpg")}
      style={styles.backgroundImage}
    >
      {loading === true ? (
        <FootballLoadingIndicator color="black" size="big" />
      ) : (
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Image
              source={require("../assets/football-icon.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Football Login</Text>
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                {isLoading ? (
                  <FootballLoadingIndicator size="small" color="black" />
                ) : (
                  <>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Email"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={(text) => setEmail(text)}
                    />
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleResetPassword}
                    >
                      <Text style={styles.modalButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { marginTop: 10, backgroundColor: "#ccc" },
                      ]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      )}
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
  button: {
    backgroundColor: "#4a69bd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: "#60a3bc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalInput: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#4a69bd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancelButton: {
    backgroundColor: "#ccc",
  },
});

export default LoginScreen;
