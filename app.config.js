import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

export default {
    expo: {
        name: "google-signin-app",
        slug: "google-signin-app",
        version: "1.0.11",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            package: "com.lgk1412.googlesigninapp"
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            WEB_CLIENT_ID: process.env.WEB_CLIENT_ID,
            IP: process.env.IP,
            eas: {
                projectId: "753cb874-4734-4e77-9151-83ca91f72dc7"
            }
        },
        plugins: [
            "@react-native-google-signin/google-signin",
            "expo-secure-store"
        ],
        jsEngine: "hermes",
        owner: "lgk1412"
    }
};
