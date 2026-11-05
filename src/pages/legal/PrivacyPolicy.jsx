import LegalLayout from "../../components/legal/LegalLoyout";


const PrivacyPolicy = () => {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <>
          <p>
            Welcome to our website. We respect your privacy and are committed
            to protecting your personal information.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, and
            protect information when you access our website, create an
            account, sign in through Google or GitHub, or publish content.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "Information We Collect",
      content: (
        <>
          <p>Depending on how you use our platform, we may collect:</p>

          <h3>Account information</h3>
          <ul>
            <li>Name or display name.</li>
            <li>Email address.</li>
            <li>Profile picture.</li>
            <li>Unique account identifier.</li>
            <li>Authentication provider information.</li>
          </ul>

          <h3>OAuth information</h3>
          <p>
            When you sign in through Google or GitHub, we receive information
            permitted by the permissions you authorize.
          </p>

          <ul>
            <li>
              <strong>Google:</strong> Name, email address, profile picture,
              and Google account identifier, depending on the requested scopes.
            </li>
            <li>
              <strong>GitHub:</strong> GitHub username, email address,
              profile information, and account identifier, depending on
              the requested scopes.
            </li>
          </ul>

          <h3>User-generated content</h3>
          <ul>
            <li>Blog titles and content.</li>
            <li>Excerpts, tags, and publication dates.</li>
            <li>Cover images.</li>
            <li>Documents uploaded for blog imports, such as DOCX and TXT.</li>
          </ul>

          <h3>Technical information</h3>
          <p>
            We may collect browser information, device details, IP addresses,
            and application logs where applicable.
          </p>
        </>
      ),
    },
    {
      id: "use-information",
      title: "How We Use Your Information",
      content: (
        <>
          <p>We use collected information to:</p>
          <ul>
            <li>Create and manage user accounts.</li>
            <li>Authenticate users through Google and GitHub.</li>
            <li>Allow users to create, edit, import, and publish blogs.</li>
            <li>Display author information on published content.</li>
            <li>Maintain website security.</li>
            <li>Improve website functionality.</li>
            <li>Respond to support requests.</li>
            <li>Prevent unauthorized access and misuse.</li>
          </ul>
        </>
      ),
    },
    {
      id: "oauth",
      title: "OAuth and Third-Party Services",
      content: (
        <>
          <p>
            Our platform supports authentication through Google and GitHub.
            These services process information according to their own
            privacy policies.
          </p>

          <ul>
            <li>
              Google:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              GitHub:{" "}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Privacy Statement
              </a>
            </li>
          </ul>

          <p>
            We only request permissions needed for the authentication
            functionality we provide. We do not access Google Drive, Gmail,
            GitHub repositories, or other private resources unless explicitly
            requested through additional permissions.
          </p>
        </>
      ),
    },
    {
      id: "storage",
      title: "Data Storage and Security",
      content: (
        <p>
          We store information using the database and hosting services
          required to operate our website. We implement reasonable technical
          and organizational security measures to protect personal
          information from unauthorized access, alteration, disclosure,
          or destruction. However, no internet-based service can guarantee
          absolute security.
        </p>
      ),
    },
    {
      id: "sharing",
      title: "Data Sharing",
      content: (
        <p>
          We do not sell or rent personal information. Information may be
          shared with service providers that help operate our website,
          including authentication, database, and hosting providers.
          We may also disclose information when required by applicable law
          or when necessary to protect our platform.
        </p>
      ),
    },
    {
      id: "retention",
      title: "Data Retention and Deletion",
      content: (
        <>
          <p>
            We retain personal information only for as long as necessary
            for the purposes described in this policy or as required by
            applicable law.
          </p>
          <p>You may request:</p>
          <ul>
            <li>Access to your personal information.</li>
            <li>Correction of inaccurate information.</li>
            <li>Deletion of your account and associated personal information.</li>
            <li>Withdrawal of consent where applicable.</li>
          </ul>
          <p>
            To submit a request, contact us at{" "}
            <a href="mailto:girmajirahul2@gmail.com">girmajirahul2@gmail.com</a>.
            Requests will be reviewed in accordance with applicable law.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and Authentication",
      content: (
        <p>
          Our website may use cookies or browser storage to maintain
          authentication sessions, remember preferences, and provide
          essential functionality. You can manage cookies through your
          browser settings. Disabling essential cookies or storage may
          affect sign-in functionality.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children's Privacy",
      content: (
        <p>
          Our website is not intentionally designed to collect personal
          information from children without the necessary consent or
          authorization required by applicable law. If you believe a child
          has provided personal information improperly, contact us so
          we can review the matter.
        </p>
      ),
    },
    {
      id: "policy-changes",
      title: "Changes to This Policy",
      content: (
        <p>
          We may update this Privacy Policy when our services, features,
          or legal requirements change. Updated versions will be published
          on this page with a revised effective date.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      content: (
        <>
          <p>
            For privacy-related questions, data access requests,
            correction requests, or account deletion requests, contact us:
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:girmajirahul2@gmail.com">girmajirahul2@gmail.com</a>
          </p>
          <p>
            <strong>Website:</strong> YOUR_WEBSITE_URL
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      type="privacy"
      title="Privacy Policy"
      description="Your privacy matters to us. Learn how we collect, use, and protect your personal information."
      sections={sections}
    />
  );
};

export default PrivacyPolicy;