import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  findUserByIdentifier,
  incrementFailedAttempts,
  resetFailedAttempts,
} from '../models/user.js';

export async function login(req, res) {
  const { identifier, password } = req.body;

  if (!identifier?.trim() || !password) {
    return res.status(400).json({
      success: false,
      error: 'Identifier and password are required',
    });
  }

  try {
    const user = await findUserByIdentifier(identifier.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username/email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (user.is_lock) {
      return res.status(403).json({
        success: false,
        error: 'Account locked. Please contact administrator.',
        code: 'ACCOUNT_LOCKED',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active. Please contact administrator.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const { newAttempts, shouldLock } = await incrementFailedAttempts(
        user.id,
        user.failed_login_attempts ?? 0
      );

      if (shouldLock) {
        return res.status(403).json({
          success: false,
          error: 'Account locked due to too many failed attempts.',
          code: 'ACCOUNT_LOCKED',
        });
      }

      const remaining = 5 - newAttempts;
      return res.status(401).json({
        success: false,
        error: `Invalid username/email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        code: 'INVALID_CREDENTIALS',
      });
    }

    await resetFailedAttempts(user.id);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
      },
    });

  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}