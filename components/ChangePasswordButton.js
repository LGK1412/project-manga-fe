import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ChangePasswordButton() {
    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.text}>Đổi mật khẩu?</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 10,
    },
    text: {
        color: '#800080',
    },
});