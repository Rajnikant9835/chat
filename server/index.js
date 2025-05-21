const express = require("express");
// const cors = require("cors");
require('dotenv').config();
const { app, server } = require('./socket/index');
const router = require("./routes/index");


const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");

//path
const path = require("path");
// const app = express();



const cors = require('cors');
// app.use(cors({ origin: 'http://localhost:3000'}));
// / CORS configuration with credentials support
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',   // Allow requests from this origin
  credentials: true                  // Allow sending cookies and authorization headers
}));

// app.use(cors({
//   origin: process.env.FRONTED_URL,
//   credentials: true,
// })
// );

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve()

// app.get("/", (request, response) => {
//   response.json({
//     message: "Server running at PORT " + PORT,
//   });
// });



//api endpointes
app.use("/api", router);

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../client/build")));


  app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../client","client","index.html"));
  })
}

// ------------------------------------- Deployment ------------------------------------ 
// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV == 'production') {
//   app.use(express.static(path.join(__dirname1, "/client/build")))

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
//   })

// } else {
//   app.get("/", (request, response) => {
//     response.json({
//       message: "Server running at PORT " + PORT,
//     });
//   });
// }


//rewrite ****************************
// const __dirname1 = path.resolve();
// console.log("NODE_ENV is:", process.env.NODE_ENV); // <== Add this line

// if (process.env.NODE_ENV === 'production') {
//   console.log("✅ Running in PRODUCTION mode"); // <== Add this too

//   // app.use(express.static(path.join(__dirname1, "/client/build")));
//   app.use(express.static(path.join(__dirname, "../client/build")));


//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"));
//   }); 

// } else {
//   console.log("🚧 Running in DEVELOPMENT mode"); // <== Add this too

//   app.get("/", (request, response) => {
//     response.json({
//       message: "Server running at PORT " + PORT,
//     });
//   });
// }

//rewrite ********************************

// const ROOT_DIR = path.resolve(__dirname, '..'); // ⬅️ root is one level above /server

// console.log("NODE_ENV is:", process.env.NODE_ENV);

// if (process.env.NODE_ENV === 'production') {
//   console.log("✅ Running in PRODUCTION mode");

//   // Serve static files from React
//   app.use(express.static(path.join(ROOT_DIR, 'client', 'build')));

//   // Handle React routing, return all requests to index.html
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(ROOT_DIR, 'client', 'build', 'index.html'));
//   });

// } else {
//   console.log("🚧 Running in DEVELOPMENT mode");

//   app.get('/', (req, res) => {
//     res.json({
//       message: "Server running at PORT " + PORT,
//     });
//   });
// }



// ------------------------- Deployment ---------------------------------------- 

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server is running at PORT " + PORT);
  });
});


