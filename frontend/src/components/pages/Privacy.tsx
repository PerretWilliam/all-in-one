// Privacy.tsx
// Privacy policy page content.

import { APP_NAME, REPO_URL } from "@/lib/constants";

/**
 * Privacy
 * Simple static page that explains how the application handles files and
 * local data. Links to the repository are provided for reporting issues.
 */
export function Privacy() {
  return (
    <main className="max-w-3xl mx-auto p-6 bg-white/60 rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>

      <p className="text-sm text-gray-700 mb-4">
        This application ({APP_NAME}) is designed to perform conversions locally
        on your device. The privacy and security of your files are a priority.
      </p>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">1. File Processing</h2>
        <p className="text-sm text-gray-700">
          All conversions are performed locally in your browser or on your
          machine (depending on configuration). We do not send your files to
          remote servers and do not store your files on our systems.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">2. Data Collected</h2>
        <p className="text-sm text-gray-700 mb-2">
          By default, we do not collect personal information or metadata from
          the files you process. However, the application may:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>
            Save local preferences (e.g., last chosen settings) in the browser's
            local storage.
          </li>
          <li>
            Keep strictly local technical logs to facilitate debugging if
            enabled voluntarily.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">
          3. Third Parties and Integrations
        </h2>
        <p className="text-sm text-gray-700">
          The application may reference or use open source tools (FFmpeg,
          yt-dlp, Squoosh). Links to these projects are provided for
          information. If you use features that rely on these external projects,
          please consult their respective policies.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">
          4. Cookies and Local Storage
        </h2>
        <p className="text-sm text-gray-700">
          We may use the browser's local storage to save settings (e.g., last
          format, last quality). No sensitive data is stored by default.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">5. Security</h2>
        <p className="text-sm text-gray-700">
          We apply good development practices to limit risks (input validation,
          minimal permissions). However, security also depends on your
          environment (browser, OS).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">6. Changes</h2>
        <p className="text-sm text-gray-700">
          This policy may be updated. The date of last modification is indicated
          in the source repository. For any questions or requests to delete
          local information, open an issue via the repository:
          <a
            className="ml-1 text-rose-600 hover:underline"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">7. Contact</h2>
        <p className="text-sm text-gray-700">
          For any questions regarding privacy, please use the Issues page of the
          GitHub repository:
          <a
            className="ml-1 text-rose-600 hover:underline"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {REPO_URL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}

export default Privacy;
