import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPromptHandler: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [shownToastId, setShownToastId] = useState<string | null>(null);
  const location = useLocation();
  const { toast, dismiss } = useToast();

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    };
  }, []);

  // show toast when on home route and we have a deferredPrompt
  useEffect(() => {
    if (!deferredPrompt) return;
    // only show on home page
    if (location.pathname !== '/') return;

    // if already shown, skip
    if (shownToastId) return;

    const idObj = toast({
      title: 'Install Meeting Room Booker',
      description: 'Install this app for faster access and offline support.',
      action: (
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                if (choice.outcome === 'accepted') {
                  // optionally show a confirmation
                  toast({ title: 'Installed', description: 'Thanks for installing!' });
                } else {
                  toast({ title: 'Install dismissed' });
                }
              } catch (err) {
                console.error('Install prompt error', err);
              }
              // dismiss our install toast
              if (idObj && idObj.id) dismiss(idObj.id);
              setDeferredPrompt(null);
            }}
          >
            Install
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (idObj && idObj.id) dismiss(idObj.id);
            }}
          >
            Later
          </button>
        </div>
      ),
    });

    setShownToastId(idObj.id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredPrompt, location.pathname]);

  return null;
};

export default InstallPromptHandler;
