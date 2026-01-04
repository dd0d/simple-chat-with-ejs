require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const http = require("http"); 
const { Server } = require("socket.io");
const sharedsession = require("express-socket.io-session");

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
});

app.use(sessionMiddleware);

io.use(sharedsession(sessionMiddleware, { autoSave: true }));

mongoose.connect(process.env.MONGO_URI)
.then(() => { console.log("Connected to MongoDB"); })
.catch(err => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


app.use("/", require("./routes/auth"));
app.use("/", require("./routes/users"));
app.use("/", require("./routes/chat"));

const Message = require("./models/Message.js");

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", (text) => {
        const user = socket.handshake.session?.user?.username || "Unknown";
        io.emit("chat message", { user, text });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
