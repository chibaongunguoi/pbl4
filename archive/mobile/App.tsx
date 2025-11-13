import { StatusBar } from "expo-status-bar";
import { LoginForm } from "components/LoginForm";

import "./global.css";

export default function App() {
  return (
    <>
      <LoginForm />
      <StatusBar style="auto" />
    </>
  );
}
