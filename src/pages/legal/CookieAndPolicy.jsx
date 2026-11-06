import LegalLayout from "../../components/legal/LegalLoyout";

const CookiePolicy = () => {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <p>
          This Cookie Policy explains how our website may use cookies
          and similar browser technologies to provide essential features,
          maintain authentication sessions, and improve your browsing
          experience.
        </p>
      ),
    },
    {
      id: "what-are-cookies",
      title: "What Are Cookies?",
      content: (
        <p>
          Cookies are small text files stored by your browser when you visit
          a website. They help websites remember information between visits
          or maintain a session while you navigate between pages.
        </p>
      ),
    },
    {
      id: "types",
      title: "Types of Cookies and Storage",
      content: (
        <>
          <h3>Essential cookies and storage</h3>
          <p>
            These may be used to support authentication, maintain user
            sessions, and provide core website functionality.
          </p>

          <h3>Preference storage</h3>
          <p>
            Browser storage may be used to remember settings or preferences
            that improve your experience.
          </p>

          <h3>Analytics technologies</h3>
          <p>
            If analytics tools are enabled, they may use cookies or similar
            technologies to help us understand website usage and improve
            performance. We will disclose the relevant tools and purposes
            when applicable.
          </p>
        </>
      ),
    },
    {
      id: "oauth-cookies",
      title: "Authentication and OAuth",
      content: (
        <p>
          When you sign in using Google or GitHub, authentication may involve
          cookies, browser storage, or other session technologies depending
          on our implementation. These technologies help maintain your
          authenticated session and protect access to your account.
        </p>
      ),
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      content: (
        <p>
          Third-party services integrated into our website may use their own
          cookies or similar technologies. Their use of these technologies
          is governed by their respective privacy and cookie policies.
        </p>
      ),
    },
    {
      id: "manage",
      title: "Managing Cookies",
      content: (
        <>
          <p>
            Most web browsers allow you to view, block, or delete cookies
            through their settings.
          </p>
          <p>
            You can manage cookies using your browser's privacy or security
            settings. Please note that disabling essential cookies or
            browser storage may affect sign-in and other website features.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "Cookie Retention",
      content: (
        <p>
          Some cookies are temporary and expire when you close your browser.
          Others may remain on your device for a longer period, depending
          on their purpose and configuration.
        </p>
      ),
    },
    {
      id: "updates",
      title: "Updates to This Cookie Policy",
      content: (
        <p>
          We may update this policy when our website functionality,
          technologies, or legal requirements change. Any updates will
          be published on this page.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      content: (
        <p>
          If you have questions about our use of cookies or similar
          technologies, contact us at{" "}
          <a href="mailto:girmajirahul2@gmail.com">girmajirahul2@gmail.com</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      type="cookies"
      title="Cookie Policy"
      description="Learn how cookies and browser storage help us provide a secure and reliable browsing experience."
      sections={sections}
    />
  );
};

export default CookiePolicy;