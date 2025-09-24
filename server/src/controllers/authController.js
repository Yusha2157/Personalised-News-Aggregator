import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { User } from '../models/User.js';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().allow('', null),
  avatarUrl: Joi.string().uri().allow('', null),
  interests: Joi.array().items(Joi.string()).default([])
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export async function register(req, res) {
  const { value, error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const existing = await User.findOne({ email: value.email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(value.password, 10);
  const user = await User.create({
    email: value.email,
    passwordHash,
    name: value.name || '',
    avatarUrl: value.avatarUrl || '',
    interests: value.interests || []
  });
  req.session.userId = user._id.toString();
  res.status(201).json(safeUser(user));
}

export async function login(req, res) {
  const { value, error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.verifyPassword(value.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.userId = user._id.toString();
  res.json(safeUser(user));
}

export async function me(req, res) {
  if (!req.session.userId) return res.json(null);
  const user = await User.findById(req.session.userId);
  res.json(safeUser(user));
}

export async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
}

export async function updateInterests(req, res) {
  const schema = Joi.object({ interests: Joi.array().items(Joi.string()).required() });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $set: { interests: value.interests } },
    { new: true }
  );
  res.json(safeUser(user));
}

export async function updateProfile(req, res) {
  const schema = Joi.object({ name: Joi.string().allow('', null), avatarUrl: Joi.string().uri().allow('', null) });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $set: { name: value.name ?? undefined, avatarUrl: value.avatarUrl ?? undefined } },
    { new: true }
  );
  res.json(safeUser(user));
}

function safeUser(user) {
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    interests: user.interests
  };
}


