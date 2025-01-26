import {
  type PaginationParams,
  QueryUtils,
  type SortingParams,
} from "@/utils/query";
import {
  type Benefit,
  type Prisma,
  Product,
  type ProductBenefit,
  SubscriptionRecurringInterval,
  prisma,
} from "@repo/database";
import type { Stripe } from "@repo/payments";
import { BaseService } from "./base-service";
import { StripeService } from "./stripe";
import { StoreService } from "./store";

const stripeService = new StripeService(prisma);

export class ProductService extends BaseService {
  listProducts(
    params: PaginationParams &
      SortingParams<keyof Prisma.ProductOrderByWithRelationInput>,
    storeId: string,
  ) {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    const query = this.prisma.product.findMany({
      where: {
        storeId,
      },
      include: {
        prices: {
          where: {
            isArchived: false,
          },
          select: {
            id: true,
            amountType: true,
          },
        },
      },
      skip,
      take,
      orderBy,
    });

    return query;
  }

  async getProduct(id: string) {
    try {
      const query = await this.prisma.product.findFirst({
        where: {
          id,
        },
        include: {
          prices: true,
          productMedias: true,
          productCustomFields: true,
        },
      });

      return query;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async getEmbed(id: string) {
    try {
      const query = await this.prisma.product.findFirst({
        where: {
          id,
          isArchived: false,
        },
        include: {
          productMedias: true,
        },
      });

      return query;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async getLoaded(id: string) {
    try {
      const query = await this.prisma.product.findFirst({
        where: {
          id,
        },
        include: {
          productMedias: true,
          productCustomFields: true,
        },
      });

      return query;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async createProduct(
    storeId: string,
    values: {
      name: string;
      description: string;
    } & {
      prices: {
        recurringInterval?: SubscriptionRecurringInterval;
        type: "one_time" | "recurring";
        priceCurrency?: string;
        amountType?: "free" | "fixed" | "custom";
        amount?: number;
        minimumAmount?: number;
        maximumAmount?: number;
        presetAmount?: number;
      }[];
    },
  ): Promise<Product> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const product = await tx.product.create({
            data: {
              name: values.name,
              description: values.description,
              store: {
                connect: {
                  id: storeId,
                },
              },
              // productMedias: values.medias.length
              //   ? {
              //       createMany: {
              //         data: values.medias,
              //       },
              //     }
              //   : undefined,
              // productCustomFields: values.customFields.length
              //   ? {
              //       connect: values.customFields.map((field) => ({
              //         id: field.id,
              //       })),
              //     }
              //   : undefined,
            },
            include: {
              prices: true,
              productMedias: true,
              productCustomFields: true,
            },
          });

          if (!product) {
            throw new Error("Failed to create the product in the database.");
          }

          const stripeProduct = await stripeService.createProduct({
            name: product.name,
            description: product.description ?? "",
            metadata: {
              productId: product.id,
            },
          });

          if (!stripeProduct || !stripeProduct.id) {
            throw new Error("Failed to create Stripe product.");
          }

          const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: {
              stripeProductId: stripeProduct.id,
            },
            include: {
              prices: true,
              productMedias: true,
              productCustomFields: true,
            },
          });

          const prices = await stripeService.createPriceForProduct(
            updatedProduct.stripeProductId!,
            values.prices,
          );

          if (!prices) throw new Error("Failed to create Stripe prices.");

          await tx.productPrice.createMany({
            data: prices.map((price) => ({
              stripePriceId: price.id,
              maximumAmount: price.custom_unit_amount?.minimum!,
              minimumAmount: price.custom_unit_amount?.minimum!,
              presetAmount: price.custom_unit_amount?.preset!,
              productId: product.id,
              priceCurrency: price.currency,
              priceAmount: price.unit_amount,
              recurringInterval: price.recurring
                ?.interval as SubscriptionRecurringInterval,
              type: price.type,
              amountType: this.mapAmountType(price),
            })),
          });

          return updatedProduct;
        },
        { timeout: 10000 },
      );
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  // async updateProduct(
  //   id: string,
  //   values: Prisma.ProductUpdateInput & {
  //     prices?: Prisma.ProductPriceCreateManyProductInput[];
  //     medias?: Prisma.ProductMediaCreateManyProductInput[];
  //     customFields?: Prisma.ProductCustomFieldCreateManyProductInput[];
  //   },
  // ): Promise<Product> {
  //   const {
  //     productBenefits,
  //     productCustomFields,
  //     discountProducts,
  //     productMedias,
  //     prices,
  //     medias,
  //     customFields,
  //     ...productData
  //   } = values;

  //   try {
  //     return await this.prisma.$transaction(async (tx) => {
  //       const existingProduct = await tx.product.findUnique({
  //         where: { id },
  //         include: {
  //           prices: true,
  //           productMedias: true,
  //           productCustomFields: true,
  //         },
  //       });

  //       if (!existingProduct) {
  //         throw new Error("Product not found.");
  //       }

  //       const updatedProduct = await tx.product.update({
  //         where: { id },
  //         data: {
  //           ...productData,
  //           productMedias:
  //             medias && medias.length
  //               ? {
  //                   deleteMany: {},
  //                   createMany: {
  //                     data: medias,
  //                   },
  //                 }
  //               : undefined,
  //           productCustomFields:
  //             customFields && customFields.length
  //               ? {
  //                   connect: customFields.map((field) => ({
  //                     id: field.id,
  //                   })),
  //                 }
  //               : undefined,
  //         },
  //         include: {
  //           prices: true,
  //           productMedias: true,
  //           productCustomFields: true,
  //         },
  //       });

  //       if (!updatedProduct) {
  //         throw new Error("Failed to update the product in the database.");
  //       }

  //       const stripeProduct = await stripeService.updateProduct(
  //         existingProduct.stripeProductId!,
  //         {
  //           name: updatedProduct.name,
  //           description: updatedProduct.description ?? "",
  //           metadata: {
  //             productId: updatedProduct.id,
  //           },
  //         },
  //       );

  //       if (!stripeProduct || !stripeProduct.id) {
  //         throw new Error("Failed to update Stripe product.");
  //       }

  //       if (prices && prices.length) {
  //         const stripePrices =
  //           await stripeService.createPriceForProduct(updatedProduct);

  //         if (!stripePrices) {
  //           throw new Error("Failed to create or update Stripe prices.");
  //         }

  //         await tx.productPrice.deleteMany({
  //           where: { productId: updatedProduct.id },
  //         });

  //         await tx.productPrice.createMany({
  //           data: stripePrices.map((price) => ({
  //             stripePriceId: price.id,
  //             maximumAmount: price.custom_unit_amount?.maximum ?? null,
  //             minimumAmount: price.custom_unit_amount?.minimum ?? null,
  //             presetAmount: price.custom_unit_amount?.preset ?? null,
  //             productId: updatedProduct.id,
  //             priceCurrency: price.currency,
  //             priceAmount: price.unit_amount,
  //             recurringInterval: price.recurring?.interval ?? null,
  //             type:
  //               price.type === "recurring"
  //                 ?'recurring'
  //                 : 'one_time',
  //             amountType: this.mapAmountType(price),
  //           })),
  //         });
  //       }

  //       return updatedProduct;
  //     });
  //   } catch (error) {
  //     throw new Error(`Error updating product: ${(error as Error).message}`);
  //   }
  // }
  updateBenefits(
    product: Prisma.ProductSelect,
    benefits: ProductBenefit["id"][],
  ) {
    const prev = product.productBenefits;
    const newBenefits: Benefit[] = [];
    const newProductBenefits: ProductBenefit[] = [];

    try {
    } catch {}
  }
  private mapAmountType(price: Stripe.Price) {
    if (price.unit_amount === 0) {
      return "free";
    }
    if (price.unit_amount !== null) {
      return "fixed";
    }
    if (price.custom_unit_amount) {
      return "custom";
    }
    throw new Error("Unable to determine amount type for price.");
  }
}
