/* eslint-disable react-hooks/refs, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { gsap } from "gsap";
import {
  createElement,
  forwardRef,
  type ElementType,
  type ForwardedRef,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import type * as React from "react";

type MotionPrimitive = string | number;
type MotionValue = MotionPrimitive | MotionPrimitive[];

export type MotionTransition = {
  delay?: number;
  duration?: number;
  ease?: string | readonly number[] | number[];
  repeat?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  type?: string;
  stiffness?: number;
  damping?: number;
  [key: string]: unknown;
};

export type MotionTarget = {
  transition?: MotionTransition;
  [key: string]: MotionValue | MotionTransition | undefined;
};

export type Variants = Record<string, MotionTarget>;

type ViewportOptions = {
  once?: boolean;
  margin?: string;
};

type MotionExtraProps = {
  initial?: MotionTarget | string | false;
  animate?: MotionTarget | string;
  exit?: MotionTarget | string;
  whileInView?: MotionTarget | string;
  whileHover?: MotionTarget;
  whileTap?: MotionTarget;
  layout?: boolean | "position" | "size";
  layoutId?: string;
  transition?: MotionTransition;
  variants?: Variants;
  viewport?: ViewportOptions;
  onAnimationComplete?: () => void;
};

type MotionProps = any;

const EASE_MAP: Record<string, string> = {
  easeOut: "power2.out",
  easeIn: "power2.in",
  easeInOut: "power2.inOut",
  linear: "none",
};

const isReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const toGsapEase = (ease: MotionTransition["ease"]): string | undefined => {
  if (!ease) return undefined;
  if (Array.isArray(ease)) return "power2.out";
  const easeKey = String(ease);
  return EASE_MAP[easeKey] ?? easeKey;
};

const resolveTarget = (
  value: MotionTarget | string | false | undefined,
  variants?: Variants,
): MotionTarget | undefined => {
  if (value === false || value == null) return undefined;
  if (typeof value === "string") return variants?.[value];
  return value;
};

const removeTransitionKey = (target: MotionTarget): Record<string, MotionValue> => {
  const clean: Record<string, MotionValue> = {};
  for (const [key, value] of Object.entries(target)) {
    if (key === "transition" || value === undefined) continue;
    clean[key] = value as MotionValue;
  }
  return clean;
};

const toTweenVars = (
  target: MotionTarget,
  baseTransition?: MotionTransition,
): Record<string, unknown> => {
  const vars: Record<string, unknown> = removeTransitionKey(target);
  const transition = (target.transition ?? baseTransition) as
    | MotionTransition
    | undefined;

  if (!transition) return vars;

  if (transition.duration !== undefined) vars.duration = transition.duration;
  if (transition.delay !== undefined) vars.delay = transition.delay;
  if (transition.repeat !== undefined) vars.repeat = transition.repeat;
  if (transition.repeatDelay !== undefined) {
    vars.repeatDelay = transition.repeatDelay;
  }
  if (transition.yoyo !== undefined) vars.yoyo = transition.yoyo;

  if (transition.type === "spring") {
    vars.ease = "power3.out";
  } else {
    const gsapEase = toGsapEase(transition.ease);
    if (gsapEase) vars.ease = gsapEase;
  }

  return vars;
};

const assignForwardedRef = <T,>(
  ref: ForwardedRef<T>,
  value: T | null,
): void => {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref && typeof ref === "object") {
    ref.current = value;
  }
};

const createMotionComponent = (component: ElementType) => {
  const MotionComponentImpl = forwardRef<any, MotionProps>(
    (
      {
        initial,
        animate,
        exit,
        whileInView,
        whileHover,
        whileTap,
        layout,
        layoutId,
        transition,
        variants,
        viewport,
        onAnimationComplete,
        ...rawProps
      },
      forwardedRef,
    ) => {
      void exit;
      void layout;
      void layoutId;
      const elementRef = useRef<any>(null);
      const hoverTweenRef = useRef<gsap.core.Tween | null>(null);
      const tapTweenRef = useRef<gsap.core.Tween | null>(null);
      const mainTweenRef = useRef<gsap.core.Tween | null>(null);

      const {
        onMouseEnter,
        onMouseLeave,
        onMouseDown,
        onMouseUp,
        onTouchStart,
        onTouchEnd,
        ...props
      } = rawProps as MotionProps & {
        onMouseEnter?: React.MouseEventHandler;
        onMouseLeave?: React.MouseEventHandler;
        onMouseDown?: React.MouseEventHandler;
        onMouseUp?: React.MouseEventHandler;
        onTouchStart?: React.TouchEventHandler;
        onTouchEnd?: React.TouchEventHandler;
      };

      const setRef = (node: any) => {
        elementRef.current = node;
        assignForwardedRef(forwardedRef, node);
      };

      useEffect(() => {
        const node = elementRef.current as unknown as Element | null;
        if (!node) return;

        const startTarget = resolveTarget(initial, variants);
        const animateTarget = resolveTarget(animate, variants);
        const inViewTarget = resolveTarget(whileInView, variants);

        if (startTarget && initial !== false) {
          gsap.set(node, removeTransitionKey(startTarget));
        }

        if (isReducedMotion()) {
          const reducedTarget = inViewTarget ?? animateTarget;
          if (reducedTarget) {
            gsap.set(node, removeTransitionKey(reducedTarget));
          }
          return;
        }

        const complete = () => onAnimationComplete?.();
        let observer: IntersectionObserver | undefined;

        if (inViewTarget) {
          const once = viewport?.once ?? false;
          let hasPlayed = false;
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                if (once && hasPlayed) return;
                hasPlayed = true;
                mainTweenRef.current?.kill();
                mainTweenRef.current = gsap.to(node, {
                  ...toTweenVars(inViewTarget, transition),
                  onComplete: complete,
                });
                if (once) observer?.disconnect();
              });
            },
            {
              root: null,
              rootMargin: viewport?.margin ?? "0px",
              threshold: 0.1,
            },
          );
          observer.observe(node);
        } else if (animateTarget) {
          mainTweenRef.current?.kill();
          mainTweenRef.current = gsap.to(node, {
            ...toTweenVars(animateTarget, transition),
            onComplete: complete,
          });
        }

        return () => {
          observer?.disconnect();
          hoverTweenRef.current?.kill();
          tapTweenRef.current?.kill();
          mainTweenRef.current?.kill();
        };
      }, [
        animate,
        initial,
        onAnimationComplete,
        transition,
        variants,
        viewport?.margin,
        viewport?.once,
        whileInView,
      ]);

      const idleTarget =
        resolveTarget(animate, variants) ?? resolveTarget(whileInView, variants);

      const handleMouseEnter: React.MouseEventHandler = (event) => {
        onMouseEnter?.(event);
        if (isReducedMotion() || !whileHover || !elementRef.current) return;
        hoverTweenRef.current?.kill();
        hoverTweenRef.current = gsap.to(
          elementRef.current as unknown as Element,
          toTweenVars(whileHover, transition),
        );
      };

      const handleMouseLeave: React.MouseEventHandler = (event) => {
        onMouseLeave?.(event);
        if (isReducedMotion() || !elementRef.current) return;
        if (idleTarget) {
          hoverTweenRef.current?.kill();
          hoverTweenRef.current = gsap.to(
            elementRef.current as unknown as Element,
            toTweenVars(idleTarget, transition),
          );
        }
      };

      const handleMouseDown: React.MouseEventHandler = (event) => {
        onMouseDown?.(event);
        if (isReducedMotion() || !whileTap || !elementRef.current) return;
        tapTweenRef.current?.kill();
        tapTweenRef.current = gsap.to(
          elementRef.current as unknown as Element,
          toTweenVars(whileTap, transition),
        );
      };

      const handleMouseUp: React.MouseEventHandler = (event) => {
        onMouseUp?.(event);
        if (isReducedMotion() || !elementRef.current) return;
        if (idleTarget) {
          tapTweenRef.current?.kill();
          tapTweenRef.current = gsap.to(
            elementRef.current as unknown as Element,
            toTweenVars(idleTarget, transition),
          );
        }
      };

      const handleTouchStart: React.TouchEventHandler = (event) => {
        onTouchStart?.(event);
        if (isReducedMotion() || !whileTap || !elementRef.current) return;
        tapTweenRef.current?.kill();
        tapTweenRef.current = gsap.to(
          elementRef.current as unknown as Element,
          toTweenVars(whileTap, transition),
        );
      };

      const handleTouchEnd: React.TouchEventHandler = (event) => {
        onTouchEnd?.(event);
        if (isReducedMotion() || !elementRef.current) return;
        if (idleTarget) {
          tapTweenRef.current?.kill();
          tapTweenRef.current = gsap.to(
            elementRef.current as unknown as Element,
            toTweenVars(idleTarget, transition),
          );
        }
      };

      return createElement(
        component as ElementType,
        {
          ...props,
          ref: setRef,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onMouseDown: handleMouseDown,
          onMouseUp: handleMouseUp,
          onTouchStart: handleTouchStart,
          onTouchEnd: handleTouchEnd,
        } as Record<string, unknown>,
        props.children as ReactNode,
      );
    },
  );

  MotionComponentImpl.displayName =
    typeof component === "string"
      ? `Motion(${component})`
      : `Motion(${component.displayName ?? component.name ?? "Component"})`;

  return MotionComponentImpl;
};

const componentCache = new Map<string, React.ComponentType<any>>();

export const motion: any = new Proxy(((component: ElementType) =>
  createMotionComponent(component)) as object, {
  apply: (_target, _thisArg, argArray: [ElementType]) =>
    createMotionComponent(argArray[0]),
  get: (_target, property: string | symbol) => {
    if (property === "create") {
      return (component: ElementType) => createMotionComponent(component);
    }
    if (typeof property !== "string") {
      return undefined;
    }
    if (!componentCache.has(property)) {
      componentCache.set(
        property,
        createMotionComponent(property as keyof React.JSX.IntrinsicElements),
      );
    }
    return componentCache.get(property);
  },
});

export function AnimatePresence({
  children,
}: {
  children: ReactNode;
  initial?: boolean;
  mode?: "sync" | "wait" | "popLayout";
}) {
  return <>{children}</>;
}

export const useReducedMotion = (): boolean => isReducedMotion();
