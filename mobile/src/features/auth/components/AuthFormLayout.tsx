import React from "react";

import { AuthCard, HeroHeader } from "../../../components/common";

interface AuthFormLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  cardTitle: string;
  cardSubtitle: string;
  children: React.ReactNode;
}

export const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  cardTitle,
  cardSubtitle,
  children,
}) => {
  return (
    <>
      <HeroHeader title={heroTitle} subtitle={heroSubtitle} animated={false} />

      <AuthCard title={cardTitle} subtitle={cardSubtitle} animated={false}>
        {children}
      </AuthCard>
    </>
  );
};
