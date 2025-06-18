import { View, Text, StyleSheet, Button } from 'react-native';
import LogoutButton from '../components/LogoutButton';
import ChangePasswordButton from '../components/ChangePasswordButton';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang Home</Text>
      <LogoutButton />
      <ChangePasswordButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20
  }
});
