"use client";

import { createContext, Dispatch, ReactNode, SetStateAction } from "react";

import { useSignInModal } from "@/components/modals//sign-in-modal";
import { useGuestLoginModal } from "@/components/modals/guest-login-modal";

export const ModalContext = createContext<{
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
  setShowGuestModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowSignInModal: () => {},
  setShowGuestModal: () => {},
});

export default function ModalProvider({ children }: { children: ReactNode }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const { GuestLoginModal, setShowGuestModal } = useGuestLoginModal();

  return (
    <ModalContext.Provider
      value={{
        setShowSignInModal,
        setShowGuestModal,
      }}
    >
      <SignInModal />
      <GuestLoginModal />
      {children}
    </ModalContext.Provider>
  );
}
