import Link from "next/link";
import { Logo } from "@/components/ui";

const LAST_UPDATED = "April 4, 2026";
const CONTACT_EMAIL = "learn@withintech.org";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12">
      <h2 className="font-heading font-bold text-xl text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="flex flex-col gap-3 font-body text-sm text-foreground-soft leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside pl-5 flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-surface-shell text-foreground">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo className="h-12" />
          <Link
            href="/"
            className="font-body text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="font-heading font-black text-3xl text-foreground mb-2">
            Terms of Service &amp; Legal Policies
          </h1>
          <p className="font-body text-sm text-muted">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="font-body text-sm text-muted mt-2">
            These Terms of Service govern your use of WithinTech Learn, a
            product of WithinTech Rwanda. By creating an account or using our
            platform, you agree to these terms in full. If you do not agree,
            please do not use the platform.
          </p>
        </div>

        {/* Table of contents */}
        <nav className="bg-surface border border-border rounded-xl p-6 mb-12">
          <p className="font-heading font-bold text-xs tracking-widest uppercase text-foreground mb-4">
            Contents
          </p>
          <ol className="list-decimal list-inside flex flex-col gap-2 font-body text-sm text-primary dark:text-foreground">
            {[
              ["#eligibility", "Eligibility & Account Requirements"],
              ["#acceptable-use", "Acceptable Use"],
              ["#account-suspension", "Account Suspension & Termination"],
              ["#intellectual-property", "Intellectual Property"],
              ["#challenges", "Coding Challenges & Code Execution"],
              ["#third-party-content", "Third-Party Content & Thumbnails"],
              ["#disclaimer", "Disclaimer of Warranties"],
              ["#limitation", "Limitation of Liability"],
              ["#privacy", "Privacy & Data Collection"],
              ["#communications", "Communications & Marketing"],
              ["#security", "Security & Prohibited Activities"],
              ["#changes", "Changes to These Terms"],
              ["#contact", "Contact Us"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 1. Eligibility ──────────────────────────────────────────────────── */}
        <Section id="eligibility" title="1. Eligibility & Account Requirements">
          <P>
            To use WithinTech Learn, you must be at least 13 years old. If you
            are under 18, you represent that you have your parent or
            guardian&apos;s permission to use the platform.
          </P>
          <P>
            Each person may hold only <strong>one (1) account</strong>. Creating
            multiple accounts, whether to circumvent restrictions, accumulate
            certificates, or for any other reason, is a violation of these Terms
            and may result in the permanent deactivation of all associated
            accounts.
          </P>
          <P>
            You are responsible for maintaining the confidentiality of your
            login credentials and for all activity that occurs under your
            account. Notify us immediately at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary dark:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            if you suspect unauthorized access.
          </P>
        </Section>

        {/* ── 2. Acceptable Use ───────────────────────────────────────────────── */}
        <Section id="acceptable-use" title="2. Acceptable Use">
          <P>
            You agree to use WithinTech Learn only for lawful, personal, and
            non-commercial educational purposes. You agree not to:
          </P>
          <Ul
            items={[
              "Share, resell, sublicense, or redistribute any course content, materials, certificates, or challenge problems.",
              "Use the platform to harass, abuse, or harm other users or WithinTech staff.",
              "Upload, post, or transmit any content that is unlawful, defamatory, or infringes on the rights of others.",
              "Use automated tools, bots, scrapers, or scripts to access, extract, or submit to platform content or features.",
              "Impersonate another person or entity.",
              "Use the platform in a manner that could damage, disable, or overburden our infrastructure.",
              "Submit code to the Challenges feature that is intentionally designed to harm, overload, or exploit the code execution environment or any connected infrastructure.",
              "Publicly share, publish, or distribute challenge problem statements, hidden test cases, or model solutions in any forum, repository, or medium without prior written consent from WithinTech.",
            ]}
          />
        </Section>

        {/* ── 3. Account Suspension ───────────────────────────────────────────── */}
        <Section
          id="account-suspension"
          title="3. Account Suspension & Termination"
        >
          <P>
            WithinTech reserves the right to{" "}
            <strong>
              suspend or permanently deactivate any user&apos;s account at any
              time
            </strong>
            , with or without prior notice, if we determine that the user is:
          </P>
          <Ul
            items={[
              "Using the platform inappropriately or in violation of these Terms.",
              "Operating multiple accounts.",
              "Attempting to abuse, manipulate, or exploit platform features.",
              "Engaging in any activity that may harm other users or the platform.",
            ]}
          />
          <P>
            Upon account deactivation, access to all enrolled courses,
            certificates, and saved progress may be permanently revoked.
            WithinTech is not liable for any loss of data or progress resulting
            from account termination.
          </P>
          <P>
            You may also delete your account at any time by contacting us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary dark:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </P>
        </Section>

        {/* ── 4. Intellectual Property ────────────────────────────────────────── */}
        <Section id="intellectual-property" title="4. Intellectual Property">
          <P>
            All content on WithinTech Learn — including but not limited to
            videos, text, quizzes, assessments, module materials, certificates,{" "}
            <strong>
              coding challenge problems, test cases, and example inputs and
              outputs
            </strong>{" "}
            — is the <strong>proprietary property of WithinTech</strong> or its
            licensed content providers. All rights reserved.
          </P>
          <P>
            You may not copy, reproduce, distribute, publish, broadcast,
            transmit, modify, adapt, create derivative works from, or otherwise
            exploit any platform content, in whole or in part, without the prior
            written consent of WithinTech. This explicitly includes reproducing
            challenge problem statements or test case data on external platforms
            such as GitHub, coding forums, or social media.
          </P>
          <P>
            Code solutions you write and submit through the Challenges feature
            remain your own intellectual property. However, by submitting code
            to our platform, you grant WithinTech a non-exclusive, royalty-free
            license to retain, analyze, and use aggregated or anonymized
            submission data solely for the purposes of improving our grading
            systems, platform quality, and educational content. We will not
            publish or share your individual solutions publicly.
          </P>
          <P>
            Certificates issued by WithinTech Learn are issued solely to the
            enrolled learner and may not be shared, transferred, or claimed by
            any other party. Certificates must not be misrepresented as
            credentials for employment or academic purposes beyond their stated
            scope.
          </P>
        </Section>

        {/* ── 5. Challenges & Code Execution ──────────────────────────────────── */}
        <Section id="challenges" title="5. Coding Challenges & Code Execution">
          <P>
            WithinTech Learn offers a <strong>Coding Challenges</strong> feature
            that allows users to write and submit code solutions in multiple
            programming languages. Submitted code is executed in an isolated,
            sandboxed environment. By using this feature, you acknowledge and
            agree to the following:
          </P>
          <Ul
            items={[
              "Code execution is performed in a controlled sandbox environment. You must not attempt to escape, probe, or abuse this environment in any way.",
              "Submissions are automatically graded by comparing your output against expected results. WithinTech does not guarantee that automated grading is free from errors and accepts no liability for incorrect verdicts.",
              "Submission results, code, language, and timestamps are stored and associated with your account as part of your submission history.",
              "Resource limits (time, memory) are enforced per submission. Submissions that exceed these limits will receive a Time Limit Exceeded or similar verdict.",
              "You must not submit code designed to consume excessive resources, perform network calls, access the file system beyond the sandbox, or otherwise interfere with the execution environment.",
              "The Challenges feature is provided as a beta feature. Its availability, grading accuracy, and supported languages may change at any time without prior notice.",
            ]}
          />
          <P>
            WithinTech reserves the right to suspend or restrict access to the
            Challenges feature for any user found to be abusing the code
            execution environment, submitting malicious payloads, or attempting
            to reverse-engineer hidden test cases through systematic probing.
          </P>
          <P>
            <strong>Beta disclaimer:</strong> The Challenges feature is under
            active development. Features, grading logic, and supported languages
            may be modified, restricted, or discontinued at any time. Completion
            records and submission history are retained on a best-effort basis
            during the beta period.
          </P>
        </Section>

        {/* ── 6. Thumbnails ───────────────────────────────────────────────────── */}
        <Section
          id="third-party-content"
          title="6. Third-Party Content & Thumbnails"
        >
          <P>
            WithinTech Learn may display course thumbnail images sourced from
            third parties. We do not claim ownership over these images. If you
            believe a thumbnail on our platform uses your image or artwork
            without appropriate authorization, please contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary dark:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject line <em>&quot;Thumbnail Removal Request&quot;</em>{" "}
            and include:
          </P>
          <Ul
            items={[
              "A description or URL of the image in question.",
              "Evidence that you are the rights holder or authorized representative.",
              "Your contact information.",
            ]}
          />
          <P>
            We will review and, where appropriate, remove the thumbnail{" "}
            <strong>within 48 hours</strong> of receiving a valid request.
          </P>
        </Section>

        {/* ── 7. Disclaimer ───────────────────────────────────────────────────── */}
        <Section id="disclaimer" title="7. Disclaimer of Warranties">
          <P>
            WithinTech Learn provides its courses and content for{" "}
            <strong>educational purposes only</strong>. While we strive for
            accuracy, <strong>we make no warranties or representations</strong>{" "}
            regarding the completeness, accuracy, reliability, suitability, or
            timeliness of any course content.
          </P>
          <P>
            <strong>
              We are not responsible for any errors, misinformation, or mistakes
              contained in our courses.
            </strong>{" "}
            You are encouraged to verify information independently before
            applying it professionally or academically.
          </P>
          <P>
            The platform, including the Challenges feature and its automated
            code execution and grading system, is provided &quot;as is&quot; and
            &quot;as available&quot; without any warranties of any kind, either
            express or implied, including but not limited to implied warranties
            of merchantability, fitness for a particular purpose, or
            non-infringement. Grading verdicts are automated and may not always
            reflect the true correctness of a submitted solution.
          </P>
        </Section>

        {/* ── 8. Limitation of Liability ──────────────────────────────────────── */}
        <Section id="limitation" title="8. Limitation of Liability">
          <P>
            To the fullest extent permitted by applicable law, WithinTech, its
            directors, employees, partners, and agents shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages arising out of or relating to your use of, or inability to
            use, the platform or its content.
          </P>
          <P>
            This includes, without limitation, loss of data, loss of profits,
            loss of career opportunities, or any other intangible losses, even
            if WithinTech has been advised of the possibility of such damages.
          </P>
        </Section>

        {/* ── 9. Privacy ──────────────────────────────────────────────────────── */}
        <Section id="privacy" title="9. Privacy & Data Collection">
          <P>
            By using WithinTech Learn, you consent to the collection and use of
            your personal data as described in this section. We collect the
            following categories of information:
          </P>
          <Ul
            items={[
              "Account information: first name, last name, and email address.",
              "Learning data: courses you are enrolled in, module and quiz progress, and completion status.",
              "Challenge data: code submissions, programming language used, submission timestamps, grading verdicts, and challenge completion status.",
              "Usage data: interactions with the platform such as button clicks, page views, feature usage, and session information.",
              "Device and browser information for security and analytics purposes.",
            ]}
          />
          <P>We use this data to:</P>
          <Ul
            items={[
              "Provide and improve the platform experience.",
              "Generate and verify certificates.",
              "Send course-related communications and reminders.",
              "Analyze platform usage and detect fraud or abuse.",
              "Comply with legal obligations.",
            ]}
          />
          <P>
            We do not sell your personal data to third parties. We may share
            data with trusted service providers (e.g., analytics, email
            delivery) strictly for operating the platform.
          </P>
          <P>
            We use Google Analytics to collect anonymized usage data. This data
            is governed by Google&apos;s Privacy Policy. You may opt out of
            Google Analytics by using the Google Analytics Opt-out Browser
            Add-on.
          </P>
          <P>
            You have the right to request access to, correction of, or deletion
            of your personal data. Contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary dark:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            to exercise these rights.
          </P>
        </Section>

        {/* ── 10. Communications ───────────────────────────────────────────────── */}
        <Section id="communications" title="10. Communications & Marketing">
          <P>
            By creating an account, you agree to receive the following types of
            emails:
          </P>
          <Ul
            items={[
              "Transactional emails: account setup, password resets, certificate issuance.",
              "Course reminder emails: nudges to continue enrolled courses.",
              "Marketing emails: announcements about new courses, platform updates, and WithinTech news.",
            ]}
          />
          <P>
            You may{" "}
            <strong>
              opt out of marketing and reminder emails at any time
            </strong>{" "}
            by clicking the unsubscribe link in any such email or by contacting
            us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary dark:text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . Note that opting out of marketing emails will not affect the
            delivery of essential transactional emails.
          </P>
        </Section>

        {/* ── 11. Security ────────────────────────────────────────────────────── */}
        <Section id="security" title="11. Security & Prohibited Activities">
          <P>
            <strong>
              Any attempt to hack, exploit, tamper with, or gain unauthorized
              access to the WithinTech Learn platform, its infrastructure, user
              accounts, course enrollment records, or certificates is strictly
              prohibited and constitutes a criminal offence
            </strong>{" "}
            under applicable cybercrime and computer misuse laws.
          </P>
          <P>This includes but is not limited to:</P>
          <Ul
            items={[
              "Attempting to bypass or circumvent authentication or access controls.",
              "Forging, fabricating, or altering course completion certificates or challenge completion records.",
              "Illegally transferring or stealing course enrollments.",
              "Performing denial-of-service attacks or attempting to disrupt platform availability.",
              "Injecting malicious code, scripts, or payloads into the platform.",
              "Exploiting API endpoints or system vulnerabilities.",
              "Submitting code to the Challenges feature that attempts to escape the sandbox, access system resources, perform network requests, or interfere with the execution infrastructure.",
              "Systematically probing the challenge grading system to reverse-engineer hidden test cases.",
            ]}
          />
          <P>
            WithinTech reserves the right to report any such activities to the
            appropriate authorities and to pursue all available legal remedies.
          </P>
        </Section>

        {/* ── 12. Changes ─────────────────────────────────────────────────────── */}
        <Section id="changes" title="12. Changes to These Terms">
          <P>
            WithinTech reserves the right to update these Terms of Service at
            any time. We will notify registered users of material changes via
            email or a prominent notice on the platform. The &quot;Last
            updated&quot; date at the top of this page reflects the most recent
            revision.
          </P>
          <P>
            Your continued use of the platform after changes are posted
            constitutes your acceptance of the revised Terms. If you do not
            agree with the updated terms, you must stop using the platform and
            may request account deletion.
          </P>
          <P>
            These Terms are governed by the laws of Rwanda. Any disputes arising
            from use of the platform shall be subject to the jurisdiction of the
            courts of Rwanda.
          </P>
        </Section>

        {/* ── 13. Contact ─────────────────────────────────────────────────────── */}
        <Section id="contact" title="13. Contact Us">
          <P>
            If you have questions about these Terms, wish to make a data
            request, or need to report a concern, please contact us at:
          </P>
          <div className="bg-surface border border-border rounded-lg p-4 font-body text-sm text-foreground-soft">
            <p className="font-bold text-foreground">WithinTech Rwanda</p>
            <p className="mt-1">Product: WithinTech Learn</p>
            <p>
              Email:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary dark:text-foreground hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="font-body text-xs text-muted-contrast"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} WithinTech Rwanda. All rights reserved.
          </p>
          <Link
            href="/"
            className="font-body text-xs text-muted hover:text-foreground transition-colors"
          >
            Back to WithinTech Learn
          </Link>
        </div>
      </footer>
    </div>
  );
}
