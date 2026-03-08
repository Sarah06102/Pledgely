const mongoose = require("mongoose");
const PromiseModel = require("./models/Promise");
require("dotenv").config({ path: __dirname + "/../.env" });

async function checkPromises() {
  await mongoose.connect(process.env.MONGO_URI);
  const promises = await PromiseModel.find().limit(5);
  console.log(JSON.stringify(promises, null, 2));
  
  const sourcesTypes = await PromiseModel.distinct("sources");
  console.log("Distinct sources:", sourcesTypes);
  
  process.exit(0);
}
checkPromises();
