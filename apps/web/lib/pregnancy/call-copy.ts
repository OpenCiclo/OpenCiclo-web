// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// "When to call", in Spanish and English (like the rest of the pregnancy
// guide: other languages read one of them through `contentLocale`). Approved
// with pregnancy Patterns (#75). Kept apart from lib/pregnancy/guide.ts so the
// day sheet can open it in place without loading the week-by-week guide, which
// stays lazy; guide.ts spreads it back into PREGNANCY_GUIDE.

import type { BaseLocale } from "@/lib/i18n";

export type PregnancyCallCopy = {
  callLabel: string;
  callBody: string;
  callEmergency: string;
};

export const PREGNANCY_CALL_COPY: Record<BaseLocale, PregnancyCallCopy> = {
  es: {
    callLabel: "Llama enseguida a tu matrona o a tu médico",
    callBody:
      "A cualquier hora, sin esperar al día siguiente: sangrado o pérdida de líquido por la vagina; dolor de vientre que no cede; dolor de cabeza intenso o que no se va; cambios en la vista; hinchazón repentina de cara, manos o pies; dolor fuerte justo debajo de las costillas; fiebre de 38 °C o más; vómitos que no te dejan retener líquidos; un brazo o una pierna hinchados, rojos o doloridos; contracciones regulares antes de la semana 37; o si el bebé se mueve menos de lo habitual.",
    callEmergency:
      "Llama a emergencias si el sangrado es abundante, el dolor es muy fuerte, te cuesta respirar, tienes dolor en el pecho, convulsiones o te desmayas, o si piensas en hacerte daño a ti o al bebé.",
  },
  en: {
    callLabel: "Call your midwife or doctor straight away",
    callBody:
      "At any hour, without waiting for the next day: bleeding or fluid leaking from your vagina; tummy pain that does not go away; a headache that is severe or will not go away; changes in your sight; sudden swelling of your face, hands or feet; severe pain just below the ribs; a fever of 38 °C (100.4 °F) or more; vomiting so that you cannot keep fluids down; a swollen, red or painful arm or leg; regular tightenings before week 37; or if the baby moves less than usual.",
    callEmergency:
      "Call the emergency number if the bleeding is heavy, the pain is severe, you have trouble breathing, chest pain, a fit, you faint, or you have thoughts of harming yourself or your baby.",
  },
};
