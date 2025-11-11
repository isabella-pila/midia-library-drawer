import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// O navegador de Abas
import { MainDrawerNavigator } from '../navigations/MainDrawerNavigation';

import medialibraryCameraScreen_WithSave from '../screens/mediaLibraryGalleryScreen';
import AdvancedGalleryScreen from '../screens/AdvancedGalleryScreen';
import GalleryListScreen from '../screens/GalleryListScreen';
export type RootStackParamList = {
  MainTabs: undefined;
  AdvancedGallery: undefined;
 midiaLibraryGallery: undefined;
 galery: undefined;


};

const Stack = createStackNavigator<RootStackParamList>();
export default function AppNavigator() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* O fluxo principal de abas */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainDrawerNavigator} // <-- Usando o TabNavigator importado
          options={{ headerShown: false }} 
        />
        
        {/* Telas Modais (acima de tudo) */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          
          <Stack.Screen 
            name="midiaLibraryGallery" 
            component={medialibraryCameraScreen_WithSave} 
            options={{ title: 'Escolher da Galeria' }} 
          />
    <Stack.Screen
            name="AdvancedGallery"
            component={AdvancedGalleryScreen}
            options={{ title: 'Galeria Avançada' }}
          />
<Stack.Screen
            name="galery" 
            component={GalleryListScreen}
            options={{ title: 'Lista de Galeria' }}
          />
        </Stack.Group>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}