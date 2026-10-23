import type { Metadata } from "next";
import Image from "next/image";

import { hasDatabase } from "@/lib/db";
import { authConfigured, isTutor } from "@/lib/tutor-auth";

import LoginForm from "./login-form";
import PanelClient from "./panel-client";

export const metadata: Metadata = {
  title: "Panel del tutor | Educational Research",
  robots: { index: false, follow: false },
};

// El panel depende de la cookie de sesión: nunca se guarda en caché.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const signedIn = await isTutor();

  return (
    <div className="page">
      <header className="card app-header">
        <Image
          className="app-logo"
          src="/logo-unad.png"
          alt="Logo de la UNAD, Universidad Nacional Abierta y a Distancia, acreditada en alta calidad"
          width={427}
          height={302}
          priority
        />
        <div className="app-heading">
          <h1 className="app-title">Panel del tutor</h1>
          <p className="app-subtitle">
            Marca el avance de cada estudiante y actualiza el listado desde el Excel.
          </p>
        </div>
        <p className="course-id" aria-label="UNAD, curso 518024">
          <span>UNAD</span>
          <span>518024</span>
        </p>
      </header>

      <main>
        {signedIn ? (
          <PanelClient hasDatabase={hasDatabase} />
        ) : (
          <LoginForm configured={authConfigured} />
        )}
      </main>
    </div>
  );
}
