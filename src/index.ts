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
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

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
  },
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
  const db = client.db("eventHub");
  const events = db.collection("events");

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // post one events
    app.post("/api/events", async (req: Request, res: Response) => {
      try {
        const eventData: EventData = req.body;

        const result = await events.insertOne(eventData);

        res.status(201).send({
          success: true,
          message: "Event added successfully",
          insertedId: result.insertedId,
        });
        console.log(result);
      } catch (error: any) {
        console.log(error);

        res.status(500).send({
          success: false,
          message: "Failed to add events",
          error: error.message,
        });
      }
    });

    // get all events
    app.get("/api/events", async (req: Request, res: Response) => {
      try {
        const eventsData = await events.find().toArray();

        res.status(200).send({
          success: true,
          message: "Events fetched successfully",
          data: eventsData,
        });
      } catch (error: any) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch events",
          error: error.message,
        });
      }
    });

   
    app.get("/api/events/featured", async (req: Request, res: Response) => {
      try {
        const eventsData = await events.find().limit(8).toArray();

        res.status(200).send({
          success: true,
          message: "Featured events fetched successfully",
          data: eventsData,
        });
      } catch (error: any) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch featured events",
          error: error.message,
        });
      }
    });
  
    // get events by id
    app.get("/api/events/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (typeof id !== "string") {
          return res.status(400).send({
            success: false,
            message: "Invalid event id",
          });
        }

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid ObjectId",
          });
        }

        const query = {
          _id: new ObjectId(id),
        };

        const event = await events.findOne(query);

        if (!event) {
          return res.status(404).send({
            success: false,
            message: "Event not found",
          });
        }

        return res.status(200).send({
          success: true,
          message: "Event fetched successfully",
          data: event,
        });
      } catch (error) {
        if (error instanceof Error) {
          return res.status(500).send({
            success: false,
            message: "Failed to fetch event",
            error: error.message,
          });
        }

        return res.status(500).send({
          success: false,
          message: "Unknown error occurred",
        });
      }
    });

    app.get("/api/events/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (typeof id !== "string") {
          return res.status(400).send({
            success: false,
            message: "Invalid event id",
          });
        }

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid ObjectId",
          });
        }

        const query = {
          _id: new ObjectId(id),
        };

        const event = await events.findOne(query);

        if (!event) {
          return res.status(404).send({
            success: false,
            message: "Event not found",
          });
        }

        return res.status(200).send({
          success: true,
          message: "Event fetched successfully",
          data: event,
        });
      } catch (error) {
        if (error instanceof Error) {
          return res.status(500).send({
            success: false,
            message: "Failed to fetch event",
            error: error.message,
          });
        }

        return res.status(500).send({
          success: false,
          message: "Unknown error occurred",
        });
      }
    });

    app.get("/api/events/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (typeof userId !== "string") {
      return res.status(400).send({
        success: false,
        message: "Invalid user id",
      });
    }

    const query = {
      userId,
    };

    const userEvents = await events.find(query).toArray();

    return res.status(200).send({
      success: true,
      message: "User events fetched successfully",
      data: userEvents,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).send({
        success: false,
        message: "Failed to fetch user events",
        error: error.message,
      });
    }

    return res.status(500).send({
      success: false,
      message: "Unknown error occurred",
    });
  }
});





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
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
