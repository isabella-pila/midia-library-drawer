
# *Cadastro de Produtos* 

Usar o `Midia library` para tirar fotos(usando expo-camera) media labrary serve para salvar a foto na galeria nativa do celular e expo-camera tira a foto
acessar a galaria usando midia-library de duas formas:  
* GalleryList -> lista as fotos da galeria.
*  AdvancedGalleryScreen -> cria as pastas separadas de cada coisa(whatsapp, print, instagram e ect)
  
### Utlizando a navegação Drawer*


### **Navegações**
<ul>
<li>AppNavigator.tsx -> navegações Stack dos botoões das funções da camera e Camera ImagePickerGallery VideoCamera QrCodeScanne  cameraAvancada(com zoom, flash e foco ) </li>
<li>CatalogNavigator.tsx -> navegação Stack do catalago e produto detalhes </li>
<li>MainDrawerNavigation.tsx -> navegação Drawer tab catalago e cadastrar Produto </li>
<li> NavigationTypes.ts -> Tipos das navegações </li>
</ul>

  
##  Bibliotecas e Funções-Chave

 As principais coisas que este projeto usa são:
* **`expo-media-library`**:
    * `getAlbumsAsync()` (para listar pastas)
    * `getAssetsAsync()` (para listar mídias)
---

