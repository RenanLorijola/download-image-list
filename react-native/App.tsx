/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {PermissionsAndroid, Platform, SafeAreaView} from 'react-native';
import RNFetchBlob, {RNFetchBlobConfig} from 'rn-fetch-blob';

import WebView from 'react-native-webview';

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
    downloadFile: function(url, filename) {
      postRn({ operation: 'downloadFile', url: url, filename: filename })
    }
  };
  
  true`;

  const downloadFile = (fileUrl: string, fileName: string) => {
    const {config, fs} = RNFetchBlob;

    let RootDir = fs.dirs.DownloadDir;
    let options: RNFetchBlobConfig = {
      path: `${RootDir}/${fileName}`,
      indicator: true,
      addAndroidDownloads: {
        path: `${RootDir}/${fileName}`,
        description: 'baixando arquivo...',
        notification: true,
        useDownloadManager: true,
      },
    };

    config(options)
      .fetch('GET', fileUrl)
      .then(res => {
        console.log(res.path());
      });
  };

  const checkDownloadPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log(err);
    }
  };

  const onMessage = (evt: {nativeEvent: {data: string}}) => {
    const {data} = evt?.nativeEvent || {};

    let dataObj: any;

    try {
      dataObj = JSON.parse(data);
    } catch (_) {
      dataObj = data;
    }

    switch (dataObj?.operation) {
      case 'downloadFile':
        console.log('dataObj?.url', dataObj?.url);
        checkDownloadPermission().then(
          granted => granted && downloadFile(dataObj?.url, dataObj?.filename),
        );
        break;
      default:
        break;
    }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        javaScriptEnabled
        source={{uri: 'http://localhost:3000/'}}
        originWhitelist={['https://*', 'http://*']}
        sharedCookiesEnabled
        injectedJavaScript={injectedJavaScript}
        useWebKit
        onMessage={onMessage}
      />
    </SafeAreaView>
  );
}

export default App;
