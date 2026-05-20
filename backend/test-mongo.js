const mongoose = require('mongoose');
const uri = "mongodb+srv://aosmanozoglu_db_user:Q7iLr8wbYYvSfkHD@cluster0.ffepese.mongodb.net/english-learning-app?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
