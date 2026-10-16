import { Stack, router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/Index')}>
          <Text style={styles.text}>Back to home Page</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "purple",
  },
  text: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
