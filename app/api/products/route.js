import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import QRCode from 'qrcode';

// GET - list products
export async function GET(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Avtorizatsiya kerak' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let query = { isActive: true };
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query)
            .populate('addedBy', 'fullName')
            .sort({ createdAt: -1 });

        // Get unique categories
        const categories = await Product.distinct('category', { isActive: true });

        return NextResponse.json({ success: true, products, categories });
    } catch (error) {
        console.error('Products GET error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}

// POST - add product
export async function POST(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Avtorizatsiya kerak' },
                { status: 401 }
            );
        }

        const { name, category, description, quantity, unit, price } = await request.json();

        if (!name || !category) {
            return NextResponse.json(
                { success: false, message: 'Mahsulot nomi va kategoriyasi kerak' },
                { status: 400 }
            );
        }

        await connectDB();

        // Generate unique SKU
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const categoryCode = category.substring(0, 3).toUpperCase();
        const sku = `${categoryCode}-${timestamp}-${random}`;

        // Generate QR Code
        const qrData = JSON.stringify({
            sku,
            name,
            category,
            quantity: quantity || 0,
            unit: unit || 'dona',
        });

        const qrCode = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff',
            },
        });

        const product = await Product.create({
            name,
            category,
            sku,
            description: description || '',
            quantity: quantity || 0,
            unit: unit || 'dona',
            price: price || 0,
            qrCode,
            addedBy: currentUser.userId,
        });

        return NextResponse.json({
            success: true,
            product: {
                id: product._id,
                name: product.name,
                category: product.category,
                sku: product.sku,
                description: product.description,
                quantity: product.quantity,
                unit: product.unit,
                price: product.price,
                qrCode: product.qrCode,
                createdAt: product.createdAt,
            },
        });
    } catch (error) {
        console.error('Products POST error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}

// PUT - update product
export async function PUT(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Avtorizatsiya kerak' },
                { status: 401 }
            );
        }

        const { id, name, category, description, quantity, unit, price } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Mahsulot ID kerak' },
                { status: 400 }
            );
        }

        await connectDB();

        const updateData = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (unit) updateData.unit = unit;
        if (price !== undefined) updateData.price = price;
        updateData.updatedAt = new Date();

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Mahsulot topilmadi' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error('Products PUT error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}

// DELETE - deactivate product
export async function DELETE(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'Avtorizatsiya kerak' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Mahsulot ID kerak' },
                { status: 400 }
            );
        }

        await connectDB();
        await Product.findByIdAndUpdate(id, { isActive: false });

        return NextResponse.json({ success: true, message: 'Mahsulot o\'chirildi' });
    } catch (error) {
        console.error('Products DELETE error:', error);
        return NextResponse.json(
            { success: false, message: 'Server xatosi' },
            { status: 500 }
        );
    }
}
