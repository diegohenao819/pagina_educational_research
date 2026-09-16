"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Reproduce cada ilustración de la guía UNA vez, cuando entra en pantalla.
 *
 * Cada figura animable lleva data-motion:
 *   "idle"  → estado final quieto (lo que llega del servidor)
 *   "armed" → primer cuadro, en pausa, mientras está fuera de pantalla
 *   "play"  → corriendo
 *
 * Si una figura ya está visible al cargar, se queda quieta: animarla ahí
 * sería un parpadeo, no una explicación. Las que llevan data-replay se
 * repiten al pasar el mouse.
 */
export default function GuideMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const figures = Array.from(root.querySelectorAll<HTMLElement>("[data-motion]"));
    const timers = new Map<HTMLElement, number>();

    const play = (el: HTMLElement) => {
      el.dataset.motion = "idle";
      void el.getBoundingClientRect(); // fuerza el reflow para que la animación arranque de cero
      el.dataset.motion = "play";

      window.clearTimeout(timers.get(el));
      const duration = Number(el.dataset.duration ?? 2000);
      timers.set(
        el,
        window.setTimeout(() => {
          el.dataset.motion = "idle";
          timers.delete(el);
        }, duration + 150)
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          play(entry.target as HTMLElement);
        }
      },
      { threshold: 0.4 }
    );

    const detach: Array<() => void> = [];

    for (const el of figures) {
      const box = el.getBoundingClientRect();
      const visible = box.bottom > 0 && box.top < window.innerHeight;
      if (!visible) {
        el.dataset.motion = "armed";
        observer.observe(el);
      }

      // Solo las ilustraciones pequeñas se repiten; el mapa es navegación
      // y repetirlo cada vez que el mouse pasa para hacer clic estorbaría.
      if (!el.hasAttribute("data-replay")) continue;
      const replay = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && el.dataset.motion === "idle") play(el);
      };
      el.addEventListener("pointerenter", replay);
      detach.push(() => el.removeEventListener("pointerenter", replay));
    }

    return () => {
      observer.disconnect();
      detach.forEach((fn) => fn());
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
