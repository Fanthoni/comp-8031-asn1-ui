import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import axios from "axios";
import { useGlobalState } from "./GlobalStateContext";

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Correct way to use navigation in expo-router
  const { setCustomerData, setStatuses } = useGlobalState();

  const onLogin = async (data: { email: string; password: string }) => {
    setLoading(true);

    try {
      const apiUrls = [
        "https://sheng.up.railway.app/api/clients",
        "https://sheng.up.railway.app/api/statuses",
        "https://sheng.up.railway.app/api/client_statuses",
      ];
      const responses = await Promise.all(apiUrls.map((url) => axios.get(url)));
      const [clientsData, statusesData, clientStatusesData] = responses.map(
        (res) => res.data
      );

      // console.log("Status Data:", statusesData.statuses);

      clientsData.clients.forEach((client: any) => {
        client.status = clientStatusesData.client_statuses.filter(
          (cs: any) => cs.client_id === client.client_id
        )[0].status_id;
      });

      setCustomerData(clientsData.clients);
      setStatuses(statusesData.statuses);

      alert(`Logged in with ${data.email}`);
      router.push("/clients");
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Login
      </Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              label="Email"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              keyboardType="email-address"
            />
            {error && <Text style={styles.error}>{error.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TextInput
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              style={styles.input}
            />
            {error && <Text style={styles.error}>{error.message}</Text>}
          </>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onLogin)}
        loading={loading}
        style={styles.button}
      >
        Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { textAlign: "center", marginBottom: 20 },
  input: { marginBottom: 10 },
  error: { color: "red", fontSize: 12, marginBottom: 10 },
  button: { marginTop: 10 },
});
