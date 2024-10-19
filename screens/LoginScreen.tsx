import React, { useState, useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import FootballLoadingIndicator from "../components/FootballLoadingIndicator";
import { alert } from "@baronha/ting";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

const { width, height } = Dimensions.get("window");

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
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const googleSignIn = useAuthStore((state) => state.googleSignIn);
  const facebookSingIn = useAuthStore((state) => state.facebookSingIn);
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    if ((await GoogleSignin.hasPlayServices()) === false) {
      console.log("haha");
    }
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const userInfo = await GoogleSignin.signIn();
    // console.log(userInfo);
    await googleSignIn(userInfo.data);

    // Sign-in the user with the credential
    // return auth().signInWithCredential(googleCredential);
  }
  async function onFacebookButtonPress() {
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      // throw "User cancelled the login process";
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();
    // const email= await AccessToken.getCurrentAccessToken().then((token)
    console.log(data);
    facebookSingIn(data);
    if (!data) {
      // throw "Something went wrong obtaining access token";
    }
  }
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "499744196132-pt1g8t7ak3d12pbuvvsj2pd8va3nmv2t.apps.googleusercontent.com",
    });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsLoading(false);
      setModalVisible(false);
      alert({
        title: "Success",
        message: "Password reset email sent. Please check your inbox.",
        preset: "done",
      });
    } catch (error) {
      setIsLoading(false);
      alert({
        title: "Error",
        message: "Failed to send reset email. Please try again.",
        preset: "error",
      });
    }
  };

  const validateEmail = (email: string) => {
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
              title: "Error",
              message: "Invalid email or password",
              preset: "error",
            });
            break;
          case "auth/too-many-requests":
            alert({
              title: "Error",
              message: "Too many login attempts. Please try again later.",
              preset: "error",
            });
            break;
          default:
            alert({
              title: "Error",
              message: "An unknown error occurred",
              preset: "error",
            });
        }
      } else {
        alert({
          title: "Error",
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        >
          {loading ? (
            <FootballLoadingIndicator color="white" size="big" />
          ) : (
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <Image
                source={require("../assets/football-icon.png")}
                style={styles.icon}
              />
              <Text style={styles.title}>FTM Login</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color="#fff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Email"
                  placeholderTextColor="#ccc"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color="#fff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#ccc"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
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
                style={styles.forgotPassword}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={() => {
                    onGoogleButtonPress();
                  }}
                >
                  <Ionicons
                    name="logo-google"
                    size={24}
                    color="#fff"
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialButtonText}>Login with Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => {
                    /* Add Facebook login logic here */
                    onFacebookButtonPress();
                  }}
                >
                  <Ionicons
                    name="logo-facebook"
                    size={24}
                    color="#fff"
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialButtonText}>
                    Login with Facebook
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleResetPassword}
                >
                  <Text style={styles.modalButtonText}>Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: "#4a69bd" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  inputError: {
    borderBottomColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4a69bd",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: "#60a3bc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#ddd",
    fontSize: 16,
    textDecorationLine: "underline",
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
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4a69bd",
  },
  modalInput: {
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#4a69bd",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancelButton: {
    backgroundColor: "#f1f2f6",
  },
  socialButtonsContainer: {
    width: "100%",
    marginTop: 20,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    width: "100%",
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  facebookButton: {
    backgroundColor: "#4267B2",
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
