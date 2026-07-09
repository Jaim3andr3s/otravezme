import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { verifyGoogleToken } from '../lib/googleAuth.js';
import {
  loginSchema,
  googleLoginSchema,
  guestLoginSchema,
  registerSchema,
  emailLoginSchema,
} from '../validators/auth.schema.js';

function signUserToken(profileId) {
  return jwt.sign({ sub: profileId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function signAdminToken(adminId) {
  return jwt.sign({ sub: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function basicProfile(profile) {
  return { id: profile.id, name: profile.name, avatar: profile.avatar, authProvider: profile.authProvider };
}

// ========== ADMIN LOGIN (existente) ==========
export async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const token = signAdminToken(admin.id);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

// ========== GOOGLE LOGIN ==========
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

// ========== GUEST LOGIN ==========
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

// ========== REGISTRO DE USUARIO NORMAL ==========
export async function register(req, res, next) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const profile = await prisma.profile.create({
      data: {
        name,
        email,
        passwordHash,
        authProvider: 'EMAIL',
        avatar: `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = signUserToken(profile.id);
    res.status(201).json({ token, profile: basicProfile(profile) });
  } catch (err) {
    next(err);
  }
}

// ========== LOGIN DE USUARIO NORMAL (email) ==========
export async function emailLogin(req, res, next) {
  try {
    const { email, password } = emailLoginSchema.parse(req.body);

    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (!profile.passwordHash) {
      return res.status(401).json({
        message: 'Esta cuenta no tiene contraseña establecida. Usa Google o ingresa como invitado.',
      });
    }

    const valid = await bcrypt.compare(password, profile.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signUserToken(profile.id);
    res.json({ token, profile: basicProfile(profile) });
  } catch (err) {
    next(err);
  }
}

// ========== LOGIN UNIFICADO (admin + usuario normal) ==========
export async function unifiedLogin(req, res, next) {
  try {
    const { email, password } = emailLoginSchema.parse(req.body);

    // 1. Buscar en Admin (usando username como email)
    const admin = await prisma.admin.findUnique({ where: { username: email } });
    if (admin) {
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }
      const token = signAdminToken(admin.id);
      return res.json({ token, role: 'admin' });
    }

    // 2. Buscar en Profile
    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (!profile.passwordHash) {
      return res.status(401).json({
        message: 'Esta cuenta no tiene contraseña establecida. Usa Google o ingresa como invitado.',
      });
    }

    const valid = await bcrypt.compare(password, profile.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signUserToken(profile.id);
    res.json({
      token,
      role: 'user',
      profile: {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        authProvider: profile.authProvider,
      },
    });
  } catch (err) {
    next(err);
  }
}