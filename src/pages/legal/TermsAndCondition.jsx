import LegalLayout from "../../components/legal/LegalLoyout";

const TermsAndConditions = () => {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using this website, you agree to comply with
          these Terms and Conditions. If you do not agree with these terms,
          please discontinue using the platform.
        </p>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility and User Accounts",
      content: (
        <>
          <p>
            You are responsible for providing accurate information when
            creating an account and keeping your account credentials secure.
          </p>
          <ul>
            <li>Provide accurate account information.</li>
            <li>Keep your login credentials secure.</li>
            <li>Notify us of suspected unauthorized account access.</li>
            <li>Do not impersonate another individual or organization.</li>
          </ul>
        </>
      ),
    },
    {
      id: "oauth",
      title: "Third-Party Authentication",
      content: (
        <p>
          Our website may allow you to sign in through Google or GitHub.
          Your use of these authentication services is also subject to
          the respective provider's terms and policies. You are responsible
          for maintaining access to the third-party account you use to sign in.
        </p>
      ),
    },
    {
      id: "content",
      title: "User-Generated Content",
      content: (
        <>
          <p>
            Our platform allows users to create, edit, import, and publish
            blog content.
          </p>
          <p>
            You retain ownership of content that you create. By publishing
            content on the platform, you grant us a limited, non-exclusive
            permission to host, store, display, and distribute that content
            as necessary to operate the website and provide its features.
          </p>
          <p>
            You are responsible for ensuring that you have the necessary
            rights and permissions for content you upload or publish.
          </p>
        </>
      ),
    },
    {
      id: "responsibility",
      title: "Content Responsibility",
      content: (
        <>
          <p>You agree not to publish content that:</p>
          <ul>
            <li>Violates applicable laws or regulations.</li>
            <li>Infringes another person's intellectual property rights.</li>
            <li>Contains malicious software or harmful links.</li>
            <li>Is fraudulent, deceptive, or intended to cause harm.</li>
            <li>Contains harassment, threats, or abusive material.</li>
            <li>Violates the rights or privacy of others.</li>
          </ul>
        </>
      ),
    },
    {
      id: "prohibited",
      title: "Prohibited Activities",
      content: (
        <>
          <p>You must not:</p>
          <ul>
            <li>Attempt unauthorized access to the website or its systems.</li>
            <li>Interfere with website functionality or security.</li>
            <li>Use the platform to distribute spam.</li>
            <li>Misuse another user's account or information.</li>
            <li>Copy or exploit platform material without permission.</li>
          </ul>
        </>
      ),
    },
    {
      id: "moderation",
      title: "Content Moderation",
      content: (
        <p>
          We reserve the right to review, restrict, or remove content that
          violates these terms or applicable laws. Where appropriate, we
          may take action against accounts that repeatedly or seriously
          violate platform rules.
        </p>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      content: (
        <p>
          The website's branding, design, logos, original interface,
          and platform materials are owned by or licensed to the website
          operator. You may not reproduce or commercially exploit these
          materials without appropriate authorization. User-generated
          content remains subject to the ownership rights of its creators.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Account Suspension and Termination",
      content: (
        <p>
          We may suspend or restrict access to accounts that violate these
          terms, threaten platform security, or misuse website functionality.
          You may stop using the platform and request account deletion
          through our published privacy contact.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Disclaimer and Limitation of Liability",
      content: (
        <p>
          The platform is provided on an as-available basis. To the extent
          permitted by applicable law, we do not guarantee uninterrupted
          access, error-free operation, or the accuracy of user-generated
          content. Nothing in these terms excludes liability that cannot
          legally be excluded.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      content: (
        <p>
          We may revise these Terms and Conditions as our platform evolves
          or legal requirements change. Updated terms will be published
          on this page with a revised effective date.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: (
        <p>
          These terms are subject to applicable laws and regulations.
          Any disputes will be handled by the competent courts or
          authorities as required by applicable law.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Information",
      content: (
        <p>
          If you have questions about these terms, contact us at{" "}
          <a href="mailto:girmajirahul2@gmail.com">girmajirahul2@gmail.com</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      type="terms"
      title="Terms & Conditions"
      description="Understand the rules and responsibilities that apply when using our platform and publishing content."
      sections={sections}
    />
  );
};

export default TermsAndConditions;