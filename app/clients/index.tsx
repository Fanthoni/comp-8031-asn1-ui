import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { Button, Chip } from "react-native-paper";
import { Link } from "expo-router";
import clientsData from "../../assets/clients.json";

export default function ClientsScreen() {
  const [sortOption, setSortOption] = useState("firstName");
  const [searchQuery, setSearchQuery] = useState("");
  type Client = {
    id: string;
    firstName: string;
    lastName: string;
    address: string;
    profilePicture: string;
  };

  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients([...clientsData]);
  }, []);

  const sortClients = (option: string) => {
    const sortedClients = [...clients].sort((a, b) =>
      a[option as keyof (typeof clients)[0]].localeCompare(
        b[option as keyof (typeof clients)[0]]
      )
    );
    setClients(sortedClients);
    setSortOption(option);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
          onPress={() => sortClients("firstName")}
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
          <View style={styles.clientContainer}>
            {/* Profile Picture */}
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.profileImage}
            />
            {/* Client Details */}
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.clientAddress}>{item.address}</Text>
            </View>
          </View>
        )}
      />

      {/* Logout Button - Navigates Back to Login */}
      <Link href="/" asChild>
        <Button mode="contained" style={styles.button}>
          Logout
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clientAddress: {
    fontSize: 16,
    color: "gray",
  },
  button: { marginTop: 20 },
});
