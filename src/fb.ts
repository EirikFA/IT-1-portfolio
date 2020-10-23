/* eslint-disable import/no-duplicates */
// Firebase imports triggers rule

import {
  auth as fbAuth, storage as fbStorage, firestore, initializeApp
} from "firebase/app";
import { auth as uiAuth } from "firebaseui";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA3keAOlA6o4557RdsL_bt5wgL0Pa-1k8I",
  authDomain: "arweb-portfolio.firebaseapp.com",
  databaseURL: "https://arweb-portfolio.firebaseio.com",
  projectId: "arweb-portfolio",
  storageBucket: "arweb-portfolio.appspot.com",
  messagingSenderId: "635924263681",
  appId: "1:635924263681:web:a2d1b9a37bad2250586100"
};

export const app = initializeApp(firebaseConfig);

export const auth = fbAuth();
export const db = firestore();
export const storage = fbStorage();
export const ui = new uiAuth.AuthUI(auth);
