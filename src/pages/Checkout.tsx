import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

export function Checkout() {
  const { cart, cartId, isLoading: isCartLoading, refetch } = useCart();
  const { data: wilayaResponse, isLoading: isWilayasLoading } = useGet<
    ApiResponse<Wilaya[]>
  >({
    path: "wilayas",
    options: {
      staleTime: 1000 * 60 * 10,
    },
  });

  const wilayas = wilayaResponse?.data ?? [];
  const items = mapCartItems(cart?.card_items ?? []);
  const subtotal = calcSubtotal(items);

  const [phone, setPhone] = useState("");
  const [wilayaId, setWilayaId] = useState<number | "">("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [orderId, setOrderId] = useState<string | null>(null);

  const selectedWilaya = useMemo(
    () => wilayas.find((w) => w.id === wilayaId),
    [wilayas, wilayaId],
  );

  const shipping = useMemo(() => {
    if (!selectedWilaya) return null;
    if (selectedWilaya.free_shipping) return 0;
    if (deliveryType === "office") {
      if (!selectedWilaya.office_delivery_enabled) return null;
      return Number(selectedWilaya.office_delivery_price ?? 0);
    }
    if (!selectedWilaya.home_delivery_enabled) return null;
    return Number(selectedWilaya.home_delivery_price ?? 0);
  }, [selectedWilaya, deliveryType]);

  useEffect(() => {
    if (!selectedWilaya) return;
    if (deliveryType === "home" && selectedWilaya.home_delivery_enabled === false) {
      if (selectedWilaya.office_delivery_enabled) {
        setDeliveryType("office");
      }
    }
    if (deliveryType === "office" && selectedWilaya.office_delivery_enabled === false) {
      if (selectedWilaya.home_delivery_enabled) {
        setDeliveryType("home");
      }
    }
  }, [selectedWilaya, deliveryType]);

  const total = subtotal + (shipping ?? 0);

  const createOrder = usePost<CreateOrderPayload, CreateOrderResponse>({
    path: cartId ? `orders?cart_id=${cartId}` : "orders?cart_id=",
    method: "post",
    successMessage: "Order placed successfully",
    errorMessage: "Failed to place order",
  });

  useEffect(() => {
    if (createOrder.data?.data?.id) {
      setOrderId(createOrder.data.data.id);
      refetch();
    }
  }, [createOrder.data, refetch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartId) {
      toast.error("Cart not ready. Please try again.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    if (!wilayaId) {
      toast.error("Please select a wilaya.");
      return;
    }
    if (shipping === null) {
      toast.error("Selected delivery type is not available.");
      return;
    }

    createOrder.mutate({
      customer_phone: phone.trim(),
      wilaya_id: Number(wilayaId),
      delivery_type: deliveryType,
    });
  };

  if (isCartLoading || isWilayasLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <p className="text-neutral-600">Loading checkout...</p>
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
              Your cart is empty
            </h1>
            <p className="mt-2 text-neutral-600">
              Add some items to your cart before checking out.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/shop">Back to shop</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Order confirmed
            </h1>
            <p className="mt-2 text-neutral-600">
              Your order has been placed successfully.
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              Order ID: <span className="font-medium">{orderId}</span>
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/shop">Continue shopping</Link>
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
            Checkout
          </h1>
          <p className="mt-2 text-neutral-600">
            Confirm your delivery details and place your order.
          </p>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-neutral-900">
            Delivery information
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-neutral-700">
                Phone number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="+213..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                Wilaya
              </label>
              <select
                value={wilayaId}
                onChange={(e) =>
                  setWilayaId(e.target.value ? Number(e.target.value) : "")
                }
                className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select a wilaya</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.id} value={wilaya.id}>
                    {wilaya.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                Delivery type
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
                  Home delivery
                  {selectedWilaya?.home_delivery_enabled === false && (
                    <span className="text-xs text-neutral-400">
                      (not available)
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
                  Office delivery
                  {selectedWilaya?.office_delivery_enabled === false && (
                    <span className="text-xs text-neutral-400">
                      (not available)
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
            {createOrder.isPending ? "Placing order..." : "Place order"}
          </Button>
        </form>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Order summary
          </h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {(item.price * item.quantity).toFixed(2)} DZD
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex items-center justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-medium text-neutral-900">
                {subtotal.toFixed(2)} DZD
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Shipping</span>
              <span
                className={cn(
                  "font-medium",
                  shipping === 0 ? "text-green-600" : "text-neutral-900",
                )}
              >
                {shipping === null
                  ? "Select delivery"
                  : `${shipping.toFixed(2)} DZD`}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900">
              <span>Total</span>
              <span>{total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
