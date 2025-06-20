import React from "react";
import {View, Text, StyleSheet} from "react-native";

interface IllustrationCardProps {
  category: string;
  icon: string;
}

const categoryColors: Record<string, string> = {
  environment: "#E8F5E9",
  relationship: "#E3F2FD",
  health: "#FFF3E0",
  personal: "#F3E5F5",
  community: "#FFFDE7",
  work: "#E0F2F1",
  random: "#F5F5F5",
};

export const IllustrationCard: React.FC<IllustrationCardProps> = ({category, icon}) => {
  const backgroundColor = categoryColors[category] || categoryColors.random;

  return (
    <View style={[styles.card, {backgroundColor}]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    marginHorizontal: 24,
    marginTop: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 100,
  },
});
