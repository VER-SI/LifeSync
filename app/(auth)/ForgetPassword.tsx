import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "@/FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgetPassword = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Input Required", "Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent! Check your inbox.");
      router.back(); 
    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message);
      else Alert.alert("Error", "An unknown error occurred.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", paddingHorizontal: 20 },
  backButton: { marginTop: 20 },
  header: { marginTop: 40, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#555" },
  form: { marginTop: 20 },
  label: { fontSize: 16, color: "#555", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#008080",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ForgetPassword;
