import { Suspense } from "react";
import NewDocumentForm from "./NewDocumentForm";

export const dynamic = "force-dynamic";

export default function NewDocumentPage() {
  return (
    <Suspense
      fallback={
        <main className="new-document-page">
          <div className="new-document-loading">
            Loading document form...
          </div>
        </main>
      }
    >
      <NewDocumentForm />
    </Suspense>
  );
}
