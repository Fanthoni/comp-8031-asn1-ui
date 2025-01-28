import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import type { NavigationProp } from '@react-navigation/native';

function SignUpScreen({ navigation }: { navigation: NavigationProp<any> }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
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

export default SignUpScreen;