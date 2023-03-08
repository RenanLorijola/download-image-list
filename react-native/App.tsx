/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Alert, PermissionsAndroid, Platform, SafeAreaView} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

import WebView from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

type FileToDownload = {
  fileUrl: string;
  fileName: string;
};

function App(): JSX.Element {
  const injectedJavaScript = `
  function postRn(data) {
    var message;
  
    try {
      message = JSON.stringify(data);
    } catch (_) {
      message = JSON.stringify({});
    }
  
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(message);
    }
  }
  
  window.Native = {
    downloadImage: function(files) {
      postRn({ operation: 'downloadImage', files: files })
    }
  };
  
  true`;

  const hasGallerySavePermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };

  const saveToCameraRoll = (files: FileToDownload[]) => {
    try {
      if (Platform.OS === 'android') {
        const dirs = RNFetchBlob.fs.dirs;

        Promise.all(
          files.map(({fileUrl, fileName}) =>
            RNFetchBlob.config({
              addAndroidDownloads: {
                title: fileName,
                useDownloadManager: true,
                notification: true,
                description: 'Imagem baixada da BLZ',
                path: `${dirs.PictureDir}/${fileName.replace(/[^\w-]/g, '_')}.${
                  fileUrl.match(/\.(\w+)$/)?.[1] || 'jpg'
                }`,
              },
            }).fetch('GET', fileUrl),
          ),
        ).then(() =>
          Alert.alert('Pronto, as imagens foram salvas em sua galeria.'),
        );
      } else {
        Promise.all(files.map(({fileUrl}) => CameraRoll.save(fileUrl))).then(
          () => Alert.alert('Pronto, as imagens foram salvas em sua galeria.'),
        );
      }
    } catch (error) {
      Alert.alert(
        'Ops, ocorreu um erro ao salvar as imagens! Erro:',
        (error as Error)?.message,
      );
    }
  };

  const onMessage = async (evt: {nativeEvent: {data: string}}) => {
    const {data} = evt?.nativeEvent || {};

    let dataObj: any;

    try {
      dataObj = JSON.parse(data);
    } catch (_) {
      dataObj = data;
    }

    switch (dataObj?.operation) {
      case 'downloadImage':
        hasGallerySavePermission().then(hasPermission =>
          hasPermission
            ? saveToCameraRoll(dataObj?.files)
            : Alert.alert('Precisamos da permissão para salvar as imagens.'),
        );
        break;
      default:
        break;
    }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        source={{uri: 'http://localhost:3000'}}
        javaScriptEnabled
        allowFileAccessFromFileURLs
        startInLoadingState
        originWhitelist={['*']}
        injectedJavaScript={injectedJavaScript}
        mixedContentMode="compatibility"
        useWebKit
        onMessage={onMessage}
      />
    </SafeAreaView>
  );
}

export default App;
