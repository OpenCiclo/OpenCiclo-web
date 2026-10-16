// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const MENOPAUSE_ARTICLES: LearnArticle[] = [
  {
    slug: "perimenopause",
    category: "menopause",
    reviewedAt: "2026-10-16",
    sources: [
      { label: "Office on Women's Health — Menopause basics", href: "https://www.womenshealth.gov/menopause/menopause-basics" },
      { label: "NHS — Early or premature menopause", href: "https://www.nhs.uk/conditions/early-menopause/" },
      { label: "NHS — What are menopause and perimenopause", href: "https://www.nhs.uk/conditions/menopause-and-perimenopause/what-are-menopause-and-perimenopause/" },
      { label: "NHS — About hormone replacement therapy (HRT)", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/about-hormone-replacement-therapy-hrt/" },
      { label: "Devon Sexual Health (NHS) — Contraception aged over 40", href: "https://www.devonsexualhealth.nhs.uk/contraception/contraception-aged-over-40/" },
    ],
    related: ["menopause-symptoms", "early-menopause", "heavy-periods"],
    es: {
      title: "Perimenopausia",
      summary: "La perimenopausia es la etapa antes de tu último periodo, cuando cambian los niveles hormonales y los periodos se vuelven menos previsibles. Suele empezar en la década de los 40 y dura unos años.",
      sections: [
        {
          heading: "Qué es la perimenopausia",
          body: "La perimenopausia, también llamada transición menopáusica, es la etapa que lleva a tu último periodo. Tus ovarios producen menos estrógeno y progesterona, así que tus periodos cambian y al final dejan de venir. La menopausia es cuando los periodos se terminan para siempre. Se confirma cuando llevas 12 meses sin periodo. La mayoría de las personas llegan a la menopausia entre mediados de los 40 y mediados de los 50, pero puede ocurrir antes.",
        },
        {
          heading: "Cuándo empieza y cuánto dura",
          body: "La perimenopausia suele empezar entre mediados y finales de los 40. En promedio dura unos 4 años antes de que los periodos se terminen, pero puede durar entre 2 y 8 años. El momento y los síntomas varían mucho de una persona a otra, así que tu experiencia puede ser muy distinta de la de una amiga o de alguien de tu familia.",
        },
        {
          heading: "Cambios en tus periodos",
          body: "Tus periodos pueden venir más seguidos o más espaciados, y puede que no te venga el periodo durante un mes o varios. El sangrado puede ser más abundante o más ligero que antes, y los periodos pueden durar más o menos de lo habitual. Registrar tus periodos y síntomas en Ciclo puede ayudarte a ver el patrón y explicárselo a un médico, pero sus pronósticos son estimaciones y son menos fiables mientras tus ciclos están cambiando.",
        },
        {
          heading: "Otros síntomas comunes",
          body: "A medida que cambian los niveles hormonales, muchas personas notan también otros síntomas. Entre ellos están los sofocos y los sudores nocturnos, los problemas para dormir, el ánimo bajo o la ansiedad, menos deseo sexual, la sequedad vaginal y los problemas de memoria o de concentración. Si los síntomas afectan a tu vida diaria, hay tratamientos que pueden ayudar.",
        },
        {
          heading: "Todavía es posible el embarazo",
          body: "Aunque tus periodos sean irregulares o no te vengan durante unos meses, durante la perimenopausia todavía es posible un embarazo. Si no quieres un embarazo, sigue usando anticoncepción hasta que lleves 2 años sin periodos si tienes menos de 50 años, o 1 año si tienes 50 o más. En general, puedes dejarla a los 55 años, porque un embarazo después de esa edad es muy poco frecuente. La terapia hormonal (THS) no evita el embarazo. La anticoncepción hormonal puede ocultar tus periodos naturales, así que un médico o una enfermera puede decirte qué método te conviene en esta etapa de la vida y cuándo es seguro dejarlo.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus síntomas te molestan, o si crees que tienes síntomas de menopausia antes de los 45 años. Hazte también una revisión si tus periodos se vuelven muy abundantes, por ejemplo si necesitas cambiar la compresa (toalla sanitaria) o el tampón cada 1 a 2 horas. El sangrado entre periodos o después de tener relaciones sexuales también debe revisarse. Y también cualquier sangrado cuando ya llevas un año sin periodo. Busca ayuda urgente si tienes un sangrado muy abundante con mareo o desmayo.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si te preocupan los cambios en tus periodos o tus síntomas, habla con un médico o una enfermera.",
    },
    en: {
      title: "Perimenopause",
      summary: "Perimenopause is the time leading up to your last period, when hormone levels change and periods become less predictable. It often starts in your 40s and lasts a few years.",
      sections: [
        {
          heading: "What perimenopause is",
          body: "Perimenopause, also called the menopausal transition, is the time leading up to your last period. Your ovaries make less of the hormones oestrogen and progesterone, so your periods change and in the end stop. Menopause is when your periods stop for good. It is confirmed once you have gone 12 months without a period. Most people reach menopause somewhere between their mid-40s and mid-50s, but it can happen earlier.",
        },
        {
          heading: "When it starts and how long it lasts",
          body: "Perimenopause usually starts in your mid- to late 40s. On average it lasts about 4 years before periods stop, but it can be anywhere from 2 to 8 years. The timing and the symptoms vary a lot from person to person, so your experience may be quite different from a friend's or a relative's.",
        },
        {
          heading: "Changes to your periods",
          body: "Your periods may come closer together or further apart, and you might skip a month or a few months. Bleeding may be heavier or lighter than before, and periods may last longer or be shorter than usual. Logging your periods and symptoms in Ciclo can help you see the pattern and describe it to a doctor, but its predictions are estimates and less reliable while your cycles are changing.",
        },
        {
          heading: "Other common symptoms",
          body: "As hormone levels change, many people notice other symptoms too. These include hot flushes and night sweats, trouble sleeping, low mood or anxiety, a lower sex drive, vaginal dryness, and problems with memory or concentration. If symptoms affect your daily life, there are treatments that can help.",
        },
        {
          heading: "You can still get pregnant",
          body: "Even if your periods are irregular or you skip a few months, you can still get pregnant during perimenopause. If you do not want to get pregnant, keep using contraception until you have had no periods for 2 years if you are under 50, or for 1 year if you are 50 or over. In general, you can stop at 55, as pregnancy after that is very rare. HRT does not prevent pregnancy. Hormonal contraception can hide your natural periods, so a doctor or nurse can tell you which method suits you at this stage of life and when it is safe to stop.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your symptoms bother you, or if you think you have menopause symptoms before the age of 45. Also get checked if your periods become very heavy, for example if you need a new pad or tampon every 1 to 2 hours. Bleeding between periods or after sex should be checked too. So should any bleeding once you have gone a year without a period. Get urgent help if you have very heavy bleeding with dizziness or fainting.",
        },
      ],
      notice: "This is general information, not a diagnosis. If changes to your periods or symptoms worry you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "menopause-symptoms",
    category: "menopause",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Menopause symptoms and relief", href: "https://www.womenshealth.gov/menopause/menopause-symptoms-and-relief" },
      { label: "NHS — Treatment for menopause and perimenopause", href: "https://www.nhs.uk/conditions/menopause-and-perimenopause/treatment/" },
      { label: "NHS — Benefits and risks of HRT", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/benefits-and-risks-of-hormone-replacement-therapy-hrt/" },
      { label: "Office on Women's Health — Menopause basics", href: "https://www.womenshealth.gov/menopause/menopause-basics" },
    ],
    related: ["hrt", "perimenopause", "postmenopausal-bleeding"],
    es: {
      title: "Síntomas de la menopausia",
      summary: "Los sofocos, dormir mal, los cambios de ánimo y la sequedad vaginal son comunes alrededor de la menopausia. Aquí verás por qué ocurren, qué ayuda y cuándo hablar con un médico o una enfermera.",
      sections: [
        {
          heading: "Por qué aparecen los síntomas",
          body: "Alrededor de la menopausia, tus ovarios producen mucho menos estrógeno. Los niveles bajos de estrógeno están detrás de muchos de los cambios que se notan, desde los sofocos hasta la sequedad vaginal. Los síntomas suelen empezar en la perimenopausia, antes de que se terminen los periodos, y varían mucho de una persona a otra. Entre los más comunes están los sofocos y los sudores nocturnos, los problemas para dormir, el ánimo bajo o la ansiedad, los problemas de memoria o de concentración, la sequedad vaginal y menos deseo sexual.",
        },
        {
          heading: "Sofocos y sudores nocturnos",
          body: "Los sofocos (también llamados bochornos) son el síntoma más común. Durante un sofoco, una sensación de calor se extiende de repente por la parte superior del cuerpo. Son más frecuentes el año antes y el año después de tu último periodo, pero pueden continuar hasta 14 años después de la menopausia. La comida picante, el alcohol, la cafeína, el estrés y los lugares calurosos pueden desencadenarlos. Puede ayudar vestirte por capas que puedas quitarte, usar un ventilador y anotar qué los desencadena en tu caso.",
        },
        {
          heading: "Sueño",
          body: "Los sudores nocturnos pueden despertarte, y algunas personas necesitan levantarse varias veces por la noche para orinar. Hacer actividad física durante el día ayuda a muchas personas a dormir. Una habitación fresca, oscura y silenciosa también ayuda. Intenta no hacer una comida abundante, fumar ni beber alcohol a última hora del día.",
        },
        {
          heading: "Ánimo, memoria y concentración",
          body: "Puedes sentirte irritable o con ganas de llorar, y el riesgo de depresión y ansiedad es mayor alrededor de la menopausia. El estrés, los cambios en la familia y el cansancio pueden sumarse a esto. Hasta dos de cada tres mujeres en la perimenopausia notan problemas de memoria o de concentración. Si el ánimo bajo o la ansiedad no mejoran, habla con un médico o una enfermera, porque las terapias psicológicas y los medicamentos pueden ayudar. Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de crisis.",
        },
        {
          heading: "Cambios en la vagina, la vejiga y la vida sexual",
          body: "Los niveles bajos de estrógeno pueden hacer que la vagina esté más seca y más fina. Esto puede causar picor, ardor o molestias, y hacer que las relaciones sexuales duelan. Un hidratante vaginal y un lubricante a base de agua pueden ayudar, y un médico puede recetarte estrógeno para usar en la vagina. Algunas personas tienen escapes de orina al toser, estornudar o reír. El interés por el sexo puede bajar o subir, y el dolor durante las relaciones sexuales puede reducirlo.",
        },
        {
          heading: "Pedir ayuda",
          body: "Si algún síntoma te molesta, habla con un médico o una enfermera. La terapia hormonal (THS) alivia la mayoría de los síntomas de la menopausia. Otras opciones son la terapia cognitivo-conductual (TCC) y algunos medicamentos sin hormonas. Hay muy pocas pruebas sobre lo bien que funcionan los remedios de hierbas o lo seguros que son. Consulta a un médico o una enfermera lo antes posible si tienes cualquier sangrado o manchado después de un año sin periodos.",
        },
      ],
      notice: "Esto es información general. Si los síntomas de la menopausia afectan a tu vida diaria, un médico o una enfermera puede explicarte las opciones de tratamiento.",
    },
    en: {
      title: "Menopause symptoms",
      summary: "Hot flushes, poor sleep, mood changes and vaginal dryness are common around menopause. Here is why they happen, what helps, and when to talk to a doctor or nurse.",
      sections: [
        {
          heading: "Why symptoms happen",
          body: "Around menopause, your ovaries make much less of the hormone oestrogen. Low oestrogen is behind many of the changes people notice, from hot flushes to vaginal dryness. Symptoms often start in perimenopause, before periods stop, and they vary a lot from person to person. Common ones include hot flushes and night sweats, trouble sleeping, low mood or anxiety, problems with memory or concentration, vaginal dryness, and a lower sex drive.",
        },
        {
          heading: "Hot flushes and night sweats",
          body: "Hot flushes are the most common symptom. During a hot flush, heat spreads suddenly over your upper body. They are most common in the year before and the year after your last period, but they can carry on for up to 14 years after menopause. Spicy food, alcohol, caffeine, stress and hot places can trigger them. Wearing layers you can take off, using a fan, and noting your own triggers can help.",
        },
        {
          heading: "Sleep",
          body: "Night sweats can wake you up, and some people need to get up several times a night to pee. Being active during the day helps many people sleep. A cool, dark, quiet room helps too. Try not to eat a big meal, smoke or drink alcohol late in the evening.",
        },
        {
          heading: "Mood, memory and focus",
          body: "You may feel irritable or tearful, and the risk of depression and anxiety is higher around menopause. Stress, family changes and tiredness can add to this. As many as two in three women in perimenopause notice problems with memory or concentration. If low mood or anxiety does not lift, talk to a doctor or nurse, because talking therapies and medicines can help. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
        {
          heading: "Vaginal, bladder and sexual changes",
          body: "Low oestrogen can make the vagina drier and thinner. This can cause itching, burning or discomfort, and make sex painful. A vaginal moisturiser and a water-based lubricant can help, and a doctor can prescribe oestrogen that you use in the vagina. Some people leak urine when they cough, sneeze or laugh. Interest in sex may go down or up, and pain during sex can lower it.",
        },
        {
          heading: "Getting help",
          body: "If any symptom bothers you, talk to a doctor or nurse. Hormone replacement therapy (HRT) relieves most menopause symptoms. Other options include cognitive behavioural therapy (CBT) and some non-hormonal medicines. There is very little evidence on how well herbal remedies work or how safe they are. See a doctor or nurse as soon as possible if you have any bleeding or spotting after a year without periods.",
        },
      ],
      notice: "This is general information. If menopause symptoms affect your daily life, a doctor or nurse can talk you through treatment options.",
    },
  },
  {
    slug: "hrt",
    category: "menopause",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Benefits and risks of HRT", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/benefits-and-risks-of-hormone-replacement-therapy-hrt/" },
      { label: "NHS — Treatment for menopause and perimenopause", href: "https://www.nhs.uk/conditions/menopause-and-perimenopause/treatment/" },
      { label: "Office on Women's Health — Menopause symptoms and relief", href: "https://www.womenshealth.gov/menopause/menopause-symptoms-and-relief" },
      { label: "NHS — About hormone replacement therapy (HRT)", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/about-hormone-replacement-therapy-hrt/" },
      { label: "NHS — Side effects of HRT", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/side-effects-of-hormone-replacement-therapy-hrt/" },
      { label: "NHS — Blood clots", href: "https://www.nhs.uk/conditions/blood-clots/" },
    ],
    related: ["menopause-symptoms", "bone-health", "early-menopause"],
    es: {
      title: "Terapia hormonal y otros tratamientos",
      summary: "La terapia hormonal (THS) alivia la mayoría de los síntomas de la menopausia y ayuda a proteger tus huesos. Aquí tienes una mirada equilibrada a sus beneficios y riesgos, y a las opciones sin hormonas.",
      sections: [
        {
          heading: "Qué es la THS",
          body: "La terapia hormonal (THS) sustituye las hormonas que tu cuerpo produce en menor cantidad alrededor de la menopausia. El estrógeno es la hormona principal, y puede tomarse en pastillas o usarse en parches, espray o gel. Si todavía tienes útero, normalmente se toma estrógeno junto con progestágeno (THS combinada). El progestágeno puede tomarse en pastillas, en un parche combinado o mediante un DIU hormonal (SIU). Si te han extirpado el útero, normalmente basta con estrógeno solo.",
        },
        {
          heading: "Cómo puede ayudar la THS",
          body: "La THS alivia la mayoría de los síntomas de la perimenopausia y la menopausia. Esto incluye los sofocos, los sudores nocturnos, los problemas de sueño, la sequedad vaginal, y la ansiedad y el ánimo bajo causados por la menopausia. También ayuda a prevenir la osteoporosis, la enfermedad que debilita los huesos, y puede ayudar a que tus músculos se mantengan fuertes. A algunas personas también se les ofrece testosterona en gel o en crema, que puede ayudar con el deseo sexual bajo. Para la mayoría de las personas, los beneficios de la THS superan a los riesgos.",
        },
        {
          heading: "Riesgos que debes conocer",
          body: "La THS puede aumentar ligeramente el riesgo de cáncer de mama. Con la THS combinada, hay unos 5 casos más de cáncer de mama por cada 1000 mujeres que la toman durante 5 años. La THS solo con estrógeno apenas aumenta el riesgo o no lo aumenta. El riesgo sube cuanto más tiempo tomas la THS y cuanto mayor eres, y vuelve a bajar cuando la dejas. Las pastillas de THS pueden aumentar el riesgo de coágulos de sangre y aumentar ligeramente el riesgo de ictus (accidente cerebrovascular), pero ambos riesgos siguen siendo muy bajos. Los parches, el espray y el gel de THS no aumentan ninguno de los dos riesgos. La THS tiene poco o ningún efecto sobre el riesgo de enfermedades del corazón. Para la mayoría de las personas, los efectos secundarios graves de la THS son raros.",
        },
        {
          heading: "Otras opciones",
          body: "Si no puedes tomar THS o prefieres no hacerlo, hay otras opciones. La terapia cognitivo-conductual (TCC), un tipo de terapia psicológica, puede ayudar con los síntomas de la menopausia. Algunos medicamentos que también se usan para la depresión, la epilepsia o la presión arterial alta pueden ayudar con los sofocos. La clonidina es un ejemplo. Para la sequedad vaginal pueden ayudar los hidratantes y los lubricantes a base de agua, y otra opción es el estrógeno en crema vaginal o en óvulos vaginales. Hay muy pocas pruebas sobre lo bien que funcionan los remedios de hierbas o lo seguros que son.",
        },
        {
          heading: "Tomar tu decisión",
          body: "Tomar o no la THS es una decisión personal. Depende de tus síntomas, de tu salud y de cómo valores los beneficios y los riesgos. Puede que la THS no sea adecuada para ti si has tenido cáncer de mama, de ovario o de útero, o un coágulo de sangre, o si tienes la presión arterial alta sin tratar o una enfermedad del hígado. La THS no evita el embarazo, así que puede que aún necesites anticoncepción durante un tiempo. Anotar tus síntomas en Ciclo durante unas semanas antes de la cita puede ayudarte a explicar lo que más te afecta.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "El sangrado irregular o el manchado son comunes en los primeros meses de THS y suelen desaparecer en un plazo de 6 meses. Consulta a un médico si duran más de 6 meses, se vuelven más abundantes, o empiezan después de que tu sangrado ya se hubiera detenido. Busca ayuda urgente si una pierna se vuelve dolorosa o se hincha, a menudo en la pantorrilla o el muslo, o si la piel de esa zona se ve roja o más oscura. Llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) si además te falta el aire o tienes dolor en el pecho.",
        },
      ],
      notice: "Esto es información general. Las decisiones sobre la THS son personales y es mejor tomarlas con un médico o una enfermera que conozca tu historial de salud.",
    },
    en: {
      title: "HRT and other treatments",
      summary: "Hormone replacement therapy (HRT) relieves most menopause symptoms and helps protect your bones. Here is a balanced look at its benefits and risks, and at options without hormones.",
      sections: [
        {
          heading: "What HRT is",
          body: "Hormone replacement therapy (HRT) replaces hormones that your body makes less of around menopause. Oestrogen is the main hormone, and it can be taken as tablets or used as patches, a spray or a gel. If you still have a womb, you usually take oestrogen with progestogen (combined HRT). The progestogen can be taken as tablets, in a combined patch or through a hormonal coil (IUS). If your womb has been removed, oestrogen on its own is usually enough.",
        },
        {
          heading: "How HRT can help",
          body: "HRT relieves most symptoms of perimenopause and menopause. This includes hot flushes, night sweats, sleep problems, vaginal dryness, and anxiety and low mood caused by menopause. It also helps prevent osteoporosis, the condition that makes bones weak, and it can help your muscles stay strong. Some people are also offered testosterone gel or cream, which can help with low sex drive. For most people, the benefits of HRT outweigh the risks.",
        },
        {
          heading: "Risks to know about",
          body: "HRT can slightly increase the risk of breast cancer. With combined HRT, there are around 5 extra cases of breast cancer for every 1,000 women who take it for 5 years. Oestrogen-only HRT causes little or no increase. The risk goes up the longer you take HRT and the older you are, and it falls again after you stop. HRT tablets can raise the risk of blood clots and slightly raise the risk of stroke, but both risks are still very low. HRT patches, sprays and gels do not raise either risk. HRT has little or no effect on the risk of heart disease. For most people, serious side effects from HRT are rare.",
        },
        {
          heading: "Other options",
          body: "If you cannot take HRT or prefer not to, there are other options. Cognitive behavioural therapy (CBT), a type of talking therapy, can help with menopause symptoms. Some medicines also used for depression, epilepsy or high blood pressure may help with hot flushes. Clonidine is one example. For vaginal dryness, moisturisers and water-based lubricants can help, and oestrogen used as a vaginal cream or pessary is another option. There is very little evidence on how well herbal remedies work or how safe they are.",
        },
        {
          heading: "Making your decision",
          body: "Whether to take HRT is a personal choice. It depends on your symptoms, your health, and how you weigh up the benefits and risks. HRT may not suit you if you have had breast, ovarian or womb cancer or a blood clot, or if you have untreated high blood pressure or liver disease. HRT does not prevent pregnancy, so you may still need contraception for a while. Noting your symptoms in Ciclo for a few weeks before an appointment can help you describe what affects you most.",
        },
        {
          heading: "When to get help",
          body: "Irregular bleeding or spotting is common in the first months of HRT and usually settles within 6 months. See a doctor if it lasts longer than 6 months, gets heavier, or starts after your bleeding had stopped. Get help urgently if one leg becomes painful or swollen, often in the calf or thigh, or the skin there looks red or darker. Call your local emergency number if you also feel short of breath or have chest pain.",
        },
      ],
      notice: "This is general information. Decisions about HRT are personal and best made with a doctor or nurse who knows your health history.",
    },
  },
  {
    slug: "early-menopause",
    category: "menopause",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Early or premature menopause", href: "https://www.nhs.uk/conditions/early-menopause/" },
      { label: "NHS — Benefits and risks of HRT", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/benefits-and-risks-of-hormone-replacement-therapy-hrt/" },
      { label: "Office on Women's Health — Osteoporosis", href: "https://www.womenshealth.gov/a-z-topics/osteoporosis" },
      { label: "NICHD — Treatments for primary ovarian insufficiency (POI)", href: "https://www.nichd.nih.gov/health/topics/poi/conditioninfo/treatments" },
      { label: "NICHD — About primary ovarian insufficiency (POI)", href: "https://www.nichd.nih.gov/health/topics/poi/conditioninfo" },
    ],
    related: ["bone-health", "hrt", "age-and-fertility"],
    es: {
      title: "Menopausia temprana e IOP",
      summary: "La menopausia antes de los 45 años se llama menopausia temprana, y antes de los 40 se llama insuficiencia ovárica prematura (IOP). Aquí verás por qué ocurre y por qué el tratamiento importa para tu salud a largo plazo.",
      sections: [
        {
          heading: "Qué significa la menopausia temprana",
          body: "La mayoría de las personas llegan a la menopausia entre mediados de los 40 y mediados de los 50. La menopausia temprana es cuando los periodos se terminan antes de los 45 años. Cuando esto ocurre antes de los 40, se llama insuficiencia ovárica prematura (IOP). La IOP no siempre es lo mismo que la menopausia. Los periodos pueden seguir viniendo de vez en cuando, y a veces los ovarios vuelven a funcionar durante un tiempo. La señal principal es que los periodos se vuelven irregulares o se detienen por completo. También puedes tener sofocos, sudores nocturnos y problemas para dormir, o cambios en el ánimo, el deseo sexual, la memoria y la concentración.",
        },
        {
          heading: "Por qué puede ocurrir",
          body: "A menudo no se encuentra ninguna causa. Entre las causas conocidas están los tratamientos contra el cáncer como la radioterapia o la quimioterapia, la cirugía para extirpar los ovarios, ciertos medicamentos hormonales y algunas enfermedades genéticas y autoinmunes. La probabilidad también es mayor si hay casos de menopausia temprana en tu familia, si tu primer periodo llegó pronto, si fumas o si tienes bajo peso.",
        },
        {
          heading: "Hacerte una revisión",
          body: "Consulta a un médico si tienes menos de 45 años y crees que tienes síntomas de menopausia, o si tus periodos se vuelven irregulares o se detienen. El médico te preguntará por tus síntomas y puede pedirte análisis de sangre. Un registro de tus periodos y síntomas, como el de Ciclo, puede ayudarte a explicar qué ha cambiado. Los periodos también pueden detenerse por otras razones, como un embarazo, así que vale la pena averiguar la causa.",
        },
        {
          heading: "Por qué importa para los huesos y el corazón",
          body: "El estrógeno ayuda a mantener los huesos fuertes, y tener el estrógeno muy bajo es la causa más común de pérdida de masa ósea en las mujeres. Cuando la menopausia llega pronto, pasas más años con el estrógeno bajo. Esto significa una mayor probabilidad de osteoporosis, en la que los huesos se debilitan y se rompen con facilidad, y de enfermedad cardiovascular, que afecta al corazón y a los vasos sanguíneos. Reponer tus hormonas hasta la edad habitual de la menopausia ayuda a proteger tus huesos, tu corazón y tus vasos sanguíneos.",
        },
        {
          heading: "Tratamiento",
          body: "Los tratamientos principales son la terapia hormonal (THS) o la píldora anticonceptiva combinada, que sustituyen las hormonas que tus ovarios ya no producen. Además de aliviar los síntomas, la THS ayuda a prevenir la osteoporosis. Los médicos suelen recomendar tomarla hasta los 50 años aproximadamente, la edad habitual de la menopausia. La actividad física en la que sostienes tu propio peso, tomar suficiente calcio y vitamina D, y no fumar también ayudan a cuidar tus huesos.",
        },
        {
          heading: "Fertilidad y apoyo",
          body: "La menopausia temprana puede hacer más difícil conseguir un embarazo. Con IOP, el embarazo todavía es posible: entre 5 y 10 de cada 100 personas logran un embarazo sin tratamiento. Si no quieres un embarazo, pregunta por la anticoncepción, porque la THS no evita el embarazo. Algunas personas pueden tener hijos mediante fecundación in vitro (FIV), con sus propios óvulos congelados o con óvulos de donante. Saber que la menopausia ha llegado pronto puede ser duro, sobre todo si querías tener hijos o tener más. Un médico, un psicólogo o una psicóloga, o un grupo de apoyo pueden ayudarte con la parte emocional además de la física.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos se detienen o se vuelven irregulares antes de los 45 años, habla con un médico.",
    },
    en: {
      title: "Early menopause and POI",
      summary: "Menopause before 45 is called early menopause, and before 40 it is called premature ovarian insufficiency (POI). Here is why it happens and why treatment matters for long-term health.",
      sections: [
        {
          heading: "What early menopause means",
          body: "Most people reach menopause between their mid-40s and mid-50s. Early menopause is when your periods stop before the age of 45. When this happens before 40, it is called premature ovarian insufficiency (POI). POI is not always the same as menopause. Periods can still come now and then, and the ovaries sometimes start working again for a while. The main sign is periods becoming irregular or stopping completely. You may also have hot flushes, night sweats and trouble sleeping, or changes in mood, sex drive, memory and concentration.",
        },
        {
          heading: "Why it can happen",
          body: "Often no cause is found. Known causes include cancer treatment such as radiotherapy or chemotherapy, surgery to remove the ovaries, certain hormone medicines, and some genetic and autoimmune conditions. Your chance is also higher if early menopause runs in your family, if you started your periods early, if you smoke, or if you are underweight.",
        },
        {
          heading: "Getting checked",
          body: "See a doctor if you are under 45 and think you have menopause symptoms, or if your periods become irregular or stop. A doctor will ask about your symptoms and may do blood tests. A record of your periods and symptoms, such as a Ciclo log, can help you explain what has changed. Periods can also stop for other reasons, including pregnancy, so it is worth finding out the cause.",
        },
        {
          heading: "Why it matters for bones and heart",
          body: "Oestrogen helps keep bones strong, and very low oestrogen is the most common reason women lose bone. When menopause comes early, you spend more years with low oestrogen. This means a higher chance of osteoporosis, where bones become weak and break easily, and of cardiovascular disease, which affects the heart and blood vessels. Replacing your hormones until the usual age of menopause helps protect your bones, heart and blood vessels.",
        },
        {
          heading: "Treatment",
          body: "The main treatments are hormone replacement therapy (HRT) or the combined contraceptive pill, which replace the hormones your ovaries are no longer making. As well as easing symptoms, HRT helps prevent osteoporosis. Doctors often suggest taking it until about age 50, the usual age of menopause. Weight-bearing activity, getting enough calcium and vitamin D, and not smoking also help look after your bones.",
        },
        {
          heading: "Fertility and support",
          body: "Early menopause can make it harder to get pregnant. With POI, pregnancy is still possible: between 5 and 10 in 100 people get pregnant without treatment. If you do not want to get pregnant, ask about contraception, because HRT does not prevent pregnancy. Some people are able to have children through IVF, using their own frozen eggs or donor eggs. Learning that menopause has come early can be hard, especially if you had hoped to have children or more children. A doctor, a counsellor or a support group can help with the emotional side as well as the physical one.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods stop or become irregular before 45, talk to a doctor.",
    },
  },
  {
    slug: "bone-health",
    category: "menopause",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Osteoporosis", href: "https://www.womenshealth.gov/a-z-topics/osteoporosis" },
      { label: "NHS — Benefits and risks of HRT", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/benefits-and-risks-of-hormone-replacement-therapy-hrt/" },
      { label: "NHS — Early or premature menopause", href: "https://www.nhs.uk/conditions/early-menopause/" },
      { label: "NICHD — Treatments for primary ovarian insufficiency (POI)", href: "https://www.nichd.nih.gov/health/topics/poi/conditioninfo/treatments" },
    ],
    related: ["calcium-vitamin-d", "early-menopause", "hrt"],
    es: {
      title: "Salud de los huesos y osteoporosis",
      summary: "Después de la menopausia, el estrógeno más bajo acelera la pérdida de hueso y aumenta el riesgo de osteoporosis. Aquí verás por qué ocurre y qué puedes hacer para proteger tus huesos.",
      sections: [
        {
          heading: "Por qué los huesos se debilitan después de la menopausia",
          body: "La osteoporosis es una enfermedad que debilita los huesos, de modo que se rompen con facilidad. Las mujeres suelen tener huesos más pequeños y finos que los hombres. La causa más común de pérdida de hueso en las mujeres son los niveles muy bajos de la hormona estrógeno, que es lo que ocurre después de la menopausia. Algunas mujeres pierden hasta una cuarta parte de su masa ósea en los primeros 10 años después de la menopausia. En Estados Unidos, alrededor de 1 de cada 4 mujeres de 65 años o más tiene osteoporosis.",
        },
        {
          heading: "Una enfermedad silenciosa",
          body: "La osteoporosis no suele causar síntomas. Puedes perder hueso durante muchos años sin saberlo, hasta que un hueso se rompe. Las fracturas son más frecuentes en la cadera, la muñeca y la columna. Como no hay señales de alerta tempranas, conviene conocer tu riesgo y cuidar tus huesos antes de que pase algo.",
        },
        {
          heading: "Qué aumenta tu riesgo",
          body: "Haber pasado la menopausia aumenta tu riesgo, y una menopausia temprana lo aumenta aún más. Otros factores de riesgo son tener un cuerpo pequeño y delgado, tener antecedentes de osteoporosis en la familia, no tomar suficiente calcio y vitamina D, y no hacer suficiente actividad física. Fumar, beber demasiado alcohol, tener un trastorno de la conducta alimentaria y algunos medicamentos para problemas de salud crónicos también aumentan el riesgo. Antes de la menopausia, pasar 3 meses seguidos sin periodo también aumenta tu riesgo.",
        },
        {
          heading: "Proteger tus huesos",
          body: "La actividad en la que tus pies y tus piernas sostienen tu peso, como caminar, ayuda a formar hueso y a frenar su pérdida. Tomar suficiente calcio y vitamina D importa a cualquier edad, y el artículo sobre calcio y vitamina D explica cuánto necesitas. No fumar reduce el riesgo de fracturas y, si bebes alcohol, ayuda beber con moderación. La terapia hormonal (THS) también ayuda a prevenir la osteoporosis, y un médico puede hablar contigo sobre si es adecuada para ti.",
        },
        {
          heading: "Pruebas y tratamiento",
          body: "Una prueba de densidad ósea, normalmente un tipo de exploración con rayos X llamada DXA o densitometría, muestra lo fuertes que están tus huesos. En Estados Unidos se recomienda hacer la prueba a las mujeres a partir de los 65 años, o antes si tienen factores de riesgo. Las recomendaciones cambian de un país a otro, así que pregunta a un médico o una enfermera. Si tienes osteoporosis, medicamentos como los bisfosfonatos, el denosumab o la THS pueden ayudar. Habla con un médico o una enfermera si tienes factores de riesgo, tuviste la menopausia pronto o te has roto un hueso con más facilidad de lo esperado.",
        },
      ],
      notice: "Esto es información general. Un médico o una enfermera puede revisar la salud de tus huesos y decirte si necesitas una prueba de densidad ósea.",
    },
    en: {
      title: "Bone health and osteoporosis",
      summary: "After menopause, lower oestrogen speeds up bone loss and raises the risk of osteoporosis. Here is why it happens and what you can do to protect your bones.",
      sections: [
        {
          heading: "Why bones weaken after menopause",
          body: "Osteoporosis is a condition that makes bones weak, so they break easily. Women usually have smaller, thinner bones than men. The most common reason for bone loss in women is very low levels of the hormone oestrogen, which is what happens after menopause. Some women lose up to a quarter of their bone mass in the first 10 years after menopause. In the United States, about 1 in 4 women aged 65 or over has osteoporosis.",
        },
        {
          heading: "A silent condition",
          body: "Osteoporosis usually causes no symptoms. You can lose bone for many years without knowing it, until a bone breaks. Breaks are most common in the hip, the wrist and the spine. Because there are no early warning signs, it helps to know your risk and to look after your bones before anything happens.",
        },
        {
          heading: "What raises your risk",
          body: "Being past menopause raises your risk, and an early menopause raises it further. Other risk factors include a small, thin body frame, a family history of osteoporosis, not getting enough calcium and vitamin D, and not being active enough. Smoking, drinking too much alcohol, having an eating disorder, and some medicines for long-term health problems also raise the risk. Before menopause, going 3 months in a row without a period also raises your risk.",
        },
        {
          heading: "Protecting your bones",
          body: "Weight-bearing activity, where your feet and legs carry your weight, such as walking, helps build bone and slow bone loss. Getting enough calcium and vitamin D matters at every age, and the calcium and vitamin D article explains how much you need. Not smoking lowers your risk of broken bones, and if you drink alcohol, keeping to moderate amounts helps. HRT also helps prevent osteoporosis, and a doctor can talk through whether it suits you.",
        },
        {
          heading: "Tests and treatment",
          body: "A bone density test, usually a type of X-ray scan called DXA, shows how strong your bones are. In the United States, testing is advised for women from 65, or earlier if they have risk factors. Guidance differs between countries, so ask a doctor or nurse. If you have osteoporosis, medicines such as bisphosphonates, denosumab or HRT can help. Talk to a doctor or nurse if you have risk factors, went through menopause early, or have broken a bone more easily than expected.",
        },
      ],
      notice: "This is general information. A doctor or nurse can check your bone health and tell you whether you need a bone density test.",
    },
  },
  {
    slug: "postmenopausal-bleeding",
    category: "menopause",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Postmenopausal bleeding", href: "https://www.nhs.uk/conditions/post-menopausal-bleeding/" },
      { label: "Office on Women's Health — Menopause basics", href: "https://www.womenshealth.gov/menopause/menopause-basics" },
      { label: "Office on Women's Health — Menopause symptoms and relief", href: "https://www.womenshealth.gov/menopause/menopause-symptoms-and-relief" },
      { label: "NHS — Side effects of HRT", href: "https://www.nhs.uk/medicines/hormone-replacement-therapy-hrt/side-effects-of-hormone-replacement-therapy-hrt/" },
    ],
    related: ["gynecologic-cancers", "menopause-symptoms", "spotting"],
    es: {
      title: "Sangrado después de la menopausia",
      summary: "Cualquier sangrado vaginal después de la menopausia debe revisarlo un médico pronto, aunque sea leve o solo ocurra una vez. La mayoría de las causas no son cáncer, pero hay que revisarlo.",
      sections: [
        {
          heading: "Qué se considera sangrado después de la menopausia",
          body: "El sangrado posmenopáusico es cualquier sangrado vaginal después de la menopausia, es decir, cuando ya llevas 12 meses sin periodo. Incluye el manchado y el sangrado muy ligero. Hay que revisarlo aunque sea poca cantidad o aunque solo haya ocurrido una vez.",
        },
        {
          heading: "Por qué hay que revisarlo",
          body: "La mayoría de las veces la causa no es grave. Pero a veces el sangrado es una señal temprana de cáncer, como el cáncer de útero, y por eso es importante revisarlo. Encontrar la causa pronto permite tratar antes cualquier problema. Consulta a un médico o una enfermera lo antes posible, y no esperes a ver si vuelve a pasar.",
        },
        {
          heading: "Causas comunes",
          body: "Lo más frecuente es que la causa no sea cáncer. El estrógeno más bajo después de la menopausia puede hacer que el revestimiento de la vagina o del útero se vuelva más fino y se inflame (vaginitis atrófica o atrofia endometrial). Los pólipos, que son pequeños crecimientos de tejido en el cuello del útero o dentro del útero, son otra causa y normalmente no son cáncer. Un engrosamiento del revestimiento del útero (hiperplasia endometrial) también puede causar sangrado. Con menos frecuencia, la causa es un cáncer, como el cáncer de útero o de ovario.",
        },
        {
          heading: "Qué pruebas esperar",
          body: "Normalmente, el médico te examinará la pelvis y la vagina. Pueden ofrecerte una ecografía (ultrasonido) vaginal para ver el útero. A algunas personas también se les hace una histeroscopia, en la que se usa una cámara fina para mirar dentro del útero, y puede tomarse una pequeña muestra de tejido (biopsia) para analizarla. El tratamiento depende de lo que muestren las pruebas.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Pide cita con un médico lo antes posible ante cualquier sangrado después de la menopausia, aunque ya se haya detenido. Anotar las fechas y lo abundante que fue, por ejemplo en Ciclo, puede ayudarte a describirlo. Si usas terapia hormonal (THS), es de esperar algo de sangrado. Algunos tipos causan un sangrado mensual, y el manchado es común en los primeros meses. Consulta a un médico si el sangrado irregular dura más de 6 meses después de empezar la THS, se vuelve más abundante, o empieza después de que tu sangrado ya se hubiera detenido. Busca ayuda de emergencia si el sangrado es muy abundante y tienes mareo o sensación de desmayo.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Cualquier sangrado después de la menopausia debe revisarlo un médico, aunque sea leve o ya se haya detenido.",
    },
    en: {
      title: "Bleeding after menopause",
      summary: "Any bleeding from the vagina after menopause should be checked by a doctor promptly, even if it is light or happens once. Most causes are not cancer, but it must be checked.",
      sections: [
        {
          heading: "What counts as bleeding after menopause",
          body: "Postmenopausal bleeding is any bleeding from the vagina after your menopause, which means after you have gone 12 months without a period. It includes spotting and very light bleeding. It needs to be checked even if it is only a small amount, or if it has only happened once.",
        },
        {
          heading: "Why it needs checking",
          body: "Most of the time the cause is not serious. Sometimes, though, bleeding is an early sign of cancer, such as womb cancer, which is why a check matters. Finding the cause early means that any problem can be treated sooner. See a doctor or nurse as soon as possible, and do not wait to see whether it happens again.",
        },
        {
          heading: "Common causes",
          body: "Most often, the cause is not cancer. Lower oestrogen after menopause can make the lining of the vagina or the womb thinner and inflamed (atrophic vaginitis or endometrial atrophy). Polyps, which are small growths on the cervix or in the womb, are another cause and are usually not cancer. A thickened womb lining (endometrial hyperplasia) can also cause bleeding. Less often, the cause is cancer, such as womb or ovarian cancer.",
        },
        {
          heading: "What tests to expect",
          body: "A doctor will usually examine your pelvis and vagina. You may be offered a vaginal ultrasound scan to look at your womb. Some people also have a hysteroscopy, where a thin camera is used to look inside the womb, and a small sample of tissue (biopsy) may be taken for testing. Treatment depends on what the tests find.",
        },
        {
          heading: "When to get help",
          body: "Book an appointment with a doctor as soon as possible for any bleeding after menopause, even if it has already stopped. Noting the dates and how heavy it was, for example in Ciclo, can help you describe it. If you take HRT, some bleeding is expected. Some types cause a monthly bleed, and spotting is common in the first few months. See a doctor if irregular bleeding lasts more than 6 months after starting HRT, gets heavier, or starts after your bleeding had stopped. Get emergency help if the bleeding is very heavy and you feel dizzy or faint.",
        },
      ],
      notice: "This is general information, not a diagnosis. Any bleeding after menopause should be checked by a doctor, even if it is light or has stopped.",
    },
  },
];
