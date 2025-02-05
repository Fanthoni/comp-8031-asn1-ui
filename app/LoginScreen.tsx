import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useGlobalState } from "./GlobalStateContext";

function LoginScreen({ navigation }) {
  const { control, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const { setCustomerData, setStatuses } = useGlobalState();

  const onLogin = async (data) => {
    setLoading(true);

    try {
      const apiUrls = [
        "https://sheng.up.railway.app/api/clients",
        "https://sheng.up.railway.app/api/statuses",
        "https://sheng.up.railway.app/api/client_statuses",
      ];
      const responses = await Promise.all(apiUrls.map((url) => axios.get(url)));
      // console.log("Fetched Data:", responses);
      const [clientsData, statusesData, clientStatusesData] = responses.map(
        (res) => res.data
      );

      clientsData.clients.forEach((client: any) => {
        client.status = clientStatusesData.client_statuses.filter(
          (cs: any) => cs.client_id === client.client_id
        )[0].status_id;
      });

      setCustomerData(clientsData.clients);
      setStatuses(statusesData.statuses);
      alert(`Logged in with ${data.email}`);
      setLoading(false);
      navigation.navigate("Clients");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
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
        Login...
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('SignUp')}
        style={styles.link}
      >
        Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  link: {
    marginTop: 16,
  },
  error: {
    color: 'red',
  },
});

export default LoginScreen;