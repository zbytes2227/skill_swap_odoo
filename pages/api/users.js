import Users from "@/model/Users";
import connectDb from "../../middleware/mongoose";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const { _id, type, search = "", page = 1, limit = 10 } = req.query;

      // If _id is provided, return that specific user
      if (_id) {
        const user = await Users.findById(_id).select("-password");
        if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
        }
        return res.status(200).json({
          success: true,
          msg: "User fetched",
          user,
        });
      }

      // If type is public, return paginated public users
      if (type === "public") {
        const jwt = require('jsonwebtoken');
        const cookie = require('cookie');
        const JWT_SECRET = process.env.JWT_TOKEN_USER;

        let loggedInUserId = null;

        // Get token from cookies
        if (req.headers.cookie) {
          const { token } = cookie.parse(req.headers.cookie || '');
          if (token) {
            try {
              console.log(JWT_SECRET);

              const decoded = jwt.verify(token, JWT_SECRET);
              console.log(decoded);

              loggedInUserId = decoded.id;
              console.log(loggedInUserId);
              console.log("loggedInUserId");

            } catch (err) {
              console.log(err);

              console.warn("Invalid token");
            }
          }
        }
        console.log("loggedInUserId");

        const searchRegex = new RegExp(search, "i");

        const query = {
          profileType: "public",
          $or: [{ skillsWanted: searchRegex }, { skillsOffered: searchRegex }],
        };

        if (loggedInUserId) {
          query._id = { $ne: loggedInUserId }; // exclude logged-in user
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const users = await Users.find(query, "-password")
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);

        const totalUsers = await Users.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNum);

        return res.status(200).json({
          success: true,
          msg: "Users fetched",
          users,
          pagination: {
            totalUsers,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
          },
        });
      }


      return res.status(400).json({
        success: false,
        msg: "Invalid query. Provide either '_id' or 'type=public'.",
      });
    } catch (error) {
      console.error("GET /api/user error:", error);
      return res.status(500).json({ success: false, msg: "Server error" });
    }
  }

  // ✅ HANDLE PUT REQUEST FOR PROFILE UPDATE
  if (req.method === "PUT") {
    try {
      const {
        email,
        name,
        location,
        skillsOffered,
        skillsWanted,
        availability,
        profileType,
        profilePhoto,
      } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, msg: "Email is required for update" });
      }

      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }

      // Update fields
      if (name) user.name = name;
      if (location) user.location = location;
      if (skillsOffered) user.skillsOffered = skillsOffered;
      if (skillsWanted) user.skillsWanted = skillsWanted;
      if (availability) user.availability = availability;
      if (profileType) user.profileType = profileType;
      if (profilePhoto) user.profilePhoto = profilePhoto;

      await user.save();

      const updatedUser = await Users.findById(user._id).select("-password");

      return res.status(200).json({
        success: true,
        msg: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("PUT /api/user error:", error);
      return res.status(500).json({ success: false, msg: "Server error" });
    }
  }

  // For all other HTTP methods
  return res.status(405).json({ success: false, msg: "Method not allowed" });
};

export default connectDb(handler);
