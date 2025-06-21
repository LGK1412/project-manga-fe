import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import LogoutButton from '../components/LogoutButton';
import ChangePasswordButton from '../components/ChangePasswordButton';
import EditProfileButton from '../components/EditProfileButton';
import AvatarButton from '../components/AvatarButton';

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Delay để mô phỏng việc load lại, có thể thêm logic gọi API nếu cần
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Trang Home</Text>
      <LogoutButton />
      <ChangePasswordButton />
      <EditProfileButton />
      <AvatarButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20
  }
});
