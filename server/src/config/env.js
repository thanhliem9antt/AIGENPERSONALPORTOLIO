const allowedNodeEnvironments = new Set(['development', 'test', 'production']);

function requireValue(name, { minLength = 1 } = {}) {
  const value = process.env[name]?.trim();
  if (!value || value.length < minLength) {
    throw new Error(`${name} must contain at least ${minLength} characters`);
  }
  return value;
}

function parseUrlList(name, fallback) {
  const raw = process.env[name]?.trim() || fallback;
  const values = raw.split(',').map((value) => value.trim()).filter(Boolean);
  if (values.length === 0) throw new Error(`${name} must include at least one URL`);
  values.forEach((value) => {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${name} only supports HTTP(S) URLs`);
  });
  return values;
}

export function getClientOrigins() {
  return parseUrlList('CLIENT_URL', 'http://localhost:5173');
}

export function assertEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!allowedNodeEnvironments.has(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${[...allowedNodeEnvironments].join(', ')}`);
  }

  requireValue('MONGODB_URI');
  requireValue('JWT_SECRET', { minLength: 32 });
  getClientOrigins();

  if (nodeEnv === 'production') requireValue('IP_HASH_SECRET', { minLength: 32 });

  const cloudinaryValues = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].filter((value) => value?.trim());
  if (cloudinaryValues.length > 0 && cloudinaryValues.length < 3) {
    throw new Error('Cloudinary requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET together');
  }
}
