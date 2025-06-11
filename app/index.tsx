import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";


import { Colors } from "@/constants/Colors";

type Props = {};

const IntroScreen = (props: Props) => {
  return (
    <>
     <Stack initialRouteName="index"> {/* 👈 Forces /app/index.tsx */}
      <Stack.Screen name="index" />
      
    </Stack>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/Welcome_img.jpg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.85)"]}
          style={styles.overlay}
        >
          <Animated.View
            entering={FadeInUp.duration(1000).delay(200)}
            style={styles.wrapper}
          >
            <Text style={styles.title}> Fun & Earn Shop</Text>
            <Text style={styles.subtitle}>
              Unlock exclusive rewards, enjoy seamless shopping, and earn while you shop. Fast, secure and rewarding.
            </Text>

            <Animated.View entering={FadeInDown.delay(500).duration(1000)}>
              <Link href="/signin" asChild>
                <TouchableOpacity style={styles.button}>
                 
                  <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  wrapper: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.highlight,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.background,
   fontWeight: "600",
   
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 26,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
