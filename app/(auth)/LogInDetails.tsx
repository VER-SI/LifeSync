import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, AntDesign, FontAwesome } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/FirebaseConfig";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const LogInDetails = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "602524777594-1u1n2d97lakuv0k9ervot5v4a6t4n12h.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri(),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      const credential = GoogleAuthProvider.credential(authentication?.idToken);
      signInWithCredential(auth, credential)
        .then(() => router.replace("/(main)/(tabs)/Home"))
        .catch((error) => Alert.alert("Google sign-in failed", error.message));
    }
  }, [response]);

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/(main)/(tabs)/Home");
    } catch (error: any) {
      Alert.alert("Sign in failed", error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return Alert.alert("Enter your email");
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      Alert.alert("Success", "Password reset email sent. Check your inbox.");
      setForgotEmail("");
      setForgotModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#19779B", "#17B3A6"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Hello There,</Text>
          <Text style={styles.subtitle}>Let's Organize Your Day</Text>
          <Text style={styles.description}>Start the day with a big smile</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Enter your details to log in</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="********"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIcon}
            >
              <Feather name={passwordVisible ? "eye" : "eye-off"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => setForgotModalVisible(true)}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={signIn}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Or</Text>
          <View style={styles.separatorLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <AntDesign name="google" size={24} color="#DB4437" />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <AntDesign name="apple" size={24} color="black" />
          <Link style={styles.socialButtonText} href={"/(main)/(tabs)/Home"}>
            Continue with Apple
          </Link>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={24} color="#4267B2" />
          <Link style={styles.socialButtonText} href={"/(main)/(tabs)/Home"}>
            Continue with Facebook
          </Link>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={forgotModalVisible}
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={forgotEmail}
              onChangeText={setForgotEmail}
            />
            <TouchableOpacity
              style={[styles.nextButton, { marginTop: 10 }]}
              onPress={handleForgotPassword}
            >
              <Text style={styles.nextButtonText}>Send Reset Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10, alignItems: "center" }}
              onPress={() => setForgotModalVisible(false)}
            >
              <Text style={{ color: "#007AFF", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerBackground: {
    paddingBottom: 80,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginTop: -60,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: "#008080",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: 30,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  separatorText: {
    paddingHorizontal: 10,
    fontSize: 14,
    color: "gray",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: "100%",
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
});

export default LogInDetails;
