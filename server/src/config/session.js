import MongoStore from 'connect-mongo';

export function buildSessionStore() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not set');
  }
  return MongoStore.create({
    mongoUrl: mongoUri,
    ttl: 60 * 60 * 24 * 7
  });
}


