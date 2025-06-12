import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TariffTrackerClient from '@/app/components/TariffTrackerClient';

const locales = ['en', 'es'];

export function generateMetadata(props: {
  params: { locale: string };
}): Metadata {
  const { locale } = props.params;
  if (!locales.includes(locale)) {
    return {};
  }
  return {
    title: 'Tariff Tracker',
    description: 'Track tariff changes and alerts for your products',
  };
}

export default function TariffTrackerPage(props: {
  params: { locale: string };
}) {
  const { locale } = props.params;
  if (!locales.includes(locale)) {
    notFound();
  }
  return <TariffTrackerClient locale={locale} />;
}
