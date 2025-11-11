import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, TouchableOpacity, Dimensions, Modal } from 'react-native'; // --- NOVO: Modal ---
import * as MediaLibrary from 'expo-media-library';
import { AntDesign } from '@expo/vector-icons'; // Para o ícone de fechar o modal

// Pega o tamanho da tela para calcular o tamanho das imagens
const { width, height } = Dimensions.get('window'); // --- NOVO: Pega a altura também
const imageSize = width / 3; // 3 colunas

export default function GalleryListScreen() {
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  // --- NOVO: Estado para a imagem selecionada no modal ---
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

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

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permissão...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Permissão à galeria negada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => setSelectedImageUri(item.uri)} // --- NOVO: Abre o modal
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.message}>Nenhuma foto encontrada.</Text>}
      />

      {/* --- NOVO: Componente Modal para a Imagem Maior --- */}
      <Modal
        animationType="fade" // Efeito de transição
        transparent={true}  // Para ver o fundo escurecido
        visible={!!selectedImageUri} // O modal só é visível se houver uma URI selecionada
        onRequestClose={() => setSelectedImageUri(null)} // Fecha ao apertar "voltar" do Android
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => setSelectedImageUri(null)} // Fecha o modal
          >
            <AntDesign name="close-circle" size={30} color="white" />
          </TouchableOpacity>

          {selectedImageUri && ( // Renderiza a imagem só se tiver uma URI
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.fullScreenImage}
              resizeMode="contain" // Garante que a imagem inteira seja visível
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

// --- ESTILOS ---
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

  // --- NOVOS ESTILOS PARA O MODAL ---
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)', // Fundo escuro transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1, // Garante que o botão fique acima da imagem
    padding: 10,
  },
  fullScreenImage: {
    width: width,  // Ocupa toda a largura da tela
    height: height * 0.8, // Ocupa 80% da altura para deixar espaço para o botão
  },
});