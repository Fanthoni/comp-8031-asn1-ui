import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
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
import Task, { TASK_TYPES, DAYS } from "../types/task";
// import notifee, { TriggerType, RepeatFrequency } from "@notifee/react-native";
import { Link, useNavigation, useRouter } from "expo-router";
import * as Notifications from 'expo-notifications';
import DateTimePicker from 'react-native-ui-datepicker';

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
  const navigation = useNavigation();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    clientId: clientId as string,
    clientName: clientName as string,
    recurring: false,
    recurringDays: new Array(7).fill(false),
    enabled: true,
  });
  const [date, setDate] = useState(new Date());
  const [inputTime, setInputTime] = useState<string>("");
  const [inputTimeHrs, setInputTimeHrs] = useState<string>("");
  const [inputTimeMins, setInputTimeMins] = useState<string>("");
  // const [date, setDate] = useState(new Date()); // New state for date picker

  // Notification setup
  useEffect(() => {
    // async function setupNotifications() {
    //   // await notifee.requestPermission();
    //   // await notifee.createChannel({
    //   //   id: "tasks",
    //   //   name: "Task Reminders",
    //   // });
    // }
    // setupNotifications();
  }, []);
  useEffect(() => {
    fetchTasks();
  }, [newTask.clientId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `https://sheng.up.railway.app/api/reminders?client_id=${newTask.clientId}`
      );
      if (response.ok) {
        const data = await response.json();
        const mappedTasks: Task[] = data.reminders.map((reminder: any) => ({
          id: reminder.reminder_id.toString(),
          type: reminder.task_type,
          datetime: new Date(reminder.reminder_datetime).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
          clientId: reminder.client_id.toString(),
          clientName: "", // Populate if available
          recurring: reminder.is_repetitive,
          repeatPattern: reminder.repeat_pattern,
          recurringDays: [], // Populate based on repeat_pattern if applicable
          enabled: reminder.is_enabled,
        }));
        console.log(mappedTasks);
        setTasks(mappedTasks);
      } else {
        const error = await response.json();
        Alert.alert("Error", error.error || "Failed to fetch tasks.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const scheduleNotification = async (task: Task) => {
    Alert.alert("Task Scheduled", task.enabled ? "Task is now scheduled." : "Task is now unscheduled.");
    if (task.recurring) {
      // Schedule recurring notifications
      task.recurringDays.forEach(async (enabled, dayIndex) => {
        if (enabled) {
          // await notifee.createTriggerNotification(
          //   {
          //     title: task.type,
          //     body: `Reminder for ${task.clientName}`,
          //     android: { channelId: "tasks" },
          //   },
          //   {
          //     type: TriggerType.TIMESTAMP,
          //     timestamp: getNextDayTime(dayIndex, task.datetime),
          //     repeatFrequency: RepeatFrequency.WEEKLY,
          //   }
          // );
          Notifications.scheduleNotificationAsync({
            content: {
              title: task.type,
              body: `Reminder for ${task.clientName}`,
              data: { taskId: task.id },
            },
            trigger: {
              repeats: true,
              weekday: dayIndex,
              hour: task.datetime.getHours(),
              minute: task.datetime.getMinutes(),
              channelId: "tasks",
            },
          });
        }
      });
    } else {
      // Schedule one-time notification
      // await notifee.createTriggerNotification(
      //   {
      //     title: task.type,
      //     body: `Reminder for ${task.clientName}`,
      //     android: { channelId: "tasks" },
      //   },
      //   {
      //     type: TriggerType.TIMESTAMP,
      //     timestamp: task.datetime.getTime(),
      //   }
      // );
      Notifications.scheduleNotificationAsync({
        content: {
          title: task.type,
          body: `Reminder for ${task.clientName} at ${task.datetime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`,
          sound: true,
          sticky: true,
          data: { taskId: task.id },
        },
        trigger: {
          date: task.datetime,
          channelId: "tasks",
        },
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.type) {
      Alert.alert("Validation Error", "Task type is required.");
      alert("Task type is required.");
      return;
    }
    if (!newTask.recurring) {
      if (!date) {
        Alert.alert("Validation Error", "Both date and time are required.");
        alert("Both date and time are required.");
        return;
      }
    }
    if (!inputTimeHrs || !inputTimeMins) {
      Alert.alert("Validation Error", "Time is required.");
      return;
    }

    // set timezone from PST to UTC
    let datetime = date;
    // we are in PST timezone
    datetime.setHours(parseInt(inputTimeHrs));
    datetime.setMinutes(parseInt(inputTimeMins));
    datetime.setSeconds(0);
    console.log(datetime);
    let dateTimeString = datetime.toISOString();
    // convert to year-month-day hour:minute:second
    dateTimeString = dateTimeString.slice(0, 19).replace("T", " ");
    if (isNaN(datetime.getTime())) {
      Alert.alert("Invalid Date/Time", "Please enter a valid date and time.");
      alert("Please enter a valid date and time.");
      return;
    }
    // if (datetime.getTime() <= Date.now()) {
    //   Alert.alert("Invalid Date/Time", "Please select a future date and time.");
    //   alert("Please select a future date and time.");
    //   return;
    // }
    const reminderData = {
      client_id: newTask.clientId,
      task_type: newTask.type,
      reminder_datetime: dateTimeString,
      is_repetitive: newTask.recurring,
      repeat_pattern: newTask.recurring ? newTask.repeatPattern : null,
      is_enabled: true,
    };
    try {
      const response = await fetch(
        "https://sheng.up.railway.app/api/reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reminderData),
        }
      );
      if (response.ok) {
        const result = await response.json();
        Alert.alert("Success", "Task added to the database.");
        scheduleNotification({
          id: result.reminder_id.toString(),
          type: newTask.type,
          datetime: datetime,
          clientId: newTask.clientId as string,
          clientName: newTask.clientName as string,
          recurring: newTask.recurring as boolean,
          repeatPattern: newTask.recurring ? newTask.repeatPattern : null,
          recurringDays: newTask.recurringDays as boolean[],
          enabled: true,
        } as Task);
      } else {
        const error = await response.json();
        Alert.alert("Error", error.error || "Failed to add task.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
    setIsAddTaskVisible(false);
    fetchTasks();
  };

  const showTaskDialog = () => {
    Alert.alert(
      "Check Task Details",
      `Type: ${selectedTask?.type}\nDate: ${selectedTask?.datetime}`,
      [
        {
          text: "Send Notification",
          onPress: async () => {
            // make sure click the notification will route to the task details
            Notifications.scheduleNotificationAsync({
              content: {
                title: selectedTask?.type,
                body: `Reminder for ${selectedTask?.clientName} at ${selectedTask?.datetime}`,
                data: { taskId: selectedTask.id },
              },
              trigger: {
                date: selectedTask?.datetime,
                channelId: "tasks",
              },
            });
          },
        },
        {
          text: "Cancel",
          onPress: () => { },
          style: "cancel",
        },
        {
          text: "Open Task Details",
          onPress: async () => {

            router.push(`/clients/taskDetails?taskId=${selectedTask.id}`);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks for {clientName}</Text>
      <ScrollView>
        <List.Section >
          {tasks.map((task) => (
            <List.Item
              key={task.id}
              title={task.type}
              titleStyle={{ color: "#000" }}
              description={task.datetime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
              descriptionStyle={{ color: "#333" }}
              right={() => (<View style={{ width: 'auto', display: 'flex', flexDirection: 'row' }}>
                <Checkbox
                  status={task.enabled ? "checked" : "unchecked"}
                  onPress={() => {
                    const updatedTasks = tasks.map((t) =>
                      t.id === task.id ? { ...t, enabled: !t.enabled } : t
                    );
                    // update the task in the database
                    fetch(`https://sheng.up.railway.app/api/reminders/${task.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        is_enabled: !task.enabled,
                      }),
                    }).then(() => {
                      setTasks(updatedTasks);
                      Alert.alert("Task Updated", !task.enabled ? "Task is now scheduled." : "Task is now unscheduled.");
                      if (!task.enabled) {
                        scheduleNotification(task);
                      }
                    });
                  }}
                /><Button
                  style={{ backgroundColor: 'red', borderRadius: 5, padding: 0, marginHorizontal: 5 }}
                  onPress={() => {
                    setSelectedTask(task);
                    showTaskDialog();
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Delete</Text>
                </Button>
              </View>
              )}

              onPress={async () => {
                setSelectedTask(task);
                showTaskDialog();
              }}
            />
          ))}
        </List.Section>
      </ScrollView>
      <View style={{ marginBottom: 40 }}></View>
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
            {/* <TextInput
              label="Enter Date (YYYY-MM-DD)"
              value={inputDate}
              onChangeText={setInputDate}
              style={styles.input}
              placeholder="e.g., 2025-01-24"
            /> */}

            {/* Manual Time Entry */}
            {/* <TextInput
              label="Enter Time (HH:MM)"
              value={inputTime}
              onChangeText={setInputTime}
              style={styles.input}
              placeholder="e.g., 10:30"
            /> */}
            {(!newTask.recurring)
              ?
              <View style={{ display: 'flex', backgroundColor: '#F5FCFF', borderRadius: 10, padding: 10 }}
                v-if={false}
              >
                <DateTimePicker
                  mode="single"
                  date={date}
                  onChange={(params) => {
                    console.log(params.date);
                    setDate(params.date);
                  }}
                /></View> : <View></View>}
            <View style={{ marginTop: 10 }}></View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <TextInput
                label="HH"
                value={inputTimeHrs}
                onChangeText={setInputTimeHrs}
                style={styles.input}
                placeholder=""
              /><Text style={{ marginTop: 0, fontSize: 40, marginHorizontal: 5 }}
              >:</Text>
              <TextInput
                label="MM"
                value={inputTimeMins}
                onChangeText={setInputTimeMins}
                style={styles.input}
                placeholder=""
              />
            </View>
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
    overflow: 'scroll',
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
  returnButton: {
    marginBottom: 16,
  },
});
