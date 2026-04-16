import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET - list all ombor users (rahbar only)
export async function GET(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser || currentUser.role !== 'rahbar') {
            return NextResponse.json(
                { success: false, message: 'Ruxsat yo\'q' },
                { status: 403 }
            );
        }

        await connectDB();
        const users = await User.find({ role: 'ombor' }).select('-__v').sort({ createdAt: -1 });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}

// POST - create new ombor user (rahbar only)
export async function POST(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser || currentUser.role !== 'rahbar') {
            return NextResponse.json(
                { success: false, message: 'Ruxsat yo\'q' },
                { status: 403 }
            );
        }

        const { username, password, fullName } = await request.json();

        if (!username || !password || !fullName) {
            return NextResponse.json(
                { success: false, message: 'Barcha maydonlarni to\'ldiring' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if username exists
        const existing = await User.findOne({ username });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Bu login allaqachon mavjud' },
                { status: 409 }
            );
        }

        const user = await User.create({
            username,
            password,
            fullName,
            role: 'ombor',
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Users POST error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}

// DELETE - deactivate ombor user (rahbar only)
export async function DELETE(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser || currentUser.role !== 'rahbar') {
            return NextResponse.json(
                { success: false, message: 'Ruxsat yo\'q' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User ID kerak' },
                { status: 400 }
            );
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Foydalanuvchi topilmadi' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Foydalanuvchi o\'chirildi' });
    } catch (error) {
        console.error('Users DELETE error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}
