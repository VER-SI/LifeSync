import { auth } from '@/FirebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInAnonymously } from 'firebase/auth';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Index = () => {
  const insets = useSafeAreaInsets();

  const handleGuestLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      console.log("Guest signed in:", result.user.uid);
      router.replace('/(main)/(tabs)/Home');
    } catch (error) {
      console.error("Guest sign-in error:", error);
    }
  };

  return (
    <LinearGradient
      colors={['#19779B', '#17B3A6']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Let's Get Started</Text>
        <Text style={styles.subtitle}>Manage your routine with ease</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/LogInDetails')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => router.push('/SignUpDetails')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleGuestLogin}
          style={styles.guestTouchArea}
        >
          <Text style={styles.guestLink}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', 
    paddingBottom: 50, 
  },
  
  content: {
    alignSelf: 'flex-start', 
    paddingHorizontal: 30,
    position: 'absolute', 
    paddingBottom: 300, 
  },
  
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'left', 
    letterSpacing: -0.5,
  },
  
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 30,
    textAlign: 'left', 
  },
  
  button: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonText: {
    fontSize: 16,
    color: '#008080',
    fontWeight: '700',
  },
  
  secondaryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  
  guestTouchArea: {
    paddingVertical: 8,
    marginTop: 4,
  },

  guestLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default Index;