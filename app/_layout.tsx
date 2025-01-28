import { Stack } from "expo-router";
import { GlobalStateProvider } from "./GlobalStateContext";
import { Provider as PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <PaperProvider>
      <GlobalStateProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GlobalStateProvider>
    </PaperProvider>
  );
}