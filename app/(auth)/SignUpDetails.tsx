import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, AntDesign, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/FirebaseConfig";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const SignUpDetails = () => {
  const insets = useSafeAreaInsets();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri(),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      const credential = GoogleAuthProvider.credential(authentication?.idToken);
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log("Google user signed up:", result.user.uid);
          router.replace("/(main)/(tabs)/Home");
        })
        .catch((error) => {
          console.error("Google sign-up error:", error);
          if (error instanceof Error) {
            alert("Google sign-up failed: " + error.message);
          } else {
            alert("An unknown error occurred during Google sign-up.");
          }
        });
    }
  }, [response]);

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential) {
        router.replace("/(main)/(tabs)/Home");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert("Sign up failed: " + error.message);
      } else {
        alert("An unknown error occurred during sign-up.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#19779B", "#17B3A6"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and get organized</Text>
          <Text style={styles.description}>Start your journey with a new account</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Enter your details to sign up</Text>

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
              <Feather
                name={passwordVisible ? "eye" : "eye-off"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={signUp}>
          <Text style={styles.nextButtonText}>SIGN UP</Text>
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
          <Text style={styles.socialButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <AntDesign name="apple" size={24} color="black" />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={24} color="#4267B2" />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
      </View>
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
  
  nextButton: {
    backgroundColor: "#008080",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 15,
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
});

export default SignUpDetails;