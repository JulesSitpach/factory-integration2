import AboutPageEs from './page.es';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Factory Integration',
  description:
    'Learn about the mission, vision, and team behind Factory Integration. We empower manufacturers to achieve smart-factory goals with real-time data and automation.',
};

export default function AboutPage(props: any) {
  if (props?.params?.locale === 'es') {
    return <AboutPageEs />;
  }
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">About Factory Integration</h1>
      <p className="mb-8 text-lg text-slate-700">
        Factory Integration empowers manufacturers to achieve smart-factory
        goals with real-time data, automated workflows, and operational
        visibility. Our mission is to make digital transformation accessible for
        every plant.
      </p>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
        <p className="text-slate-600">
          To democratize access to advanced integration and analytics, enabling
          companies of all sizes to thrive in Industry 4.0.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Our Team</h2>
        <p className="text-slate-600">
          We are a diverse group of engineers, operators, and designers
          passionate about building the future of manufacturing technology.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="text-slate-600">
          Have questions?{' '}
          <a
            href="mailto:info@factoryintegration.com"
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
