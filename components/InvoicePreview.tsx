import React from "react";
import { Modal, View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

export default function InvoicePreview({
  visible,
  onClose,
  uri,
}: {
  visible: boolean;
  onClose: () => void;
  uri: string;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Invoice</Text>
          </View>

          <WebView source={{ uri }} style={styles.webview} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    height: height * 0.6,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#3b82f6",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  webview: {
    flex: 1,
  },
});
