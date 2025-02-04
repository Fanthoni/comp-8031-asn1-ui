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
import { Link, useNavigation, useRouter } from "expo-router";
import { useGlobalState } from "../GlobalStateContext";

export default function ClientsScreen() {
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { customerData, statuses, setCustomerData, setStatuses } = useGlobalState();

  const STATUS_OPTIONS = statuses.map((status: any) => ({
    label: status.status_name,
    value: status.status_id,
  }));

  type Client = {
    client_id: string;
    first_name: string;
    last_name: string;
    address: string;
    photo_url: string;
    status: number;
  };

  const [clients, setClients] = useState<Client[]>([]);
  const navigation = useNavigation();
  const router = useRouter();

  const sortClients = (option: string) => {
    const sortedClients = [...clients].sort((a, b) => {
      const aValue = a[option as keyof (typeof clients)[0]];
      const bValue = b[option as keyof (typeof clients)[0]];

      // Handle null values explicitly
      if (aValue === null && bValue === null) return 0; // Both are null, keep original order
      if (aValue === null) return 1; // Null should be considered the lower value
      if (bValue === null) return -1;

      return String(aValue).localeCompare(String(bValue));
    });

    setClients(sortedClients);
    setSortOption(option);
  };

  useEffect(() => {
    console.log("Customer Data", customerData);
    setClients([...customerData]);
  }, [customerData]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Clients", headerLeft: () => null }); // Set the title to "Clients"
  }, [navigation]);

  const filteredClients = clients.filter(
    (client) =>
      (client.first_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (client.last_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (client.address?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const showDialog = (client: Client) => {
    setSelectedClient(client);
    setVisible(true);
  };

  const updateClientStatus = (status: number) => {
    const updatedClients = clients.map((client) => {
      if (client.client_id === selectedClient?.client_id) {
        return { ...client, status };
      }
      return client;
    });

    setClients(updatedClients);
    setCustomerData(updatedClients);
  }

  const handleSwipe = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;
      const currentIndex = clients.findIndex(
        (c) => c.client_id === selectedClient?.client_id
      );
      if (translationX < -50 && currentIndex < clients.length - 1) {
        setSelectedClient(clients[currentIndex + 1]);
      } else if (translationX > 50 && currentIndex > 0) {
        setSelectedClient(clients[currentIndex - 1]);
      }
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return { backgroundColor: "green" }; // Green for completed
      case 2:
        return { backgroundColor: "purple" }; // Blue for in-progress
      case 3:
        return { backgroundColor: "orange" }; // Grey for backlog
      default:
        return { backgroundColor: "red" }; // Fallback
    }
  };

  const handleLogout = () => {
    // Clear any stored data
    setCustomerData([]);
    setStatuses([]);

    // Navigate back to the login screen
    navigation.navigate('Login');
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search clients..."
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.chipContainer}>
          <Chip
            selected={sortOption === "first_name"}
            onPress={() => {
              sortClients("first_name");
            }}
          >
            First Name
          </Chip>
          <Chip
            selected={sortOption === "last_name"}
            onPress={() => sortClients("last_name")}
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
          keyExtractor={(item) => item.client_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => showDialog(item)}>
              <View style={styles.clientContainer}>
                <Image
                  source={{
                    uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.clientInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.clientName}>
                      {item.first_name} {item.last_name}
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
                <Button
                  mode="contained"
                  onPress={() =>
                    router.push({
                      pathname: "/clients/tasks",
                      params: {
                        clientId: item.client_id,
                        clientName: `${item.first_name} ${item.last_name}`,
                      },
                    })
                  }
                >
                  Tasks
                </Button>
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
                          source={{
                            uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                          }}
                          style={styles.profileImageLarge}
                        />

                        {/* Name and Address */}
                        <Text style={styles.clientNameLarge}>
                          {selectedClient.first_name} {selectedClient.last_name}
                        </Text>
                        <Text style={styles.clientAddressLarge}>
                          {selectedClient.address}
                        </Text>

                        {/* Status Selection */}
                        <View style={styles.statusContainer}>
                          {STATUS_OPTIONS.map((option: any) => (
                            <TouchableRipple
                              key={option.value}
                              onPress={() => {
                                setSelectedClient({
                                  ...selectedClient,
                                  status: option.value,
                                });
                                updateClientStatus(option.value)
                              }
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
                      labelStyle={{ color: "black", marginTop: 55 }}
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
          <Button mode="contained" style={styles.button} onPress={handleLogout}>
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
    backgroundColor: "white",
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
    backgroundColor: "white",
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
