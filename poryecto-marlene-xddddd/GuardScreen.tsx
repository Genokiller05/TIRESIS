import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform, // <-- Añadido
  Image,      // <-- Añadido
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './theme/ThemeContext';
import { useI18n } from './theme/I18nContext';

// Componente para inyectar estilos de scrollbar en la web
const WebScrollbarStyle = () => {
  const { colors } = useTheme();
  // Este componente no renderiza nada en móvil
  if (Platform.OS !== 'web') {
    return null;
  }

  const scrollbarStyles = `
    ::-webkit-scrollbar {
      width: 12px;
    }
    ::-webkit-scrollbar-track {
      background: ${colors.background}; 
    }
    ::-webkit-scrollbar-thumb {
      background-color: ${colors.subtext};
      border-radius: 6px;
      border: 3px solid ${colors.background};
    }
  `;

  return <style>{scrollbarStyles}</style>;
};

const GuardScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useI18n();
  const { width } = useWindowDimensions();

  // ... (el resto de tus hooks y estado se mantiene igual)
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [isViewModalVisible, setViewModalVisible] = useState(false);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);

    const CAMERAS = [
    { id: 1, name: `Cámara 1` },
    { id: 2, name: `Cámara 2` },
    { id: 3, name: `Cámara 3` },
    { id: 4, name: `Cámara 4` },
    { id: 5, name: `Cámara 5` },
    { id: 6, name: `Cámara 6` },
    { id: 7, name: `Cámara 7` },
    { id: 8, name: `Cámara 8` },
  ];

  const handleViewCamera = () => {
    if (selectedCameraId === null) {
      Alert.alert(t('general.required_action'), t('general.select_camera_first'));
    } else {
      setViewModalVisible(true);
    }
  };

  const handleOptions = () => {
    if (selectedCameraId === null) {
      Alert.alert(t('general.required_action'), t('general.select_camera_options'));
    } else {
      setOptionsModalVisible(true);
    }
  };

    const handleOptionAction = (action: string) => {
    const selectedCamera = CAMERAS.find(cam => cam.id === selectedCameraId);
    Alert.alert(
      t('general.options'),
      `${action} en ${selectedCamera?.name || ''}`
    );
    setOptionsModalVisible(false);
  };

  const selectedCamera = CAMERAS.find(cam => cam.id === selectedCameraId);
  
  // --- Lógica de Diseño Responsivo ---
  const numColumns = width < 600 ? 2 : (width < 900 ? 3 : 4);
  
  // Usamos un cálculo de ancho más simple y robusto
  const cardWidth = 
      numColumns === 2 ? '48.5%' : 
      numColumns === 3 ? '32%' : '23.5%';


  // --- Estilos Dinámicos ---
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Contenedor para centrar el contenido en la web
    container: {
      flex: 1,
      width: '100%',
      // Aplicar 'alignItems' solo en la web para centrar el contenido
      ...(Platform.OS === 'web' && { alignItems: 'center' }),
    },
    scrollViewContainer: {
      padding: 20,
      width: '100%',
      maxWidth: 1200, // Ancho máximo para el contenido
    },
    headerTitle: {
      color: colors.text,
    },
    cameraCard: {
      backgroundColor: colors.card,
      borderColor: 'transparent',
      width: cardWidth, // Ancho dinámico
    },
    cameraCardSelected: {
      borderColor: colors.accent,
      shadowColor: colors.accent,
    },
    button: {
      backgroundColor: colors.accent,
    },
    buttonOptions: {
      backgroundColor: colors.subtext,
    },
    buttonText: {
      color: colors.card,
    },
    recentAlertsContainer: {
      backgroundColor: colors.card,
    },
    recentAlertsTitle: {
      color: colors.text,
    },
    alertText: {
      color: colors.subtext,
    },
    modalContent: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    optionsModalTitle: {
      color: colors.text,
    },
    modalTitle: {
      color: 'white', // White color for the fullscreen modal title
      position: 'absolute',
      top: 60,
    },
    optionsModalContent: {
      backgroundColor: colors.card,
    },
    optionButton: {
      backgroundColor: colors.accent,
    },
    optionButtonText: {
      color: colors.card,
    },
    cancelButton: {
      backgroundColor: '#6c757d',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <WebScrollbarStyle />
      <View style={dynamicStyles.container}>
        <ScrollView 
          contentContainerStyle={dynamicStyles.scrollViewContainer}
          indicatorStyle={isDarkMode ? 'white' : 'black'} // Estilo de scrollbar para iOS
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>{t('home.guard_button')}</Text>
          </View>

          <View style={styles.cameraGrid}>
            {CAMERAS.map((camera) => (
              <Pressable
                key={camera.id}
                style={[
                  styles.cameraCard,
                  dynamicStyles.cameraCard,
                  selectedCameraId === camera.id && dynamicStyles.cameraCardSelected,
                ]}
                onPress={() => setSelectedCameraId(camera.id)}
              >
                <Text style={styles.cameraIcon}>📹</Text>
              </Pressable>
            ))}
          </View>

          {/* Este View ahora debería ser visible en móvil */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, dynamicStyles.button]} onPress={handleViewCamera}>
              <Text style={[styles.buttonText, dynamicStyles.buttonText]}>{t('general.view_camera')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, dynamicStyles.buttonOptions]} onPress={handleOptions}>
              <Text style={[styles.buttonText, dynamicStyles.buttonText]}>{t('general.options')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.recentAlertsContainer, dynamicStyles.recentAlertsContainer]}>
            <Text style={[styles.recentAlertsTitle, dynamicStyles.recentAlertsTitle]}>{t('general.recent_alerts')}</Text>
            <View style={styles.alertItem}>
              <View style={[styles.alertDot, styles.alertDotRed]} />
              <Text style={[styles.alertText, dynamicStyles.alertText]}>{t('general.movement_detected')}</Text>
            </View>
            <View style={styles.alertItem}>
              <View style={[styles.alertDot, styles.alertDotYellow]} />
              <Text style={[styles.alertText, dynamicStyles.alertText]}>{t('general.camera_disconnected')}</Text>
            </View>
            <View style={styles.alertItem}>
              <View style={[styles.alertDot, styles.alertDotGreen]} />
              <Text style={[styles.alertText, dynamicStyles.alertText]}>{t('general.all_clear')}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* --- Modal de Vista de Cámara (Pantalla Completa) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isViewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={[styles.modalOverlay, dynamicStyles.modalContent]}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setViewModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.modalVideoContainer}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              {selectedCamera?.name} {t('general.preview')}
            </Text>
            {selectedCameraId === 1 ? (
              Platform.OS === 'web' ? (
                <Image
                  source={{ uri: 'http://192.168.1.67:8080/video' }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  mixedContentMode="always"
                  androidLayerType="software"
                  source={{ uri: 'http://192.168.1.67:8080' }} // <-- CAMBIO: Apunta a la raíz, no a /video
                />
              )
            ) : selectedCameraId === 2 ? (
              Platform.OS === 'web' ? (
                <Image
                  source={{ uri: 'http://TU_IP_CAMARA_2:8080/video' }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  mixedContentMode="always"
                  source={{
                    html: `<body style="margin:0;padding:0;background-color:black;"><img src="http://TU_IP_CAMARA_2:8080/video" style="width:100%;height:100%;object-fit:contain;"/></body>`,
                  }}
                  style={{ flex: 1, width: '100%', backgroundColor: 'black' }}
                />
              )
            ) : selectedCameraId === 3 ? (
              Platform.OS === 'web' ? (
                <Image
                  source={{ uri: 'http://TU_IP_CAMARA_3:8080/video' }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  mixedContentMode="always"
                  source={{
                    html: `<body style="margin:0;padding:0;background-color:black;"><img src="http://TU_IP_CAMARA_3:8080/video" style="width:100%;height:100%;object-fit:contain;"/></body>`,
                  }}
                  style={{ flex: 1, width: '100%', backgroundColor: 'black' }}
                />
              )
            ) : selectedCameraId === 4 ? (
              Platform.OS === 'web' ? (
                <Image
                  source={{ uri: 'http://TU_IP_CAMARA_4:8080/video' }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  mixedContentMode="always"
                  source={{
                    html: `<body style="margin:0;padding:0;background-color:black;"><img src="http://TU_IP_CAMARA_4:8080/video" style="width:100%;height:100%;object-fit:contain;"/></body>`,
                  }}
                  style={{ flex: 1, width: '100%', backgroundColor: 'black' }}
                />
              )
            ) : (
              <Text style={styles.modalCameraIcon}>📹</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* --- Modal de Opciones (se mantiene igual) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOptionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlayOptions}>
          <View style={[styles.optionsModalContent, dynamicStyles.optionsModalContent]}>
            <Text style={[styles.optionsModalTitle, dynamicStyles.optionsModalTitle]}>{t('general.options')} para {selectedCamera?.name}</Text>
            <TouchableOpacity style={[styles.optionButton, dynamicStyles.optionButton]} onPress={() => handleOptionAction(t('general.rotate_camera_right'))}>
              <Text style={[styles.optionButtonText, dynamicStyles.optionButtonText]}>{t('general.rotate_camera_right')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, dynamicStyles.optionButton]} onPress={() => handleOptionAction(t('general.rotate_camera_left'))}>
              <Text style={[styles.optionButtonText, dynamicStyles.optionButtonText]}>{t('general.rotate_camera_left')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, dynamicStyles.optionButton]} onPress={() => handleOptionAction(t('general.focus'))}>
              <Text style={[styles.optionButtonText, dynamicStyles.optionButtonText]}>{t('general.focus')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, dynamicStyles.optionButton]} onPress={() => handleOptionAction(t('general.monitor_automatically'))}>
              <Text style={[styles.optionButtonText, dynamicStyles.optionButtonText]}>{t('general.monitor_automatically')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, dynamicStyles.cancelButton]}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={[styles.optionButtonText, dynamicStyles.optionButtonText]}>{t('general.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cameraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Espacio automático entre elementos
    marginBottom: 20,
  },
  cameraCard: {
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
  },
  cameraIcon: {
    fontSize: 50,
  },
  actionButtons: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentAlertsContainer: {
    padding: 15,
    borderRadius: 10,
  },
  recentAlertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  alertDotRed: { backgroundColor: '#dc3545' },
  alertDotYellow: { backgroundColor: '#ffc107' },
  alertDotGreen: { backgroundColor: '#28a745' },
  alertText: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalVideoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalCloseButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlayOptions: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  optionsModalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalCameraIcon: {
    fontSize: 200,
    color: 'white',
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GuardScreen;
