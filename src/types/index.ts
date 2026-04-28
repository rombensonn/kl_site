export interface WaitlistFormData {
  email: string;
  represents?: string;
  useCase?: string;
  role?: string;
  consent: boolean;
  marketingConsent: boolean;
  source?: string;
}

export type FormStatus = "idle" | "loading" | "success" | "error";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}
