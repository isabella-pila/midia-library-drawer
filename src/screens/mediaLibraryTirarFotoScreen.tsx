import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, ImageBackground, Platform } from 'react-native';
import Slider from '@react-native-community/slider'; 
import { 
  CameraView, 
  CameraType, 
  useCameraPermissions, 
  CameraCapturedPicture, 
  FocusMode
} from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../context/ProductContext'; // Ajuste o caminho
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library'; // --- NOVO: Importar MediaLibrary ---

// (Vou re-definir os tipos de FlashMode aqui para evitar erros de tipo)
type CustomFlashMode = 'on' | 'off' | 'auto' | 'torch';

export default function medialibraryCameraScreen_WithSave() {
  const navigation = useNavigation();
  const { setTempImageUri } = useProducts();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // States dos Controles
  const [zoom, setZoom] = useState(0);
  const [flashMode, setFlashMode] = useState<CustomFlashMode>('off');
  const [autoFocus, setAutoFocus] = useState<FocusMode>('on');

  // --- NOVO: State e Hook de Permissão da Galeria ---
  const [galleryPermission, requestGalleryPermission] = MediaLibrary.usePermissions();
  const [isSaved, setIsSaved] = useState(false); // Para desabilitar o botão

  // Pedir permissão da CÂMERA
  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para usar sua câmera.');
        navigation.goBack();
      }
    })();
  }, [requestPermission, navigation]);

  // --- NOVO: Função para Salvar a Foto ---
  const savePhoto = async () => {
    if (!photo) return; // Segurança

    // 1. Verificar permissão de galeria
    if (!galleryPermission?.granted) {
      const { status } = await requestGalleryPermission();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para salvar na sua galeria.');
        return;
      }
    }

    // 2. Tentar salvar
    try {
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      Alert.alert('Salvo!', 'A foto foi salva no seu rolo da câmera.');
      setIsSaved(true); // Desabilita o botão para não salvar de novo
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    }
  };


  // --- Funções dos Controles (com 'torch') ---
  const toggleFlash = () => {
    if (flashMode === 'off') setFlashMode('on');
    else if (flashMode === 'on') setFlashMode('auto');
    else if (flashMode === 'auto') setFlashMode('torch');
    else setFlashMode('off'); 
  };
  const toggleFocus = () => {
    setAutoFocus(current => (current === 'on' ? 'off' : 'on'));
  };
  const flashIcon = flashMode === 'off' ? 'flash-off' : flashMode === 'on' ? 'flash' : flashMode === 'auto' ? 'flash-outline' : 'flashlight';
  const focusIcon = autoFocus === 'on' ? 'aperture' : 'aperture-outline';


  // --- Funções Padrão ---
  async function takePicture() {
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setPhoto(pic);
      setIsSaved(false); // --- NOVO: Reseta o 'isSaved' para a nova foto
    }
  }
  function retry() { setPhoto(null); }
  function usePhoto() {
    if (photo) {
      setTempImageUri(photo.uri); 
      navigation.goBack();       
    }
  }

  // --- RENDERIZAÇÃO ---
  if (!permission?.granted) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Solicitando permissão...</Text></View>;
  }

  // Tela de PREVIEW (com 3 botões)
  if (photo) {
    return (
      <ImageBackground source={{ uri: photo.uri }} style={styles.previewContainer}>
        <View style={styles.previewButtonContainer}>
          {/* Botão Repetir */}
          <TouchableOpacity onPress={retry} style={styles.previewButton}>
            <Ionicons name="refresh" size={30} color="white" />
            <Text style={styles.previewButtonText}>Repetir</Text>
          </TouchableOpacity>

          {/* --- NOVO: Botão Salvar --- */}
          {/* Ele fica desabilitado (opaco) se já foi salvo */}
          <TouchableOpacity 
            onPress={savePhoto} 
            style={[styles.previewButton, isSaved && styles.disabledButton]}
            disabled={isSaved}
          >
            <Ionicons name={isSaved ? "checkmark-done" : "download"} size={30} color="white" />
            <Text style={styles.previewButtonText}>{isSaved ? "Salvo" : "Salvar"}</Text>
          </TouchableOpacity>

          {/* Botão Usar Foto (para o app) */}
          <TouchableOpacity onPress={usePhoto} style={styles.previewButton}>
            <Ionicons name="checkmark" size={30} color="white" />
            <Text style={styles.previewButtonText}>Usar Foto</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // Tela da CÂMERA (igual a antes)
  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef} 
        facing={facing} 
        style={StyleSheet.absoluteFill} 
        zoom={zoom}
        flash={flashMode as any} // Usando 'as any' para o 'torch'
        autofocus={autoFocus} 
      />

      {/* Controles do TOPO */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <AntDesign name="close" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.rightControls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
            <Ionicons name={flashIcon} size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFocus}>
            <Ionicons name={focusIcon} size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controles de BAIXO */}
      <View style={styles.bottomControls}>
        <View style={styles.zoomContainer}>
          <Text style={styles.zoomText}>ZOOM</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Platform.OS === 'ios' ? 0.035 : 1} 
            value={zoom}
            onValueChange={setZoom}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#AAAAAA"
          />
        </View>
        <View style={styles.shutterContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setFacing(c => (c === 'back' ? 'front' : 'back'))}>
            <Ionicons name="camera-reverse" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePicture} style={styles.shutterButton} />
          <View style={styles.placeholder} /> 
        </View>
      </View>
    </View>
  );
}

// --- ESTILOS (Adicionado 'disabledButton') ---
const styles = StyleSheet.create({
  // ... (todos os estilos anteriores)
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  loadingText: { color: 'white', fontSize: 18 },
  container: { flex: 1, backgroundColor: 'black' },
  topControls: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  rightControls: { flexDirection: 'row' },
  iconButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 50, marginHorizontal: 5 },
  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  zoomContainer: { paddingHorizontal: 30, paddingBottom: 10 },
  zoomText: { color: 'white', textAlign: 'center', fontSize: 12 },
  slider: { width: '100%', height: 40 },
  shutterContainer: { height: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', borderWidth: 4, borderColor: 'grey' },
  placeholder: { width: 55, height: 55 }, 
  previewContainer: { flex: 1, justifyContent: 'flex-end' },
  previewButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 120, backgroundColor: 'rgba(0,0,0,0.5)' },
  previewButton: { alignItems: 'center' },
  previewButtonText: { color: 'white', fontSize: 16, marginTop: 5, fontWeight: 'bold' },
  
  // --- NOVO: Estilo para o botão desabilitado ---
  disabledButton: {
    opacity: 0.5
  }
});