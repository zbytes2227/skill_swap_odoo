import connectDb from "@/middleware/mongoose";
import SkillSwapRequest from "@/model/SkillSwapRequest";
import Users from "@/model/Users";

const handler = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { fromUser, toUser, offeredSkill, wantedSkill, message } = req.body;

      if (!fromUser || !toUser || !offeredSkill || !wantedSkill) {
        return res.status(400).json({ success: false, msg: "Missing required fields" });
      }

      const request = new SkillSwapRequest({
        fromUser,
        toUser,
        offeredSkill,
        wantedSkill,
        message,
      });

      await request.save();
      return res.status(201).json({ success: true, msg: "Skill swap request sent", request });
    }
    if (req.method === "PUT") {
      const { requestId, status, feedback, userId } = req.body;

      if (!requestId) {
        return res.status(400).json({ success: false, msg: "Missing request ID" });
      }

      const updateData = {};

      if (status && ["completed", "rejected", "pending"].includes(status)) {
        updateData.status = status;
      }

      // Handle feedback
      if (feedback && userId) {
        const request = await SkillSwapRequest.findById(requestId);
        if (!request) {
          return res.status(404).json({ success: false, msg: "Request not found" });
        }

        const feedbackKey = request.fromUser.toString() === userId ? "fromFeedback" : "toFeedback";
        updateData[feedbackKey] = feedback;
      }

      const updatedRequest = await SkillSwapRequest.findByIdAndUpdate(requestId, updateData, { new: true });

      return res.status(200).json({ success: true, msg: "Request updated", request: updatedRequest });
    }


    if (req.method === "GET") {
      const { userId, role, requestId } = req.query;

      // Get a specific request
      if (requestId) {
        const request = await SkillSwapRequest.findById(requestId)
          .populate("fromUser", "name email profilePhoto")
          .populate("toUser", "name email profilePhoto");

        if (!request) {
          return res.status(404).json({ success: false, msg: "Request not found" });
        }

        return res.status(200).json({ success: true, request });
      }

      // Get all requests sent or received by a user
      if (userId) {
        const query =
          role === "sent"
            ? { fromUser: userId }
            : role === "received"
              ? { toUser: userId }
              : { $or: [{ fromUser: userId }, { toUser: userId }] };

        const requests = await SkillSwapRequest.find(query)
          .sort({ createdAt: -1 })
          .populate("fromUser", "name email profilePhoto")
          .populate("toUser", "name email profilePhoto");

        return res.status(200).json({ success: true, requests });
      }

      return res.status(400).json({ success: false, msg: "Missing userId or requestId" });
    }

    return res.status(405).json({ success: false, msg: "Method not allowed" });
  } catch (error) {
    console.error("/api/skillswap error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

export default connectDb(handler);
