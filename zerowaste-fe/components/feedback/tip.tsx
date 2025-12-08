import React from 'react'
import Card from '../ui/card';
import { StyleSheet, Text } from "react-native";
import { useTranslation } from '@/hooks/useTranslation';

function Tip() {
  const { t } = useTranslation();
  
  return (
    <Card style={styles.tipCard}>
      <Text style={styles.tipText}>
        💡<Text style={{ fontWeight: "bold" }}>{t('feedback.tip')}</Text> {t('feedback.tipMessage')}
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