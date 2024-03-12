const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Example of a Firestore 'create' function
exports.addDocument = functions.https.onRequest(async (req, res) => {
    const data = req.body;
    const writeResult = await admin.firestore().collection('Testing').add(data);
    res.json({result: `Document with ID: ${writeResult.id} added.`});
});