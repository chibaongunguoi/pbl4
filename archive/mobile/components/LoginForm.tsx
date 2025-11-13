import { SafeAreaView, Text, View, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState } from "react";


export const LoginForm = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error_message, setErrorMessage] = useState("Error messages here.");
  const [is_submitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    console.log("[-- START --] You are logging in...");
    setErrorMessage("");
    setIsSubmitting(true);
    const response = await fetch("http://192.168.187.1:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const status_code = response.status;

    if (response.ok) {
      console.log("Logined successfully.");
      const data = await response.json();
      if (data?.redirect) {
        Alert.alert(`Bạn đã đăng nhập thành công.`)
      }
    } else if (status_code == 401) {
      setErrorMessage("Sai tên đăng nhập hoặc mật khẩu.");
    } else {
      setErrorMessage("Máy chủ đang gặp sự cố, vui lòng thử lại sau.");
    }
    setIsSubmitting(false);
    console.log("[-- FINISH --] Ended logging in.");
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View className="flex w-full h-full justify-center items-center">
          <Text className="text-3xl text-bold">Đăng nhập</Text>
          <View className="w-[75%] px-4 py-8">
            <View className="">
              <Text>Tên đăng nhập</Text>
              <TextInput className={styles["text_input"]} value={username} onChangeText={setUsername} placeholder="Tên đăng nhập" />
            </View>
            <View className="">
              <Text>Mật khẩu</Text>
              <TextInput className={styles["text_input"]} value={password} onChangeText={setPassword} placeholder="Mật khẩu" />
            </View>
            <View className="">
              <Text className="text-red-500">{error_message}</Text>
            </View>
            <View className="mb-2">
            </View>
            <Pressable onPress={handleLogin} className="bg-blue-300 px-2 py-4 items-center rounded-xl w-full active:bg-blue-400">
              {
                is_submitting ? (<View className="h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full"></View>) : (<Text>Đăng nhập</Text>)
                // is_submitting ? (<View className="h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></View>) : (<Text>Đăng nhập</Text>)
              }
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = {
  "text_input": "border rounded-lg mb-4"
}
