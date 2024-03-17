
const {onRequest} = require("firebase-functions/v2/https");
const { format } = require('date-fns');
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

admin.initializeApp();
const app = express();

app.use(express.json());
app.use(cors());

app.post('/createProduct', async (req, res) => {
    const data = req.body;

    admin.database().ref('products').push(data)
        .then(() => {
            res.status(200).send({message: 'New Product Created'});
        })
        .catch((error) => {
            console.error("Error adding data:", error);
            res.status(500).send({message: 'Error adding data: ' + error});
        });
});

app.post('/newOrder', async (req, res) => {
    const data = req.body;
    data.checkpoints = {};

    data.checkpoints.placed = format(new Date(), 'MM/dd/yyyy hh:mm:ss a');

    admin.database().ref('orders').push(data)
        .then(() => {
            res.status(200).send({message: 'Order successfully created'});
        })
        .catch((error) => {
            console.error("Error adding data:", error);
            res.status(500).send({message: 'Error adding data: ' + error});
        });
});

app.patch('/shipOrder/:id', (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).send({message: 'Order ID must be provided'});
    }

    const todayDate = format(new Date(), 'MM/dd/yyyy hh:mm:ss a'); // Format today's date as MM/dd/yyyy
    const updatePath = `orders/${orderId}/checkpoints/shipped`;

    // Update the specific order's checkpoint with the cancellation date
    admin.database().ref(updatePath).set(todayDate)
        .then(() => {
            res.status(200).send({message: `Order with ID ${orderId} marked as shipped on ${todayDate}.`});
        })
        .catch((error) => {
            logger.error("Error updating order:", error);
            res.status(500).send({message: 'Error updating order: ' + error});
        });
});

app.patch('/deliverOrder/:id', (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).send({message: 'Order ID must be provided'});
    }

    const todayDate = format(new Date(), 'MM/dd/yyyy hh:mm:ss a'); // Format today's date as MM/dd/yyyy
    const updatePath = `orders/${orderId}/checkpoints/delivery`;

    // Update the specific order's checkpoint with the cancellation date
    admin.database().ref(updatePath).set(todayDate)
        .then(() => {
            res.status(200).send({message: `Order with ID ${orderId} marked as out for delivery on ${todayDate}.`});
        })
        .catch((error) => {
            logger.error("Error updating order:", error);
            res.status(500).send({message: 'Error updating order: ' + error});
        });
});

app.patch('/receiveOrder/:id', (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).send({message: 'Order ID must be provided'});
    }

    const todayDate = format(new Date(), 'MM/dd/yyyy hh:mm:ss a'); // Format today's date as MM/dd/yyyy
    const updatePath = `orders/${orderId}/checkpoints/received`;

    // Update the specific order's checkpoint with the cancellation date
    admin.database().ref(updatePath).set(todayDate)
        .then(() => {
            res.status(200).send({message: `Order with ID ${orderId} marked as received on ${todayDate}.`});
        })
        .catch((error) => {
            logger.error("Error updating order:", error);
            res.status(500).send({message: 'Error updating order: ' + error});
        });
});

app.patch('/cancelOrder/:id', (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).send({message: 'Order ID must be provided'});
    }

    const todayDate = format(new Date(), 'MM/dd/yyyy hh:mm:ss a'); // Format today's date as MM/dd/yyyy
    const updatePath = `orders/${orderId}/checkpoints/cancelled`;

    // Update the specific order's checkpoint with the cancellation date
    admin.database().ref(updatePath).set(todayDate)
        .then(() => {
            res.status(200).send({message: `Order with ID ${orderId} marked as cancelled on ${todayDate}.`});
        })
        .catch((error) => {
            logger.error("Error updating order:", error);
            res.status(500).send({message: 'Error updating order: ' + error});
        });
});

app.patch('/refundOrder/:id', (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).send({message: 'Order ID must be provided'});
    }

    const todayDate = format(new Date(), 'MM/dd/yyyy hh:mm:ss a'); // Format today's date as MM/dd/yyyy
    const updatePath = `orders/${orderId}/checkpoints/refunded`;

    // Update the specific order's checkpoint with the cancellation date
    admin.database().ref(updatePath).set(todayDate)
        .then(() => {
            res.status(200).send({message: `Order with ID ${orderId} marked as refunded on ${todayDate}.`});
        })
        .catch((error) => {
            logger.error("Error updating order:", error);
            res.status(500).send({message: 'Error updating order: ' + error});
        });
});

app.get('/getProducts', (req, res) => {
    admin.database().ref('products').once('value', snapshot => {
        if (snapshot.exists()) {
            res.status(200).json(snapshot.val());
        } else {
            res.status(404).send({message: 'No products found'});
        }
    }).catch((error) => {
        logger.error("Error fetching data:", error);
        res.status(500).send({message: 'Error fetching data: ' + error});
    });
});

