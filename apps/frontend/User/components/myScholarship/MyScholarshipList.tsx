import React from "react";
import { FlatList } from "react-native";
import { MyScholarshipCard } from "./MyScholarshipCard";

export const MyScholarshipList = ({
  items,
}: {
  items: { id: string; title: string; date: string; status: string }[];
}) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MyScholarshipCard scholarship={item} />}
      contentContainerStyle={{ padding: 12 }}
    />
  );
};
