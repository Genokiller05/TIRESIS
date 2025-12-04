import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from './theme/ThemeContext';
import { useI18n } from './theme/I18nContext';

// Tipos para la navegación (RootStackParamList para navegar a Profile/Settings)
type RootStackParamList = {
  LoginScreen: undefined;
  MainTabs: { screen?: string };
  ProfileScreen: undefined;
  SettingsScreen: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = createStyles(colors);



  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.panel}>
          <View style={styles.header}>

            <Text style={styles.headerTitle}>{t('home.guard_button')}</Text>
            <View style={{ width: 24 }} />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>{t('home.profile_button')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <Text style={styles.buttonIcon}>⚙️</Text>
            <Text style={styles.buttonText}>{t('home.settings_button')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// 4. Función que genera los estilos dinámicamente usando los colores del tema.
// Ahora, los colores de fondo, texto y tarjetas se adaptarán automáticamente.
const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    panel: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
    },
    backButton: {
      padding: 5,
    },
    backIcon: {
      fontSize: 24,
      color: colors.text,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card, // El fondo del botón será el de la tarjeta
      borderWidth: 1,
      borderColor: colors.border, // Añadimos un borde sutil
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
    },
    buttonIcon: {
      fontSize: 24,
      marginRight: 15,
    },
    buttonText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '500',
    },
  });

export default HomeScreen;