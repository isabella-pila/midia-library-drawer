import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, Alert, 
  TouchableOpacity, Dimensions, ActivityIndicator 
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../context/ProductContext'; 
import { Ionicons } from '@expo/vector-icons';

// --- Configuração do Grid ---
const { width } = Dimensions.get('window');
const imageSize = width / 3; // 3 colunas
const albumImageSize = width / 2; // 2 colunas para álbuns

export default function AdvancedGalleryScreen() {
  const navigation = useNavigation();
  const { setTempImageUri } = useProducts();

  // --- States de Controle ---
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Pedir permissão e carregar ÁLBUNS
  useEffect(() => {
    const loadAlbums = async () => {
      setIsLoading(true);
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
        setIsLoading(false);
        return;
      }

      try {
        // Busca os álbuns, incluindo os "Álbuns Inteligentes" (Recentes, Favoritos)
        const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
          includeSmartAlbums: true,
        });

        // Filtra álbuns que tenham pelo menos 1 foto
        setAlbums(fetchedAlbums.filter(album => album.assetCount > 0));

      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar os álbuns.');
      }
      setIsLoading(false);
    };

    loadAlbums();
  }, [requestPermission]);

  // 2. Função para carregar FOTOS de um álbum selecionado
  const loadAssetsFromAlbum = async (album: MediaLibrary.Album) => {
    setIsLoading(true);
    setSelectedAlbum(album); // Muda o "estado" da tela

    try {
      const fetchedAssets = await MediaLibrary.getAssetsAsync({
        album: album.id,         // <-- A MÁGICA ESTÁ AQUI
        first: 30,             // Pega as 30 mais recentes
        mediaType: 'photo',
        sortBy: 'creationTime',
      });
      setAssets(fetchedAssets.assets);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar as fotos deste álbum.');
    }
    setIsLoading(false);
  };

  // 3. Função para selecionar a foto (igual ao exemplo anterior)
  const handleImageSelect = (uri: string) => {
    setTempImageUri(uri);
    navigation.goBack(); 
  };

  // 4. Função para voltar da lista de fotos para a lista de álbuns
  const goBackToAlbums = () => {
    setSelectedAlbum(null);
    setAssets([]); // Limpa as fotos
  };

  // --- RENDERIZAÇÃO ---

  // Tela de Loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Tela de Permissão
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Permissão à galeria negada.</Text>
      </View>
    );
  }

  // --- RENDERIZAÇÃO CONDICIONAL ---

  // Se um álbum foi selecionado, mostra a GRADE DE FOTOS
  if (selectedAlbum) {
    return (
      <View style={styles.container}>
        {/* Cabeçalho para Voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackToAlbums} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>{selectedAlbum.title}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={assets}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImageSelect(item.uri)}>
              <Image source={{ uri: item.uri }} style={styles.imageGrid} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.message}>Nenhuma foto neste álbum.</Text>}
        />
      </View>
    );
  }

  // Se NENHUM álbum foi selecionado, mostra a LISTA DE ÁLBUNS
  return (
    <View style={styles.container}>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        numColumns={2} // 2 colunas para álbuns
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => loadAssetsFromAlbum(item)} style={styles.albumItem}>
            {/* O 'getAssetsAsync' para pegar a capa é lento,
                vamos usar um ícone ou cor por enquanto */}
            <View style={styles.albumThumbnail}>
              <Ionicons name="images" size={50} color="#ccc" />
            </View>
            <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.albumCount}>{item.assetCount}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={styles.mainTitle}>Álbuns</Text>}
      />
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  message: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#333'
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  // Header (para voltar)
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Estilos da Lista de Álbuns
  albumItem: {
    width: albumImageSize,
    padding: 10,
    alignItems: 'center',
  },
  albumThumbnail: {
    width: albumImageSize - 20,
    height: albumImageSize - 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  albumCount: {
    fontSize: 14,
    color: '#888',
  },
  // Estilos da Grade de Fotos
  imageGrid: {
    width: imageSize,
    height: imageSize,
    borderWidth: 1,
    borderColor: '#fff',
  },
});