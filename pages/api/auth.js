import jwt from "jsonwebtoken";
import connectDb from "@/middleware/mongoose";
import Users from "@/model/Users";

const handler = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ success: false, msg: "Method not allowed" });
  }

  // Parse cookies from the request headers
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return res.status(401).json({ success: false, msg: "No cookies provided" });
  }

  // Find the token in cookies (assuming cookie name is 'token')
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, msg: "No token cookie provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_USER);

    const user = await Users.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, msg: "Invalid token: user not found" });
    }

    return res.status(200).json({ success: true, msg: "Valid token", user });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
};

export default connectDb(handler);
