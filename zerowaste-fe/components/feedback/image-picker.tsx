import React, { useState } from "react";
import {
  View,
  Button,
  Image,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const ImgPicker = (props: any) => {
  const [pickedImage, setPickedImage] = useState<string | undefined>();

  const verifyPermissions = async () => {
    // Request camera permission
    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    // Request media library permission
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Insufficient permissions!",
        "You need to grant camera and media library permissions to use this app.",
        [{ text: "Okay" }]
      );
      return false;
    }
    return true;
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      console.log(pickedUri);
      setPickedImage(pickedUri);
      props.onImageTaken(pickedUri);
    }
  };

  return (
    <View>
      <Text style={styles.label}>Photo (Optional)</Text>
      <View style={styles.imagePicker}>
        <View style={styles.imagePreview}>
          {!pickedImage ? (
            <Pressable onPress={takeImageHandler} style={styles.pressable}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={24} />
                <Text>Tap to upload photo</Text>
              </View>
            </Pressable>
          ) : (
            <Image style={styles.image} source={{ uri: pickedImage }} />
          )}
        </View>
        <View>
          {pickedImage && (
            <Pressable onPress={takeImageHandler} style={styles.retakeBtn}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={24} color={"white"} />
                <Text style={{ color: "white" }}>Retake photo</Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#bbb7b7ff",
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    width: "45%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pressable: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  retakeBtn: {
    width: "75%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
});

export default ImgPicker;
