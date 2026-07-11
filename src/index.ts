/*
 * Title: EventHub
 * Description: Main server file for the EventHub application
 * Author: Mishu Debnath
 * Date: 11/07/2026
 */

import dns from "node:dns/promises";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion } from 'mongodb';

// DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Config
dotenv.config();

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI!;

// App
const app = express();

app.use(cors());
app.use(express.json());






// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
 interface EventData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  date: string;
  priority: string;
  imageUrl: string;
 }
async function run() {
    const db = client.db('eventHub')
    const events = db.collection('events');


    // post one events
        app.post('/api/events',  async (req:Request, res:Response) => {
            try {
                const eventData:EventData = req.body;

                const result = await events.insertOne(eventData);

                res.status(201).send({
                    success: true,
                    message: "Event added successfully",
                     insertedId: result.insertedId,
                });
                console.log(result);
            } catch (error:any) {
              
                console.log(error);

                res.status(500).send({
                    success: false,
                    message: 'Failed to add events',
                    error: error.message 
                })
            }
        });


        // get all events 
        app.get('/api/events', async (req:Request, res:Response) => {
            try {
               
                const eventsData = await events.find().toArray();

                res.status(200).send({
                    success: true,
                    message: "Events fetched successfully",
                    data: eventsData,
                });

            } catch (error:any) {
                res.status(500).send({
                    success: false,
                    message: "Failed to fetch events",
                    error: error.message,
                });
            }
        });

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




















// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("EventHub API");
});

// Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});