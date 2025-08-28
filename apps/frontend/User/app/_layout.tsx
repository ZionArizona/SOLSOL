import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { WebSocketProvider } from "../contexts/WebSocketContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </WebSocketProvider>
    </AuthProvider>
  );
}
