import { Link } from '@/lib/router';
import { Shield, FileText, Cookie, RotateCcw, AlertTriangle, Copyright, ArrowLeft } from 'lucide-react';

const legalContent: Record<string, { title: string; icon: React.ReactNode; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    icon: <Shield className="w-6 h-6" />,
    sections: [
      { heading: 'Information We Collect', body: 'We collect information you provide directly to us, including your name, email address, and any other information you choose to provide when creating an account or contacting us. We also automatically collect certain technical data such as IP address, browser type, and usage patterns.' },
      { heading: 'How We Use Your Information', body: 'We use your information to provide and improve our services, communicate with you about your account and our analysis, process payments, and send you notifications about market updates and new analysis publications.' },
      { heading: 'Data Storage & Security', body: 'Your data is stored securely using industry-standard encryption and access controls. We use Supabase for database management, which provides row-level security and encrypted data storage. We do not store payment card details on our servers.' },
      { heading: 'Cookie Usage', body: 'We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze how you use our platform. You can control cookies through your browser settings.' },
      { heading: 'Data Sharing', body: 'We do not sell, rent, or trade your personal information to third parties. We may share data with trusted service providers who help us operate our platform, all of whom are bound by confidentiality obligations.' },
      { heading: 'Your Rights', body: 'You have the right to access, correct, delete, or export your personal data. You can also opt out of marketing communications at any time. To exercise these rights, contact us at privacy@elevatex.com.' },
      { heading: 'Data Retention', body: 'We retain your data for as long as your account is active or as needed to provide our services. You can request deletion of your account and associated data at any time.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    icon: <FileText className="w-6 h-6" />,
    sections: [
      { heading: 'Acceptance of Terms', body: 'By accessing and using ElevateX, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.' },
      { heading: 'Service Description', body: 'ElevateX provides institutional-grade market analysis, trading education, and related services. Our analysis is for educational purposes only and does not constitute financial advice.' },
      { heading: 'User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be at least 18 years old to create an account.' },
      { heading: 'Membership & Billing', body: 'Premium memberships are billed on a recurring basis (monthly). You can cancel anytime. Fees are non-refundable except as stated in our Refund Policy. We reserve the right to change pricing with reasonable notice.' },
      { heading: 'Intellectual Property', body: 'All content on ElevateX, including analysis, charts, articles, and design, is our intellectual property or used with permission. You may not reproduce, distribute, or create derivative works without our written consent.' },
      { heading: 'Prohibited Conduct', body: 'You agree not to misuse the platform, attempt to gain unauthorized access, scrape content, share account credentials, or use the service for any illegal or unauthorized purpose.' },
      { heading: 'Limitation of Liability', body: 'ElevateX is provided "as is" without warranties of any kind. We are not liable for any trading losses or damages arising from the use of our analysis or services.' },
      { heading: 'Termination', body: 'We reserve the right to suspend or terminate accounts that violate these terms. You may close your account at any time.' },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    icon: <Cookie className="w-6 h-6" />,
    sections: [
      { heading: 'What Are Cookies', body: 'Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, authenticate your session, and analyze platform usage.' },
      { heading: 'Types of Cookies We Use', body: 'Essential cookies enable core functionality like authentication. Preference cookies remember your settings (theme, language). Analytics cookies help us understand how you use the platform to improve our services.' },
      { heading: 'Managing Cookies', body: 'You can control and delete cookies through your browser settings. Disabling essential cookies may affect platform functionality. Most browsers allow you to refuse cookies while still using the site.' },
      { heading: 'Third-Party Cookies', body: 'We may use third-party services (such as analytics providers) that set their own cookies. These are governed by the respective providers\' privacy policies.' },
    ],
  },
  refund: {
    title: 'Refund Policy',
    icon: <RotateCcw className="w-6 h-6" />,
    sections: [
      { heading: 'Refund Eligibility', body: 'We offer a 7-day money-back guarantee on first-time premium memberships. If you are not satisfied with your subscription, contact us within 7 days of your initial purchase for a full refund.' },
      { heading: 'Non-Refundable Items', body: 'Refunds are not available for subsequent billing cycles after the 7-day window. Refunds are not available for VIP signal services once signals have been delivered.' },
      { heading: 'How to Request a Refund', body: 'To request a refund, email support@elevatex.com with your account email and order details. Refunds are processed within 5-10 business days to your original payment method.' },
      { heading: 'Cancellation', body: 'You can cancel your membership at any time from your profile settings. Cancellation prevents future charges but does not refund the current billing period.' },
    ],
  },
  risk: {
    title: 'Risk Disclaimer',
    icon: <AlertTriangle className="w-6 h-6" />,
    sections: [
      { heading: 'Trading Risk Warning', body: 'Trading in financial markets involves substantial risk of loss. You should only trade with money you can afford to lose. Past performance is not indicative of future results. No analysis or signal can guarantee profitable trades.' },
      { heading: 'No Financial Advice', body: 'All content on ElevateX is for educational and informational purposes only. It does not constitute financial advice, investment recommendations, or solicitation to buy or sell any financial instrument. You should consult a licensed financial advisor before making investment decisions.' },
      { heading: 'Market Volatility', body: 'Financial markets are inherently volatile and unpredictable. Sudden price movements can result in significant losses, including the loss of your entire investment. Leverage can amplify both gains and losses.' },
      { heading: 'Analysis Limitations', body: 'Our analysis is based on available data and methodologies including Smart Money Concepts and Market Structure. However, no analysis method is foolproof. Market conditions can change rapidly and invalidate previous analysis.' },
      { heading: 'Your Responsibility', body: 'You are solely responsible for your trading decisions and outcomes. You acknowledge that you have read and understood this risk disclaimer before using any of our services.' },
    ],
  },
  dmca: {
    title: 'DMCA Policy',
    icon: <Copyright className="w-6 h-6" />,
    sections: [
      { heading: 'Copyright Notice', body: 'ElevateX respects the intellectual property rights of others. We respond to notices of alleged copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA).' },
      { heading: 'Filing a DMCA Notice', body: 'To file a copyright infringement notice, email dmca@elevatex.com with: (1) identification of the copyrighted work, (2) identification of the infringing material, (3) your contact information, and (4) a good-faith statement that the use is unauthorized.' },
      { heading: 'Counter-Notification', body: 'If you believe your content was removed in error, you may file a counter-notification with the same email. Include identification of the removed content and a statement under penalty of perjury that you have a good-faith belief it was removed in error.' },
      { heading: 'Repeat Infringers', body: 'We will terminate accounts of users who are found to repeatedly infringe the copyrights of others in accordance with the DMCA.' },
    ],
  },
};

export function LegalPage({ type }: { type: string }) {
  const content = legalContent[type];

  if (!content) {
    return (
      <div className="section-pad max-w-2xl mx-auto py-20 text-center">
        <p className="text-xl text-soft mb-4">Page not found.</p>
        <Link to="/" className="btn-gold px-6 py-3 rounded-xl inline-block">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="section-pad max-w-4xl mx-auto py-12">
      <Link to="/" className="flex items-center gap-2 text-sm text-soft hover:text-gold-400 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 gold-border flex items-center justify-center text-gold-400">
              {content.icon}
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl">{content.title}</h1>
          </div>

          <p className="text-sm text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            {content.sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-display font-semibold text-lg mb-3 flex items-start gap-2">
                  <span className="text-gold-400 font-mono text-sm shrink-0 mt-1">{String(i + 1).padStart(2, '0')}</span>
                  {section.heading}
                </h2>
                <p className="text-soft leading-relaxed pl-8">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-base">
            <p className="text-sm text-muted">
              Questions about this policy? Contact us at{' '}
              <a href="mailto:support@elevatex.com" className="text-gold-400 hover:text-gold-300 transition-colors">support@elevatex.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
