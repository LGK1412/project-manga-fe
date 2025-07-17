import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileButton() {
    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateUserProfile')}>
            <Text style={styles.text}>Chỉnh sửa hồ sơ</Text>
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