app.get('/getProductById/:id', (req, res) => {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).send({message: 'Product ID must be provided'});
    }

    admin.database().ref(`products/${productId}`).once('value', snapshot => {
        if (snapshot.exists()) {
            res.status(200).json(snapshot.val());
        } else {
            res.status(404).send({message: 'Product not found'});
        }
    }).catch((error) => {
        logger.error("Error fetching product:", error);
        res.status(500).send({message: 'Error fetching product: ' + error});
    });
});

app.get('/getOrders', (req, res) => {
    admin.database().ref('orders').once('value', snapshot => {
        if (snapshot.exists()) {
            res.status(200).json(snapshot.val());
        } else {
            res.status(404).send({message: 'No orders found'});
        }
    }).catch((error) => {
        logger.error("Error fetching data:", error);
        res.status(500).send({message: 'Error fetching data: ' + error});
    });
});

app.patch('/editProduct', async (req, res) => {
    const { id, args } = req.body;

    if (!id || !args) {
        return res.status(400).send({message: 'Product ID and args must be provided'});
    }

    const productRef = admin.database().ref(`products/${id}`);

    productRef.once('value', snapshot => {
        if (snapshot.exists()) {
            const updates = {};

            Object.keys(args).forEach(key => {
                updates[key] = args[key];
            });

            productRef.update(updates, error => {
                if (error) {
                    logger.error("Error updating product:", error);
                    res.status(500).send({message: 'Error updating product: ' + error});
                } else {
                    res.status(200).send({message: `Product with ID ${id} updated successfully.`});
                }
            });
        } else {
            res.status(404).send({message: `Product with ID ${id} not found.`});
        }
    }).catch(error => {
        logger.error("Error fetching product:", error);
        res.status(500).send({message: 'Error fetching product: ' + error});
    });
});

app.post('/increaseLikes/:id', async (req, res) => {
    const { id } = req.params;

    const productRef = admin.database().ref(`products/${id}`);

    try {
        const transactionResult = await new Promise((resolve, reject) => {
            productRef.transaction((currentData) => {
                if (currentData === null) {
                    return reject(new Error(`Product with id ${id} not found`));
                } else {
                    if (currentData.likes || currentData.likes === 0) {
                        currentData.likes++;
                    } else {
                        currentData.likes = 1;
                    }
                    return currentData;
                }
            }, (error, committed, snapshot) => {
                if (error) {
                    return reject(error);
                } else if (!committed) {
                    return reject(new Error(`Transaction not committed for product with id ${id}`));
                } else {
                    return resolve(snapshot.val());
                }
            });
        });
        res.status(200).send(`Likes for product with ID ${id} increased to ${transactionResult.likes}`);
    } catch (error) {
        logger.error("Error updating likes:", error);
        res.status(error.message.includes("not found") ? 404 : 500).send(error.message);
    }
});


app.post('/decreaseLikes/:id', async (req, res) => {
    const { id } = req.params;

    const productRef = admin.database().ref(`products/${id}`);

    await productRef.transaction((currentData) => {
        if (currentData !== null) {
            if (currentData.likes && currentData.likes > 0) {
                currentData.likes--;
            } else {
                // Prevent likes from going negative
                currentData.likes = 0;
            }
            return currentData;
        } else {
            return; // Skip if product doesn't exist
        }
    }, (error, committed, snapshot) => {
        if (error) {
            logger.error("Error updating likes:", error);
            res.status(500).send('Error updating likes: ' + error);
        } else if (!committed) {
            res.status(404).send({message: `Product with id ${id} not found`});
        } else {
            res.status(200).send(`Likes for product with ID ${id} decreased to ${snapshot.val().likes}`);
        }
    });
});

app.delete('/deleteProduct/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({message: 'Product ID must be provided'});
    }

    const productRef = admin.database().ref(`products/${id}`);

    productRef.once('value', snapshot => {
        if (snapshot.exists()) {
            productRef.remove()
                .then(() => {
                    res.status(200).send({message: 'Product successfully deleted'});
                })
                .catch((error) => {
                    logger.error("Error deleting product:", error);
                    res.status(500).send({message: 'Error deleting product: ' + error});
                });
        } else {
            res.status(404).send({message: `Product with ID ${id} not found.`});
        }
    }).catch(error => {
        logger.error("Error fetching product:", error);
        res.status(500).send({message: 'Error fetching product: ' + error});
    });
});

exports.app = functions.https.onRequest(app);
// firebase deploy --only functions