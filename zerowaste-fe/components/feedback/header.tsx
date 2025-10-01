import React from 'react'
import Card from '../ui/card';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text } from "react-native";

function Header() {
  return (
    <Card style={styles.headerCard}>
      <LinearGradient
        colors={["#059669", "#10B981", "#059669"]}
        start={{ x: -0.1, y: 0.5 }}
        end={{ x: 1.1, y: 0.5 }}
        style={styles.gradient}
      >
        <MaterialIcons name="feedback" size={28} color={"white"} />
        <Text style={styles.headerTitle}>Feedback</Text>
      </LinearGradient> 
    </Card>
  );
}

export default Header

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 400,
    maxHeight: 400,
    padding: 20,
  },
  headerCard: {
    overflow: "hidden",
    marginBottom: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 19,
    fontWeight: "700",
  },
});