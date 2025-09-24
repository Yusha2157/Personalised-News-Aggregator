import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    interests: { type: [String], default: [] },
    savedArticles: {
      type: [
        new mongoose.Schema(
          {
            id: String,
            title: String,
            url: String,
            source: String,
            author: String,
            description: String,
            imageUrl: String,
            publishedAt: Date,
            categories: [String]
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);


