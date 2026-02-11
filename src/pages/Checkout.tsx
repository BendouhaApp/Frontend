import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useCart } from "@/hooks/useCart";
import type { ApiResponse, CreateOrderPayload, Order, Wilaya } from "@/types/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calcSubtotal, mapCartItems } from "@/lib/cart";
import { toast } from "sonner";

type CreateOrderResponse = {
  message?: string;
  data: Order;
  pricing?: {
    items_total: number;
    shipping: number;
    total: number;
  };
};

type OrderSummary = {
  id: string;
  items: ReturnType<typeof mapCartItems>;
  pricing?: CreateOrderResponse["pricing"];
};

export function Checkout() {
  const { t } = useTranslation();
  const { cart, cartId, isLoading: isCartLoading, refetch } = useCart();
  const { data: wilayaResponse, isLoading: isWilayasLoading } = useGet<
    ApiResponse<Wilaya[]>
  >({
    path: "wilayas",
    options: {
      staleTime: 1000 * 60 * 10,
    },
  });

  const wilayas = useMemo(() => wilayaResponse?.data ?? [], [wilayaResponse?.data]);
  const items = mapCartItems(cart?.card_items ?? []);
  const subtotal = calcSubtotal(items);

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [wilayaId, setWilayaId] = useState<number | "">("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  const selectedWilaya = useMemo(
    () => wilayas.find((w) => w.id === wilayaId),
    [wilayas, wilayaId],
  );

  const shipping = useMemo(() => {
    if (!selectedWilaya) return null;
    if (selectedWilaya.free_shipping) return 0;
    const baseRate =
      selectedWilaya.default_rate !== undefined
        ? Number(selectedWilaya.default_rate ?? 0)
        : null;
    if (deliveryType === "office") {
      if (!selectedWilaya.office_delivery_enabled) return null;
      const officePrice = Number(selectedWilaya.office_delivery_price ?? 0);
      return officePrice > 0 ? officePrice : Number(baseRate ?? officePrice);
    }
    if (!selectedWilaya.home_delivery_enabled) return null;
    const homePrice = Number(selectedWilaya.home_delivery_price ?? 0);
    return homePrice > 0 ? homePrice : Number(baseRate ?? homePrice);
  }, [selectedWilaya, deliveryType]);

  const resolveDeliveryType = (
    wilaya: (typeof wilayas)[number] | undefined,
    current: "home" | "office",
  ) => {
    if (!wilaya) return current;
    if (current === "home" && wilaya.home_delivery_enabled === false) {
      return wilaya.office_delivery_enabled ? "office" : current;
    }
    if (current === "office" && wilaya.office_delivery_enabled === false) {
      return wilaya.home_delivery_enabled ? "home" : current;
    }
    return current;
  };

  const total = subtotal + (shipping ?? 0);

  const createOrder = usePost<CreateOrderPayload, CreateOrderResponse>({
    path: cartId ? `orders?cart_id=${cartId}` : "orders?cart_id=",
    method: "post",
    successMessage: t("checkout.orderPlacedSuccess"),
    errorMessage: t("checkout.orderPlacedError"),
    options: {
      onSuccess: (response) => {
        if (response?.data?.id) {
          setOrderSummary({
            id: response.data.id,
            items,
            pricing: response.pricing,
          });
        }
        refetch();
      },
    },
  });

  const orderId = createOrder.data?.data?.id ?? null;
  const resolvedOrderSummary =
    orderSummary ??
    (orderId
      ? {
          id: orderId,
          items,
          pricing: createOrder.data?.pricing,
        }
      : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartId) {
      toast.error(t("cart.notReady"));
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("checkout.requiredNameError"));
      return;
    }
    if (!phone.trim()) {
      toast.error(t("checkout.requiredPhoneError"));
      return;
    }
    if (!wilayaId) {
      toast.error(t("checkout.requiredWilayaError"));
      return;
    }
    if (shipping === null) {
      toast.error(t("checkout.deliveryUnavailableError"));
      return;
    }

    createOrder.mutate({
      customer_first_name: firstName.trim(),
      customer_last_name: lastName.trim(),
      customer_phone: phone.trim(),
      wilaya_id: Number(wilayaId),
      delivery_type: deliveryType,
    });
  };

  if (isCartLoading || isWilayasLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <p className="text-neutral-600">{t("checkout.loading")}</p>
        </div>
      </div>
    );
  }

  const currency = t("common.currency");

  if (resolvedOrderSummary) {
    const summaryItems = resolvedOrderSummary.items ?? [];
    const summarySubtotal =
      resolvedOrderSummary.pricing?.items_total != null
        ? Number(resolvedOrderSummary.pricing.items_total)
        : calcSubtotal(summaryItems);
    const summaryShipping =
      resolvedOrderSummary.pricing?.shipping != null
        ? Number(resolvedOrderSummary.pricing.shipping)
        : shipping ?? 0;
    const summaryTotal =
      resolvedOrderSummary.pricing?.total != null
        ? Number(resolvedOrderSummary.pricing.total)
        : summarySubtotal + summaryShipping;

    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h1 className="text-2xl font-semibold text-neutral-900">
                {t("checkout.orderConfirmedTitle")}
              </h1>
              <p className="mt-2 text-neutral-600">
                {t("checkout.orderConfirmedBody")}
              </p>
              <p className="mt-4 text-sm text-neutral-500">
                {t("checkout.orderIdLabel")}{" "}
                <span className="font-medium">
                  {resolvedOrderSummary.id}
                </span>
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link to="/shop">{t("checkout.continueShopping")}</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {t("checkout.orderSummary")}
              </h2>

              <div className="mt-6 space-y-4">
                {summaryItems.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    {t("checkout.cartEmptyBody")}
                  </p>
                ) : (
                  summaryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {t("checkout.qty")} {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        {(item.price * item.quantity).toFixed(2)} {currency}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>{t("common.subtotal")}</span>
                  <span className="font-medium text-neutral-900">
                    {summarySubtotal.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>{t("common.shipping")}</span>
                  <span className="font-medium text-neutral-900">
                    {summaryShipping.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900">
                  <span>{t("common.total")}</span>
                  <span>
                    {summaryTotal.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {t("checkout.cartEmptyTitle")}
            </h1>
            <p className="mt-2 text-neutral-600">
              {t("checkout.cartEmptyBody")}
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/shop">{t("checkout.backToShop")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200 bg-neutral-50/60">
        <div className="container mx-auto px-4 py-10 md:px-6">
          <h1 className="text-3xl font-semibold text-neutral-900">
            {t("checkout.title")}
          </h1>
          <p className="mt-2 text-neutral-600">
            {t("checkout.subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-neutral-900">
            {t("checkout.deliveryInformation")}
          </h2>

          <div className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  {t("checkout.firstName")}
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={t("checkout.firstNamePlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  {t("checkout.lastName")}
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={t("checkout.lastNamePlaceholder")}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("checkout.phoneNumber")}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t("checkout.phonePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("checkout.wilaya")}
              </label>
              <select
                value={wilayaId}
                onChange={(e) => {
                  const nextId = e.target.value ? Number(e.target.value) : "";
                  setWilayaId(nextId);
                  const nextWilaya = wilayas.find((w) => w.id === nextId);
                  setDeliveryType((prev) => resolveDeliveryType(nextWilaya, prev));
                }}
                className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">{t("checkout.selectWilaya")}</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.id} value={wilaya.id}>
                    {wilaya.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("checkout.deliveryType")}
              </label>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="home"
                    checked={deliveryType === "home"}
                    onChange={() => setDeliveryType("home")}
                    disabled={selectedWilaya?.home_delivery_enabled === false}
                  />
                  {t("checkout.homeDelivery")}
                  {selectedWilaya?.home_delivery_enabled === false && (
                    <span className="text-xs text-neutral-400">
                      {t("checkout.notAvailable")}
                    </span>
                  )}
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="office"
                    checked={deliveryType === "office"}
                    onChange={() => setDeliveryType("office")}
                    disabled={selectedWilaya?.office_delivery_enabled === false}
                  />
                  {t("checkout.officeDelivery")}
                  {selectedWilaya?.office_delivery_enabled === false && (
                    <span className="text-xs text-neutral-400">
                      {t("checkout.notAvailable")}
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-8 w-full rounded-full"
            disabled={
              createOrder.isPending || !cartId || shipping === null || !wilayaId
            }
          >
            {createOrder.isPending
              ? t("checkout.placingOrder")
              : t("checkout.placeOrder")}
          </Button>
        </form>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            {t("checkout.orderSummary")}
          </h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {t("checkout.qty")} {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {(item.price * item.quantity).toFixed(2)} {currency}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex items-center justify-between text-neutral-600">
              <span>{t("common.subtotal")}</span>
              <span className="font-medium text-neutral-900">
                {subtotal.toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>{t("common.shipping")}</span>
              <span
                className={cn(
                  "font-medium",
                  shipping === 0 ? "text-green-600" : "text-neutral-900",
                )}
              >
                {shipping === null
                  ? t("checkout.selectDelivery")
                  : `${shipping.toFixed(2)} ${currency}`}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900">
              <span>{t("common.total")}</span>
              <span>
                {total.toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
