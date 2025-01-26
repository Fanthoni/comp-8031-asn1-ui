import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Button,
  Text,
  Dialog,
  Portal,
  List,
  Checkbox,
  TextInput,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { Task, TASK_TYPES, DAYS } from "../types/task";
import notifee, { TriggerType, RepeatFrequency } from "@notifee/react-native";

// Add the getNextDayTime function
const getNextDayTime = (dayIndex: number, datetime: Date): number => {
  const today = new Date();
  const targetDate = new Date(datetime);
  targetDate.setDate(today.getDate() + ((7 + dayIndex - today.getDay()) % 7));
  targetDate.setHours(datetime.getHours(), datetime.getMinutes(), 0, 0);
  return targetDate.getTime();
};

export default function TasksScreen() {
  const params = useLocalSearchParams();
  const { clientId, clientName } = params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    clientId: clientId as string,
    clientName: clientName as string,
    recurring: false,
    recurringDays: new Array(7).fill(false),
    enabled: true,
  });
  const [inputDate, setInputDate] = useState<string>(""); // New state for date
  const [inputTime, setInputTime] = useState<string>(""); // New state for time

  // Notification setup
  useEffect(() => {
    async function setupNotifications() {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: "tasks",
        name: "Task Reminders",
      });
    }
    setupNotifications();
  }, []);

  const scheduleNotification = async (task: Task) => {
    if (task.recurring) {
      // Schedule recurring notifications
      task.recurringDays.forEach(async (enabled, dayIndex) => {
        if (enabled) {
          await notifee.createTriggerNotification(
            {
              title: task.type,
              body: `Reminder for ${task.clientName}`,
              android: { channelId: "tasks" },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: getNextDayTime(dayIndex, task.datetime),
              repeatFrequency: RepeatFrequency.WEEKLY,
            }
          );
        }
      });
    } else {
      // Schedule one-time notification
      await notifee.createTriggerNotification(
        {
          title: task.type,
          body: `Reminder for ${task.clientName}`,
          android: { channelId: "tasks" },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: task.datetime.getTime(),
        }
      );
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.type) {
      Alert.alert("Validation Error", "Task type is required.");
      alert("Task type is required.");
      return;
    }

    if (!inputDate || !inputTime) {
      Alert.alert("Validation Error", "Both date and time are required.");
      alert("Both date and time are required.");
      return;
    }

    const datetimeString = `${inputDate} ${inputTime}`;
    const datetime = new Date(datetimeString);

    if (isNaN(datetime.getTime())) {
      Alert.alert("Invalid Date/Time", "Please enter a valid date and time.");
      alert("Please enter a valid date and time.");
      return;
    }

    // Check if the selected date and time is in the future
    if (datetime.getTime() <= Date.now()) {
      Alert.alert("Invalid Date/Time", "Please select a future date and time.");
      alert("Please select a future date and time.");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...(newTask as Task),
      datetime,
    };

    await scheduleNotification(task);
    setTasks([...tasks, task]);
    setIsAddTaskVisible(false);
    setNewTask({
      clientId: clientId as string,
      clientName: clientName as string,
      recurring: false,
      recurringDays: new Array(7).fill(false),
      enabled: true,
    });
    setInputDate("");
    setInputTime("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks for {clientName}</Text>

      <List.Section>
        {tasks.map((task) => (
          <List.Item
            key={task.id}
            title={task.type}
            description={task.datetime.toLocaleString()}
            right={() => (
              <Checkbox
                status={task.enabled ? "checked" : "unchecked"}
                onPress={() => {
                  const updatedTasks = tasks.map((t) =>
                    t.id === task.id ? { ...t, enabled: !t.enabled } : t
                  );
                  setTasks(updatedTasks);
                }}
              />
            )}
            onPress={() => setSelectedTask(task)}
          />
        ))}
      </List.Section>

      <Button
        mode="contained"
        onPress={() => setIsAddTaskVisible(true)}
        style={styles.addButton}
      >
        Add Task
      </Button>

      {/* Add Task Dialog */}
      <Portal>
        <Dialog
          visible={isAddTaskVisible}
          onDismiss={() => setIsAddTaskVisible(false)}
        >
          <Dialog.Title>New Task</Dialog.Title>
          <Dialog.Content>
            {/* Manual Date Entry */}
            <TextInput
              label="Enter Date (YYYY-MM-DD)"
              value={inputDate}
              onChangeText={setInputDate}
              style={styles.input}
              placeholder="e.g., 2025-01-24"
            />

            {/* Manual Time Entry */}
            <TextInput
              label="Enter Time (HH:MM)"
              value={inputTime}
              onChangeText={setInputTime}
              style={styles.input}
              placeholder="e.g., 10:30"
            />

            {TASK_TYPES.map((type) => (
              <Button
                key={type}
                mode={newTask.type === type ? "contained" : "outlined"}
                onPress={() => setNewTask({ ...newTask, type })}
                style={styles.typeButton}
              >
                {type}
              </Button>
            ))}

            <Checkbox.Item
              label="Recurring"
              status={newTask.recurring ? "checked" : "unchecked"}
              onPress={() =>
                setNewTask({
                  ...newTask,
                  recurring: !newTask.recurring,
                })
              }
            />

            {newTask.recurring && (
              <View style={styles.daysGrid}>
                {DAYS.map((day, index) => (
                  <Checkbox.Item
                    key={day}
                    label={day}
                    status={
                      newTask.recurringDays[index] ? "checked" : "unchecked"
                    }
                    onPress={() => {
                      const newDays = [...newTask.recurringDays];
                      newDays[index] = !newDays[index];
                      setNewTask({
                        ...newTask,
                        recurringDays: newDays,
                      });
                    }}
                  />
                ))}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsAddTaskVisible(false)}>Cancel</Button>
            <Button onPress={handleCreateTask}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  input: {
    marginBottom: 10,
  },
  typeButton: {
    marginVertical: 5,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 30,
  },
});
