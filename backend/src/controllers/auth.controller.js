import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { verifyGoogleToken } from '../lib/googleAuth.js';
import { loginSchema, googleLoginSchema, guestLoginSchema } from '../validators/auth.schema.js';

function signUserToken(profileId) {
  return jwt.sign({ sub: profileId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function basicProfile(profile) {
  return { id: profile.id, name: profile.name, avatar: profile.avatar, authProvider: profile.authProvider };
}

export async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const token = jwt.sign({ sub: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential } = googleLoginSchema.parse(req.body);
    const { googleId, email, name, avatar } = await verifyGoogleToken(credential);

    let profile = await prisma.profile.findUnique({ where: { googleId } });
    if (!profile) {
      profile = await prisma.profile.create({
        data: { googleId, email, name: name || 'Lector', avatar, authProvider: 'GOOGLE' },
      });
    }

    const token = signUserToken(profile.id);
    res.json({ token, profile: basicProfile(profile) });
  } catch (err) {
    if (err.message?.includes('GOOGLE_CLIENT_ID')) {
      return res.status(503).json({ message: 'El inicio de sesión con Google no está configurado todavía.' });
    }
    next(err);
  }
}

export async function guestLogin(req, res, next) {
  try {
    const { guestToken } = guestLoginSchema.parse(req.body);

    let profile = guestToken ? await prisma.profile.findUnique({ where: { guestToken } }) : null;

    if (!profile) {
      const newGuestToken = crypto.randomBytes(24).toString('hex');
      profile = await prisma.profile.create({
        data: {
          name: `Invitado ${Math.floor(1000 + Math.random() * 9000)}`,
          authProvider: 'GUEST',
          guestToken: newGuestToken,
        },
      });
    }

    const token = signUserToken(profile.id);
    res.json({ token, profile: basicProfile(profile), guestToken: profile.guestToken });
  } catch (err) {
    next(err);
  }
}
