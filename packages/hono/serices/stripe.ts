import {
  prisma,
  Prisma,
  Product,
  ProductPrice,
  SubscriptionRecurringInterval,
} from "@repo/database";
import { BaseService } from "./base-service";
import { stripe, Stripe } from "@repo/payments";
import { UserService } from "./user";
import { ProductPriceType } from "@repo/types/";
import { ProductPriceAmountType } from "@repo/types/";
// import { ProductPriceAmountType, ProductPriceType } from "@repo/types/";

const userService = new UserService(prisma);

export class StripeService extends BaseService {
  async createAccount(
    values: Prisma.AccountCreateInput,
  ): Promise<Stripe.Account> {
    try {
      const params: Stripe.AccountCreateParams = {
        business_profile: {
          name: "something",
        },
        type: "express",
        capabilities: {
          transfers: {
            requested: true,
          },
        },
        settings: {
          payouts: {
            schedule: {
              interval: "manual",
            },
          },
        },
      };

      if (values.country !== "US") {
        params["tos_acceptance"] = { service_agreement: "recipient" };
      }

      const account = await stripe.accounts.create(params);

      return account;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async updateAccount(
    accountId: string,
    params: Stripe.AccountUpdateParams,
    name?: string,
  ): Promise<Stripe.Account> {
    try {
      if (name) {
        params["business_profile"] = { name: name };
      }
      const account = await stripe.accounts.update(accountId, params);

      return account;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async retrieveBalance(accountId: string): Promise<Stripe.Balance> {
    try {
      const account = await stripe.accounts.retrieve(accountId);

      if (!account) {
        throw new Error(`stripe acccount does not exists with this id.`);
      }

      const balance = await stripe.balance.retrieve(
        {},
        { stripeAccount: accountId },
      );

      return balance;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async createAccountLink(accountId: string) {
    try {
      const accountlink = await stripe.accountLinks.create({
        account: accountId,
        type: "account_onboarding",
        return_url: "",
        refresh_url: "",
      });

      return accountlink;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async createLoginLink(accountId: string) {
    try {
      const accountlink = await stripe.accounts.createLoginLink(accountId);

      return accountlink;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async transfer({
    destStripeId,
    amount,
    srcTransaction,
    transferGroup,
    metadata,
  }: {
    destStripeId: string;
    amount: number;
    srcTransaction?: string;
    transferGroup?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    try {
      const params: Stripe.TransferCreateParams = {
        amount,
        currency: "USD",
        destination: destStripeId,
      };
      if (srcTransaction) {
        params["source_transaction"] = srcTransaction;
      }

      if (transferGroup) {
        params["transfer_group"] = transferGroup;
      }

      if (metadata) {
        params["metadata"] = metadata;
      }
      const transfer = await stripe.transfers.create(params);

      return transfer;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async getTransfer(transferId: string): Promise<Stripe.Transfer> {
    try {
      const transfer = await stripe.transfers.retrieve(transferId);

      if (!transfer) {
        throw new Error(`transfer does not exists with this id.`);
      }

      return transfer;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async updateTransfer(
    transferId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    try {
      const params: Stripe.TransferUpdateParams = {
        metadata: metadata,
      };
      const transfer = await stripe.transfers.update(transferId, params);

      return transfer;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async getCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId);

      return customer;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async getOrCreateUserCustomer(userId: string) {
    try {
      const user = await userService.getUserById(userId);

      if (!user) {
        throw new Error("user not found with this id.");
      }

      if (user.stripeCustomerId) {
        return this.getCustomer(user.stripeCustomerId);
      }

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.clerkId,
          email: user.email,
        },
      });

      if (!customer) return null;

      // update this user customer id in db      @kamzi
      await userService.updateUser(user.clerkId, {
        stripeCustomerId: customer.id,
      });

      return customer;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  // async getOrCreateOrgCustomer(userId: string) {
  //   try {
  //     if (org.stripeCustomerId) {
  //       return this.getCustomer(org.stripeCustomerId);
  //     }

  //     if (!org.billingEmail) {
  //       throw new Error("Organization billing email is not set.");
  //     }

  //     const customer = await stripe.customers.create({
  //       name: org.slug,
  //       email: org.billingEmail,
  //       metadata: {
  //         name: org.slug,
  //         email: org.billingEmail,
  //       },
  //     });

  //     if (!customer) return null;

  //     await orgService.updateOrg(org.id, {
  //       stripeCustomerId: customer.id,
  //     });

  //     return customer;
  //   } catch (error) {
  //     throw new Error(`Error creating product: ${(error as Error).message}`);
  //   }
  // }

  async listUserPaymentMethods(customerId: string) {
    try {
      const customer = await this.getOrCreateUserCustomer(customerId);

      if (!customer) return null;

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: "card",
      });

      return paymentMethods.data;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async detachPaymentMethod(methodId: string) {
    try {
      return await stripe.paymentMethods.detach(methodId);
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async createUserPortalSession(customerId: string) {
    try {
      const customer = await this.getOrCreateUserCustomer(customerId);

      if (!customer) return null;

      const params: Stripe.BillingPortal.SessionCreateParams = {
        customer: customer.id,
        return_url: "", //todo
      };
      const session = await stripe.billingPortal.sessions.create(params);

      return session;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  // async createOrgPortalSession(customerId: string, org: Organization) {
  //   try {
  //     const customer = await this.getOrCreateOrgCustomer(customerId, org);

  //     if (!customer) return null;

  //     const params: Stripe.BillingPortal.SessionCreateParams = {
  //       customer: customer.id,
  //       return_url: "", //todo
  //     };
  //     const session = await stripe.billingPortal.sessions.create(params);

  //     return session;
  //   } catch (error) {
  //     throw new Error(`Error creating product: ${(error as Error).message}`);
  //   }
  // }

  async createProduct({
    name,
    description,
    metadata,
  }: {
    name: string;
    description?: string;
    metadata: Record<string, string>;
  }) {
    try {
      const params: Stripe.ProductCreateParams = {
        name: name,
        metadata: metadata ?? {},
      };

      if (description) params["description"] = description;

      const product = await stripe.products.create(params);

      return product;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async createPriceForProduct(
    productStripeId: string,
    prices: {
      recurringInterval?: SubscriptionRecurringInterval;
      type: "one_time" | "recurring";
      priceCurrency?: string;
      amountType?: "free" | "fixed" | "custom";
      amount?: number;
      minimumAmount?: number;
      maximumAmount?: number;
      presetAmount?: number;
    }[],
  ): Promise<Stripe.Price[]> {
    const createdPrices: Stripe.Price[] = [];

    for (const price of prices) {
      const params: Stripe.PriceCreateParams = {
        currency: "usd",
        product: productStripeId,
      };

      if (price.type === ProductPriceType.OneTime) {
        switch (price.amountType) {
          case ProductPriceAmountType.Free:
            params.unit_amount = 0;
            break;
          case ProductPriceAmountType.Fixed:
            params.unit_amount = price.amount!;
            break;
          case ProductPriceAmountType.Custom:
            params.custom_unit_amount = {
              enabled: true,
              minimum: price.minimumAmount!,
              maximum: price.maximumAmount!,
              preset: price.presetAmount!,
            };
            break;
        }
      } else if (price.type === ProductPriceType.Recurring) {
        params.recurring = {
          interval:
            price.recurringInterval as Stripe.PriceCreateParams.Recurring.Interval,
        };
        switch (price.amountType) {
          case ProductPriceAmountType.Free:
            params.unit_amount = 0;
            break;
          case ProductPriceAmountType.Fixed:
            params.unit_amount = price.amount!;
            break;
          case ProductPriceAmountType.Custom:
            params.custom_unit_amount = {
              enabled: true,
              minimum: price.minimumAmount!,
              maximum: price.maximumAmount!,
              preset: price.presetAmount!,
            };
            break;
        }
      }

      try {
        const price = await stripe.prices.create({
          ...params,
        });

        createdPrices.push(price);
      } catch (error) {
        throw new Error(`Error creating price: ${(error as Error).message}`);
      }
    }

    return createdPrices;
  }

  async updateProduct(productId: string, params: Stripe.ProductUpdateParams) {
    try {
      const updated = await stripe.products.update(productId, params);

      return updated;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async archiveProduct(productId: string) {
    try {
      const archived = await stripe.products.update(productId, {
        active: false,
      });

      return archived;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async archivePrice(priceId: string) {
    try {
      const archived = await stripe.prices.update(priceId, {
        active: false,
      });

      return archived;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async unArchiveProduct(productId: string) {
    try {
      const archived = await stripe.products.update(productId, {
        active: true,
      });

      return archived;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createCheckoutSession({
    price,
    successUrl,
    customer,
    customerEmail,
    isSubscription,
    isTaxApplicable,
    metadata,
    subscriptionMetadata,
  }: {
    price: string;
    successUrl: string;
    customer?: string;
    customerEmail?: string;
    isSubscription: boolean;
    isTaxApplicable: boolean;
    metadata: Record<string, string>;
    subscriptionMetadata: Record<string, string>;
  }) {
    try {
      const params: Stripe.Checkout.SessionCreateParams = {
        line_items: [
          {
            price: price,
            quantity: 1,
          },
        ],

        success_url: successUrl,
        mode: isSubscription ? "subscription" : "payment",
        automatic_tax: { enabled: isTaxApplicable },
        tax_id_collection: { enabled: isTaxApplicable },
        metadata: metadata ?? {},
      };

      if (isSubscription) {
        params["payment_method_collection"] = "if_required";
        if (subscriptionMetadata) {
          params["subscription_data"] = subscriptionMetadata;
        }
      } else {
        params["invoice_creation"] = {
          enabled: true,
          invoice_data: metadata ?? {},
        };
      }

      if (customer) {
        params["customer"] = "customer";
        params["customer_update"] = { name: "auto", address: "auto" };
      }

      if (customerEmail) {
        params["customer_email"] = customerEmail;
      }

      const session = await stripe.checkout.sessions.create(params);

      return session;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getCheckoutSession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return session;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getCheckoutSessionsByPaymentIntent(paymentIntent: string) {
    try {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent,
      });

      return sessions;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async updateSubscriptionPrice({
    id,
    oldPrice,
    newPrice,
    errorIfComplete,
  }: {
    id: string;
    oldPrice: string;
    newPrice: string;
    errorIfComplete?: Boolean;
  }) {
    try {
      const sub = await stripe.subscriptions.retrieve(id);

      const items = sub.items;
      const newItems: Stripe.SubscriptionItemUpdateParams[] = [];

      items.data.map((item) => {
        if (item.price.id === oldPrice) {
          newItems.push({ price: item.id }); // todo check if there is delete arg
        } else {
          newItems.push({ price: newPrice, quantity: 1 });
        }
      });

      try {
        const updated = await stripe.subscriptions.update(id, {
          items: newItems,
          payment_behavior: errorIfComplete
            ? "error_if_incomplete"
            : "allow_incomplete",
        });

        return updated;
      } catch (error) {
        throw new Error(`Error creating price: ${(error as Error).message}`);
      }
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async cancelSubscription(subId: string) {
    try {
      const sub = await stripe.subscriptions.update(subId, {
        cancel_at_period_end: true,
      });

      return sub;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getInvoice(invoiceId: string) {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId, {
        expand: ["total_tax_amounts.tax_rate"],
      });

      return invoice;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async updateInvoice(invoiceId: string, metadata: Record<string, string>) {
    try {
      const updated = await stripe.invoices.update(invoiceId, metadata);

      return updated;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getBalanceTransaction(id: string) {
    try {
      const balanceTransaction = await stripe.balanceTransactions.retrieve(id);

      return balanceTransaction;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async listBalanceTransactions(
    accountId: string,
    payout: string,
    type: string,
  ) {
    try {
      const params: Stripe.BalanceTransactionListParams = {
        expand: ["data.source"],
        // limit: 100, todo add some limit.
      };

      if (payout) params["payout"] = payout;
      if (type) params["type"] = type;

      const balanceTransaction = await stripe.balanceTransactions.list(params, {
        stripeAccount: accountId,
      });

      return balanceTransaction;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async listRefunds(charge: string) {
    try {
      const params: Stripe.RefundListParams = {
        limit: 100,
      };

      if (charge) params["charge"] = charge;

      // const balanceTransaction = await stripe.refunds.list(params, {
      //   stripeAccount: accountId,
      // });

      const refunds = await stripe.refunds.list(params);

      return refunds;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getCharge(chargeId: string, accountId: string, expand?: string[]) {
    try {
      const charge = await stripe.charges.retrieve(
        chargeId,
        {
          expand: expand ?? undefined,
        },
        {
          stripeAccount: accountId,
        },
      );

      return charge;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getRefund(refundId: string, accountId: string, expand?: string[]) {
    try {
      const refund = await stripe.refunds.retrieve(
        refundId,
        {
          expand: expand ?? undefined,
        },
        {
          stripeAccount: accountId,
        },
      );

      return refund;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getDispute(disputeId: string, accountId: string, expand?: string[]) {
    try {
      const dispute = await stripe.disputes.retrieve(
        disputeId,
        {
          expand: expand ?? undefined,
        },
        {
          stripeAccount: accountId,
        },
      );

      return dispute;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createPayout({
    amount,
    accountId,
    currency,
    metadata,
  }: {
    amount: number;
    accountId: string;
    currency: string;
    metadata: Record<string, string>;
  }) {
    try {
      const payout = await stripe.payouts.create(
        {
          amount,
          currency,
          metadata,
        },
        {
          stripeAccount: accountId,
        },
      );

      return payout;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createPaymentIntent(params: Stripe.PaymentIntentCreateParams) {
    try {
      const paymentIntent = await stripe.payouts.create(params);

      return paymentIntent;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async getPaymentIntent(id: string) {
    try {
      const paymentIntent = await stripe.payouts.retrieve(id);

      return paymentIntent;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createSetupIntent(params: Stripe.SetupIntentCreateParams) {
    try {
      const setupIntent = await stripe.setupIntents.create(params);

      return setupIntent;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createCustomer(params: Stripe.CustomerCreateParams) {
    try {
      const customer = await stripe.customers.create(params);

      return customer;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async updateCustomer(
    id: string,
    params: Stripe.CustomerUpdateParams,
    taxId?: Stripe.CustomerCreateTaxIdParams,
  ) {
    try {
      if (taxId) {
        await stripe.customers.createTaxId(id, taxId);
      }
      const customer = await stripe.customers.update(id, params);

      return customer;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createCustomerSession(customerId: string) {
    try {
      const customerSession = await stripe.customerSessions.create(
        {
          components: {
            payment_element: {
              enabled: true,
              features: {
                payment_method_redisplay: "enabled",
                payment_method_allow_redisplay_filters: [
                  "always",
                  "limited",
                  "unspecified",
                ],
              },
            },
          },
          customer: customerId,
        },
        {},
      );

      return customerSession;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createOutOfBandSubscription({
    customer,
    currency,
    price,
    coupon = null,
    automatic_tax = true,
    metadata = null,
    invoice_metadata = null,
    idempotency_key = null,
  }: {
    customer: string;
    currency: string;
    price: string;
    coupon: string | null;
    automatic_tax: boolean;
    metadata: Record<string, string> | null;
    invoice_metadata: Record<string, string> | null;
    idempotency_key: string | null;
  }): Promise<{ subscription: Stripe.Subscription; invoice: Stripe.Invoice }> {
    const params: Stripe.SubscriptionCreateParams = {
      customer,
      currency,
      automatic_tax: { enabled: automatic_tax },
      metadata: metadata ?? {},
      collection_method: "send_invoice",
      items: [{ price, quantity: 1 }],
      days_until_due: 0,
      expand: ["latest_invoice"],
    };

    if (coupon) params["discounts"] = [{ coupon }];
    try {
      const subscription = await stripe.subscriptions.create(params);

      if (!subscription.latest_invoice) {
        throw new Error(
          `Missing latest invoice for subscription ID: ${subscription.id}`,
        );
      }

      const latestInvoiceId = subscription.latest_invoice as string;

      const invoice = await this.payOutofBandSubscriptionInvoice({
        invoiceId: latestInvoiceId,
        idempotency_key,
        metadata,
      });

      return { subscription, invoice };
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async setSubscriptionToChargeAutomatically({
    subscriptionId,
    paymentMethod = null,
    idempotency_key = null,
  }: {
    subscriptionId: string;
    paymentMethod: string | null;
    idempotency_key: string | null;
  }): Promise<Stripe.Subscription> {
    try {
      const params: Stripe.SubscriptionUpdateParams = {
        collection_method: "charge_automatically",
      };

      if (paymentMethod) params["default_payment_method"] = paymentMethod;

      let subscription = await stripe.subscriptions.update(
        subscriptionId,
        params,
        {
          idempotencyKey: idempotency_key ?? undefined,
        },
      );

      return subscription;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async updateOutofBandSubscription({
    subscriptionId,
    oldPrice,
    newPrice,
    coupon = null,
    automatic_tax = true,
    metadata = null,
    invoice_metadata = null,
    idempotency_key = null,
  }: {
    subscriptionId: string;
    oldPrice: string;
    newPrice: string;
    coupon: string | null;
    automatic_tax: boolean;
    metadata: Record<string, string> | null;
    invoice_metadata: Record<string, string> | null;
    idempotency_key: string | null;
  }): Promise<{ subscription: Stripe.Subscription; invoice: Stripe.Invoice }> {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);

    const params: Stripe.SubscriptionUpdateParams = {
      collection_method: "send_invoice",
      automatic_tax: { enabled: automatic_tax },
      days_until_due: 0,
    };

    if (coupon) params["discounts"] = [{ coupon }];
    if (metadata) params["metadata"] = metadata;

    const items = sub.items;
    const newItems: Stripe.SubscriptionItemUpdateParams[] = [];

    items.data.map((item) => {
      if (item.price.id === oldPrice) {
        newItems.push({ price: item.id }); // todo check if there is delete arg
      } else {
        newItems.push({ price: newPrice, quantity: 1 });
      }
    });

    params["items"] = newItems;

    try {
      const subscription = await stripe.subscriptions.update(
        subscriptionId,
        params,
        {
          idempotencyKey: idempotency_key ?? undefined,
        },
      );

      if (!subscription.latest_invoice) {
        throw new Error(
          `Missing latest invoice for subscription ID: ${subscription.id}`,
        );
      }

      const latestInvoiceId = subscription.latest_invoice as string;

      const invoice = await this.payOutofBandSubscriptionInvoice({
        invoiceId: latestInvoiceId,
        idempotency_key,
        metadata,
      });

      return { subscription, invoice };
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async payOutofBandSubscriptionInvoice({
    invoiceId,
    metadata = null,
    idempotency_key = null,
  }: {
    invoiceId: string;
    metadata: Record<string, string> | null;
    idempotency_key: string | null;
  }): Promise<Stripe.Invoice> {
    try {
      const params: Stripe.InvoiceUpdateParams = {
        metadata: metadata ?? {},
      };

      let invoice = await stripe.invoices.update(invoiceId, params, {
        idempotencyKey: idempotency_key
          ? `${idempotency_key}_update_invoice`
          : undefined,
      });

      invoice = await stripe.invoices.finalizeInvoice(
        invoiceId,
        {},
        {
          idempotencyKey: idempotency_key
            ? `${idempotency_key}_finalize_invoice`
            : undefined,
        },
      );

      if (invoice.status === "open") {
        await stripe.invoices.pay(
          invoiceId,
          {
            paid_out_of_band: true,
          },
          {
            idempotencyKey: idempotency_key
              ? `${idempotency_key}_pay_invoice`
              : undefined,
          },
        );
      }

      return invoice;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createOfBandInvoice({
    customer,
    currency,
    price,
    coupon = null,
    automatic_tax = true,
    metadata = null,
    invoice_metadata = null,
    idempotency_key = null,
  }: {
    customer: string;
    currency: string;
    price: string;
    coupon: string | null;
    automatic_tax: boolean;
    metadata: Record<string, string> | null;
    invoice_metadata: Record<string, string> | null;
    idempotency_key: string | null;
  }): Promise<Stripe.Invoice> {
    const params: Stripe.InvoiceCreateParams = {
      auto_advance: true,
      customer,
      currency,
      automatic_tax: { enabled: automatic_tax },
      metadata: metadata ?? {},
      collection_method: "send_invoice",
      days_until_due: 0,
    };

    if (coupon) params["discounts"] = [{ coupon }];
    try {
      let invoice = await stripe.invoices.create(params, {
        idempotencyKey: idempotency_key
          ? `${idempotency_key}_invoice`
          : undefined,
      });

      const invoiceId = invoice.id;

      const invoiceItem = await stripe.invoiceItems.create(
        {
          customer,
          currency,
          invoice: invoiceId,
          price,
          quantity: 1,
        },
        {
          idempotencyKey: idempotency_key
            ? `${idempotency_key}_invoiceItem`
            : undefined,
        },
      );

      invoice = await stripe.invoices.finalizeInvoice(
        invoiceId,
        {},
        {
          idempotencyKey: idempotency_key
            ? `${idempotency_key}_finalize_invoice`
            : undefined,
        },
      );

      if (invoice.status === "open") {
        await stripe.invoices.pay(
          invoiceId,
          { paid_out_of_band: true },
          {
            idempotencyKey: idempotency_key
              ? `${idempotency_key}_pay_invoice`
              : undefined,
          },
        );
      }

      return invoice;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createTaxCalculation(
    params: Stripe.Tax.CalculationCreateParams,
  ): Promise<Stripe.Tax.Calculation> {
    try {
      const taxCalculation = await stripe.tax.calculations.create(params);

      return taxCalculation;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async createCoupon(
    params: Stripe.CouponCreateParams,
  ): Promise<Stripe.Coupon> {
    try {
      const coupon = await stripe.coupons.create(params);

      return coupon;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async updateCoupon(
    id: string,
    params: Stripe.CouponCreateParams,
  ): Promise<Stripe.Coupon> {
    try {
      const coupon = await stripe.coupons.update(id, params);

      return coupon;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }

  async deleteCoupen(id: string): Promise<Stripe.DeletedCoupon> {
    try {
      const coupon = await stripe.coupons.del(id);

      return coupon;
    } catch (error) {
      throw new Error(`Error creating price: ${(error as Error).message}`);
    }
  }
}
