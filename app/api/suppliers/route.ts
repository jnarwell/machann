import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  createSupplierSchema,
  updateSupplierRatingSchema,
  safeValidate,
  validationErrorResponse,
} from "@/lib/validation";

// GET /api/suppliers - List all suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const commodityId = searchParams.get("commodityId");

    const where = {
      ...(location && { location: { contains: location } }),
      ...(commodityId && { commodities: { contains: commodityId } }),
    };

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    });

    return NextResponse.json({ success: true, suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Add a new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(createSupplierSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { name, phone, location, commodities, notes } = result.data;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone: phone ?? null,
        location,
        commodities: commodities || "",
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ success: true, ...supplier }, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplier", code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

// PATCH /api/suppliers - Update supplier rating
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(updateSupplierRatingSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { supplierId, rating } = result.data;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Calculate new average rating
    const newReviewCount = supplier.reviewCount + 1;
    const newRating =
      (supplier.rating * supplier.reviewCount + rating) / newReviewCount;

    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        rating: Math.round(newRating * 10) / 10,
        reviewCount: newReviewCount,
      },
    });

    return NextResponse.json({ success: true, ...updatedSupplier });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update supplier", code: "UPDATE_ERROR" },
      { status: 500 }
    );
  }
}
