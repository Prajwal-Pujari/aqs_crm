import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { unsubscribeApi } from '@/api/services';
import { ContactPreferenceDto } from '@/types';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft, Mail, HeartHandshake } from 'lucide-react';

export default function UnsubscribePage() {
  const { token } = useParams<{ token: string }>();

  const [preferences, setPreferences] = useState<ContactPreferenceDto | null>(null);
  const [optedInGreetings, setOptedInGreetings] = useState(true);
  const [optedInPromos, setOptedInPromos] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No unsubscribe token provided in link.');
      setIsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const data = await unsubscribeApi.get(token);
        setPreferences(data);
        setOptedInGreetings(data.optedInGreetings);
        setOptedInPromos(data.optedInPromos);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Invalid or expired communication preference link.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await unsubscribeApi.update(token, {
        optedInGreetings,
        optedInPromos,
      });
      setPreferences(updated);
      setSavedSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to update communication preferences. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await unsubscribeApi.update(token, {
        optedInGreetings: false,
        optedInPromos: false,
      });
      setPreferences(updated);
      setOptedInGreetings(false);
      setOptedInPromos(false);
      setSavedSuccess(true);
    } catch (err: any) {
      setError('Failed to unsubscribe from all marketing communications.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-md w-full space-y-6">
        {/* Brand / Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-card bg-sage-light text-sage-dark mb-3">
            <ShieldCheck className="h-6 w-6 text-sage" />
          </div>
          <h1 className="font-headline text-headline-lg font-semibold text-ink">
            Aarush Quality Services
          </h1>
          <p className="text-body-sm text-stone-text mt-1">
            Communication &amp; Notification Preferences
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-card border border-divider bg-card p-8 shadow-card space-y-6">
          {isLoading ? (
            <div className="py-8 text-center text-body-sm text-stone-text">
              Loading your preferences...
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="p-4 rounded-card border border-red-300 bg-red-50 text-red-800 text-body-sm flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-semibold block">Link Error</span>
                  <span>{error}</span>
                </div>
              </div>
              <p className="text-body-xs text-stone-text text-center">
                If you believe this is in error, please contact your account representative or write to us directly.
              </p>
            </div>
          ) : savedSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-sage-light text-sage">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-headline text-headline-sm font-semibold text-ink">
                  Preferences Updated
                </h2>
                <p className="text-body-sm text-stone-text mt-1">
                  Your communication choices for <strong className="text-ink">{preferences?.email}</strong> have been recorded in our system.
                </p>
              </div>

              <div className="p-4 rounded-card bg-canvas border border-divider text-left text-body-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-text">Festive Greetings:</span>
                  <span className={`font-semibold ${optedInGreetings ? 'text-sage' : 'text-stone-text'}`}>
                    {optedInGreetings ? 'Subscribed' : 'Unsubscribed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-text">Product &amp; Promotional Notes:</span>
                  <span className={`font-semibold ${optedInPromos ? 'text-sage' : 'text-stone-text'}`}>
                    {optedInPromos ? 'Subscribed' : 'Unsubscribed'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSavedSuccess(false)}
                className="text-label-sm text-sage hover:underline font-medium cursor-pointer"
              >
                Modify settings again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-divider pb-4">
                <span className="text-label-xs font-semibold text-stone-text uppercase tracking-wider block">
                  Recipient Details
                </span>
                <p className="font-headline text-body-md font-semibold text-ink mt-0.5">
                  {preferences?.contactName}
                </p>
                <p className="text-body-xs text-stone-text">
                  {preferences?.companyName} • <span className="font-mono text-ink">{preferences?.email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3 rounded-card border border-divider hover:bg-canvas/50 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optedInGreetings}
                    onChange={(e) => setOptedInGreetings(e.target.checked)}
                    className="mt-1 rounded border-divider text-sage focus:ring-sage"
                  />
                  <div>
                    <span className="text-label-sm font-semibold text-ink block flex items-center gap-1.5">
                      <HeartHandshake className="h-4 w-4 text-sage" />
                      <span>Festive Greetings &amp; Celebrations</span>
                    </span>
                    <span className="text-body-xs text-stone-text mt-0.5 block">
                      Warm greetings on New Year, Diwali, Holi, and national milestones.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-card border border-divider hover:bg-canvas/50 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optedInPromos}
                    onChange={(e) => setOptedInPromos(e.target.checked)}
                    className="mt-1 rounded border-divider text-sage focus:ring-sage"
                  />
                  <div>
                    <span className="text-label-sm font-semibold text-ink block flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-sage" />
                      <span>Product Updates &amp; Announcements</span>
                    </span>
                    <span className="text-body-xs text-stone-text mt-0.5 block">
                      New version releases, industrial software features, and advisory notices.
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-3.5 rounded-card bg-canvas border border-divider text-[11px] text-stone-text leading-relaxed">
                <strong className="text-ink">Note regarding active subscriptions:</strong> Important contractual renewal reminders, invoice notices, and purchase order communications will continue to be delivered to authorized contacts to ensure uninterrupted software licensing.
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Save Communication Preferences'}
                </button>

                <button
                  type="button"
                  onClick={handleUnsubscribeAll}
                  disabled={isSaving}
                  className="w-full py-2 rounded-card border border-divider hover:bg-divider/50 text-stone-text text-label-xs font-medium transition-colors cursor-pointer"
                >
                  Opt Out of All Non-Transactional Emails
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-stone-text">
          <span>&copy; {new Date().getFullYear()} Aarush Quality Services. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}

