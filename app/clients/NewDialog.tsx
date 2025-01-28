import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Notifications from "expo-notifications";

interface NewDialogProps {
  visible: boolean;
  onDismiss: () => void;
  clientName: string;
}

const NewDialog: React.FC<NewDialogProps> = ({
  visible,
  onDismiss,
  clientName,
}) => {
  const [medReminderDate, setMedReminderDate] = useState<Date | null>(null);
  const [vitalsCheckDate, setVitalsCheckDate] = useState<Date | null>(null);
  const [houseKeepingDate, setHouseKeepingDate] = useState<Date | null>(null);

  const handleDismiss = () => {
    onDismiss();
  };

  const fetchReminderDates = async (clientId: number) => {
    // Simulated API response
    const response = {
      med:
        Math.random() < 0.5
          ? null
          : new Date(Date.now() + Math.random() * 31536000000).toISOString(), // Random date within next year or null
      vitals: new Date(Date.now() + Math.random() * 31536000000).toISOString(), // Random date within next year
      houseKeeping: new Date(
        Date.now() + Math.random() * 31536000000
      ).toISOString(), // Random date within next year
    };

    // Convert to Date objects
    setMedReminderDate(response.med ? new Date(response.med) : null);
    setVitalsCheckDate(response.vitals ? new Date(response.vitals) : null);
    setHouseKeepingDate(
      response.houseKeeping ? new Date(response.houseKeeping) : null
    );
  };

  // Check and request notification permissions
  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        console.log("Notification permissions not granted");
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>{clientName} Reminders</Dialog.Title>
        <Dialog.Content>
          {[
            {
              label: "Med Reminders",
              date: medReminderDate,
              setDate: setMedReminderDate,
            },
            {
              label: "Vitals Check",
              date: vitalsCheckDate,
              setDate: setVitalsCheckDate,
            },
            {
              label: "House Keeping",
              date: houseKeepingDate,
              setDate: setHouseKeepingDate,
            },
          ].map(({ label, date, setDate }) => (
            <View key={label} style={styles.dialogRowColumn}>
              <Text style={styles.dialogLabel}>{label}</Text>
              {date ? (
                <View style={styles.dateTimePickerRow}>
                  <DateTimePicker
                    value={date}
                    mode="datetime"
                    display="default"
                    minimumDate={new Date()}
                    onChange={async (event, selectedDate) => {
                      const currentDate = selectedDate || date;
                      setDate(currentDate);

                      console.log(currentDate);

                      // Schedule notification for the selected date
                      if (currentDate > new Date()) {
                        await Notifications.cancelAllScheduledNotificationsAsync();
                        // Ensure the date is in the future
                        await Notifications.scheduleNotificationAsync({
                          content: {
                            title: `Reminder for ${clientName} to ${label}`,
                            body: `${label} reminder`,
                          },
                          trigger: currentDate,
                        });

                        // Log all scheduled notifications to verify
                        const scheduledNotifications =
                          await Notifications.getAllScheduledNotificationsAsync();
                        console.log(
                          "Scheduled Notifications after adding:",
                          scheduledNotifications
                        );
                      } else {
                        console.log(
                          "Selected date is not in the future, notification not scheduled"
                        );
                      }
                    }}
                  />
                  <Icon
                    name="cancel"
                    size={24}
                    color="red"
                    onPress={() => setDate(null)}
                    style={styles.removeIcon}
                  />
                </View>
              ) : (
                <Button onPress={() => setDate(new Date())}>Select Date</Button>
              )}
            </View>
          ))}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialogRowColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginVertical: 3,
  },
  dateTimePickerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeIcon: {
    marginLeft: 10,
  },
  dialogLabel: {
    marginVertical: 8,
    fontSize: 18,
  },
});

export default NewDialog;
