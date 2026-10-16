// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const SYMPTOMS_ARTICLES: LearnArticle[] = [
  {
    slug: "pms",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      { label: "Office on Women's Health — Premenstrual syndrome (PMS)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome" },
      { label: "CDC — About sleep", href: "https://www.cdc.gov/sleep/about/index.html" },
    ],
    related: ["pmdd", "mood-and-cycle", "bloating-digestion"],
    es: {
      title: "Síndrome premenstrual (SPM)",
      summary: "El SPM es una mezcla de cambios físicos y emocionales en la semana o las dos semanas antes del periodo. La mayoría de las personas tiene algún síntoma, y puedes hacer mucho para sentirte mejor.",
      sections: [
        {
          heading: "Qué es el SPM",
          body: "El síndrome premenstrual (SPM) es muy común. Los síntomas pueden empezar hasta 2 semanas antes del periodo y suelen desaparecer pocos días después de que empiece, cuando los niveles hormonales vuelven a subir. Más del 90% de las mujeres dicen tener al menos algún síntoma premenstrual. Es probable que se trate de SPM si tus síntomas siguen un patrón. Empiezan en los 5 días antes del periodo y terminan en los 4 días siguientes al inicio del sangrado. Aparecen durante al menos 3 ciclos seguidos y dificultan tu vida diaria.",
        },
        {
          heading: "Señales habituales",
          body: "Entre las señales físicas están la hinchazón o la sensación de gases, los pechos sensibles o hinchados, los cólicos, el dolor de cabeza o de espalda, el estreñimiento o la diarrea, los granos y el cabello graso. Entre los cambios emocionales y de conducta están los cambios de ánimo, la irritabilidad, tener el ánimo bajo, sentir ansiedad o ganas de llorar, el cansancio y dormir más o menos de lo habitual. También son comunes los cambios de apetito o los antojos, la dificultad para concentrarte y el menor interés por el sexo. Puede que solo notes algunos.",
        },
        {
          heading: "Por qué ocurre",
          body: "Los expertos no entienden del todo por qué ocurre el SPM. Parece estar relacionado con los cambios hormonales del ciclo. Después de la ovulación, la progesterona sube. Si no hay embarazo, el estrógeno y la progesterona bajan bruscamente en los días antes del periodo. Los síntomas suelen aparecer en esta segunda mitad del ciclo. El SPM puede ser más probable si tienes mucho estrés, si has tenido depresión o depresión posparto, o si hay antecedentes de depresión en tu familia. Es más común entre los 30 y los 39 años, y puede empeorar la migraña, el asma y las alergias.",
        },
        {
          heading: "Pasos diarios que ayudan",
          body: "Hacer ejercicio aeróbico con regularidad a lo largo del mes puede aliviar el cansancio, el ánimo bajo y la falta de concentración. Intenta dormir al menos 7 horas cada noche, porque dormir mal puede empeorar los cambios de ánimo. Algunas personas se sienten mejor si hacen comidas más pequeñas cada 2 a 3 horas. Reducir la cafeína, la sal y el azúcar en las 2 semanas antes del periodo puede aliviar muchos síntomas. El yoga, la meditación, hablar con amistades o escribir un diario pueden ayudar con el estrés. Fumar se asocia a un SPM más frecuente e intenso, y también ayuda no beber demasiado alcohol.",
        },
        {
          heading: "Analgésicos, suplementos y tratamiento",
          body: "Los analgésicos como el ibuprofeno o el paracetamol pueden aliviar el dolor. Algunos estudios sugieren que el calcio puede ayudar con el cansancio, los antojos y el ánimo bajo, y que la vitamina B6 o el magnesio pueden ayudar con algunos síntomas. Los resultados de remedios de hierbas como el sauzgatillo y el aceite de onagra (o de prímula) son dispares. Si tomas otros medicamentos, consulta con un médico o con tu farmacéutico o farmacéutica antes de empezar un suplemento. Un médico puede sugerir la píldora anticonceptiva combinada para los síntomas físicos, un antidepresivo (normalmente de un tipo llamado ISRS) para los síntomas emocionales, o una terapia psicológica llamada terapia cognitivo-conductual (TCC).",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus síntomas afectan a tu vida diaria o si los cambios en tus hábitos no han ayudado. Antes de ir, anota tus síntomas cada día durante al menos 2 ciclos. Registrar tu estado de ánimo y tus síntomas en Ciclo puede mostrar con claridad cuándo empiezan y cuándo terminan. Si tus síntomas son intensos, sobre todo la ira, la ansiedad o el ánimo bajo, pregunta por el trastorno disfórico premenstrual (TDPM). Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de crisis.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si los síntomas premenstruales afectan a tu vida diaria, habla con un médico o una enfermera.",
    },
    en: {
      title: "Premenstrual syndrome (PMS)",
      summary: "PMS is a mix of physical and emotional changes in the week or two before a period. Most people get some symptoms, and there is a lot you can do to feel better.",
      sections: [
        {
          heading: "What PMS is",
          body: "Premenstrual syndrome (PMS) is very common. Symptoms can start up to 2 weeks before a period and usually fade within a few days of it starting, as hormone levels begin to rise again. Over 90% of women say they get at least some premenstrual symptoms. PMS is likely if your symptoms follow a pattern. They start in the 5 days before your period and end within 4 days after bleeding starts. They happen for at least 3 cycles in a row and get in the way of daily life.",
        },
        {
          heading: "Common signs",
          body: "Physical signs include bloating or a gassy feeling, tender or swollen breasts, cramps, headaches or backache, constipation or diarrhoea, spotty skin and greasy hair. Emotional and behaviour changes include mood swings, irritability, feeling low, anxious or tearful, tiredness, and sleeping more or less than usual. Changes in appetite or food cravings, trouble concentrating and less interest in sex are also common. You may notice only a few of these.",
        },
        {
          heading: "Why it happens",
          body: "Experts do not fully understand why PMS happens. It seems to be linked to hormone changes in the cycle. After ovulation, progesterone rises. If you do not get pregnant, oestrogen and progesterone then fall sharply in the days before your period. Symptoms tend to appear in this second half of the cycle. PMS may be more likely if you are under a lot of stress, have had depression or postnatal depression, or have a family history of depression. It is most common in people in their 30s, and it can make migraine, asthma and allergies worse.",
        },
        {
          heading: "Everyday steps that help",
          body: "Regular aerobic exercise through the month can ease tiredness, low mood and poor focus. Try to get at least 7 hours of sleep a night, as poor sleep can make moodiness worse. Some people feel better eating smaller meals every 2 to 3 hours. Cutting down on caffeine, salt and sugar in the 2 weeks before your period may ease many symptoms. Yoga, meditation, talking with friends or writing in a journal can help with stress. Smoking is linked to more and worse PMS, and it helps not to drink too much alcohol.",
        },
        {
          heading: "Painkillers, supplements and treatment",
          body: "Painkillers such as ibuprofen or paracetamol can ease pain. Some studies suggest calcium may help with tiredness, cravings and low mood, and that vitamin B6 or magnesium may help some symptoms. Results for herbal remedies such as chasteberry and evening primrose oil are mixed. If you take other medicines, check with a doctor or pharmacist before starting a supplement. A doctor may suggest the combined pill for physical symptoms, an antidepressant (usually a type called an SSRI) for emotional symptoms, or a talking therapy called cognitive behavioural therapy (CBT).",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your symptoms affect your daily life or if lifestyle changes have not helped. Before you go, note your symptoms each day for at least 2 cycles. Logging your mood and symptoms in Ciclo can show clearly when they start and stop. If your symptoms are severe, especially anger, anxiety or low mood, ask about premenstrual dysphoric disorder (PMDD). If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If premenstrual symptoms affect your daily life, talk to a doctor or nurse.",
    },
  },
  {
    slug: "pmdd",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Premenstrual dysphoric disorder (PMDD)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome/premenstrual-dysphoric-disorder-pmdd" },
      { label: "IAPMD — What is PMDD?", href: "https://iapmd.org/about-pmdd" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
    ],
    related: ["pms", "mood-and-cycle", "depression"],
    es: {
      title: "Trastorno disfórico premenstrual (TDPM)",
      summary: "El TDPM es una forma grave del SPM que afecta sobre todo al estado de ánimo en la semana o las dos semanas antes del periodo. Es un problema de salud reconocido, y el tratamiento puede ayudar.",
      sections: [
        {
          heading: "Qué es el TDPM",
          body: "El trastorno disfórico premenstrual (TDPM) es una forma grave del síndrome premenstrual (SPM). Afecta sobre todo al estado de ánimo. Puede causar de forma intensa ánimo bajo, ansiedad, irritabilidad o ira en la semana o las dos semanas antes del periodo. Los síntomas suelen aliviarse 2 a 3 días después de que empiece el sangrado. Hasta un 5% de las mujeres en edad fértil tienen TDPM.",
        },
        {
          heading: "Por qué ocurre",
          body: "El TDPM no es un desequilibrio hormonal. Las personas con TDPM tienen niveles hormonales normales, que suben y bajan como de costumbre a lo largo del ciclo. Pero su cerebro reacciona con fuerza a estos cambios normales. La serotonina, un mensajero químico del cerebro cuyos niveles cambian a lo largo del ciclo, también puede influir. Algunas personas parecen ser más sensibles que otras a estos cambios.",
        },
        {
          heading: "Señales del TDPM",
          body: "Entre las señales del estado de ánimo están la irritabilidad o la ira persistentes que afectan a otras personas, una tristeza profunda o desesperanza, tensión o ansiedad, ataques de pánico, cambios de ánimo y llorar a menudo. Puedes perder interés por la vida diaria y las relaciones, tener dificultad para concentrarte, sentir mucho cansancio, dormir mal, sentir que pierdes el control, o tener antojos fuertes o atracones de comida. También pueden aparecer señales físicas como hinchazón, pechos sensibles, dolor de cabeza y dolor en las articulaciones o los músculos. Algunas personas tienen pensamientos de suicidio. Lo más característico es el momento: los síntomas aumentan antes del periodo y desaparecen cuando empieza.",
        },
        {
          heading: "Cómo se diagnostica",
          body: "No hay ningún análisis de sangre para el TDPM. En su lugar, el médico suele pedirte que anotes tus síntomas cada día durante al menos 2 ciclos. Así se ve si siguen el patrón de tu ciclo. Para el diagnóstico hacen falta 5 síntomas o más, y al menos uno debe ser del estado de ánimo. Registrar cada día tu estado de ánimo y tus síntomas en Ciclo, junto a las fechas de tu periodo, te da un registro claro para llevar a la consulta.",
        },
        {
          heading: "Tratamiento y apoyo",
          body: "Hay varios tratamientos que pueden ayudar. Una opción son los antidepresivos llamados inhibidores selectivos de la recaptación de serotonina (ISRS). A algunas personas se les ofrecen ciertas píldoras anticonceptivas. Los analgésicos sin receta pueden aliviar los síntomas físicos. Manejar el estrés, por ejemplo con técnicas de relajación o reservando tiempo para actividades que disfrutas, también puede ayudar. El médico también puede sugerir una terapia psicológica como la terapia cognitivo-conductual (TCC). Si los primeros tratamientos no ayudan, pueden derivarte a un especialista.",
        },
        {
          heading: "Pedir ayuda y mantenerte a salvo",
          body: "Consulta a un médico o una enfermera si los síntomas premenstruales afectan a tu trabajo, tus relaciones o tu vida diaria. El TDPM puede traer pensamientos de suicidio, aunque te sientas bien en otros momentos del mes. Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de crisis. Si sientes que podrías actuar según esos pensamientos, llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o acude a un servicio de urgencias. También puede ayudar contarle a alguien de confianza cómo te sientes.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de crisis.",
    },
    en: {
      title: "Premenstrual dysphoric disorder (PMDD)",
      summary: "PMDD is a severe form of PMS that mainly affects mood in the week or two before a period. It is a recognised medical condition, and treatment can help.",
      sections: [
        {
          heading: "What PMDD is",
          body: "Premenstrual dysphoric disorder (PMDD) is a severe form of premenstrual syndrome (PMS). It mainly affects mood. It can cause intense low mood, anxiety, irritability or anger in the week or two before a period. Symptoms usually ease 2 to 3 days after bleeding starts. Up to 5% of women of childbearing age have PMDD.",
        },
        {
          heading: "Why it happens",
          body: "PMDD is not a hormone imbalance. People with PMDD have normal hormone levels that rise and fall as usual through the cycle. But their brain reacts strongly to these normal changes. Serotonin, a chemical messenger in the brain whose levels change across the cycle, may also play a part. Some people seem to be more sensitive to these shifts than others.",
        },
        {
          heading: "Signs of PMDD",
          body: "Mood signs include lasting irritability or anger that affects other people, deep sadness or despair, tension or anxiety, panic attacks, mood swings and crying often. You may lose interest in daily life and relationships, find it hard to focus, feel very tired, sleep badly, feel out of control, or have strong food cravings or binge eating. Physical signs such as bloating, tender breasts, headaches and joint or muscle pain can also happen. Some people have thoughts of suicide. The key feature is timing: symptoms build before a period and fade once it starts.",
        },
        {
          heading: "How it is diagnosed",
          body: "There is no blood test for PMDD. Instead, a doctor will usually ask you to record your symptoms every day for at least 2 cycles. This shows whether they follow the pattern of your cycle. A diagnosis needs 5 or more symptoms, including at least one mood symptom. Recording your mood and symptoms each day in Ciclo, alongside your period dates, gives you a clear record to bring to the appointment.",
        },
        {
          heading: "Treatment and support",
          body: "Several treatments can help. Antidepressants called selective serotonin reuptake inhibitors (SSRIs) are one option. Some people are offered certain contraceptive pills. Over-the-counter painkillers can ease physical symptoms. Stress management, such as relaxation techniques and making time for activities you enjoy, can also help. A doctor may also suggest a talking therapy such as cognitive behavioural therapy (CBT). If first treatments do not help, you can be referred to a specialist.",
        },
        {
          heading: "Getting help and staying safe",
          body: "See a doctor or nurse if premenstrual symptoms affect your work, relationships or daily life. PMDD can bring thoughts of suicide, even if you feel well at other times of the month. If you are thinking about harming yourself, get emergency help or contact a crisis line now. If you feel you might act on these thoughts, call your local emergency number or go to an emergency department. It can also help to tell someone you trust how you are feeling.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
    },
  },
  {
    slug: "breast-pain",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Breast pain", href: "https://www.nhs.uk/conditions/breast-pain/" },
      { label: "NHS — Symptoms of breast cancer in women", href: "https://www.nhs.uk/conditions/breast-cancer-in-women/symptoms-of-breast-cancer-in-women/" },
      { label: "Office on Women's Health — Premenstrual syndrome (PMS)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome" },
    ],
    related: ["breast-awareness", "pms"],
    es: {
      title: "Dolor cíclico en los pechos",
      summary: "El dolor en los pechos que va y viene con tu ciclo es común y rara vez es grave. Aquí verás cómo se siente, qué ayuda y cuándo conviene revisarlo.",
      sections: [
        {
          heading: "Qué es el dolor cíclico en los pechos",
          body: "Tener los pechos doloridos es muy común, y la causa rara vez es grave. Por sí solo, es poco probable que sea una señal de cáncer. El dolor que va y viene con los periodos se llama dolor cíclico en los pechos, y está relacionado con los cambios hormonales del ciclo. Los pechos sensibles o hinchados son una de las señales más comunes del síndrome premenstrual (SPM). Los pechos también pueden doler durante el embarazo y alrededor de la menopausia, cuando las hormonas también cambian.",
        },
        {
          heading: "Cómo se siente normalmente",
          body: "El dolor cíclico en los pechos suele empezar hasta 2 semanas antes del periodo. Tiende a empeorar a medida que se acerca el periodo, y desaparece cuando el periodo termina. Suele ser un dolor sordo, una sensación de pesadez o una molestia continua. A menudo afecta a los dos pechos, y el dolor puede extenderse hacia la axila.",
        },
        {
          heading: "Otras causas del dolor en los pechos",
          body: "No todo dolor en los pechos está relacionado con el periodo. Las distensiones musculares o las lesiones en el cuello, el hombro o la espalda pueden notarse como dolor en los pechos. Algunos medicamentos, como la píldora anticonceptiva y algunos antidepresivos, pueden causar dolor en los pechos. La mastitis (un pecho doloroso e hinchado, a veces por una infección), o una acumulación de pus llamada absceso mamario, también pueden causar dolor, y un médico debe revisarlas.",
        },
        {
          heading: "Qué puede ayudar",
          body: "Usa un sujetador que te quede bien durante el día y uno suave por la noche. Los analgésicos como el paracetamol o el ibuprofeno, o un gel analgésico aplicado sobre los pechos, pueden aliviar el dolor. Hay pocas pruebas de que los suplementos de vitamina E o el aceite de onagra (o de prímula) ayuden. Anotar el dolor en los pechos en Ciclo durante unos ciclos puede mostrar si va ligado a tu periodo.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si el dolor en los pechos no mejora o los analgésicos no ayudan. Consulta también si hay casos de cáncer de mama en tu familia o si podrías estar embarazada. Pide una cita urgente si encuentras un bulto duro en el pecho o en la axila, si un pecho cambia de forma, si la piel se ve con hoyuelos como la piel de naranja, si el pezón se hunde hacia dentro o tiene un sarpullido, o si sale líquido del pezón. Pide consejo médico el mismo día si tienes dolor en los pechos con fiebre muy alta, o si sientes calor, frío o escalofríos. Haz lo mismo si una parte del pecho está roja, caliente o hinchada.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si encuentras un bulto o notas un cambio en tu pecho, consulta a un médico o una enfermera.",
    },
    en: {
      title: "Cyclical breast pain",
      summary: "Breast pain that comes and goes with your cycle is common and rarely serious. Here is how it feels, what helps and when to get it checked.",
      sections: [
        {
          heading: "What cyclical breast pain is",
          body: "Sore breasts are very common, and the cause is rarely serious. On its own, it is unlikely to be a sign of cancer. Pain that comes and goes with your periods is called cyclical breast pain, and it is linked to the hormone changes of the cycle. Tender or swollen breasts are one of the most common signs of premenstrual syndrome (PMS). Breasts can also get sore during pregnancy and around menopause, when hormones change too.",
        },
        {
          heading: "How it usually feels",
          body: "Cyclical breast pain usually starts up to 2 weeks before a period. It tends to get worse as the period comes closer, and then goes away when the period ends. It usually feels dull, heavy or aching. It often affects both breasts, and the ache can spread into the armpit.",
        },
        {
          heading: "Other causes of breast pain",
          body: "Not all breast pain is linked to periods. Strains or injuries to the neck, shoulder or back can be felt as pain in the breast. Some medicines, including the contraceptive pill and some antidepressants, can cause breast pain. Mastitis (a painful, swollen breast, sometimes caused by an infection), or a collection of pus called a breast abscess, can also cause pain and needs to be checked by a doctor.",
        },
        {
          heading: "What can help",
          body: "Wear a well-fitted bra during the day and a soft bra at night. Painkillers such as paracetamol or ibuprofen, or a painkilling gel rubbed on the breasts, can ease the ache. There is little evidence that vitamin E tablets or evening primrose oil help. Noting breast pain in Ciclo for a few cycles can show whether it follows your period.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if breast pain is not improving or painkillers are not helping. Also see one if breast cancer runs in your family or you could be pregnant. Ask for an urgent appointment if you find a hard lump in your breast or armpit, a breast changes shape, the skin looks dimpled like orange peel, the nipple turns inwards or has a rash, or fluid comes from the nipple. Get medical advice the same day if you have breast pain with a very high temperature, or you feel hot, cold or shivery. Do the same if part of your breast is red, hot or swollen.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you find a lump or notice a change in your breast, see a doctor or nurse.",
    },
  },
  {
    slug: "menstrual-migraine",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Migraine", href: "https://www.nhs.uk/conditions/migraine/" },
      { label: "Office on Women's Health — Migraine", href: "https://www.womenshealth.gov/a-z-topics/migraine" },
      { label: "NHS — Who can take the combined pill", href: "https://www.nhs.uk/contraception/methods-of-contraception/combined-pill/who-can-take-it/" },
    ],
    related: ["pms", "cycle-hormones", "the-pill"],
    es: {
      title: "Dolor de cabeza y migraña con el periodo",
      summary: "La bajada de las hormonas antes del periodo puede desencadenar dolores de cabeza y migrañas. Conocer tu patrón te ayuda a anticiparte y a recibir el tratamiento adecuado.",
      sections: [
        {
          heading: "Por qué el periodo puede desencadenar migrañas",
          body: "Justo antes de que empiece el periodo, los niveles de las hormonas estrógeno y progesterona bajan bruscamente. En algunas personas, esta bajada puede desencadenar una migraña. Las crisis que ocurren justo antes o durante el periodo se llaman migrañas menstruales. Suelen durar más y ser más intensas que las crisis en otros momentos. Unas 3 de cada 4 personas con migraña son mujeres, y más de la mitad de las migrañas en mujeres ocurren justo antes, durante o después del periodo. Los cambios hormonales más adelante en la vida también importan. En la mayoría de las mujeres, la migraña mejora o desaparece a partir del tercer mes de embarazo aproximadamente, y unas dos terceras partes dicen que mejora después de la menopausia.",
        },
        {
          heading: "Cómo es una migraña",
          body: "Una migraña suele ser un dolor de cabeza palpitante, a menudo en un lado de la cabeza, y puede ser intenso. Muchas personas también tienen náuseas o vómitos, y se vuelven muy sensibles a la luz y al sonido. Una crisis suele durar entre 4 horas y 3 días. Algunas personas notan antes unas señales de aviso llamadas aura, como líneas en zigzag o luces que parpadean, entumecimiento u hormigueo, mareo o dificultad para hablar. El aura no debería durar más de 1 hora.",
        },
        {
          heading: "Detectar tu patrón",
          body: "Otras cosas también pueden desencadenar crisis, como el estrés, el cansancio, saltarse comidas, el exceso de cafeína, la ansiedad y el ánimo bajo. Un diario de dolores de cabeza te ayuda a ti y a tu médico a ver si las crisis siguen tu ciclo. Anota todos los días de tu periodo, no solo el primero, y también cada día con dolor de cabeza. En Ciclo puedes registrar los días de periodo y añadir un tag o una nota cuando tengas dolor de cabeza. Comer bien, dormir lo suficiente y hacer actividad física, idealmente 30 minutos casi todos los días, también puede ayudar.",
        },
        {
          heading: "Tratamientos que pueden ayudar",
          body: "Durante una crisis, puede ayudar dormir o acostarte en una habitación a oscuras. Los analgésicos de farmacia son una opción, pero intenta no tomarlos más de 2 días a la semana, porque tomarlos más a menudo puede causar más dolores de cabeza. Un médico puede recetar medicamentos llamados triptanes o gepantes para las crisis, medicamentos contra las náuseas, o medicamentos diarios para prevenir las crisis. Si tomas la píldora, el médico puede sugerirte tomar solo las píldoras con hormonas durante 3 meses seguidos, sin el descanso habitual, lo que puede mejorar los dolores de cabeza. Si tienes migraña con aura, puede que la píldora combinada no sea segura para ti, así que díselo al médico o a la enfermera que te receta el anticonceptivo.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta a un médico o una enfermera si tienes varios dolores de cabeza al mes que duran horas o días cada uno, o si los dolores de cabeza alteran tu vida en casa, en el trabajo o en los estudios. Pide consejo pronto si una migraña dura más de 3 días, si el aura dura más de 1 hora, o si tienes una migraña durante el embarazo o poco después del parto. Busca ayuda de emergencia (llama al número de emergencias de tu país, por ejemplo, 911 en México o 112 en España) si un dolor de cabeza aparece de repente y es muy intenso, o si llega con una convulsión, fiebre muy alta o una lesión reciente en la cabeza. Busca también ayuda de emergencia si te cuesta hablar o recordar, pierdes la vista o ves doble, tienes somnolencia o confusión, o sientes debilidad en un lado de la cara o del cuerpo.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Un dolor de cabeza repentino y muy intenso necesita ayuda de emergencia.",
    },
    en: {
      title: "Headaches and migraine around your period",
      summary: "Falling hormone levels before a period can trigger headaches and migraine. Knowing your pattern helps you plan ahead and get the right treatment.",
      sections: [
        {
          heading: "Why periods can trigger migraine",
          body: "Just before a period starts, levels of the hormones oestrogen and progesterone drop sharply. In some people, this fall can trigger a migraine. Attacks that happen just before or during a period are called menstrual migraines. They are often longer and more severe than attacks at other times. About 3 in 4 people with migraine are women, and more than half of migraines in women happen just before, during or after a period. Hormone shifts later in life matter too. For most women, migraine improves or stops from about the third month of pregnancy, and about two-thirds say it improves after menopause.",
        },
        {
          heading: "What a migraine feels like",
          body: "A migraine is usually a throbbing headache, often on one side of the head, and it can be severe. Many people also feel sick or vomit, and become very sensitive to light and sound. An attack usually lasts between 4 hours and 3 days. Some people first get warning signs called aura, such as zigzag lines or flashing lights, numbness or pins and needles, dizziness or difficulty speaking. Aura should not last longer than 1 hour.",
        },
        {
          heading: "Spotting your pattern",
          body: "Other things can trigger attacks too, including stress, tiredness, skipping meals, too much caffeine, anxiety and low mood. A headache diary helps you and your doctor see whether attacks follow your cycle. Note every day of your period, not just the first day, as well as each headache day. In Ciclo you can log your period days and add a tag or note when you get a headache. Eating well, getting enough sleep and being active, ideally for 30 minutes on most days, can also help.",
        },
        {
          heading: "Treatment that can help",
          body: "During an attack, sleeping or lying down in a dark room can help. Painkillers from a pharmacy are an option, but try not to take them on more than 2 days a week, as taking them more often can cause more headaches. A doctor can prescribe medicines called triptans or gepants for attacks, medicine to stop you feeling sick, or daily medicines to prevent attacks. If you take the pill, a doctor may suggest taking only hormone pills for 3 months in a row, without the usual break, which can improve headaches. If you get migraine with aura, the combined pill may not be safe for you, so tell the doctor or nurse who prescribes your contraception.",
        },
        {
          heading: "When to get help",
          body: "See a doctor or nurse if you have several headaches a month that each last hours or days, or if headaches disrupt your home, work or school life. Get advice soon if a migraine lasts longer than 3 days, aura lasts longer than 1 hour, or you get a migraine while pregnant or soon after giving birth. Get emergency help if a headache comes on suddenly and is extremely painful, or comes with a fit, a very high temperature, or a recent head injury. Also get emergency help if you have trouble speaking or remembering, lose your vision or see double, feel drowsy or confused, or have weakness on one side of your face or body.",
        },
      ],
      notice: "This is general information, not a diagnosis. A sudden, extremely painful headache needs emergency help.",
    },
  },
  {
    slug: "hormonal-acne",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Acne", href: "https://www.nhs.uk/conditions/acne/" },
      { label: "MedlinePlus — Acne", href: "https://medlineplus.gov/acne.html" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      { label: "NHS — Isotretinoin: a medicine for severe acne", href: "https://www.nhs.uk/medicines/isotretinoin-capsules/" },
    ],
    related: ["pms", "pcos", "body-image"],
    es: {
      title: "El acné y tu ciclo",
      summary: "Los granos que empeoran antes del periodo son comunes y están relacionados con cambios hormonales normales. Cuidar la piel con suavidad ayuda, y un médico puede ofrecerte más si hace falta.",
      sections: [
        {
          heading: "Por qué los granos pueden empeorar con tu ciclo",
          body: "El acné aparece cuando los folículos pilosos de la piel se tapan con grasa y células muertas. Los cambios en los niveles hormonales pueden desencadenarlo, por eso el acné es común en la pubertad, alrededor del periodo, en el embarazo y en la menopausia. Los granos y el cabello graso están entre las señales más comunes del síndrome premenstrual (SPM), en la semana o las dos semanas antes del periodo. El acné suele afectar a la cara, el pecho y la espalda.",
        },
        {
          heading: "Tipos de granos",
          body: "El acné puede ir de leve a grave. Los puntos negros son granos negros o marrones que suelen ser planos. Los puntos blancos son pequeños bultos del mismo color que tu piel. Las pápulas son bultos elevados, y las pústulas son bultos elevados con pus. Los nódulos y los quistes son bultos más grandes bajo la piel, y pueden ser profundos y dolorosos.",
        },
        {
          heading: "Mitos comunes",
          body: "El acné no se debe a tener la piel sucia, y los puntos negros no son suciedad. Hay pocas pruebas de que alimentos como el chocolate o la comida con mucha grasa influyan mucho en el acné en la mayoría de las personas. El estrés no causa acné, aunque puede empeorar los granos. Cualquiera puede tener acné, aunque es común en adolescentes y adultos jóvenes.",
        },
        {
          heading: "Cuidar tu piel",
          body: "Lávate la piel dos veces al día con un limpiador suave, e intenta no tocarla demasiado. No pellizques ni revientes los granos, porque pueden quedar cicatrices. Elige productos para la piel y maquillaje con la etiqueta «no comedogénico», que están hechos para no tapar los poros. Las cremas o geles de farmacia con ácido salicílico o peróxido de benzoilo pueden ayudar. Intenta evitar el exceso de sol. Anotar los brotes en Ciclo durante unos ciclos puede mostrar si tus granos van ligados a tu periodo.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si has intentado tratar el acné por tu cuenta y no mejora, si tienes muchos granos, o si los granos son profundos, duelen o dejan cicatrices. Un médico puede recetar cremas o geles (como retinoides o antibióticos), antibióticos en pastillas, la píldora anticonceptiva combinada o, para algunas personas, un medicamento más fuerte que se toma por boca llamado isotretinoína. La isotretinoína puede dañar gravemente al bebé en desarrollo, así que no debe tomarse durante el embarazo ni cuando buscas un embarazo. Si el acné afecta a tu estado de ánimo o a tu confianza, eso ya es por sí solo un motivo para consultar a un médico. El acné también puede estar relacionado con el síndrome de ovario poliquístico (SOP, que ahora también se conoce como PMOS, por sus siglas en inglés), así que cuéntale al médico cualquier cambio en tus periodos.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si el acné te duele, te deja cicatrices o te desanima, habla con un médico o una enfermera.",
    },
    en: {
      title: "Acne and your cycle",
      summary: "Spots that flare before a period are common and linked to normal hormone changes. Gentle skin care helps, and a doctor can offer more if needed.",
      sections: [
        {
          heading: "Why spots can flare with your cycle",
          body: "Acne happens when hair follicles in the skin get blocked with oil and dead skin cells. Changes in hormone levels can trigger it, which is why acne is common during puberty, around periods, in pregnancy and at menopause. Spotty skin and greasy hair are among the most common signs of premenstrual syndrome (PMS), in the week or two before a period. Acne usually affects the face, chest and back.",
        },
        {
          heading: "Types of spots",
          body: "Acne can range from mild to severe. Blackheads are black or brown spots that are usually flat. Whiteheads are small bumps the same colour as your skin. Papules are raised bumps, and pustules are raised bumps filled with pus. Nodules and cysts are larger lumps under the skin, and they can be deep and painful.",
        },
        {
          heading: "Common myths",
          body: "Acne is not caused by dirty skin, and blackheads are not dirt. There is little evidence that foods such as chocolate or greasy food have much effect on acne for most people. Stress is not a cause of acne, though it may make spots worse. Anyone can get acne, though it is common in teenagers and young adults.",
        },
        {
          heading: "Caring for your skin",
          body: "Wash your skin twice a day with a gentle cleanser, and try not to touch it too much. Do not pick or squeeze spots, as this can cause scars. Choose skincare and make-up labelled non-comedogenic, which are made not to block pores. Creams or gels from a pharmacy containing salicylic acid or benzoyl peroxide can help. Try to avoid too much sun. Noting flare-ups in Ciclo for a few cycles can show whether your spots follow your period.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if you have tried treating acne yourself and it is not getting better, if you have lots of spots, or if spots are deep, painful or leaving scars. A doctor can prescribe creams or gels (such as retinoids or antibiotics), antibiotic tablets, the combined pill or, for some people, a stronger medicine taken by mouth called isotretinoin. Isotretinoin can seriously harm an unborn baby, so it must not be taken in pregnancy or when trying to get pregnant. If acne is affecting your mood or confidence, that is a reason to see a doctor in itself. Acne can also be linked to polycystic ovary syndrome (PCOS, now also called PMOS), so tell the doctor about any changes in your periods.",
        },
      ],
      notice: "This is general information, not a diagnosis. If acne is painful, scarring or getting you down, talk to a doctor or nurse.",
    },
  },
  {
    slug: "bloating-digestion",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Premenstrual syndrome (PMS)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome" },
      { label: "Mayo Clinic — Water retention: Relieve this premenstrual symptom", href: "https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/water-retention/art-20044983" },
      { label: "BMC Women's Health — Gastrointestinal symptoms before and during menses in healthy women", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3901893/" },
      { label: "NHS — Ovarian cancer: symptoms", href: "https://www.nhs.uk/conditions/ovarian-cancer/symptoms/" },
      { label: "NHS — Bloating", href: "https://www.nhs.uk/conditions/bloating/" },
    ],
    related: ["pms", "gynecologic-cancers", "period-pain"],
    es: {
      title: "Hinchazón y cambios digestivos",
      summary: "Muchas personas notan hinchazón o cambios en el intestino antes o durante el periodo. Es común, y unos pasos sencillos pueden ayudar. Aquí verás cuándo conviene consultar.",
      sections: [
        {
          heading: "Cambios intestinales comunes alrededor del periodo",
          body: "La hinchazón, la sensación de gases, el dolor abdominal, el estreñimiento y la diarrea son comunes antes o durante el periodo. Son señales reconocidas del síndrome premenstrual (SPM). En una encuesta a 156 mujeres sanas, casi 3 de cada 4 tenían al menos un síntoma digestivo antes o durante el periodo. Unas 6 de cada 10 notaban hinchazón antes del periodo, y alrededor de 1 de cada 4 tenía diarrea. La encuesta se basaba en lo que las personas recordaban, así que las cifras exactas son inciertas, pero estos cambios son claramente comunes.",
        },
        {
          heading: "Por qué ocurre",
          body: "Antes del periodo, se cree que los cambios hormonales hacen que el cuerpo retenga más agua, lo que puede darte una sensación de hinchazón. Lo que comes también puede influir, y la comida salada puede hacer que retengas más agua. Durante el periodo, el útero libera unas sustancias llamadas prostaglandinas que hacen que se contraiga. Las prostaglandinas también pueden hacer que se contraigan los músculos del intestino y cambiar cómo maneja los líquidos, lo que puede explicar que algunas personas tengan heces más blandas.",
        },
        {
          heading: "Qué puede ayudar",
          body: "Comer menos sal puede reducir la retención de líquidos. Reducir la cafeína, la sal y el azúcar en las 2 semanas antes del periodo puede aliviar muchos síntomas del SPM. El ejercicio aeróbico regular, dormir bien y relajarte, por ejemplo con ejercicios de respiración, yoga o masajes, también pueden ayudar. Hay algunas pruebas de que el magnesio puede reducir la retención de líquidos y de que la vitamina B6 puede aliviar la hinchazón. Pregunta a tu farmacéutico o farmacéutica antes de tomar suplementos, sobre todo si tomas otros medicamentos.",
        },
        {
          heading: "Medicamentos y registro",
          body: "Si la hinchazón es un problema importante, un médico puede recetar diuréticos (pastillas que ayudan a eliminar líquido), que pueden reducir la hinchazón en algunas personas. Tomar diuréticos junto con analgésicos antiinflamatorios como el ibuprofeno puede dañar los riñones, así que úsalos solo si te lo indica un médico. La anticoncepción hormonal también puede ayudar con los síntomas físicos del SPM. Registrar la digestión y la hinchazón en Ciclo durante unos meses puede mostrar si los cambios siguen tu ciclo o vienen de otra cosa.",
        },
        {
          heading: "Cuándo consultar",
          body: "Consulta a un médico o una enfermera si notas hinchazón o el abdomen hinchado con frecuencia, o si la hinchazón llega con sangre en las heces o con pérdida de peso sin buscarla. Consulta también si a menudo notas que te llenas muy rápido, pierdes el apetito, necesitas orinar más a menudo, o tienes dolor en el abdomen o la pelvis. Estos síntomas tienen muchas causas, pero en raras ocasiones pueden ser una señal de cáncer de ovario. Busca ayuda el mismo día si la hinchazón llega con vómitos, fiebre alta, un bulto en el abdomen, o si no puedes orinar, hacer caca ni expulsar gases. Busca ayuda de emergencia si tienes un dolor repentino e intenso en el abdomen o la pelvis, o si vomitas sangre.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si la hinchazón o los cambios intestinales son frecuentes o no siguen tu ciclo, consulta a un médico o una enfermera.",
    },
    en: {
      title: "Bloating and digestion changes",
      summary: "Many people feel bloated or notice bowel changes before or during a period. This is common, and a few simple steps can help. Here is when to get checked.",
      sections: [
        {
          heading: "Common gut changes around a period",
          body: "Bloating, a gassy feeling, tummy pain, constipation and diarrhoea are all common before or during a period. They are recognised signs of premenstrual syndrome (PMS). In one survey of 156 healthy women, nearly 3 in 4 had at least one gut symptom before or during their period. About 6 in 10 felt bloated before their period, and about 1 in 4 had diarrhoea. The survey relied on people's memory, so the exact figures are uncertain, but these changes are clearly common.",
        },
        {
          heading: "Why it happens",
          body: "Before a period, changing hormone levels are thought to make the body hold on to more water, which can leave you feeling puffy or bloated. What you eat may also play a part, and salty food may make you hold more water. During a period, the womb releases chemicals called prostaglandins that make it squeeze. Prostaglandins can also make the muscles of the bowel squeeze and change how it handles fluid, which may explain looser stools for some people.",
        },
        {
          heading: "What can help",
          body: "Eating less salt may reduce water retention. Cutting down on caffeine, salt and sugar in the 2 weeks before your period may ease many PMS symptoms. Regular aerobic exercise, good sleep and relaxation, such as breathing exercises, yoga or massage, may also help. There is some evidence that magnesium may reduce water retention and that vitamin B6 may ease bloating. Ask a pharmacist before taking supplements, especially if you take other medicines.",
        },
        {
          heading: "Medicines and tracking",
          body: "If bloating is a big problem, a doctor may prescribe water tablets (diuretics), which can reduce bloating for some people. Taking diuretics together with anti-inflammatory painkillers such as ibuprofen can damage the kidneys, so only use them with a doctor's advice. Hormonal contraception may also help the physical symptoms of PMS. Logging digestion and bloating in Ciclo for a few months can show whether changes follow your cycle or come from something else.",
        },
        {
          heading: "When to get checked",
          body: "See a doctor or nurse if you feel bloated or have a swollen tummy regularly, or if bloating comes with blood in your poo or losing weight without trying. Also go if you often feel full quickly, lose your appetite, need to pee more often, or have pain in your tummy or pelvis. These have many causes, but rarely they can be a sign of ovarian cancer. Get help the same day if bloating comes with vomiting, a high temperature, a lump in your tummy, or you cannot pee, poo or pass wind. Get emergency help for sudden, severe pain in your tummy or pelvis, or if you are vomiting blood.",
        },
      ],
      notice: "This is general information, not a diagnosis. If bloating or bowel changes happen often or do not follow your cycle, see a doctor or nurse.",
    },
  },
  {
    slug: "fatigue-sleep",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Premenstrual syndrome (PMS)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome" },
      { label: "NHS — Iron deficiency anaemia", href: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/" },
      { label: "Office on Women's Health — Insomnia", href: "https://www.womenshealth.gov/a-z-topics/insomnia" },
      { label: "CDC — About sleep", href: "https://www.cdc.gov/sleep/about/index.html" },
    ],
    related: ["sleep", "anemia", "heavy-periods"],
    es: {
      title: "Cansancio y sueño a lo largo del ciclo",
      summary: "Tener más cansancio o dormir mal antes del periodo es común. Aquí verás por qué ocurre, qué puede ayudar y cuándo conviene revisar el cansancio.",
      sections: [
        {
          heading: "Por qué puedes sentir más cansancio",
          body: "El cansancio y los cambios en el sueño son señales comunes del síndrome premenstrual (SPM). Algunas personas duermen mal antes del periodo, y otras duermen más de lo habitual. A muchas les cuesta más dormirse y mantener el sueño en los días antes del periodo. Se cree que los cambios hormonales influyen. Estos problemas de sueño suelen aliviarse pocos días después de que empiece el sangrado.",
        },
        {
          heading: "El sueño y el TDPM",
          body: "Los problemas de sueño también son comunes en el trastorno disfórico premenstrual (TDPM), una forma grave del SPM. No poder dormir (insomnio) es un síntoma común del TDPM y a veces puede ser grave. La falta de sueño también se asocia al ánimo bajo y a la ansiedad, y puede empeorar los cambios de ánimo premenstruales.",
        },
        {
          heading: "Periodos abundantes y falta de hierro",
          body: "El cansancio también puede tener otras causas. Los periodos abundantes son una causa muy frecuente de anemia por falta de hierro. Ocurre cuando la falta de hierro impide que el cuerpo produzca suficientes glóbulos rojos sanos. Las señales incluyen cansancio y falta de energía, falta de aire, latidos del corazón que se notan (palpitaciones), piel más pálida de lo habitual y dolor de cabeza. Un análisis de sangre puede detectarla. Si tus niveles son bajos, normalmente se recomiendan pastillas de hierro.",
        },
        {
          heading: "Hábitos que te ayudan a dormir",
          body: "Intenta acostarte y levantarte a la misma hora todos los días, y mantén tu dormitorio a oscuras, fresco y en silencio. Una rutina relajante antes de dormir, como leer, escuchar música o hacer yoga suave, puede ayudarte a desconectar. Evita la cafeína, el alcohol y la nicotina al menos 5 horas antes de acostarte, e intenta evitar las pantallas brillantes justo antes de dormir. La mayoría de las personas adultas necesitan dormir al menos 7 horas cada noche.",
        },
        {
          heading: "Moverte y aliviar los síntomas",
          body: "El ejercicio aeróbico regular a lo largo del mes puede aliviar el cansancio, el ánimo bajo y la falta de concentración relacionados con el SPM. Hacer actividad durante el día ayuda a dormir, pero intenta no hacer ejercicio en las 5 a 6 horas antes de acostarte. Algunos estudios sugieren que el calcio puede ayudar con el cansancio del SPM. Si los cólicos no te dejan dormir, los analgésicos como el ibuprofeno o el paracetamol pueden ayudar. Anotar el cansancio y el sueño en Ciclo con un tag o una nota puede mostrar si siguen tu ciclo.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si el cansancio o dormir mal afecta a tu vida diaria, o si los cambios en tus hábitos no han ayudado. Hazte también una revisión si tus periodos son abundantes o tienes señales de anemia, como falta de aire o palpitaciones. Si sientes que te vas a desmayar, o tienes dolor en el pecho o dificultad para respirar, busca ayuda de emergencia. Si el ánimo bajo, la ansiedad o la ira antes del periodo son intensos, pregunta por el TDPM. Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de crisis.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si el cansancio afecta a tu vida diaria, habla con un médico o una enfermera.",
    },
    en: {
      title: "Tiredness and sleep across the cycle",
      summary: "Feeling more tired or sleeping badly before a period is common. Here is why it happens, what can help, and when tiredness is worth getting checked.",
      sections: [
        {
          heading: "Why you may feel more tired",
          body: "Tiredness and sleep changes are common signs of premenstrual syndrome (PMS). Some people sleep badly before a period, while others sleep more than usual. Many find it harder to fall asleep and stay asleep in the days before a period. Hormone changes are thought to play a part. These sleep problems usually ease within a few days of bleeding starting.",
        },
        {
          heading: "Sleep and PMDD",
          body: "Sleep problems are also common in premenstrual dysphoric disorder (PMDD), a severe form of PMS. Being unable to sleep (insomnia) is a common symptom of PMDD and can sometimes be severe. Lack of sleep is also linked to low mood and anxiety, and it can make premenstrual moodiness worse.",
        },
        {
          heading: "Heavy periods and low iron",
          body: "Tiredness can also have other causes. Heavy periods are a very common cause of iron deficiency anaemia. This is when a lack of iron means your body cannot make enough healthy red blood cells. Signs include tiredness and lack of energy, shortness of breath, noticeable heartbeats (palpitations), paler skin than usual and headaches. A blood test can check for it. If your levels are low, iron tablets are usually recommended.",
        },
        {
          heading: "Habits that help you sleep",
          body: "Try to go to bed and wake up at the same time every day, and keep your bedroom dark, cool and quiet. A calming bedtime routine, such as reading, music or gentle yoga, can help you wind down. Avoid caffeine, alcohol and nicotine for at least 5 hours before bed, and try to avoid bright screens just before you sleep. Most adults need at least 7 hours of sleep a night.",
        },
        {
          heading: "Staying active and easing symptoms",
          body: "Regular aerobic exercise through the month can ease tiredness, low mood and poor focus linked to PMS. Being active during the day helps sleep, but try not to exercise in the 5 to 6 hours before bed. Some studies suggest calcium may help with PMS tiredness. If cramps keep you awake, painkillers such as ibuprofen or paracetamol may help. Noting tiredness and sleep in Ciclo with a tag or note can show whether they follow your cycle.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if tiredness or poor sleep affects your daily life, or if lifestyle changes have not helped. Also get checked if your periods are heavy or you have signs of anaemia, such as breathlessness or palpitations. If you feel faint, or have chest pain or trouble breathing, get emergency help. If low mood, anxiety or anger before your period is severe, ask about PMDD. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If tiredness affects your daily life, talk to a doctor or nurse.",
    },
  },
  {
    slug: "cravings-appetite",
    category: "symptoms",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Nutrition Reviews — Effect of the menstrual cycle on energy intake: a systematic review and meta-analysis", href: "https://academic.oup.com/nutritionreviews/article/83/3/e866/7713894" },
      { label: "Office on Women's Health — Premenstrual syndrome (PMS)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome" },
      { label: "Office on Women's Health — Premenstrual dysphoric disorder (PMDD)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome/premenstrual-dysphoric-disorder-pmdd" },
      { label: "NHS — Iron deficiency anaemia", href: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
    ],
    related: ["pms", "eating-disorders", "healthy-eating"],
    es: {
      title: "Antojos y apetito",
      summary: "Tener más hambre o ganas de ciertos alimentos antes del periodo es común. Aquí verás lo que muestra la investigación, lo que aún no está claro y formas amables de cuidarte.",
      sections: [
        {
          heading: "Un cambio premenstrual común",
          body: "Los cambios de apetito y los antojos son señales reconocidas del síndrome premenstrual (SPM). Algunas personas tienen más hambre en la semana o las dos semanas antes del periodo, y otras tienen ganas de alimentos concretos. Como otros síntomas del SPM, estos cambios suelen pasar pocos días después de que empiece el periodo. Son una parte normal de cómo el ciclo puede afectar a tu cuerpo.",
        },
        {
          heading: "Lo que muestra la investigación",
          body: "Una revisión combinó 15 conjuntos de resultados de 330 mujeres. En promedio, comieron un poco más en la segunda mitad del ciclo, después de la ovulación, que en la primera mitad. Pero los estudios eran pequeños, usaron distintas formas de calcular las fases del ciclo y sus resultados variaron mucho. Así que aún no está claro de qué tamaño es el cambio ni a quién afecta más.",
        },
        {
          heading: "Por qué podría ocurrir",
          body: "Las razones no se entienden del todo. Una idea es que la hormona estrógeno podría ayudar a reducir el apetito, mientras que la progesterona, que sube después de la ovulación, podría aumentarlo. Son explicaciones posibles, no demostradas, y todavía se están estudiando. Como las pruebas son limitadas, desconfía de las afirmaciones rotundas, las dietas especiales o los planes de alimentación basados en las fases del ciclo.",
        },
        {
          heading: "Formas amables de manejarlo",
          body: "No necesitas luchar contra tu apetito ni prohibirte los alimentos que te gustan. Algunas personas se sienten más estables si hacen comidas más pequeñas y más a menudo, por ejemplo cada 2 a 3 horas. El ejercicio regular y dormir lo suficiente pueden ayudar con el cansancio y el ánimo bajo, que también son comunes antes del periodo. Algunos estudios sugieren que el calcio puede ayudar con los antojos. Pregunta a tu farmacéutico o farmacéutica antes de tomar un suplemento, sobre todo si tomas otros medicamentos. Registrar tus síntomas en Ciclo puede mostrar si los cambios de apetito siguen tu ciclo, para que te sorprendan menos.",
        },
        {
          heading: "Cuándo hablar con alguien",
          body: "Habla con un médico o una enfermera si los cambios en tu forma de comer llegan con un ánimo muy bajo, mucha ansiedad o mucha ira antes del periodo. Puede ser una señal del trastorno disfórico premenstrual (TDPM), que puede incluir atracones de comida. Hazte también una revisión si tienes ganas de comer cosas que no son comida, como hielo o papel, porque puede ser una señal de falta de hierro. Si sientes que pierdes el control al comer, o te preocupa la comida, el peso o tu cuerpo, pide ayuda. Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de crisis.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si te preocupa tu forma de comer, habla con un médico o una enfermera.",
    },
    en: {
      title: "Food cravings and appetite",
      summary: "Feeling hungrier or wanting certain foods before a period is common. Here is what research shows, what is still unclear, and gentle ways to look after yourself.",
      sections: [
        {
          heading: "A common premenstrual change",
          body: "Changes in appetite and food cravings are recognised signs of premenstrual syndrome (PMS). Some people feel hungrier in the week or two before a period, and some want particular foods. Like other PMS symptoms, these changes usually settle within a few days of your period starting. They are a normal part of how the cycle can affect your body.",
        },
        {
          heading: "What research shows",
          body: "One review combined 15 sets of results from 330 women. On average, they ate a little more in the second half of the cycle, after ovulation, than in the first half. But the studies were small, used different ways to work out cycle phases, and their results varied a lot. So it is still unclear how big the change is, and who it affects most.",
        },
        {
          heading: "Why it might happen",
          body: "The reasons are not fully understood. One idea is that the hormone oestrogen may help to dampen appetite, while progesterone, which rises after ovulation, may increase it. These are possible explanations, not proven ones, and are still being studied. Because the evidence is limited, be wary of strong claims, special diets or eating plans built around cycle phases.",
        },
        {
          heading: "Gentle ways to handle it",
          body: "You do not need to fight your appetite or ban foods you enjoy. Some people feel steadier eating smaller meals more often, for example every 2 to 3 hours. Regular exercise and enough sleep can help with tiredness and low mood, which are also common before a period. Some studies suggest calcium may help with cravings. Ask a pharmacist before taking a supplement, especially if you take other medicines. Logging symptoms in Ciclo can show whether changes in appetite follow your cycle, so they feel less surprising.",
        },
        {
          heading: "When to talk to someone",
          body: "Talk to a doctor or nurse if changes in eating come with severe low mood, anxiety or anger before your period. This can be a sign of premenstrual dysphoric disorder (PMDD), which can include binge eating. Also get checked if you want to eat things that are not food, such as ice or paper, as this can be a sign of low iron. If you feel your eating is out of control, or you are worried about food, weight or your body, ask for help. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you are worried about your eating, talk to a doctor or nurse.",
    },
  },
  {
    slug: "common-symptoms",
    category: "symptoms",
    reviewedAt: "2026-08-18",
    sources: [
      { label: "NHS — Period problems", href: "https://www.nhs.uk/conditions/periods/period-problems/" },
    ],
    es: {
      title: "Síntomas habituales",
      summary: "Cólicos, fatiga, cambios de ánimo o hinchazón son frecuentes. Registrarlos ayuda a ver patrones; no sustituye una consulta clínica.",
      sections: [
        {
          heading: "Qué puedes registrar en Ciclo",
          body: "Cólicos, dolor de cabeza, libido alta, sexo, hinchazón, pechos sensibles, fatiga, cambios de ánimo y antojos. Son etiquetas para tu diario, no un diagnóstico.",
        },
        {
          heading: "Patrones, no causas",
          body: "Ver que un síntoma se repite en varios ciclos puede ayudarte a prepararte. Una correlación en tu diario no demuestra por qué ocurre ni qué tratamiento necesitas.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Dolor que no cede, sangrado muy abundante, ausencia de periodos o síntomas que te impiden trabajar o dormir merecen valoración profesional.",
        },
      ],
      notice: "Ciclo no diagnostica endometriosis, SOP ni ninguna otra condición.",
    },
    en: {
      title: "Common symptoms",
      summary: "Cramps, fatigue, mood shifts, and bloating are common. Logging them helps you see patterns; it does not replace clinical care.",
      sections: [
        {
          heading: "What you can log in Ciclo",
          body: "Cramps, headache, high libido, sex, bloating, tender breasts, fatigue, mood swings, and cravings. These are diary labels, not a diagnosis.",
        },
        {
          heading: "Patterns, not causes",
          body: "Seeing a symptom repeat across cycles can help you prepare. A correlation in your diary does not prove why it happens or which treatment you need.",
        },
        {
          heading: "When to seek care",
          body: "Pain that does not ease, very heavy bleeding, missing periods, or symptoms that stop you working or sleeping deserve clinical assessment.",
        },
      ],
      notice: "Ciclo does not diagnose endometriosis, PCOS, or any other condition.",
    },
  },
];
