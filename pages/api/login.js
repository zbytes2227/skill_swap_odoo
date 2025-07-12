import connectDb from '@/middleware/mongoose';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import Users from '@/model/Users';
import bcrypt from 'bcrypt';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { email, password, mode, name } = req.body;

      if (!email || !password || !mode) {
        return res.status(400).json({ success: false, msg: 'All fields are required.' });
      }

      if (mode === 'register') {
        if (!name) {
          return res.status(400).json({ success: false, msg: 'Name is required.' });
        }
        // Check if user already exists
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ success: false, msg: 'User already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new Users({
          name: email.split('@')[0], // Placeholder name
          email,
          password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_TOKEN_USER, {
          expiresIn: '30d',
        });

        res.setHeader('Set-Cookie', serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        }));

        return res.status(201).json({
          success: true,
          msg: 'Registration successful.',
        });
      } else if (mode === 'login') {
        // Find user
        const user = await Users.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, msg: 'User not found.' });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(401).json({ success: false, msg: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_USER, {
          expiresIn: '30d',
        });

        res.setHeader('Set-Cookie', serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        }));

        return res.status(200).json({
          success: true,
          msg: 'Login successful.',
        });
      } else {
        return res.status(400).json({ success: false, msg: 'Invalid mode.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, msg: 'Server error.', error });
    }
  } else {
    return res.status(405).json({ success: false, msg: 'Method not allowed.' });
  }
};

export default connectDb(handler);
