import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  categories,
  productVariants,
  inventory,
  productImages,
} from "@/db/schema";
import { eq } from "drizzle-orm";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// PUT /api/v1/admin/products/[id] - Update product details in Supabase DB
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const {
      name,
      tamilName,
      emoji,
      categoryName,
      price,
      mrp,
      variantName,
      unit,
      stock,
      imageUrl,
      shortDescription,
      isOrganic,
      isBestSeller,
      isFeatured,
      isFreshToday,
      isCutVegetable,
      status,
    } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID missing" }, { status: 400 });
    }

    // 1. Find category ID if updated
    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const foundCategory = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, categoryName))
        .limit(1);
      if (foundCategory.length > 0) {
        categoryId = foundCategory[0].id;
      }
    }

    // 2. Update Product table
    const updateFields: Record<string, any> = {};
    if (name !== undefined) {
      updateFields.name = name;
      updateFields.slug = slugify(name);
    }
    if (tamilName !== undefined) updateFields.tamilName = tamilName;
    if (emoji !== undefined) updateFields.emoji = emoji;
    if (categoryId !== undefined) updateFields.categoryId = categoryId;
    if (shortDescription !== undefined) updateFields.shortDescription = shortDescription;
    if (isOrganic !== undefined) updateFields.isOrganic = !!isOrganic;
    if (isBestSeller !== undefined) updateFields.isBestSeller = !!isBestSeller;
    if (isFeatured !== undefined) updateFields.isFeatured = !!isFeatured;
    if (isFreshToday !== undefined) updateFields.isFreshToday = !!isFreshToday;
    if (isCutVegetable !== undefined) updateFields.isCutVegetable = !!isCutVegetable;
    if (status !== undefined) updateFields.status = status;

    if (Object.keys(updateFields).length > 0) {
      await db.update(products).set(updateFields).where(eq(products.id, productId));
    }

    // 3. Update Product Variant & Pricing
    const variants = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    if (variants.length > 0) {
      const variantId = variants[0].id;
      const numPrice = Number(price);
      const numMrp = Number(mrp || price);
      const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

      const variantUpdateFields: Record<string, any> = {};
      if (price !== undefined) variantUpdateFields.sellingPrice = String(numPrice);
      if (mrp !== undefined) variantUpdateFields.mrp = String(numMrp);
      variantUpdateFields.discountPercentage = String(discount);
      if (variantName !== undefined) variantUpdateFields.variantName = variantName;
      if (unit !== undefined) variantUpdateFields.unit = unit;

      await db
        .update(productVariants)
        .set(variantUpdateFields)
        .where(eq(productVariants.id, variantId));

      // 4. Update Inventory Stock
      if (stock !== undefined) {
        const invRows = await db
          .select({ id: inventory.id })
          .from(inventory)
          .where(eq(inventory.variantId, variantId));

        if (invRows.length > 0) {
          await db
            .update(inventory)
            .set({ availableStock: Number(stock) })
            .where(eq(inventory.id, invRows[0].id));
        } else {
          await db.insert(inventory).values({
            variantId,
            availableStock: Number(stock),
          });
        }
      }
    }

    // 5. Update Primary Product Image
    if (imageUrl !== undefined) {
      const imgRows = await db
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.productId, productId));

      if (imgRows.length > 0) {
        await db
          .update(productImages)
          .set({ imageUrl })
          .where(eq(productImages.id, imgRows[0].id));
      } else if (imageUrl) {
        await db.insert(productImages).values({
          productId,
          imageUrl,
          isPrimary: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully in Supabase DB",
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/products/[id] - Delete product from Supabase DB
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json({ error: "Product ID missing" }, { status: 400 });
    }

    // Delete product (cascades to variants, inventory, and images)
    await db.delete(products).where(eq(products.id, productId));

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully from Supabase DB",
    });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
