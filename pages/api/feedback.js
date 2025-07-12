import Feedbacks from "@/model/Feedback";
import connectDb from "../../middleware/mongoose";
import Users from "@/model/Users";
import jwt from "jsonwebtoken"

const handler = async (req, res) => {
  if (req.method === "POST") {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }
    const token = authHeader.split(' ')[1];
    console.log('token');
    console.log(token);
    let decoded = await jwt.verify(token, process.env.JWT_TOKEN_USER);
    const user = await Users.findOne({ User_ID: decoded.ID });

    const { Star, Message } = req.body;


    // Basic validation
    if (!Star || typeof Star !== "number" || Star < 1 || Star > 5) {
      return res.status(400).json({ success: false, error: "Invalid star rating" });
    }

    try {
      const feedback = new Feedbacks({
        User: user,
        Star,
        Message: Message || "", // fallback if no message
      });

      await feedback.save();

      return res.status(200).json({ success: true, message: "Feedback saved" });
    } catch (err) {
      console.error("Error saving feedback:", err);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  } else {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
};

export default connectDb(handler);
