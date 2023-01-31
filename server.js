import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import eurovisionData from './data/eurovision-winners.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Winner = mongoose.model("Winner", {
  id: Number,
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
    await Winner.deleteMany();
    eurovisionData.forEach(singleWinner => {
      const newWinner = new Winner(singleWinner);
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
  res.send({
    message: "Welcome to explore the winners of the Eurovision Song Contest!",
    routes: {
      "/winners": "to see all winners",
      "/winners?country=ENTER_COUNTRY": "to see all winners from a certain country",
      "/winners?artist=ENTER_ARTIST": "to see all winners from a certain artist",
      "/winners?country=ENTER_COUNTRY&artist=ENTER_ARTIST": "to see if a country has won with same artist more than once (SPOILER ALERT - Try Ireland)"
    }
  });
});

app.get("/winners", async (req, res) => {

  const { country, artist } = req.query;
  const response = {
    success: true,
    body: {}
  }
  const matchAllRegex = new RegExp(".*");
  const countryQuery = country ? country : { $regex: matchAllRegex, $options: 'i' };
  const artistQuery = artist ? artist : { $regex: matchAllRegex, $options: 'i' };

  try {
    response.body = await Winner.find({ country: countryQuery, artist: artistQuery })

    res.status(200).json({
      success: true,
      body: response
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      body: {
        message: error
      }
    });
  }

});

app.get("/winners/:id", async (req, res) => {
  try {
    const singleWinner = await Winner.findById(req.params.id);
    if (singleWinner) {
      res.status(200).json({
        success: true,
        body: singleWinner
      });
    } else {
      res.status(404).json({
        success: false,
        body: {
          message: "Could not find the song"
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      body: {
        message: "Invalid id"
      }
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
