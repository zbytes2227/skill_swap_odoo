export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Simple static admin credentials
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
