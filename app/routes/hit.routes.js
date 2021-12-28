const express = require('express');
const router = express.Router();
const Counter = require("../model/counter.model");

router.get('/:namespace/:key',
    async(req, res) => {
        try {
            let namespace = req.params.namespace.trim();
            let key = req.params.key.trim();

            // check if namespace & key exists if not create namespace with key
            Counter.countDocuments({"namespace": `${namespace}`}, (err, count) => {
                if (err) {
                    console.log(err);
                    res.json({message: "could not fetch this namespace", error: 404});
                } else {
                    if (count > 0) {
                        Counter.countDocuments({"namespace": `${namespace}`, "keys.key": `${key}`}, (err, count) => {
                            if (err) {
                                console.log(err);
                                res.json({message: "could not fetch this key", error: 404});
                            } 
                            if (count > 0) {
                                Counter.getKeyByNameSpace({nameSpace: namespace, key: key}, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    res.json(result);

                                    // after sending cached updated value, update DB also
                                    Counter.updateKeyValueInMongoDB(
                                        {
                                            namespace: namespace,
                                            key: key,
                                            value: result.value 
                                        }, (err, state) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                        }).catch(err => {
                                            console.log(err);
                                        })
                                });
                            } else {
                                // namespace exist but this key does not
                                Counter.appendNewKey({namespace: namespace, key: key}, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    res.json(result);
                                });
                            }
    
                        })
                    } else {
                        Counter.createNewNameSpace({namespace: namespace, key: key}, (err, result) => {
                            if (err) {
                                console.log(err);
                                res.json({message: "could not create new namespace", error: 500});
                            } 
                            res.json(result);
                        })
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
});

module.exports = router;