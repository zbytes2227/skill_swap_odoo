import dbConnect from '@/middleware/mongoose';
import Users from '@/model/Users';
import SkillSwapRequest from '@/model/SkillSwapRequest';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query } = req;
  const { action, userId, swapId } = query;

  try {
    switch (method) {
      case 'GET':
        if (action === 'stats') {
          const users = await Users.find({});
          const swaps = await SkillSwapRequest.find({});
          return res.status(200).json({
            totalUsers: users.length,
            bannedUsers: users.filter(u => u.isBanned).length,
            totalSwaps: swaps.length,
            pendingSwaps: swaps.filter(s => s.status === 'pending').length,
            acceptedSwaps: swaps.filter(s => s.status === 'accepted').length,
          });
        }

        if (action === 'report') {
          const users = await Users.find({});
          const swaps = await SkillSwapRequest.find({}).populate('fromUser toUser');
          return res.status(200).json({ users, swaps });
        }

        return res.status(400).json({ message: 'Invalid action' });

      case 'PUT':
        if (action === 'ban' && userId) {
          await Users.findByIdAndUpdate(userId, { isBanned: true });
          return res.status(200).json({ message: 'User banned' });
        }

        if (action === 'unban' && userId) {
          await Users.findByIdAndUpdate(userId, { isBanned: false });
          return res.status(200).json({ message: 'User unbanned' });
        }

        if (action === 'reject' && swapId) {
          await SkillSwapRequest.findByIdAndUpdate(swapId, { status: 'rejected' });
          return res.status(200).json({ message: 'Swap rejected' });
        }

        return res.status(400).json({ message: 'Missing parameters for action' });

      default:
        return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
