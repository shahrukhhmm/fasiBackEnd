// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./dummy-f7239-firebase-adminsdk-oyz2b-6f4a0642f8.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dummy-f7239.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = { bucket };