import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

// Rahbar default credentials
const RAHBAR_USERNAME = '123';
const RAHBAR_PASSWORD = '123';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Login va parol kiritilishi shart' },
                { status: 400 }
            );
        }

        // Check for Rahbar (admin) login
        if (username === RAHBAR_USERNAME && password === RAHBAR_PASSWORD) {
            await connectDB();

            // Find or create rahbar user
            let rahbar = await User.findOne({ role: 'rahbar' });
            if (!rahbar) {
                rahbar = await User.create({
                    username: RAHBAR_USERNAME,
                    password: RAHBAR_PASSWORD,
                    role: 'rahbar',
                    fullName: 'Rahbar',
                });
            }

            rahbar.lastLogin = new Date();
            await rahbar.save();

            const token = generateToken(rahbar);

            return NextResponse.json({
                success: true,
                token,
                user: {
                    id: rahbar._id,
                    username: rahbar.username,
                    role: rahbar.role,
                    fullName: rahbar.fullName,
                },
            });
        }

        // Check for Ombor user login
        await connectDB();
        const user = await User.findOne({ username, isActive: true });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Login yoki parol noto\'g\'ri' },
                { status: 401 }
            );
        }

        if (user.password !== password) {
            return NextResponse.json(
                { success: false, message: 'Login yoki parol noto\'g\'ri' },
                { status: 401 }
            );
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
            },
        });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}
