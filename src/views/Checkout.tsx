import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
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

const CHECKOUT_DRAFT_STORAGE_KEY = "bendouha_checkout_draft_v1";
const PHONE_DIGITS_LENGTH = 10;

type CheckoutDraft = {
  phone: string;
  firstName: string;
  lastName: string;
  wilayaId: number | "";
  communeId: number | "";
  deliveryType: "home" | "office";
};

const EMPTY_CHECKOUT_DRAFT: CheckoutDraft = {
  phone: "",
  firstName: "",
  lastName: "",
  wilayaId: "",
  communeId: "",
  deliveryType: "home",
};

const parseDraftId = (value: unknown): number | "" => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : "";
};

const normalizePhone = (value: string): string =>
  value.replace(/\D/g, "").slice(0, PHONE_DIGITS_LENGTH);

const isCommuneAvailableForDeliveryType = (
  commune: NonNullable<Wilaya["communes"]>[number],
  type: "home" | "office",
) =>
  type === "home"
    ? commune.home_delivery_enabled !== false
    : commune.office_delivery_enabled !== false;

const readCheckoutDraft = (): CheckoutDraft => {
  if (typeof window === "undefined") {
    return { ...EMPTY_CHECKOUT_DRAFT };
  }

  const raw = window.localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
  if (!raw) {
    return { ...EMPTY_CHECKOUT_DRAFT };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      phone: typeof parsed.phone === "string" ? normalizePhone(parsed.phone) : "",
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
      wilayaId: parseDraftId(parsed.wilayaId),
      communeId: parseDraftId(parsed.communeId),
      deliveryType:
        parsed.deliveryType === "home" || parsed.deliveryType === "office"
          ? parsed.deliveryType
          : "home",
    };
  } catch {
    window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
    return { ...EMPTY_CHECKOUT_DRAFT };
  }
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
  const initialDraft = useMemo(() => readCheckoutDraft(), []);

  const [phone, setPhone] = useState(normalizePhone(initialDraft.phone));
  const [firstName, setFirstName] = useState(initialDraft.firstName);
  const [lastName, setLastName] = useState(initialDraft.lastName);
  const [wilayaId, setWilayaId] = useState<number | "">(initialDraft.wilayaId);
  const [communeId, setCommuneId] = useState<number | "">(initialDraft.communeId);
  const [deliveryType, setDeliveryType] = useState<"home" | "office">(
    initialDraft.deliveryType,
  );
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  const selectedWilaya = useMemo(
    () => wilayas.find((w) => w.id === wilayaId),
    [wilayas, wilayaId],
  );

  const selectedCommuneRaw = useMemo(
    () =>
      selectedWilaya?.communes?.find((commune) => commune.id === communeId),
    [selectedWilaya, communeId],
  );

  const hasHomeDeliveryCommunes = useMemo(
    () =>
      (selectedWilaya?.communes ?? []).some((commune) =>
        isCommuneAvailableForDeliveryType(commune, "home"),
      ),
    [selectedWilaya],
  );

  const hasOfficeDeliveryCommunes = useMemo(
    () =>
      (selectedWilaya?.communes ?? []).some((commune) =>
        isCommuneAvailableForDeliveryType(commune, "office"),
      ),
    [selectedWilaya],
  );

  const filteredCommunes = useMemo(
    () =>
      (selectedWilaya?.communes ?? []).filter((commune) =>
        isCommuneAvailableForDeliveryType(commune, deliveryType),
      ),
    [selectedWilaya, deliveryType],
  );

  const effectiveCommuneId = useMemo(() => {
    if (communeId === "") return "";
    return filteredCommunes.some((commune) => commune.id === communeId)
      ? communeId
      : "";
  }, [communeId, filteredCommunes]);

  const selectedCommune = useMemo(
    () =>
      selectedWilaya?.communes?.find(
        (commune) => commune.id === effectiveCommuneId,
      ),
    [selectedWilaya, effectiveCommuneId],
  );

  const resolveDeliveryType = (
    commune:
      | (NonNullable<Wilaya["communes"]>[number])
      | undefined,
    current: "home" | "office",
  ) => {
    if (!commune) return current;
    if (current === "home" && commune.home_delivery_enabled === false) {
      return commune.office_delivery_enabled ? "office" : current;
    }
    if (current === "office" && commune.office_delivery_enabled === false) {
      return commune.home_delivery_enabled ? "home" : current;
    }
    return current;
  };

  const resolvedDeliveryType = useMemo(
    () => resolveDeliveryType(selectedCommune, deliveryType),
    [selectedCommune, deliveryType],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasDraftData =
      phone.trim().length > 0 ||
      firstName.trim().length > 0 ||
      lastName.trim().length > 0 ||
      wilayaId !== "" ||
      effectiveCommuneId !== "" ||
      resolvedDeliveryType !== "home";

    if (!hasDraftData) {
      window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
      return;
    }

    const payload: CheckoutDraft = {
      phone,
      firstName,
      lastName,
      wilayaId,
      communeId: effectiveCommuneId,
      deliveryType: resolvedDeliveryType,
    };

    window.localStorage.setItem(
      CHECKOUT_DRAFT_STORAGE_KEY,
      JSON.stringify(payload),
    );
  }, [
    phone,
    firstName,
    lastName,
    wilayaId,
    effectiveCommuneId,
    resolvedDeliveryType,
  ]);

  const shipping = useMemo(() => {
    if (!selectedWilaya || !selectedCommune) return null;
    if (selectedWilaya.free_shipping || selectedCommune.free_shipping) return 0;
    if (resolvedDeliveryType === "office") {
      if (selectedCommune.office_delivery_enabled === false) return null;
      return Number(selectedCommune.office_delivery_price ?? 0);
    }
    if (selectedCommune.home_delivery_enabled === false) return null;
    return Number(selectedCommune.home_delivery_price ?? 0);
  }, [selectedWilaya, selectedCommune, resolvedDeliveryType]);

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
    const normalizedPhone = normalizePhone(phone);

    if (!cartId) {
      toast.error(t("cart.notReady"));
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("checkout.requiredNameError"));
      return;
    }
    if (!normalizedPhone) {
      toast.error(t("checkout.requiredPhoneError"));
      return;
    }
    if (normalizedPhone.length !== PHONE_DIGITS_LENGTH) {
      toast.error(
        t("checkout.invalidPhoneError", {
          defaultValue: `Le numero de telephone doit contenir ${PHONE_DIGITS_LENGTH} chiffres.`,
        }),
      );
      return;
    }
    if (!wilayaId) {
      toast.error(t("checkout.requiredWilayaError"));
      return;
    }
    if (!effectiveCommuneId) {
      toast.error(t("checkout.requiredCommuneError"));
      return;
    }
    if (shipping === null) {
      toast.error(t("checkout.deliveryUnavailableError"));
      return;
    }

    createOrder.mutate({
      customer_first_name: firstName.trim(),
      customer_last_name: lastName.trim(),
      customer_phone: normalizedPhone,
      wilaya_id: Number(wilayaId),
      commune_id: Number(effectiveCommuneId),
      delivery_type: resolvedDeliveryType,
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
                type="tel"
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                inputMode="numeric"
                autoComplete="tel"
                maxLength={PHONE_DIGITS_LENGTH}
                pattern="[0-9]{10}"
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
                  const nextWilaya =
                    nextId === ""
                      ? undefined
                      : wilayas.find((zone) => zone.id === nextId);

                  if (nextWilaya) {
                    const nextHasHome = (nextWilaya.communes ?? []).some(
                      (commune) =>
                        isCommuneAvailableForDeliveryType(commune, "home"),
                    );
                    const nextHasOffice = (nextWilaya.communes ?? []).some(
                      (commune) =>
                        isCommuneAvailableForDeliveryType(commune, "office"),
                    );

                    if (
                      deliveryType === "home" &&
                      !nextHasHome &&
                      nextHasOffice
                    ) {
                      setDeliveryType("office");
                    } else if (
                      deliveryType === "office" &&
                      !nextHasOffice &&
                      nextHasHome
                    ) {
                      setDeliveryType("home");
                    }
                  }

                  setWilayaId(nextId);
                  setCommuneId("");
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
                {t("checkout.commune")}
              </label>
              <select
                value={effectiveCommuneId}
                onChange={(e) => {
                  const nextId = e.target.value ? Number(e.target.value) : "";
                  setCommuneId(nextId);
                }}
                className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={!selectedWilaya}
              >
                <option value="">{t("checkout.selectCommune")}</option>
                {filteredCommunes.map((commune) => (
                  <option key={commune.id} value={commune.id}>
                    {commune.display_name}
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
                    checked={resolvedDeliveryType === "home"}
                    onChange={() => {
                      setDeliveryType("home");
                      if (
                        selectedCommuneRaw &&
                        !isCommuneAvailableForDeliveryType(
                          selectedCommuneRaw,
                          "home",
                        )
                      ) {
                        setCommuneId("");
                      }
                    }}
                    disabled={Boolean(selectedWilaya) && !hasHomeDeliveryCommunes}
                  />
                  {t("checkout.homeDelivery")}
                  {Boolean(selectedWilaya) && !hasHomeDeliveryCommunes && (
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
                    checked={resolvedDeliveryType === "office"}
                    onChange={() => {
                      setDeliveryType("office");
                      if (
                        selectedCommuneRaw &&
                        !isCommuneAvailableForDeliveryType(
                          selectedCommuneRaw,
                          "office",
                        )
                      ) {
                        setCommuneId("");
                      }
                    }}
                    disabled={Boolean(selectedWilaya) && !hasOfficeDeliveryCommunes}
                  />
                  {t("checkout.officeDelivery")}
                  {Boolean(selectedWilaya) && !hasOfficeDeliveryCommunes && (
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
              createOrder.isPending ||
              !cartId ||
              shipping === null ||
              !wilayaId ||
              !effectiveCommuneId
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
                  ? t("checkout.selectCommuneForShipping")
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


