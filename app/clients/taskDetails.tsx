import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe"; // or use react-native-video
import type { NavigationProp } from '@react-navigation/native';
export default function TaskDetailsScreen({ navigation }: { navigation: NavigationProp<any> }) {
  const route = useRoute();
  const { taskId } = route.params;

  // Fetch task details using taskId
  // For demonstration, using a placeholder task
  const [task, setTask] = useState({
    id: "1",
    task_type: "Vitals Check",
    reminder_datetime: new Date(),
    videoUrl: "https://www.youtube.com/watch?v=CKl8mhU_eR0",
  });

  useEffect(() => {
    console.log("Task ID:", taskId);
    console.log(route.params);
    // fetchTaskDetails(taskId);
  }, [taskId]);

  // const fetchTaskDetails = async (taskId: string) => {
  //   fetch(`https://sheng.up.railway.app/api/reminders/${task.id}`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Task Details:", data);
  //       setTask(data.reminder);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching task details:", error);
  //     });
  // };
  return (
    <View style={styles.container} >
      <Text style={styles.header}>Task Details</Text>
      <Text style={styles.label}>Type: {task.task_type}</Text>
      <Text style={styles.label}>Date: {task.reminder_datetime.toLocaleString()}</Text>
      {task.videoUrl && (
        <YoutubePlayer
          height={300}
          play={true}
          videoId={task.videoUrl.split("v=")[1]}
        />
      )
      }
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
});