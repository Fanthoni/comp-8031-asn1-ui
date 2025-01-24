import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Chip,
  Dialog,
  PaperProvider,
  Portal,
  TouchableRipple,
} from "react-native-paper";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Link, useNavigation } from "expo-router";
import clientsData from "../../assets/clients.json";

export default function ClientsScreen() {
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const STATUS_OPTIONS = [
    { label: "Completed", value: "completed" },
    { label: "In Progress", value: "in_progress" },
    { label: "Backlog", value: "backlog" },
  ];

  type Client = {
    id: string;
    firstName: string;
    lastName: string;
    address: string;
    profilePicture: string;
    status: string;
  };

  const [clients, setClients] = useState<Client[]>([]);
  const navigation = useNavigation();

  const sortClients = (option: string) => {
    const sortedClients = [...clients].sort((a, b) =>
      a[option as keyof (typeof clients)[0]].localeCompare(
        b[option as keyof (typeof clients)[0]]
      )
    );
    setClients(sortedClients);
    setSortOption(option);
  };

  useEffect(() => {
    setClients([...clientsData]);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Clients", headerLeft: () => null }); // Set the title to "Clients"
  }, [navigation]);

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showDialog = (client: Client) => {
    setSelectedClient(client);
    setVisible(true);
  };

  const handleSwipe = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;
      const currentIndex = clients.findIndex(
        (c) => c.id === selectedClient?.id
      );
      if (translationX < -50 && currentIndex < clients.length - 1) {
        setSelectedClient(clients[currentIndex + 1]);
      } else if (translationX > 50 && currentIndex > 0) {
        setSelectedClient(clients[currentIndex - 1]);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { backgroundColor: "green" }; // Green for completed
      case "in_progress":
        return { backgroundColor: "blue" }; // Blue for in-progress
      case "backlog":
        return { backgroundColor: "red" }; // Grey for backlog
      default:
        return { backgroundColor: "transparent" }; // Fallback
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Clients</Text>
        <TextInput
          style={styles.searchBox}
          placeholder="Search clients..."
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.chipContainer}>
          <Chip
            selected={sortOption === "firstName"}
            onPress={() => {
              sortClients("firstName");
            }}
          >
            First Name
          </Chip>
          <Chip
            selected={sortOption === "lastName"}
            onPress={() => sortClients("lastName")}
          >
            Last Name
          </Chip>
          <Chip
            selected={sortOption === "address"}
            onPress={() => sortClients("address")}
          >
            Address
          </Chip>
        </View>
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => showDialog(item)}>
              <View style={styles.clientContainer}>
                <Image
                  source={{ uri: item.profilePicture }}
                  style={styles.profileImage}
                />
                <View style={styles.clientInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.clientName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <View
                      style={[
                        styles.statusIndicator,
                        getStatusColor(item.status),
                      ]}
                    />
                  </View>
                  <Text style={styles.clientAddress}>{item.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <Portal>
          <Dialog
            visible={visible}
            onDismiss={() => setVisible(false)}
            style={styles.dialogContainer}
          >
            <GestureHandlerRootView>
              <PanGestureHandler onHandlerStateChange={handleSwipe}>
                <View>
                  <Dialog.Title style={styles.dialogTitle}>
                    Client Details
                  </Dialog.Title>
                  <Dialog.Content style={styles.dialogContent}>
                    {selectedClient && (
                      <View style={styles.centeredContent}>
                        {/* Profile Image */}
                        <Image
                          source={{ uri: selectedClient.profilePicture }}
                          style={styles.profileImageLarge}
                        />

                        {/* Name and Address */}
                        <Text style={styles.clientNameLarge}>
                          {selectedClient.firstName} {selectedClient.lastName}
                        </Text>
                        <Text style={styles.clientAddressLarge}>
                          {selectedClient.address}
                        </Text>

                        {/* Status Selection */}
                        <View style={styles.statusContainer}>
                          {STATUS_OPTIONS.map((option) => (
                            <TouchableRipple
                              key={option.value}
                              onPress={() =>
                                setSelectedClient({
                                  ...selectedClient,
                                  status: option.value,
                                })
                              }
                              style={[
                                styles.statusButton,
                                selectedClient.status === option.value &&
                                  styles.statusButtonActive,
                              ]}
                            >
                              <View style={styles.statusOption}>
                                <Text
                                  style={[
                                    styles.statusText,
                                    selectedClient.status === option.value &&
                                      styles.statusTextActive,
                                  ]}
                                >
                                  {option.label}
                                </Text>
                              </View>
                            </TouchableRipple>
                          ))}
                        </View>
                      </View>
                    )}
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button
                      onPress={() => setVisible(false)}
                      labelStyle={{ color: "black" }}
                    >
                      Close
                    </Button>
                  </Dialog.Actions>
                </View>
              </PanGestureHandler>
            </GestureHandlerRootView>
          </Dialog>
        </Portal>

        <Link href="/" asChild>
          <Button mode="contained" style={styles.button}>
            Logout
          </Button>
        </Link>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10, // Small circle size
    height: 10,
    borderRadius: 5, // Makes it circular
    marginLeft: 8, // Space between name and circle
  },
  container: { flex: 1, padding: 20 },
  dialogContainer: {
    backgroundColor: "lightpink",
    borderRadius: 20, // Adds rounded corners for a modern look
    padding: 0,
    elevation: 10, // Adds a slight shadow for depth
  },
  dialogTitle: {
    color: "black",
    fontSize: 19, // Makes title more prominent
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  dialogText: {
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
  },
  dialogContent: {
    alignItems: "center",
    padding: 5,
  },
  centeredContent: {
    height: 200,
    alignItems: "center",
    padding: 5,
    gap: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchBox: {
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  clientContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clientNameLarge: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 5,
  },
  clientAddress: {
    fontSize: 16,
    color: "gray",
  },
  clientAddressLarge: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 8,
  },
  radioGroupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginTop: 10,
  },
  button: {
    marginTop: 0,
    backgroundColor: "#6200ea",
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10, // Reduced spacing
    marginTop: 0,
    flexWrap: "wrap", // Allows wrapping if needed
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8, // Slightly rounded corners
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    minWidth: 110, // Ensures all buttons have the same width
    justifyContent: "center", // Centers text inside the button
  },
  statusButtonActive: {
    backgroundColor: "#b3e5fc",
    borderColor: "#0288d1",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 5, // Smaller spacing
    fontSize: 14, // Reduced font size
    fontWeight: "500",
    color: "#555",
  },
  statusTextActive: {
    color: "#0288d1",
    fontWeight: "bold",
  },
  radioButton: {
    transform: [{ scale: 0.8 }], // Shrinks radio button
  },
});
