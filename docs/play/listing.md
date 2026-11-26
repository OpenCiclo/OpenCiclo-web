# Google Play store listing (draft)

Status: **draft, not reviewed.** Spanish and English. The other ten UI languages can be added later as machine translations, after a native review of the disclaimer.

Copy each block as it is. The character counts are what Play counts (limits: name 30, short description 80, full description 4000). Recount after any edit.

Rules this text follows, so keep them when you edit it:

- It says clearly that Ciclo is **not a medical device**, **not a contraceptive**, and that people should **consult a health professional** (Play's health content policy). This matches the app's disclaimer (`disclaimer` in `apps/web/lib/i18n.ts`): forecasts can be wrong; not a medical device, a diagnosis, or a contraceptive method.
- No claim the app cannot back: no "predicts ovulation", no "accurate", no "medical", no "clinically", no "100 %".
- Features are described as the app behaves today.

Decisions still open that change this text (see the launch tracker):

- **P9, estimated ovulation.** The text mentions the estimated ovulation because the calendar shows it (a window of days with the most likely day marked; it replaced the old fixed fertile window in November 2026). If it is removed or reworded for launch, change the "What you can do" bullet in both languages.
- **P8, research pool.** The listing does not advertise the pool. If it stays, it must be declared in the Data safety form; the listing needs no change.
- **P4, contact email.** Play asks for a public developer email in the store settings (not in this text). Use the mailbox chosen for P4, and set `PRIVACY_EMAIL` in `apps/web/lib/marketing/copy.ts`.
- **P11, countries** and **P12, age range.** Set in Play Console, not here. If the US is included, Washington's My Health My Data Act asks for a separate consumer health data policy linked from the home page.

Links for Play Console:

- Privacy policy: `https://www.openciclo.com/privacy?lang=en` for the English listing, `?lang=es` for the Spanish one. `lang` only picks the language shown (any UI language tag works; ones without their own text fall back to Spanish or English) and is never saved.
- Account deletion (Data safety, "Delete account URL"): `https://www.openciclo.com/delete-account?lang=en`, or `?lang=es`.
- Website: `https://www.openciclo.com`

## Spanish (es-ES)

App name (23):

```text
Ciclo: diario menstrual
```

Short description (77):

```text
Diario menstrual cifrado en tu móvil, con pronósticos honestos. Sin anuncios.
```

Full description (2055):

```text
Ciclo es un diario del periodo con pronósticos del ciclo, hecho por el proyecto de código abierto OpenCiclo. Tu diario se cifra en tu móvil antes de guardarse: ni siquiera nosotras podemos leerlo.

QUÉ PUEDES HACER
• Apuntar los días de regla y el sangrado, el moco cervical, síntomas, estados de ánimo, actividad sexual, tests de embarazo y de ovulación, tomas de la píldora y notas breves.
• Ver cuándo puede llegar tu próximo periodo, siempre con su margen de incertidumbre, nunca con una fecha falsamente exacta.
• Ver en el calendario las fases estimadas del ciclo y los días en que puede caer la ovulación (una estimación). Puedes ocultar todos los pronósticos en Ajustes.
• Ver la duración media de tus ciclos, cómo cambia con el tiempo y tus síntomas más frecuentes.
• Leer más de 100 artículos de salud con fuentes citadas sobre el ciclo, los síntomas y cuándo pedir ayuda.
• Exportar tu diario en JSON o CSV cuando quieras.
• Usar la app en 12 idiomas.

PRIVACIDAD DE VERDAD
• Tu diario se cifra en tu dispositivo con AES-256 antes de guardarse. El servidor solo guarda la copia cifrada y no puede leerla.
• Elige cómo entrar: correo y contraseña, una frase de 12 palabras sin correo, o «Solo en este dispositivo», sin cuenta ni servidor.
• Los pronósticos se calculan en tu móvil. Tus fechas no se envían a ningún sitio para hacer predicciones.
• Sin anuncios, sin analítica, sin rastreadores. No vendemos tus datos.
• Puedes borrar tu cuenta y todos tus datos desde Ajustes cuando quieras.
• El código y el modelo de pronóstico son abiertos (licencia Apache 2.0).

IMPORTANTE
Ciclo no es un dispositivo médico. No diagnostica, no trata y no previene ninguna enfermedad. No es un método anticonceptivo: no lo uses para evitar un embarazo. Tampoco es un test de ovulación ni de embarazo. Los pronósticos, las fases y la ovulación estimada son estimaciones y pueden fallar. Ante cualquier duda sobre tu salud, consulta a un profesional sanitario.

Política de privacidad: https://www.openciclo.com/privacy?lang=es
Borrar tu cuenta: https://www.openciclo.com/delete-account?lang=es
```

## English (en-US)

App name (27):

```text
Ciclo: private period diary
```

Short description (76):

```text
Period diary encrypted on your phone. Honest forecasts. No ads, no tracking.
```

Full description (1907):

```text
Ciclo is a period diary with cycle forecasts, made by the open-source OpenCiclo project. Your diary is encrypted on your phone before it is saved: not even we can read it.

WHAT YOU CAN DO
• Log period days and flow, cervical mucus, temperature, symptoms, moods, sexual activity, pregnancy and ovulation tests, pill intake and short notes.
• See when your next period may come, always with its range of uncertainty, never a falsely exact date.
• See estimated cycle phases and the days ovulation may fall on (an estimate) on the calendar. You can hide all forecasts in Settings.
• See your average cycle length, how it changes over time, and your most logged symptoms.
• Read more than 100 health articles with cited sources about the cycle, symptoms, and when to seek care.
• Export your diary as JSON or CSV whenever you like.
• Use the app in 12 languages.

REAL PRIVACY
• Your diary is encrypted on your device with AES-256 before it is saved. The server keeps only the encrypted copy and cannot read it.
• Choose how to sign in: email and password, a 12-word phrase with no email, or "Only on this device", with no account and no server.
• Forecasts are calculated on your phone. Your dates are not sent anywhere to be predicted.
• No ads, no analytics, no trackers. We do not sell your data.
• Delete your account and all your data from Settings at any time.
• The code and the forecast model are open source (Apache 2.0 license).

IMPORTANT
Ciclo is not a medical device. It does not diagnose, treat or prevent any condition. It is not a contraceptive method: do not use it to avoid pregnancy. It is not an ovulation or pregnancy test either. Forecasts, phases and the estimated ovulation are estimates and can be wrong. For any question about your health, consult a doctor or another health professional.

Privacy policy: https://www.openciclo.com/privacy?lang=en
Delete your account: https://www.openciclo.com/delete-account?lang=en
```
