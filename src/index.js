/*
 * Title: EventHub
 * Description: Main server file for the EventHub application
 * Author: Mishu Debnath
 * Date: 11/07/2026
 */
import dns from "node:dns/promises";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// Config
dotenv.config();
const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
// App
const app = express();
app.use(cors());
app.use(express.json());
// Routes
app.get("/", (req, res) => {
    res.send("EventHub API");
});
// Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
