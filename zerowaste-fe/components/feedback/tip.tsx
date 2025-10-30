import React from 'react'
import Card from '../ui/card';
import { StyleSheet, Text } from "react-native";

function Tip() {
  return (
    <Card style={styles.tipCard}>
      <Text style={styles.tipText}>
        💡<Text style={{ fontWeight: "bold" }}>Tip:</Text> Share additional
        feedback on food waste to help us evaluate the program and reduce food
        waste at school.
      </Text>
    </Card>
  );
}

export default Tip

const styles = StyleSheet.create({
  tipCard: {
    padding: 15,
    backgroundColor: "#e4eff5ff",
    borderColor: "#7ea9c6ff",
    borderWidth: 1,
    marginBottom: 15,
  },
  tipText: {
    color: "#1073b5ff",
    backgroundColor: "transparent",
    fontSize: 13
  },
});