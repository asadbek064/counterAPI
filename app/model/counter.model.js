const mongoose = require("mongoose");
const beautifyUnique = require("mongoose-beautiful-unique-validation");

if (process.env.REDISTOGO_URL) {
  // TODO: redistogo connection
  var rtg = require("url").parse(process.env.REDISTOGO_URL);
  var client = require("redis").createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
  var client = require("redis").createClient();
}

const Key = mongoose.Schema({
  key: { type: String },
  value: { type: Number, default: 0 },
});

const CounterSchema = mongoose.Schema({
  namespace: { type: String, unique: true },
  keys: [Key],
});
CounterSchema.plugin(beautifyUnique);

const Counter = module.exports = mongoose.model("Counter", CounterSchema);

module.exports.getKeyByNameSpace = async (req, callback) => {
    try {
        let nameSpace = req.nameSpace;
        let key = req.key;
        let KEY_ID = `${nameSpace}+${key}`
        client.get(`${nameSpace}+${key}`, (err, result) => {
            /* if (result) {
                // remove old cache
                let count = Number(result) + 1;
                client.getset(`${KEY_ID}`, count);
                callback(null, {value: count});
            } else {
            } */
            Counter.findOne({ namespace: `${nameSpace}`, "keys.key": `${key}` }, {"keys": 1, "_id": 0})
            .select("keys.$.value")
            .then(
                (_result) => {
                    let count = Number(_result['keys'][0].value);
                    count++;
                    //client.set(`${KEY_ID}`, count);
                    callback(null, {value: count});
                }
            )
        });
    } catch (error) {
        console.log(error);
        callback(null, false);
    }
};

module.exports.createNewNameSpace = async (req, callback) => {
  let nameSpace = req.namespace;
  let key = req.key;
  let KEY_ID = `${nameSpace}+${key}`

  let NEWKEY = ({
      key: key,
      value: 1,
  });

  let newNameSpace = new Counter({
    namespace: nameSpace,
    keys: [NEWKEY]
  });

  newNameSpace.save();
  
  client.set(`${KEY_ID}`, 1);
  callback(null, { value: 1 });
};

module.exports.appendNewKey = async (req, callback) => {
  let nameSpace = req.namespace;
  let newKey = req.key;
  let KEY_ID = `${nameSpace}+${newKey}`
  
  let NEWKEY = ({
      key: newKey,
      value: 1,
  });

  await Counter.updateOne(
    { "namespace": nameSpace },
    {
      $addToSet: {
        "keys": NEWKEY  ,
      },
    }
  );

  client.set(`${KEY_ID}`, 1);
  callback(null, { value: 1 });
};

module.exports.updateKeyValueInMongoDB = async (req, callback) => {
  let nameSpace = req.namespace;
  let key = req.key;
  let newValue = req.value;

  Counter.findOneAndUpdate({namespace: `${nameSpace}`, "keys.key": `${key}`},
    {
      $set : {
        'keys.$.value': `${newValue}`
      }      
    }, (err, res) => {
      if (err) {
        console.log(err);
        callback(null, err);
      }
      callback(null, res);
    }
  );

} 