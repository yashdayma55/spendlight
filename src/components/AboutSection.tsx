import { FISCAL_METADATA } from "@/lib/data";

const formatNumber = (n: number) =>
  n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function AboutSection() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        About this app
      </h2>
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          <strong className="text-gray-800">What we built.</strong> Spendlight
          helps non-technical users explore Washington State&apos;s FY2022 vendor
          payments — ${(FISCAL_METADATA.total_spend / 1e9).toFixed(1)}B across{" "}
          {formatNumber(FISCAL_METADATA.total_transactions)} transactions. The app
          parses the real Open Checkbook CSV at build time, visualizes spending
          with interactive charts, answers questions via Claude with RAG, surfaces
          newsworthy insights in Story Mode, and logs every AI call for
          governance. Penny, our cartoon guide, explains what you click in plain
          English.
        </p>
        <p>
          <strong className="text-gray-800">How RAG works here.</strong>{" "}
          Retrieval-Augmented Generation means we do not send the entire dataset
          to Claude on every question. Instead, we split pre-aggregated spending
          facts into six topic chunks (overview, agencies, categories, monthly
          trends, vendors, and agency-by-category). When you ask a question, a
          simple keyword matcher picks the two most relevant chunks plus the
          overview, and only that context goes to the model — faster, cheaper, and
          more focused answers with visible source badges.
        </p>
        <p>
          <strong className="text-gray-800">What would change in production.</strong>{" "}
          A managed database (e.g. PostgreSQL or BigQuery) would replace build-time
          JSON aggregates; governance logs would persist to an audit store with
          user identity and retention policies; authentication and row-level access
          would gate sensitive exports; vector embeddings would improve retrieval
          beyond keywords; Penny and chat would share rate limits and caching; and
          the CSV pipeline would run on a schedule rather than locally before deploy.
        </p>
      </div>
    </section>
  );
}
