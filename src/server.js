const express = require('express');
const app = express();
const firebase = require('firebase');

const firebaseConfig = {
 
      apiKey: "AIzaSyC9PN2JY7nM9kKYGGMrKfWRdrBUNcH98VQ",
      authDomain: "schedulemakerlmp.firebaseapp.com",
      databaseURL: "https://schedulemakerlmp-default-rtdb.firebaseio.com",
      projectId: "schedulemakerlmp",
      storageBucket: "schedulemakerlmp.appspot.com",
      messagingSenderId: "522450878035",
      appId: "1:522450878035:web:3b7668e9efb33fc61890a6"
  
};

firebase.initializeApp(firebaseConfig);

// Ruta para leer datos de Firebase
app.get('/clases', (req, res) => {
  firebase
    .database()
    .ref('clases')
    .once('value')
    .then((snapshot) => {
      const clases = snapshot.val();
      console.log(clases); // Muestra los datos en la consola del servidor
      res.send(clases);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error al leer datos de Firebase');
    });
});

// Puerto en el que se ejecutará el servidor
const port = 3000;

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Express.js escuchando en el puerto ${port}`);
});