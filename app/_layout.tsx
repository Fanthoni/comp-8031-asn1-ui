import { Stack } from "expo-router";
import { GlobalStateProvider } from "./GlobalStateContext";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <GlobalStateProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GlobalStateProvider>
    </PaperProvider>
  );
}
