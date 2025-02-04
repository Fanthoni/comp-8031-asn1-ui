import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useGlobalState, GlobalStateProvider } from "./GlobalStateContext";
import LoginScreens from "./LoginScreen";
import SignUpScreens from "./SignUpScreen";
import { createStackNavigator as createNativeStackNavigator } from '@react-navigation/stack';
import ClientsScreen from "./clients/index";
import * as Notifications from 'expo-notifications';
import TaskDetailsScreen from "./clients/taskDetails";
import { Link, router } from "expo-router";

const createStackNavigator = createNativeStackNavigator;

const Stack = createStackNavigator();

function LoginScreen({ navigation }: { navigation: any }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
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
      console.log("Fetched Data:", responses);
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
      navigation.navigate("Clients");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
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
            {error && <Text>{error.message}</Text>}
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
            {error && <Text>{error.message}</Text>}
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

function SignUpScreen({ navigation }: { navigation: any }) {
  const { control, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSignUp = async (data) => {
    setLoading(true);
    try {
      await axios.post('https://sheng.up.railway.app/api/users', {
        username: data.email,
        password_hash: data.password,
      });
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
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
            {error && <Text>{error.message}</Text>}
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
            {error && <Text>{error.message}</Text>}
          </>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSignUp)}
        loading={loading}
        style={styles.button}
      >
        Sign Up
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={styles.link}
      >
        Login
      </Button>
    </View>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('tasks', {
      name: 'tasks',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',

    });
  }
}


export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    // const fetchData = async () => {
    //   await Notifications.requestPermissionsAsync();
    //   await registerForPushNotificationsAsync();
    //   const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    //     const data = response.notification.request.content.data;
    //     if (data.taskId) {
    //       router.push(`/clients/taskDetails?taskId=${data.taskId}`);
    //     }
    //   });
    //   return () => subscription.remove();
    // };
    // fetchData();
  }, []);

  return (
    <GlobalStateProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreens} />
          <Stack.Screen name="SignUp" component={SignUpScreens} />
          <Stack.Screen name="Clients" component={ClientsScreen} />
        </Stack.Navigator>
    </GlobalStateProvider>
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
});

