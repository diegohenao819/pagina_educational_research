"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Proporción de la figura que debe verse para reproducirla */
const VISIBLE_RATIO = 0.4;

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
      { threshold: VISIBLE_RATIO }
    );

    const detach: Array<() => void> = [];

    for (const el of figures) {
      const box = el.getBoundingClientRect();
      const shown = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
      const ratio = shown / Math.max(box.height, 1);

      if (shown <= 0) {
        // Fuera de pantalla: espera en el primer cuadro hasta que se vea
        el.dataset.motion = "armed";
        observer.observe(el);
      } else if (ratio < VISIBLE_RATIO) {
        // Asoma por el borde al cargar: esconderla dejaría un hueco en blanco,
        // así que se arma ahí mismo, como parte de la entrada de la página
        play(el);
      }
      // Bien visible al cargar: se queda quieta (animarla sería un parpadeo)

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
