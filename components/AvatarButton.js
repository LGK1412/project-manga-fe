import { useState, useCallback } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { IP } from "../constants/config";

const AvatarButton = () => {
  const [avatarUri, setAvatarUri] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const loadAvatar = async () => {
        const userInfo = await AsyncStorage.getItem("userInfo");
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          setAvatarUri(parsed.avatar);
          console.log(avatarUri);
        }
      };
      loadAvatar();
    }, [])
  );

  const handlePress = () => {
    navigation.navigate("UploadAvatar");
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        {avatarUri && (
          <Image
            source={{
              uri: avatarUri?.startsWith("http")
                ? avatarUri
                : `http://${IP}:333/avatars/${
                    avatarUri || "avatar.png"
                  }?t=${Date.now()}`,
            }}
            style={styles.image}
          />
        )}
        <MaterialIcons
          name="photo-camera"
          size={28}
          color="white"
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  icon: {
    position: "absolute",
  },
});

export default AvatarButton;
