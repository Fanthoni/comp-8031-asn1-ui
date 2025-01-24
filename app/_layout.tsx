import { Stack } from "expo-router";
import { GlobalStateProvider } from "./GlobalStateContext";

export default function RootLayout() {
  return (
    <GlobalStateProvider>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </GlobalStateProvider>
  );
}