import Joi from 'joi';
import { fetchLatestNews } from '../services/newsService.js';
import { User } from '../models/User.js';

export async function getFeed(req, res) {
  const user = await User.findById(req.session.userId);
  const categories = user?.interests || [];
  const articles = await fetchLatestNews({ categories });
  res.json({ articles });
}

export async function searchNews(req, res) {
  const schema = Joi.object({ q: Joi.string().allow(''), categories: Joi.string().allow('') });
  const { value } = schema.validate(req.query);
  const categories = value.categories ? value.categories.split(',').map((s) => s.trim()) : [];
  const articles = await fetchLatestNews({ categories, query: value.q || '' });
  res.json({ articles });
}

export async function saveArticle(req, res) {
  const schema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    url: Joi.string().uri().required(),
    source: Joi.string().allow(''),
    author: Joi.string().allow(''),
    description: Joi.string().allow(''),
    imageUrl: Joi.string().allow(''),
    publishedAt: Joi.date().allow(null),
    categories: Joi.array().items(Joi.string()).default([])
  });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $addToSet: { savedArticles: value } },
    { new: true }
  );
  res.json({ savedArticles: user.savedArticles });
}

export async function listSaved(req, res) {
  const user = await User.findById(req.session.userId);
  res.json({ savedArticles: user?.savedArticles || [] });
}

export async function removeSaved(req, res) {
  const schema = Joi.object({ id: Joi.string().required() });
  const { value, error } = schema.validate(req.params);
  if (error) return res.status(400).json({ error: error.message });
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { $pull: { savedArticles: { id: value.id } } },
    { new: true }
  );
  res.json({ savedArticles: user.savedArticles });
}


