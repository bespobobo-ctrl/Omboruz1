import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'omboruz_default_secret';

export function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function getUserFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}
