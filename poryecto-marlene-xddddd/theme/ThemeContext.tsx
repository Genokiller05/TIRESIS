
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define la estructura de nuestro tema para tener un tipado fuerte.
interface AppTheme {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    accent: string;
    danger: string;
    border: string;
    inputBackground: string;
  };
}

// Define los colores específicos para el tema claro.
const lightColors = {
  background: "#f3f4f6", // Un gris muy claro para el fondo
  card: "#ffffff",       // Blanco puro para las tarjetas o paneles
  text: "#111827",       // Casi negro para el texto principal
  subtext: "#6b7280",    // Gris para texto secundario o descriptivo
  accent: "#2563eb",     // Azul vibrante para elementos interactivos
  danger: "#dc2626",     // Rojo para acciones destructivas o alertas
  border: "#e5e7eb",     // Gris claro para bordes y separadores
  inputBackground: "#f9fafb", // Un blanco ligeramente grisáceo para fondos de input
};

// Define los colores específicos para el tema oscuro.
const darkColors = {
  background: "#020617", // Azul muy oscuro, casi negro, para el fondo
  card: "#0f172a",       // Azul oscuro para las tarjetas
  text: "#f9fafb",       // Blanco con un toque de gris para el texto
  subtext: "#9ca3af",    // Gris más claro para texto secundario
  accent: "#3b82f6",     // Un azul más brillante que resalta en la oscuridad
  danger: "#ef4444",     // Un rojo más brillante para ser visible en fondos oscuros
  border: "#1f2937",     // Un borde sutil de color azul-gris oscuro
  inputBackground: "#020617", // Mismo color que el fondo para inputs integrados
};


// 1. Creación del Contexto
// Creamos el contexto con un valor inicial por defecto.
// Este valor se usará solo si un componente intenta usar el contexto
// sin estar envuelto en un ThemeProvider.
export const ThemeContext = createContext<AppTheme>({
  isDarkMode: false,
  toggleTheme: () => console.warn('ThemeProvider no encontrado'),
  colors: lightColors,
});

// Props que recibirá nuestro Provider.
type ThemeProviderProps = {
  children: ReactNode;
};

// 2. Creación del Provider
// Este componente envolverá nuestra aplicación (o partes de ella)
// y proveerá el estado del tema y las funciones para cambiarlo.
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Estado para saber si el modo oscuro está activado.
  // El valor inicial se carga de forma asíncrona desde AsyncStorage.
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 3. Persistencia con AsyncStorage y Carga Inicial
  // Usamos useEffect para cargar la preferencia del tema guardada
  // tan pronto como el componente se monte.
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          // Si encontramos un tema guardado ('dark' o 'light'), lo aplicamos.
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // Si no hay nada guardado, usamos el tema del sistema operativo como valor inicial.
          const colorScheme = Appearance.getColorScheme();
          setIsDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        // En caso de error, usamos el tema del sistema como fallback.
        console.error("Error al cargar el tema desde AsyncStorage:", error);
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');
      }
    };

    loadTheme();
  }, []);

  // Función para cambiar el tema.
  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      // Cada vez que cambiamos el tema, guardamos la nueva preferencia.
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error("Error al guardar el tema en AsyncStorage:", error);
    }
  };
  
  // Seleccionamos el set de colores correcto basado en el estado isDarkMode.
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Hook personalizado `useTheme`
// Este hook simplifica el uso del contexto en los componentes.
// En lugar de `useContext(ThemeContext)`, podemos simplemente usar `useTheme()`.
export const useTheme = () => useContext(ThemeContext);
