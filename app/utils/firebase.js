import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyDV1W__SwOtDR04Ow4f7z3gTZz06cnju74',
  authDomain: 'tenedores-6034e.firebaseapp.com',
  databaseURL: 'https://tenedores-6034e.firebaseio.com',
  projectId: 'tenedores-6034e',
  storageBucket: 'tenedores-6034e.appspot.com',
  messagingSenderId: '450893336673',
  appId: '1:450893336673:web:adfc757e8ccd3198091a20',
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
