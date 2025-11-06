import React from 'react'
import Card from '@/components/ui/card';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from "react-native";

function Header(props: { title: string, icon: keyof typeof MaterialIcons.glyphMap }) {
  return (
    <Card style={styles.headerCard}>
      <LinearGradient
        colors={["#059669", "#10B981", "#059669"]}
        start={{ x: -0.1, y: 0.5 }}
        end={{ x: 1.1, y: 0.5 }}
        style={styles.gradient}
      >
        <View style={styles.headerContent}>
          <MaterialIcons name={props.icon} size={28} color={"white"} />
          <Text style={styles.headerTitle}>{props.title}</Text>
        </View>
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
    padding: 20,
  },
  headerCard: {
    overflow: "hidden",
    marginBottom: 15,
    minHeight: 100,
  },
  headerContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
});