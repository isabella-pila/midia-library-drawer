import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, TouchableOpacity, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

// --- NOVO: Imports de Navegação e Contexto ---
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../context/ProductContext'; // <-- Ajuste o caminho se necessário

// Pega o tamanho da tela para calcular o tamanho das imagens
const { width } = Dimensions.get('window');
const imageSize = width / 3; // 3 colunas

export default function GalleryListScreen() {
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  // --- NOVO: Hooks de Navegação e Contexto ---
  const navigation = useNavigation();
  const { setTempImageUri } = useProducts(); // Pega a função do contexto

  useEffect(() => {
    const loadAssets = async () => {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para mostrar as fotos.');
        return;
      }
      try {
        const fetchedAssets = await MediaLibrary.getAssetsAsync({
          first: 21,
          mediaType: 'photo',
          sortBy: 'creationTime',
        });
        setAssets(fetchedAssets.assets);
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar as fotos da galeria.');
      }
    };
    loadAssets();
  }, [requestPermission]);

  // --- NOVO: Função para lidar com a seleção ---
  const handleImageSelect = (uri: string) => {
    // 1. Envia a URI para o contexto
    setTempImageUri(uri);
    // 2. Fecha a tela da galeria (o modal)
    navigation.goBack(); 
  };

  // Telas de loading (igual)
  if (!permission) {
    return <View style={styles.container}><Text style={styles.message}>Solicitando permissão...</Text></View>;
  }
  if (!permission.granted) {
    return <View style={styles.container}><Text style={styles.message}>Permissão à galeria negada.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleImageSelect(item.uri)} // --- MUDANÇA: Chama a nova função
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.message}>Nenhuma foto encontrada.</Text>}
      />
      
      {/* O MODAL FOI REMOVIDO DAQUI */}
    </View>
  );
}

// --- ESTILOS ---
// (Os estilos do Modal foram removidos por não serem mais necessários)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#333'
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderWidth: 1,
    borderColor: '#fff',
  },
});