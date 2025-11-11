import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigations/AppNavigator';
import { useProducts } from '../context/ProductContext';

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function RegisterProductScreen() {
  const navigation = useNavigation<NavProp>();
  const { addProduct, tempImageUri, setTempImageUri } = useProducts();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState('');

  const clearForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setUser('');
    setTempImageUri(null);
  };

  const handleRegister = () => {
    if (!name  || !description  || !tempImageUri) {
      alert('Por favor, preencha todos os campos e adicione uma foto.');
      return;
    }
    addProduct({
      name,
      price,
      description,
      user,
      imageUri: tempImageUri,
    });
    alert('Produto cadastrado com sucesso!');
    clearForm();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Foto do Produto</Text>
        <View style={styles.imagePreview}>
          {tempImageUri ? (
            <Image source={{ uri: tempImageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Nenhuma foto</Text>
          )}
        </View>
        <View style={styles.buttonRow}>
        <Button title="salvar foto galeria" onPress={() => navigation.navigate('midiaLibraryGallery')} />
        <Button title="Galeria Avançada" onPress={() => navigation.navigate('AdvancedGallery')} />
          <Button title="Lista de Galeria" onPress={() => navigation.navigate('galery')} />
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      
        <Text style={styles.label}>Descrição</Text>
        <TextInput style={styles.inputMulti} value={description} onChangeText={setDescription} multiline />
        <Button title="Cadastrar Produto" onPress={handleRegister} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16 },
  inputMulti: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16, height: 100, textAlignVertical: 'top' },
  imagePreview: { width: '100%', height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginBottom: 10 },
  image: { width: '100%', height: '100%', borderRadius: 5 },
  imagePlaceholder: { color: '#888' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }
});