// entrypoint.js (or index.js)

/** --- Polyfills --- **/
import 'fast-text-encoding'; // TextEncoder/Decoder
import 'react-native-get-random-values'; // ⬅️ FIRST: patches global.crypto.getRandomValues


import { Buffer } from 'buffer';
global.Buffer = Buffer;                  // make Buffer globally available

import '@ethersproject/shims'; // now safe to load
/** ------------------ **/

// finally hand control to Expo Router
import 'expo-router/entry';

console.log('entrypoint.js loaded');