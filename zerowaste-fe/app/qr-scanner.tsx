import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";

import { CameraView, scanFromURLAsync, useCameraPermissions } from "expo-camera";
import type { BarcodeScanningResult } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function QrScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);

  const showToast = useCallback((message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("QR Scanner", message);
    }
  }, []);

  const handleScanSuccess = useCallback(
    (data: string) => {
      setIsScanning(false);
      setScannedData(data);
      console.log("Scanned data: ", data);
      router.replace({
        pathname: "/(tabs)/feedback",
        params: { scannedData: data },
      });
    },
    [router]
  );

  const handleBarCodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      handleScanSuccess(data);
    },
    [handleScanSuccess]
  );

  const handlePickFromAlbum = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    try {
      const scanResults = await scanFromURLAsync(result.assets[0].uri, ["qr"]);
      if (scanResults.length > 0 && scanResults[0]?.data) {
        handleScanSuccess(scanResults[0].data);
      } else {
        showToast("No QR code detected in the selected image.");
      }
    } catch (error) {
      console.error("Failed to scan QR from image:", error);
      showToast("Unable to process the selected image.");
    }
  }, [handleScanSuccess, showToast]);

  const scannerStatusText = useMemo(() => {
    if (!permission?.granted) return "Camera access is required to scan QR codes.";
    if (!isScanning && scannedData) return "QR code captured";
    return "Align the QR code inside the frame to scan.";
  }, [isScanning, permission?.granted, scannedData]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Preparing camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="qr-code-2" size={64} color="#10B981" />
        <Text style={[styles.infoText, styles.permissionText]}>
          We need access to your camera to scan QR codes.
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, styles.fullWidthButton]}
          onPress={requestPermission}
        >
          <Text style={styles.primaryButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.outlinedButton, styles.outlinedButtonLight, styles.fullWidthButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.outlinedButtonText, styles.outlinedButtonLightText]}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        enableTorch={isFlashOn}
      />
      <View style={styles.overlay}>
        <Text style={styles.instructions}>{scannerStatusText}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsFlashOn((prev) => !prev)}
          >
            <MaterialIcons name={isFlashOn ? "flash-on" : "flash-off"} size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickFromAlbum}
          >
            <MaterialIcons name="photo-library" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 74,
    paddingBottom: 104,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  instructions: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 34,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  actionButtonLabel: {
    color: "#fff",
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  resultPrimaryButton: {
    marginRight: 12,
  },
  primaryButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  outlinedButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  outlinedButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  outlinedButtonDark: {
    borderColor: "#fff",
  },
  outlinedButtonDarkText: {
    color: "#fff",
  },
  outlinedButtonLight: {
    borderColor: "#10B981",
    width: "100%",
  },
  outlinedButtonLightText: {
    color: "#10B981",
  },
  outlinedButtonCard: {
    borderColor: "#D1D5DB",
    marginTop: 0,
  },
  outlinedButtonCardText: {
    color: "#111827",
  },
  halfWidthButton: {
    flex: 1,
  },
  fullWidthButton: {
    alignSelf: "stretch",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    color: "#111827",
    marginTop: 16,
  },
  permissionText: {
    marginBottom: 16,
  },
});

