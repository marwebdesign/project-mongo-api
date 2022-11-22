import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import eurovisionData from './data/eurovision-winners.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Winner = mongoose.model("Winner", {
  year: Number,
  country: String,
  song: String,
  artist: String,
  songwriters: String,
  total_points: Number,
  location: String
})

if (process.env.RESET_DB) {
  const resetDataBase = async () => {
    await Winner.deleteMany()
    eurovisionData.forEach(singleWinner => {
      const newWinner = new Winner(singleWinner)
      newWinner.save()
    })
  }
  resetDataBase()
}
// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
