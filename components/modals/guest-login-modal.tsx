import { signIn } from "next-auth/react";
import { Dispatch, SetStateAction, useCallback, useMemo, useState, useEffect } from "react";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { siteConfig } from "@/config/site";

import { getActiveAuthProviders } from "@/actions/get-auth-providers";

function GuestLoginModal({
  showGuestModal,
  setShowGuestModal,
}: {
  showGuestModal: boolean;
  setShowGuestModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [signInClicked, setSignInClicked] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    if (showGuestModal) {
      getActiveAuthProviders().then((res) => {
        setProviders(res);
      });
    }
  }, [showGuestModal]);

  return (
    <Modal showModal={showGuestModal} setShowModal={setShowGuestModal}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a>
          <h3 className="font-urban text-2xl font-bold">Awesome Generation Complete!</h3>
          <p className="text-sm text-gray-500">
            Sign in now to save this output to your immutable history log and unlock unlimited access to the ProJob workspace.
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
          {providers.length > 0 ? (
            providers.map((provider) => (
              <Button
                key={provider}
                variant="default"
                disabled={!!signInClicked}
                onClick={() => {
                  setSignInClicked(provider);
                  signIn(provider, { redirect: false }).then(() =>
                    setTimeout(() => {
                      setShowGuestModal(false);
                      setSignInClicked(null);
                    }, 400),
                  );
                }}
              >
                {signInClicked === provider ? (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                ) : provider === "google" ? (
                  <Icons.google className="mr-2 size-4" />
                ) : provider === "github" ? (
                  <Icons.gitHub className="mr-2 size-4" />
                ) : (
                  <Icons.user className="mr-2 size-4" />
                )}{" "}
                Sign In with {provider.charAt(0).toUpperCase() + provider.slice(1)} to Save
              </Button>
            ))
          ) : (
            <div className="text-center text-sm text-slate-500">No auth providers enabled.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function useGuestLoginModal() {
  const [showGuestModal, setShowGuestModal] = useState(false);

  const GuestLoginModalCallback = useCallback(() => {
    return (
      <GuestLoginModal
        showGuestModal={showGuestModal}
        setShowGuestModal={setShowGuestModal}
      />
    );
  }, [showGuestModal, setShowGuestModal]);

  return useMemo(
    () => ({
      setShowGuestModal,
      GuestLoginModal: GuestLoginModalCallback,
    }),
    [setShowGuestModal, GuestLoginModalCallback],
  );
}
