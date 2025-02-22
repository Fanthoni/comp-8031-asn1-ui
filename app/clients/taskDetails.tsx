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
  const [task, setTask] = useState(JSON.parse(`{ "client_id": 3, "created_at": "Mon, 03 Feb 2025 08:36:29 GMT", "is_enabled": 1, "is_repetitive": 1, "reminder_datetime": "Mon, 03 Feb 2025 02:02:37 GMT", "reminder_id": 19, "repeat_pattern": null, "task_type": "House Keeping", "updated_at": "Mon, 03 Feb 2025 08:36:29 GMT" }`));

  useEffect(() => {
    console.log("Task ID:", taskId);
    console.log(route.params);
    fetchTaskDetails(taskId);
  }, [taskId]);

  const fetchTaskDetails = async (taskId: string) => {
    try {
      fetch(`https://sheng.up.railway.app/api/reminders/${taskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Task Details:", data.reminder);
          data.reminder.videoUrl = "https://www.youtube.com/watch?v=F9yF_mISzmI";
          setTask(data.reminder);
        })
        .catch((error) => {
          console.error("Error fetching task details:", error);
        });
    } catch (error) {
      console.error("Error fetching task details:", error
      );
    }
  };
  return (
    <View style={styles.container} >
      <Text style={styles.header}>Task Details</Text>
      <Text style={styles.label}>Type: {task.task_type}</Text>
      <Text style={styles.label}>Date: {task.reminder_datetime.toString()}</Text>
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