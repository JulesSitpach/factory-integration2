import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | TradeNavigatorPro',
  description:
    'Learn about the mission, vision, and team behind TradeNavigatorPro. We empower businesses to optimize their global supply chains with AI-driven insights.',
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">About TradeNavigatorPro</h1>
      <p className="mb-8 text-lg text-slate-700">
        TradeNavigatorPro empowers businesses to optimize global supply chains
        with AI-driven insights and tools. Our mission is to make international
        trade smarter, faster, and more resilient for everyone.
      </p>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
        <p className="text-slate-600">
          To democratize access to advanced supply chain analytics and empower
          companies of all sizes to thrive in a changing global market.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Our Team</h2>
        <p className="text-slate-600">
          We are a diverse group of supply chain experts, engineers, and
          designers passionate about building the future of trade technology.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="text-slate-600">
          Have questions?{' '}
          <a
            href="mailto:info@tradenavigatorpro.com"
            className="text-primary hover:underline"
          >
            Email us
          </a>
          .
        </p>
      </section>
    </main>
  );
}
