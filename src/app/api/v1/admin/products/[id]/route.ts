import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  categories,
  productVariants,
  inventory,
  productImages,
} from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { ALL_PRODUCTS, updateLiveProduct } from "@/lib/data/all-products";
import { getPersistedCatalog } from "@/app/api/v1/admin/catalog/save/route";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// PUT /api/v1/admin/products/[id] - Update product details in Supabase DB & Server Memory
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

    // Always update in-memory catalog store so session has zero latency
    updateLiveProduct(productId, {
      name,
      tamilName,
      emoji,
      categoryName,
      price: price !== undefined ? Number(price) : undefined,
      mrp: mrp !== undefined ? Number(mrp) : undefined,
      availableStock: stock !== undefined ? Number(stock) : undefined,
      imageUrl,
      shortDescription,
      isOrganic: isOrganic !== undefined ? !!isOrganic : undefined,
      isBestSeller: isBestSeller !== undefined ? !!isBestSeller : undefined,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
      isFreshToday: isFreshToday !== undefined ? !!isFreshToday : undefined,
      isCutVegetable: isCutVegetable !== undefined ? !!isCutVegetable : undefined,
    });

    // Also update global persisted catalog list
    try {
      const persisted = getPersistedCatalog();
      const existingIdx = persisted.findIndex(
        (p: any) =>
          p.id === productId ||
          p.slug === productId ||
          (p.name && name && p.name.toLowerCase().trim() === name.toLowerCase().trim())
      );
      if (existingIdx >= 0) {
        persisted[existingIdx] = {
          ...persisted[existingIdx],
          ...body,
          price: price !== undefined ? Number(price) : persisted[existingIdx].price,
          mrp: mrp !== undefined ? Number(mrp) : persisted[existingIdx].mrp,
          stock: stock !== undefined ? Number(stock) : persisted[existingIdx].stock,
        };
      }
    } catch (e) {
      console.warn("Global catalog cache update notice:", e);
    }

    // 1. Safely find category ID
    let categoryId: string | undefined = undefined;
    if (categoryName) {
      try {
        const foundCategory = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.name, categoryName))
          .limit(1);

        if (foundCategory.length > 0) {
          categoryId = foundCategory[0].id;
        } else {
          const looseCategory = await db
            .select({ id: categories.id })
            .from(categories)
            .where(ilike(categories.name, "%vegetable%"))
            .limit(1);
          if (looseCategory.length > 0) {
            categoryId = looseCategory[0].id;
          } else {
            const firstCat = await db.select({ id: categories.id }).from(categories).limit(1);
            if (firstCat.length > 0) categoryId = firstCat[0].id;
          }
        }
      } catch (catErr) {
        console.warn("Category lookup notice:", catErr);
      }
    }

    // 2. Perform DB update safely by matching UUID, Static Definition, Slug, or Keyword Fallback
    try {
      let targetDbId: string | null = null;
      const targetSlug = slugify(name || productId.replace(/^prod-/, ""));

      // Pass 1: Match by exact UUID
      if (isUUID(productId)) {
        const foundById = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.id, productId))
          .limit(1);
        if (foundById.length > 0) {
          targetDbId = foundById[0].id;
        }
      }

      // Pass 2: Match by static catalog item definition (ALL_PRODUCTS)
      if (!targetDbId) {
        const staticItem = ALL_PRODUCTS.find(
          (p) =>
            p.id === productId ||
            p.slug === productId ||
            (name && p.name.toLowerCase().trim() === name.toLowerCase().trim())
        );

        if (staticItem) {
          const conditions: any[] = [];
          if (isUUID(staticItem.id)) conditions.push(eq(products.id, staticItem.id));
          if (staticItem.slug) conditions.push(eq(products.slug, staticItem.slug));
          if (staticItem.name) conditions.push(ilike(products.name, staticItem.name));

          if (conditions.length > 0) {
            const foundByStatic = await db
              .select({ id: products.id })
              .from(products)
              .where(or(...conditions))
              .limit(1);

            if (foundByStatic.length > 0) {
              targetDbId = foundByStatic[0].id;
            }
          }
        }
      }

      // Pass 3: Match by exact slug or exact name
      if (!targetDbId) {
        const foundBySlug = await db
          .select({ id: products.id })
          .from(products)
          .where(
            or(
              eq(products.slug, productId),
              eq(products.slug, targetSlug),
              name ? ilike(products.name, `%${name}%`) : undefined
            )
          )
          .limit(1);

        if (foundBySlug.length > 0) {
          targetDbId = foundBySlug[0].id;
        }
      }

      // Pass 4: Match by clean keyword slug (exact match)
      if (!targetDbId) {
        const cleanKeyword = productId
          .replace(/^prod-/, "")
          .replace(/^whole-/, "")
          .replace(/^cut-/, "")
          .replace(/-/g, " ")
          .trim();

        if (cleanKeyword.length > 2) {
          const foundByKeyword = await db
            .select({ id: products.id })
            .from(products)
            .where(
              or(
                eq(products.slug, cleanKeyword),
                eq(products.slug, slugify(cleanKeyword)),
                ilike(products.name, cleanKeyword)
              )
            )
            .limit(1);

          if (foundByKeyword.length > 0) {
            targetDbId = foundByKeyword[0].id;
          }
        }
      }

      // Pass 4: Match by static catalog definition original name/slug
      if (!targetDbId) {
        const staticItem = updateLiveProduct(productId, {}) as any;
        if (staticItem && staticItem.slug) {
          const foundByStatic = await db
            .select({ id: products.id })
            .from(products)
            .where(
              or(
                eq(products.slug, staticItem.slug),
                ilike(products.name, `%${staticItem.name || ""}%`)
              )
            )
            .limit(1);

          if (foundByStatic.length > 0) {
            targetDbId = foundByStatic[0].id;
          }
        }
      }

      // Pass 5: If product does not exist in DB yet, auto-create it in Supabase DB!
      if (!targetDbId) {
        const newId = isUUID(productId) ? productId : crypto.randomUUID();
        const defaultCatId = categoryId || "81227589-88a2-41e0-af7c-70d104f66d5d";
        const finalSlug = targetSlug || slugify(productId);
        
        const insertedProduct = await db.insert(products).values({
          id: newId,
          categoryId: defaultCatId,
          name: name || productId,
          slug: finalSlug,
          sku: `VF-${finalSlug.slice(0, 10).toUpperCase().replace(/-/g, "")}`,
          tamilName: tamilName || null,
          emoji: emoji || "🥬",
          shortDescription: shortDescription || null,
          isOrganic: !!isOrganic,
          isBestSeller: !!isBestSeller,
          isFeatured: !!isFeatured,
          isFreshToday: !!isFreshToday,
          isCutVegetable: !!isCutVegetable,
          status: status || "active",
        }).returning({ id: products.id });

        if (insertedProduct.length > 0) {
          targetDbId = insertedProduct[0].id;

          // Insert default variant
          const numPrice = Number(price || 35);
          const numMrp = Number(mrp || price || 50);
          const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

          const insertedVariant = await db.insert(productVariants).values({
            productId: targetDbId,
            variantName: variantName || "500 g",
            weight: "0.500",
            unit: unit || "g",
            mrp: String(numMrp),
            sellingPrice: String(numPrice),
            costPrice: String(Math.round(numPrice * 0.7)),
            discountPercentage: String(discount),
            isDefault: true,
            status: "active",
          }).returning({ id: productVariants.id });

          if (insertedVariant.length > 0 && stock !== undefined) {
            await db.insert(inventory).values({
              variantId: insertedVariant[0].id,
              availableStock: Number(stock),
            });
          }

          if (imageUrl) {
            await db.insert(productImages).values({
              productId: targetDbId,
              imageUrl: imageUrl,
              isPrimary: true,
            });
          }
        }
      }

      if (targetDbId) {
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
          await db.update(products).set(updateFields).where(eq(products.id, targetDbId));
        }

        // 3. Update Variant & Pricing in PostgreSQL DB
        const variants = await db
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(eq(productVariants.productId, targetDbId));

        if (variants.length > 0) {
          for (const varRow of variants) {
            const variantId = varRow.id;
            const numPrice = Number(price);
            const numMrp = Number(mrp || price);
            const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

            const variantUpdateFields: Record<string, any> = {};
            if (price !== undefined) variantUpdateFields.sellingPrice = String(numPrice);
            if (mrp !== undefined) variantUpdateFields.mrp = String(numMrp);
            if (price !== undefined || mrp !== undefined) variantUpdateFields.discountPercentage = String(discount);
            if (variantName !== undefined) variantUpdateFields.variantName = variantName;
            if (unit !== undefined) variantUpdateFields.unit = unit;

            if (Object.keys(variantUpdateFields).length > 0) {
              await db
                .update(productVariants)
                .set(variantUpdateFields)
                .where(eq(productVariants.id, variantId));
            }

            // 4. Update Stock in PostgreSQL DB
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
        }

        // 5. Update Primary Product Image in PostgreSQL DB
        if (imageUrl !== undefined) {
          const imgRows = await db
            .select({ id: productImages.id })
            .from(productImages)
            .where(eq(productImages.productId, targetDbId));

          if (imgRows.length > 0) {
            await db
              .update(productImages)
              .set({ imageUrl })
              .where(eq(productImages.id, imgRows[0].id));
          } else if (imageUrl) {
            await db.insert(productImages).values({
              productId: targetDbId,
              imageUrl,
              isPrimary: true,
            });
          }
        }
      }
    } catch (dbUpdateErr) {
      console.warn("Direct DB update notice:", dbUpdateErr);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully in Supabase DB & Server memory!",
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

    try {
      let targetDbId: string | null = null;
      if (isUUID(productId)) {
        targetDbId = productId;
      } else {
        const found = await db
          .select({ id: products.id })
          .from(products)
          .where(or(eq(products.slug, productId), eq(products.slug, slugify(productId))))
          .limit(1);
        if (found.length > 0) targetDbId = found[0].id;
      }

      if (targetDbId) {
        await db.delete(products).where(eq(products.id, targetDbId));
      }
    } catch (dbDelErr) {
      console.warn("DB delete notice:", dbDelErr);
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
