import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from './theme/ThemeContext';
import { useI18n } from './theme/I18nContext';

// --- Tipado para la pila de navegación ---
type RootStackParamList = {
  LoginScreen: undefined;
  MainTabs: { screen?: 'Home' | 'GuardCameras' | 'AlertsDashboard' | 'Reports' };
  ProfileScreen: undefined;
  SettingsScreen: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('prueba@segcdmx.com');
  const [password, setPassword] = useState('123456');
  const { colors, isDarkMode } = useTheme();
  const { t } = useI18n();
  const styles = createStyles(colors);

  const handleLogin = () => {
    if (email === 'prueba@segcdmx.com' && password === '123456') {
      navigation.replace('MainTabs', { screen: 'Home' });
    } else {
      Alert.alert(t('login.error_title'), t('login.error_message'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📷</Text>
        </View>

        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>SEGCDMX</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={t('login.user')}
            placeholderTextColor={colors.subtext}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            placeholder={t('login.password')}
            placeholderTextColor={colors.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t('login.button')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


// 4. Función que genera los estilos dinámicamente usando los colores del tema
const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background, // Color de fondo del tema
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background, // Color de fondo del tema
      padding: 20,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.card, // Color de tarjeta del tema
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    iconText: {
      fontSize: 50,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text, // Color de texto del tema
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      color: colors.accent, // Color de acento del tema
      textAlign: 'center',
      marginBottom: 30,
    },
    card: {
      width: '100%',
      backgroundColor: colors.card, // Color de tarjeta del tema
      borderRadius: 25,
      paddingVertical: 20,
      paddingHorizontal: 25,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      marginBottom: 30,
    },
    input: {
      fontSize: 16,
      height: 50,
      color: colors.text, // Color de texto del tema
    },
    divider: {
      height: 1,
      backgroundColor: colors.border, // Color de borde del tema
      marginVertical: 10,
    },
    button: {
      width: '100%',
      backgroundColor: colors.accent, // Color de acento del tema
      padding: 15,
      borderRadius: 15,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF', // Texto del botón usualmente es blanco para contrastar
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

export default LoginScreen;