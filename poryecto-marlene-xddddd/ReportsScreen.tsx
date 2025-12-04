import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from './theme/ThemeContext';
import { useI18n } from './theme/I18nContext';

// --- Tipado para la pila de navegación ---
type RootStackParamList = {
  NewReportScreen: undefined;
  MainTabs: undefined;
};

type ReportsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

// --- Tipos de datos para los reportes ---
interface ReportData {
  id: number;
  type: string;
  date: string;
  status: 'Enviado' | 'En Revisión' | 'Resuelto';
  summary: string;
}

const ReportsScreen = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const { colors } = useTheme();
  const { t } = useI18n();
  const styles = createStyles(colors);

  const dummyReports: ReportData[] = [
    {
      id: 1,
      type: 'Intrusión detectada',
      date: '2025-11-24 10:30',
      status: 'Resuelto',
      summary: 'Acceso no autorizado en Almacén B, se notificó a seguridad.',
    },
    {
      id: 2,
      type: 'Fallo de equipo',
      date: '2025-11-23 15:12',
      status: 'En Revisión',
      summary: 'La cámara CAM-04 del pasillo norte ha perdido la conexión.',
    },
    {
      id: 3,
      type: 'Actividad sospechosa',
      date: '2025-11-23 08:45',
      status: 'Enviado',
      summary: 'Vehículo desconocido sin placas fue visto rondando el perímetro norte.',
    },
    {
      id: 4,
      type: 'Vandalismo',
      date: '2025-11-22 23:50',
      status: 'Resuelto',
      summary: 'Graffiti encontrado en la pared exterior del Edificio C.',
    },
  ];

  const statusColors: Record<ReportData['status'], string> = {
    Enviado: colors.accent,
    'En Revisión': '#F59E0B',
    Resuelto: '#10B981',
  };

  const statusTranslations = {
    Enviado: t('reports.status_sent'),
    'En Revisión': t('reports.status_in_review'),
    Resuelto: t('reports.status_resolved'),
  };

  const renderReportItem = ({ item }: { item: ReportData }) => (
    <Pressable style={styles.reportCard}>
      <View style={styles.reportIconContainer}>
        <Text style={styles.reportIcon}>📋</Text>
      </View>
      <View style={styles.reportTextContainer}>
        <Text style={styles.reportType}>{item.type}</Text>
        <Text style={styles.reportSummary}>{item.summary}</Text>
        <Text style={styles.reportDate}>{item.date}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] }]} />
        <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
          {statusTranslations[item.status]}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>{t('reports.management_title')}</Text>
        <View style={styles.panel}>
          <FlatList
            data={dummyReports}
            renderItem={renderReportItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewReportScreen')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


// 4. Función que genera los estilos dinámicamente.
// Ahora la pantalla y sus componentes se adaptan al tema claro/oscuro.
const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    mainTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
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
      overflow: 'hidden',
    },
    listContent: {
      padding: 20,
    },
    reportCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reportIconContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 12,
      marginRight: 15,
    },
    reportIcon: {
      fontSize: 24,
    },
    reportTextContainer: {
      flex: 1,
    },
    reportType: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    reportSummary: {
      fontSize: 14,
      color: colors.subtext,
      marginTop: 4,
    },
    reportDate: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 8,
    },
    statusContainer: {
      alignItems: 'center',
      marginLeft: 10,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    fab: {
      position: 'absolute',
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      right: 30,
      bottom: 30,
      backgroundColor: colors.accent,
      borderRadius: 30,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    fabIcon: {
      fontSize: 30,
      color: 'white',
    },
  });

export default ReportsScreen;