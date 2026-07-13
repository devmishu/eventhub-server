/*
 * Title: EventHub
 * Description: Main server file for the EventHub application
 * Author: Mishu Debnath
 * Date: 11/07/2026
 */

import dns from "node:dns/promises";
import express, { Request, Response, NextFunction } from "express";
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

// MongoDB Connection
client
  .connect()
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

interface EventData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  date: string;
  priority: string;
  imageUrl: string;
  category: string;
  location: string;
}

const db = client.db("eventHub");
const events = db.collection("events");
const sessions = db.collection("session");
const users = db.collection("user");

interface CustomRequest extends Request {
  user?: any;
}

const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  const query = { token: token };
  const session = await sessions.findOne(query);

  const userId = session?.userId;

  if (!userId) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  const userQuery = {
    _id: userId,
  };
  const user = await users.findOne(userQuery);

  if (!user) {
    return res.status(401).send({
      message: "Unauthorized access",
    });
  }

  req.user = user;
  next();
};

// post one events
app.post("/api/events", verifyToken, async (req: Request, res: Response) => {
  try {
    const eventData: EventData = req.body;
    const result = await events.insertOne(eventData);

    res.status(201).send({
      success: true,
      message: "Event added successfully",
      insertedId: result.insertedId,
    });
  } catch (error: any) {
    console.error(error);
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
    const { search, category, location, sortBy, page, itemsPerPage } = req.query;

    let query: Record<string, any> = {};

    if (search && typeof search === "string") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && typeof category === "string" && category !== "All Categories") {
      query.category = {
        $regex: `^${category.trim()}$`,
        $options: "i",
      };
    }

    if (location && typeof location === "string" && location !== "All Locations") {
      query.location = {
        $regex: `^${location.trim()}$`,
        $options: "i",
      };
    }

    let sortOption: Record<string, any> = { _id: -1 };

    if (sortBy === "Newest") {
      sortOption = { date: -1 };
    } else if (sortBy === "Oldest") {
      sortOption = { date: 1 };
    } else if (sortBy === "PriceLowToHigh") {
      sortOption = { price: 1 };
    } else if (sortBy === "PriceHighToLow") {
      sortOption = { price: -1 };
    }

    const total = await events.countDocuments(query);

    const currentPage = parseInt(page as string) || 1;
    const limit = parseInt(itemsPerPage as string) || 8;
    const skip = (currentPage - 1) * limit;

    const result = await events
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).send({
      success: true,
      message: "Events fetched successfully",
      data: {
        total,
        result,
      },
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

app.get("/api/events/user/:userId", verifyToken, async (req: Request, res: Response) => {
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

// delete event by id
app.delete("/api/events/:id", verifyToken, async (req: Request, res: Response) => {
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

    const result = await events.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Event deleted successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete event",
        error: error.message,
      });
    }

    return res.status(500).send({
      success: false,
      message: "Unknown error occurred",
    });
  }
});

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("EventHub API");
});

// Server Listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;