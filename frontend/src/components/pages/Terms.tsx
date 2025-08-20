// Terms.tsx
// Terms of Use page.

import { APP_NAME, REPO_URL } from "@/lib/constants";

/**
 * Terms
 * Static Terms of Use page. Explains permitted usage, liability and contact
 * information. Links to the repository are provided for reporting issues.
 */
export function Terms() {
  return (
    <main className="max-w-3xl mx-auto p-6 bg-white/60 rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Terms of Use</h1>

      <p className="text-sm text-gray-700 mb-4">
        Thank you for using {APP_NAME}. By using this software, you agree to
        these terms. Please read them carefully.
      </p>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">1. Authorized Use</h2>
        <p className="text-sm text-gray-700">
          You may use the application to convert your own files. You must not
          use it to violate copyrights or the privacy of others.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">
          2. Liability and Warranties
        </h2>
        <p className="text-sm text-gray-700">
          The tool is provided "as is" without express or implied warranties.
          The authors cannot be held responsible for direct or indirect damages
          resulting from the use of the software.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">3. Intellectual Property</h2>
        <p className="text-sm text-gray-700">
          The source code and graphic elements belong to their respective
          authors. The project is open source: check the repository for licenses
          and contributions.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">4. Restrictions</h2>
        <p className="text-sm text-gray-700">
          It is forbidden to use the application for illegal activities
          (hacking, unauthorized distribution, invasion of privacy). The user is
          solely responsible for complying with local laws.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">5. Changes to the Terms</h2>
        <p className="text-sm text-gray-700">
          These terms may be updated. Changes will be published in the source
          repository. Check regularly for the current version.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">6. Contact</h2>
        <p className="text-sm text-gray-700">
          To report a problem or ask a legal question, use the Issues page of
          the repository:
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

export default Terms;
