const express = require("express")
require('dotenv').config()
const mongoose = require("mongoose")
const { userRouter } = require("./routes/user")
const { courseRouter } = require("./routes/course")
const { adminRouter } = require("./routes/admin");
const app = express();

app.use(express.json())

app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/user",userRouter);
app.use("/api/v1/course", courseRouter);

async function main(){
await mongoose.connect(process.env.MONGODB_URL);
app.listen(process.env.PORT);
console.log(`Connected to DB; Listening to port ${process.env.PORT}`);
}

main();
