// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const CYCLE_ARTICLES: LearnArticle[] = [
  {
    slug: "how-the-cycle-works",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
      { label: "NHS — Periods and fertility in the menstrual cycle", href: "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/" },
      { label: "OpenStax — Anatomy and Physiology 2e, 27.2 Anatomy and physiology of the ovarian reproductive system", href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system" },
    ],
    related: ["cycle-phases", "cycle-hormones", "normal-cycle-length"],
    es: {
      title: "Cómo funciona el ciclo menstrual",
      summary: "En cada ciclo, tu cuerpo se prepara para un posible embarazo y luego vuelve a empezar con un periodo. Esta es la visión general de lo que pasa de un periodo al siguiente.",
      sections: [
        {
          heading: "Para qué sirve el ciclo",
          body: "El ciclo menstrual es un patrón de cambios que se repite más o menos una vez al mes. Lo dirigen las hormonas, que son mensajeros químicos que viajan por la sangre. En cada ciclo, tu cuerpo se prepara para un posible embarazo. Un óvulo madura y se libera, y la capa interna del útero (matriz) se vuelve gruesa. Si no hay embarazo, los niveles de hormonas bajan y esa capa se desprende. Ese sangrado es tu periodo (menstruación). Los periodos suelen empezar hacia los 12 años y continúan hasta la menopausia, que casi siempre llega entre mediados de los 40 y mediados de los 50 años.",
        },
        {
          heading: "Cuánto dura un ciclo",
          body: "El día 1 del ciclo es el primer día de sangrado del periodo. El ciclo dura hasta el día anterior al inicio del siguiente periodo. La mayoría de los ciclos en personas adultas duran entre unos 21 y 38 días. La media es de unos 28 días, pero pocas personas tienen exactamente 28 cada vez, y la duración puede cambiar de un mes a otro. El periodo en sí suele durar de 2 a 7 días, a menudo unos 5.",
        },
        {
          heading: "Primera mitad: un óvulo madura",
          body: "Durante el periodo y después, el cerebro envía señales a los ovarios. Unas pequeñas bolsas de los ovarios llamadas folículos, cada una con un óvulo, empiezan a crecer. Al crecer, producen la hormona estrógeno. El estrógeno reconstruye la capa interna del útero después del periodo y la hace más gruesa. También hace que el moco del cuello del útero (cérvix) sea más fino y elástico. Normalmente un folículo crece más que los demás, y su óvulo es el que se liberará.",
        },
        {
          heading: "Ovulación: se libera el óvulo",
          body: "Cuando el estrógeno está alto, el cerebro libera de golpe una gran cantidad de hormona luteinizante (LH). Esto hace que el folículo principal libere su óvulo, lo que se llama ovulación. Suele ocurrir unos 10 a 16 días antes del siguiente periodo, así que el día exacto depende de cuánto dure tu ciclo. El óvulo pasa a una trompa de Falopio, que lo lleva hacia el útero. El embarazo es más probable con relaciones sexuales en los días previos a la ovulación y alrededor de ella, porque los espermatozoides pueden sobrevivir en el cuerpo hasta 7 días.",
        },
        {
          heading: "Segunda mitad: el útero se prepara",
          body: "Después de la ovulación, el folículo vacío se convierte en una pequeña estructura llamada cuerpo lúteo. Este produce la hormona progesterona, que mantiene la capa interna del útero gruesa y lista para que un óvulo fecundado se instale en ella. Si no hay embarazo, el cuerpo lúteo deja de funcionar. Entonces el estrógeno y la progesterona caen a niveles bajos, y esto le indica al cuerpo que desprenda esa capa. Empieza tu periodo, y un nuevo ciclo comienza en su primer día.",
        },
        {
          heading: "Cuándo hablar con un médico o una enfermera",
          body: "Pide consejo si tus ciclos suelen durar menos de 24 días o más de 38. Pide consejo también si llevas 3 meses sin periodo y no estás embarazada ni dando el pecho. Si el dolor o el sangrado te impiden hacer tus actividades diarias, consúltalo, porque el tratamiento puede ayudar. Un médico debe revisar siempre el sangrado entre periodos, después de las relaciones sexuales o después de la menopausia. Busca atención urgente si sangras de forma muy abundante y sientes mareo o que te vas a desmayar, o si tienes un dolor repentino e intenso en la parte baja del abdomen. Registrar tus periodos en Ciclo puede ayudarte a notar cambios como estos.",
        },
      ],
      notice: "Esta es información general sobre un ciclo típico. Cada cuerpo es distinto; si algo de tu ciclo te preocupa, habla con un médico o una enfermera.",
    },
    en: {
      title: "How the menstrual cycle works",
      summary: "Each cycle, your body gets ready for a possible pregnancy and then resets with a period. Here is the big picture of what happens from one period to the next.",
      sections: [
        {
          heading: "What the cycle is for",
          body: "The menstrual cycle is a pattern of changes that repeats about once a month. It is run by hormones, which are chemical messengers in your blood. Each cycle, your body gets ready for a possible pregnancy. An egg ripens and is released, and the inner lining of the womb (uterus) grows thick. If you do not get pregnant, hormone levels fall and the lining comes away. That bleeding is your period (menstruation). Periods usually start at around age 12 and continue until menopause, which most often happens in the mid-40s to mid-50s.",
        },
        {
          heading: "How long a cycle lasts",
          body: "Day 1 of a cycle is the first day of period bleeding. The cycle runs until the day before your next period starts. Most adult cycles last somewhere between about 21 and 38 days. The average is around 28 days, but few people have exactly 28 every time, and the length can change from month to month. The period itself usually lasts 2 to 7 days, often about 5.",
        },
        {
          heading: "First half: an egg ripens",
          body: "During and after your period, the brain sends signals to the ovaries. Small sacs in the ovaries called follicles, each holding an egg, start to grow. As they grow, they make the hormone oestrogen. Oestrogen rebuilds the womb lining after your period and makes it thicker. It also makes the mucus from the neck of the womb (cervix) thinner and stretchier. Usually one follicle grows bigger than the rest, and its egg is the one that will be released.",
        },
        {
          heading: "Ovulation: the egg is released",
          body: "When oestrogen is high, the brain releases a burst of luteinising hormone (LH). This makes the leading follicle release its egg, which is called ovulation. It usually happens about 10 to 16 days before the next period, so the exact day depends on how long your cycle is. The egg moves into a fallopian tube, which carries it towards the womb. Pregnancy is most likely from sex in the days before and around ovulation, because sperm can survive in the body for up to 7 days.",
        },
        {
          heading: "Second half: the womb gets ready",
          body: "After ovulation, the empty follicle turns into a small structure called the corpus luteum. It makes the hormone progesterone, which keeps the womb lining thick and ready for a fertilised egg to settle in. If no pregnancy happens, the corpus luteum stops working. Oestrogen and progesterone then drop to low levels, and this tells the body to shed the lining. Your period starts, and a new cycle begins on its first day.",
        },
        {
          heading: "When to talk to a doctor or nurse",
          body: "Get advice if your cycles are regularly shorter than 24 days or longer than 38 days. Also get advice if you have no period for 3 months and are not pregnant or breastfeeding. If pain or bleeding stops you doing everyday things, get it checked, because treatment can help. Bleeding between periods, after sex or after menopause should always be checked by a doctor. Get urgent help if you bleed very heavily and feel dizzy or faint, or have sudden, severe pain in your lower tummy. Logging your periods in Ciclo can help you notice changes like these.",
        },
      ],
      notice: "This is general information about a typical cycle. Every body is different; if something about your cycle worries you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "cycle-phases",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "OpenStax — Anatomy and Physiology 2e, 27.2 Anatomy and physiology of the ovarian reproductive system", href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system" },
      { label: "NHS — Periods and fertility in the menstrual cycle", href: "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "Office on Women's Health — Trying to conceive", href: "https://womenshealth.gov/pregnancy/you-get-pregnant/trying-conceive" },
    ],
    related: ["how-the-cycle-works", "cycle-hormones", "fertile-window"],
    es: {
      title: "Las cuatro fases de tu ciclo",
      summary: "Tu ciclo se suele dividir en cuatro fases: menstrual, folicular, ovulación y lútea. Esto es lo que pasa en cada una, y por qué las fechas de las fases que ves son solo estimaciones.",
      sections: [
        {
          heading: "Cuatro fases, dos perspectivas",
          body: "Los médicos describen el ciclo desde dos ángulos. Los ovarios pasan por una fase folicular, mientras madura un óvulo, y una fase lútea, después de que el óvulo se libera. La capa interna del útero (matriz) se desprende durante el periodo, luego vuelve a engrosarse y después se prepara para un posible embarazo. Si se juntan las dos perspectivas, el ciclo se suele describir en cuatro fases: menstrual, folicular, ovulación y lútea. El número de días de cada fase varía entre personas y de un ciclo a otro.",
        },
        {
          heading: "Fase menstrual: tu periodo",
          body: "El ciclo empieza el día 1, el primer día de sangrado. Los niveles de las hormonas estrógeno y progesterona están bajos, y esto le indica al cuerpo que desprenda la capa interna del útero (endometrio) a través de la vagina. Un periodo suele durar de 2 a 7 días, a menudo unos 5. Los cólicos son frecuentes, sobre todo los primeros días, porque el músculo del útero se contrae para expulsar esa capa.",
        },
        {
          heading: "Fase folicular: el crecimiento",
          body: "La fase folicular va desde el inicio del periodo hasta la ovulación, así que coincide en parte con el periodo. La hormona foliculoestimulante (FSH), que produce una pequeña glándula en la base del cerebro, hace crecer varios folículos. Son pequeñas bolsas del ovario, cada una con un óvulo. Los folículos producen estrógeno, que reconstruye y engrosa la capa interna del útero cuando termina el sangrado. La duración de esta fase puede cambiar de un mes a otro, incluso en la misma persona.",
        },
        {
          heading: "Ovulación: se libera el óvulo",
          body: "Cuando el estrógeno sube lo suficiente, el cerebro libera un pico de hormona luteinizante (LH). Esto hace que el folículo principal libere su óvulo. La ovulación suele ocurrir unos 10 a 16 días antes del siguiente periodo. Eso es alrededor del día 14 en un ciclo de 28 días, pero más tarde en un ciclo más largo y antes en uno más corto. En estos días, el moco cervical a menudo se vuelve transparente, húmedo y elástico, y algunas personas notan una punzada en un lado de la parte baja del abdomen.",
        },
        {
          heading: "Fase lútea: preparación y vuelta a empezar",
          body: "Después de la ovulación, el folículo vacío se convierte en una pequeña estructura llamada cuerpo lúteo, que produce progesterona. La progesterona mantiene la capa interna del útero gruesa y lista para que un óvulo fecundado se instale en ella. La fase lútea suele durar unos 10 a 16 días. Si no hay embarazo, el cuerpo lúteo deja de funcionar, los niveles de hormonas bajan, esa capa se deshace y empieza un nuevo periodo. En los días antes del periodo, algunas personas notan hinchazón, pechos sensibles o cambios de ánimo.",
        },
        {
          heading: "Por qué las fases son solo estimaciones",
          body: "Las fases y la ventana fértil que muestra Ciclo son estimaciones, y Ciclo no es un método anticonceptivo ni una prueba de fertilidad. Un calendario no puede confirmar si ovulaste ni cuándo, porque el día de la ovulación puede cambiar de un ciclo a otro. Para evitar o planear un embarazo, habla con un médico, una enfermera o un servicio de salud sexual sobre opciones fiables.",
        },
      ],
      notice: "Esta es información general. La duración de las fases es distinta para cada persona, y las fases estimadas no pueden confirmar la ovulación ni evitar un embarazo.",
    },
    en: {
      title: "The four phases of your cycle",
      summary: "Your cycle is often split into four phases: menstrual, follicular, ovulation and luteal. Here is what happens in each one, and why any phase dates you see are only estimates.",
      sections: [
        {
          heading: "Four phases, two views",
          body: "Doctors describe the cycle from two angles. The ovaries go through a follicular phase, while an egg ripens, and a luteal phase, after the egg is released. The lining of the womb (uterus) is shed during your period, then builds up, then gets ready for a possible pregnancy. Put together, the cycle is often described in four phases: menstrual, follicular, ovulation and luteal. The number of days in each phase differs between people and from one cycle to the next.",
        },
        {
          heading: "Menstrual phase: your period",
          body: "The cycle starts on day 1, the first day of bleeding. Levels of the hormones oestrogen and progesterone are low, and this tells the body to shed the womb lining (endometrium) through the vagina. A period usually lasts 2 to 7 days, often about 5. Cramps are common, especially in the first days, because the muscle of the womb squeezes to push the lining out.",
        },
        {
          heading: "Follicular phase: building up",
          body: "The follicular phase covers the time from the start of your period until ovulation, so it overlaps with your period. Follicle-stimulating hormone (FSH), made by a small gland at the base of the brain, makes several follicles grow. These are small sacs in the ovary, each holding an egg. The follicles make oestrogen, which rebuilds and thickens the womb lining once bleeding stops. The length of this phase can change from month to month, even in the same person.",
        },
        {
          heading: "Ovulation: the egg is released",
          body: "When oestrogen gets high enough, the brain releases a surge of luteinising hormone (LH). This makes the leading follicle release its egg. Ovulation usually happens about 10 to 16 days before your next period. That is around day 14 in a 28-day cycle, but later in a longer cycle and earlier in a shorter one. Around this time, cervical mucus often becomes clear, wet and stretchy, and some people feel a twinge on one side of the lower tummy.",
        },
        {
          heading: "Luteal phase: ready, then resetting",
          body: "After ovulation, the empty follicle becomes a small structure called the corpus luteum, which makes progesterone. Progesterone keeps the womb lining thick and ready for a fertilised egg to settle in. The luteal phase usually lasts about 10 to 16 days. If there is no pregnancy, the corpus luteum stops working, hormone levels drop, the lining breaks down and a new period starts. In the days before a period, some people notice bloating, sore breasts or mood changes.",
        },
        {
          heading: "Why the phases are only estimates",
          body: "The phases and fertile window shown in Ciclo are estimates, and Ciclo is not contraception or a fertility test. A calendar cannot confirm whether or when you ovulated, because the day you ovulate can change from cycle to cycle. To avoid or plan a pregnancy, talk to a doctor, nurse or sexual-health clinic about reliable options.",
        },
      ],
      notice: "This is general information. Phase timings differ for everyone, and estimated phases cannot confirm ovulation or prevent pregnancy.",
    },
  },
  {
    slug: "cycle-hormones",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "OpenStax — Anatomy and Physiology 2e, 27.2 Anatomy and physiology of the ovarian reproductive system", href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system" },
      { label: "MedlinePlus — Follicle-stimulating hormone (FSH) levels test", href: "https://medlineplus.gov/lab-tests/follicle-stimulating-hormone-fsh-levels-test/" },
      { label: "MedlinePlus — Luteinizing hormone (LH) levels test", href: "https://medlineplus.gov/lab-tests/luteinizing-hormone-lh-levels-test/" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
    ],
    related: ["cycle-phases", "ovulation", "ovulation-tests"],
    es: {
      title: "Las hormonas a lo largo del ciclo",
      summary: "Cuatro hormonas principales dirigen tu ciclo: la FSH y la LH, que vienen del cerebro, y el estrógeno y la progesterona, que vienen de los ovarios. Esto es lo que hace cada una, fase a fase.",
      sections: [
        {
          heading: "Señales entre el cerebro y los ovarios",
          body: "Las hormonas son mensajeros químicos que viajan por la sangre. Tu ciclo funciona gracias a señales que van y vienen entre el cerebro y los ovarios. Una parte del cerebro llamada hipotálamo controla la hipófisis (glándula pituitaria). Esta pequeña glándula en la base del cerebro produce dos hormonas, llamadas FSH y LH, que actúan sobre los ovarios. Los ovarios responden produciendo estrógeno y progesterona. Estas actúan sobre el útero (matriz) y también envían señales de vuelta al cerebro.",
        },
        {
          heading: "FSH: preparar los óvulos",
          body: "FSH son las siglas en inglés de hormona foliculoestimulante. Al principio del ciclo, hace crecer varios folículos en los ovarios. Los folículos son pequeñas bolsas que contienen cada una un óvulo, y la FSH ayuda a preparar un óvulo para que se libere. A medida que los folículos crecen, envían señales que vuelven a frenar la FSH. Más adelante en la vida, cuando los ovarios liberan menos óvulos, el cuerpo produce más FSH. Por eso es de esperar un nivel alto de FSH en la perimenopausia y después de la menopausia.",
        },
        {
          heading: "Estrógeno: la primera mitad",
          body: "Los folículos en crecimiento producen estrógeno, así que su nivel sube durante la primera mitad del ciclo. El estrógeno reconstruye y engrosa la capa interna del útero (endometrio) después del periodo. También hace que el moco del cuello del útero (cérvix) sea más fino y elástico a medida que se acerca la ovulación. Durante la mayor parte del ciclo, el estrógeno mantiene a raya la FSH y la LH. Pero cuando llega a un nivel alto justo antes de la ovulación, hace lo contrario y provoca una gran liberación de LH.",
        },
        {
          heading: "LH: la señal de la ovulación",
          body: "LH son las siglas en inglés de hormona luteinizante. Igual que la FSH, la produce la hipófisis. Durante la mayor parte del ciclo se mantiene bastante baja, y luego sube rápido en lo que se llama el pico de LH. Esta subida empieza unas 36 horas antes de la ovulación y llega a su punto más alto unas 12 horas antes. Hace que el folículo más maduro libere su óvulo. Las pruebas de ovulación caseras funcionan detectando esta subida de LH.",
        },
        {
          heading: "Progesterona: la segunda mitad",
          body: "Después de la ovulación, el folículo vacío se convierte en el cuerpo lúteo, una estructura de vida corta que produce grandes cantidades de progesterona. La progesterona prepara la capa interna del útero para que un óvulo fecundado se instale en ella (implantación). También mantiene bajas la FSH y la LH, para que mientras tanto no maduren óvulos nuevos. Los médicos llaman a esta parte del ciclo del útero fase secretora.",
        },
        {
          heading: "Cuando los niveles bajan, empieza un periodo",
          body: "Si no hay embarazo, el cuerpo lúteo deja de producir progesterona al cabo de unos 10 a 12 días. El estrógeno y la progesterona caen a niveles muy bajos, y esto le indica al cuerpo que desprenda la capa interna del útero en forma de periodo. Sin progesterona, el cerebro puede volver a producir más FSH, y un nuevo grupo de folículos empieza a crecer. Como estas hormonas cambian a lo largo del mes, puede que un médico te pida un análisis de sangre en un momento concreto del ciclo.",
        },
      ],
      notice: "Esta es información general. Los niveles de hormonas varían entre personas y a lo largo del mes; un médico o una enfermera puede explicarte qué significan para ti los resultados de cualquier análisis.",
    },
    en: {
      title: "Hormones across your cycle",
      summary: "Four main hormones run your cycle: FSH and LH from the brain, and oestrogen and progesterone from the ovaries. Here is what each one does, phase by phase.",
      sections: [
        {
          heading: "Signals between brain and ovaries",
          body: "Hormones are chemical messengers carried in your blood. Your cycle is run by signals passing between your brain and your ovaries. A part of the brain called the hypothalamus controls the pituitary gland. This small gland at the base of the brain makes two hormones, called FSH and LH, which act on the ovaries. The ovaries answer by making oestrogen and progesterone. These act on the womb (uterus) and also send signals back to the brain.",
        },
        {
          heading: "FSH: getting eggs ready",
          body: "FSH stands for follicle-stimulating hormone. Early in the cycle, it makes several follicles in the ovaries grow. Follicles are small sacs that each hold an egg, and FSH helps get an egg ready for release. As the follicles grow, they send out signals that slow FSH down again. Later in life, as the ovaries release fewer eggs, the body makes more FSH. So a high FSH level is expected around perimenopause and after menopause.",
        },
        {
          heading: "Oestrogen: the first half",
          body: "The growing follicles make oestrogen, so its level climbs through the first half of the cycle. Oestrogen rebuilds and thickens the womb lining (endometrium) after your period. It also makes the mucus from the neck of the womb (cervix) thinner and stretchier as ovulation gets close. For most of the cycle, oestrogen keeps FSH and LH in check. But when it reaches a high level just before ovulation, it does the opposite and triggers a big release of LH.",
        },
        {
          heading: "LH: the trigger for ovulation",
          body: "LH stands for luteinising hormone. Like FSH, it is made by the pituitary gland. For most of the cycle it stays fairly low, then it rises quickly in what is called the LH surge. The surge starts about 36 hours before ovulation and peaks about 12 hours before. It makes the ripest follicle release its egg. Home ovulation tests work by detecting this rise in LH.",
        },
        {
          heading: "Progesterone: the second half",
          body: "After ovulation, the empty follicle turns into the corpus luteum, a short-lived structure that makes large amounts of progesterone. Progesterone gets the womb lining ready for a fertilised egg to settle in (implantation). It also keeps FSH and LH low, so no new eggs ripen in the meantime. Doctors call this part of the womb's cycle the secretory phase.",
        },
        {
          heading: "When levels fall, a period starts",
          body: "If there is no pregnancy, the corpus luteum stops making progesterone after about 10 to 12 days. Oestrogen and progesterone both drop to very low levels, and this tells the body to shed the womb lining as a period. With progesterone gone, the brain can make more FSH again, and a new group of follicles starts to grow. Because these hormones change through the month, a doctor may ask for a blood test at a certain point in your cycle.",
        },
      ],
      notice: "This is general information. Hormone levels differ between people and across the month; a doctor or nurse can explain what any test results mean for you.",
    },
  },
  {
    slug: "ovulation",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Periods and fertility in the menstrual cycle", href: "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/" },
      { label: "NHS — Ovulation pain", href: "https://www.nhs.uk/conditions/ovulation-pain/" },
      { label: "Office on Women's Health — Trying to conceive", href: "https://womenshealth.gov/pregnancy/you-get-pregnant/trying-conceive" },
      { label: "OpenStax — Anatomy and Physiology 2e, 27.2 Anatomy and physiology of the ovarian reproductive system", href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system" },
      { label: "healthdirect — Fertility awareness (natural family planning)", href: "https://www.healthdirect.gov.au/fertility-awareness-natural-family-planning" },
    ],
    related: ["fertile-window", "cervical-mucus", "ovulation-tests"],
    es: {
      title: "La ovulación y sus señales",
      summary: "La ovulación es el momento en que un ovario libera un óvulo, normalmente de 10 a 16 días antes del siguiente periodo. Aquí verás cuándo ocurre, las señales que notan algunas personas y lo que un calendario no puede decirte.",
      sections: [
        {
          heading: "Qué pasa en la ovulación",
          body: "La ovulación es el momento en que uno de tus ovarios suelta un óvulo. En los días previos, el óvulo madura dentro de una pequeña bolsa llamada folículo. Después, una subida repentina de la hormona luteinizante (LH) hace que el folículo libere el óvulo. El óvulo pasa a la trompa de Falopio más cercana, donde unos pelillos diminutos ayudan a llevarlo hacia el útero (matriz). Si los espermatozoides llegan al óvulo en la trompa, puede fecundarse allí.",
        },
        {
          heading: "Cuándo ocurre",
          body: "La ovulación suele ocurrir unos 10 a 16 días antes de que empiece el siguiente periodo. En un ciclo de 28 días, eso es alrededor del día 14. En un ciclo de 35 días, sería más cerca del día 21. El número de días antes de la ovulación puede variar entre personas, y de un mes a otro en la misma persona. Por eso la ovulación no cae siempre en el mismo día del ciclo, y por eso un calendario solo puede estimarla.",
        },
        {
          heading: "Señales que puedes notar",
          body: "Las señales cambian de una persona a otra. En los días antes de la ovulación, el moco cervical a menudo se vuelve más húmedo, transparente y elástico, algo parecido a la clara de huevo cruda. Algunas personas sienten dolor de ovulación. Es un dolor sordo o unas punzadas en un lado de la parte baja del abdomen, que duran desde unos minutos hasta 1 o 2 días. También puede haber un poco de manchado o más flujo vaginal. La temperatura del cuerpo en reposo sube un poco justo después de la ovulación, así que cuando ves la subida, tus días más fértiles normalmente ya han pasado.",
        },
        {
          heading: "Tu ventana fértil",
          body: "Una vez liberado, el óvulo vive solo unas 12 a 24 horas. Los espermatozoides, en cambio, pueden sobrevivir en el cuerpo hasta 7 días después de las relaciones sexuales. Así que el embarazo es posible por relaciones en los días previos a la ovulación, además de en el mismo día. Todos estos días juntos se llaman ventana fértil. Como la ovulación puede llegar antes de lo esperado, también es posible un embarazo poco después de un periodo, aunque es menos probable.",
        },
        {
          heading: "Lo que un calendario no puede decirte",
          body: "La fase de ovulación y la ventana fértil que muestra Ciclo son estimaciones, no una prueba, y Ciclo no es un método anticonceptivo. Un calendario no puede confirmar que ovulaste, ni cuándo exactamente. Las pruebas de ovulación caseras buscan el pico de LH, y si hace falta, un médico puede revisar tus niveles de hormonas con un análisis de sangre. Si quieres evitar un embarazo, pregunta a un médico, una enfermera o un servicio de salud sexual por métodos fiables.",
        },
        {
          heading: "Cuándo hacerte una revisión",
          body: "Consulta con un médico o una enfermera si el dolor a mitad del ciclo no mejora con analgésicos o vuelve una y otra vez. A veces, un dolor así tiene otra causa, como endometriosis, un quiste de ovario o una infección como la clamidia. Pide ayuda médica el mismo día si el dolor es intenso y los analgésicos no te han aliviado. Si podrías estar embarazada, aunque no tengas una prueba de embarazo positiva, habla con un médico o una enfermera el mismo día si tienes dolor en la parte baja de un lado del abdomen o cualquier sangrado. Llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) si tienes un dolor abdominal repentino e intenso, dolor en la punta del hombro, un sangrado abundante, o mucho mareo o sensación de que te vas a desmayar. Pueden ser señales de un embarazo que crece fuera del útero (embarazo ectópico).",
        },
      ],
      notice: "Esta es información general. Las fechas estimadas de ovulación no son una prueba ni un método anticonceptivo. Si tienes un dolor repentino o intenso, busca atención médica.",
    },
    en: {
      title: "Ovulation and its signs",
      summary: "Ovulation is when an ovary releases an egg, usually 10 to 16 days before your next period. Here is when it happens, the signs some people notice, and what a calendar cannot tell you.",
      sections: [
        {
          heading: "What happens at ovulation",
          body: "Ovulation is the moment one of your ovaries lets go of an egg. In the days before, the egg ripens inside a small sac called a follicle. A sudden rise in luteinising hormone (LH) then makes the follicle let the egg go. The egg moves into the nearby fallopian tube, where tiny hairs help carry it towards the womb (uterus). If sperm reach the egg in the tube, it can be fertilised there.",
        },
        {
          heading: "When it happens",
          body: "Ovulation usually happens about 10 to 16 days before your next period starts. In a 28-day cycle, that is around day 14. In a 35-day cycle, it would be closer to day 21. The number of days before ovulation can differ between people, and from month to month in the same person. This is why ovulation does not fall on the same cycle day every time, and why a calendar can only estimate it.",
        },
        {
          heading: "Signs you might notice",
          body: "Signs vary from person to person. In the days before ovulation, cervical mucus often gets wetter, clearer and stretchy, a bit like raw egg white. Some people feel ovulation pain. This is a dull ache or sharp twinges on one side of the lower tummy, lasting from a few minutes to 1 or 2 days. A little spotting or extra discharge can happen too. Your body temperature at rest rises slightly just after ovulation, so by the time you see the rise, your most fertile days have usually passed.",
        },
        {
          heading: "Your fertile window",
          body: "Once it is released, the egg lives for only about 12 to 24 hours. Sperm, though, can survive in the body for up to 7 days after sex. So pregnancy is possible from sex in the days before ovulation as well as on the day itself. These days together are called the fertile window. Because ovulation can come earlier than expected, pregnancy is also possible soon after a period, although it is less likely.",
        },
        {
          heading: "What a calendar cannot tell you",
          body: "The ovulation phase and fertile window shown in Ciclo are estimates, not a test, and Ciclo is not contraception. A calendar cannot confirm that you ovulated, or exactly when. Home ovulation tests look for the LH surge, and a doctor can check your hormone levels with a blood test if needed. If you want to avoid pregnancy, ask a doctor, nurse or sexual-health clinic about reliable methods.",
        },
        {
          heading: "When to get checked",
          body: "See a doctor or nurse if pain in the middle of your cycle does not ease with painkillers or keeps coming back. Pain like this sometimes has another cause, such as endometriosis, an ovarian cyst or an infection like chlamydia. Get help the same day if the pain is severe and painkillers have not helped. If you might be pregnant, even without a positive test, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of a pregnancy growing outside the womb (ectopic pregnancy).",
        },
      ],
      notice: "This is general information. Estimated ovulation dates are not a test and not contraception. For sudden or severe pain, get medical help.",
    },
  },
  {
    slug: "cervical-mucus",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Planned Parenthood — What is the cervical mucus method?", href: "https://www.plannedparenthood.org/learn/birth-control/fertility-awareness/whats-cervical-mucus-method-fams" },
      { label: "NHS — Vaginal discharge", href: "https://www.nhs.uk/conditions/vaginal-discharge/" },
      { label: "Office on Women's Health — Trying to conceive", href: "https://womenshealth.gov/pregnancy/you-get-pregnant/trying-conceive" },
      { label: "NHS — Natural family planning (fertility awareness)", href: "https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/" },
      { label: "NHS inform — Natural family planning (fertility awareness)", href: "https://www.nhsinform.scot/healthy-living/contraception/natural-family-planning-fertility-awareness/" },
    ],
    related: ["vaginal-discharge", "ovulation", "fertility-awareness"],
    es: {
      title: "El moco cervical a lo largo del ciclo",
      summary: "El moco del cuello del útero cambia a lo largo del ciclo a medida que las hormonas suben y bajan. Conocer tu patrón habitual te ayuda a entender tu cuerpo y a notar cuándo algo es diferente.",
      sections: [
        {
          heading: "Qué es el moco cervical",
          body: "El cuello del útero (cérvix) produce moco, que ves como parte de tu flujo vaginal, en la ropa interior o en el papel higiénico. El flujo sano mantiene la vagina limpia y húmeda y ayuda a protegerla de infecciones. Puede ser transparente o blanco, y espeso y pegajoso, o resbaladizo y húmedo. No debería tener un olor fuerte ni desagradable. La cantidad y la textura cambian a lo largo del ciclo, sobre todo por la hormona estrógeno.",
        },
        {
          heading: "El patrón habitual",
          body: "Durante el periodo, la sangre tapa cualquier moco. Durante unos días después, muchas personas se notan secas y ven poco o nada. A medida que sube el estrógeno, aumenta el moco. Al principio suele ser pegajoso, y blanco o turbio. Después puede volverse cremoso. Cerca de la ovulación se vuelve más húmedo y acuoso. Justo antes de la ovulación suele haber más cantidad, y es transparente, resbaladizo y elástico, como la clara de huevo cruda. Después de la ovulación suele haber menos, y vuelve a ser más espeso y pegajoso hasta el siguiente periodo.",
        },
        {
          heading: "Cinco tipos de moco",
          body: "El moco se suele describir en cinco tipos. «Seco» significa poco o nada de moco. «Pegajoso» es espeso y se mantiene unido. «Cremoso» es suave y blanco o turbio, y a menudo aparece cuando empiezan tus días fértiles. «Acuoso» es fino, húmedo y transparente. «Clara de huevo» es transparente y resbaladizo, y se estira entre los dedos. El moco acuoso y el de tipo clara de huevo suelen aparecer más cerca de la ovulación, cuando eres más fértil. No todo el mundo nota todos los tipos en cada ciclo, y aprender tu propio patrón puede llevar unos cuantos ciclos de revisiones diarias.",
        },
        {
          heading: "Cómo revisarlo",
          body: "Lo más fácil es mirar el moco en papel higiénico blanco al limpiarte antes de orinar, o en la ropa interior. También puedes usar los dedos limpios. Fíjate en el color, en lo húmedo que se siente y en si se estira. Algunas cosas pueden cambiar el moco y hacer que cueste más interpretarlo. Por ejemplo, las relaciones sexuales, el lubricante, los anticonceptivos hormonales y algunos otros medicamentos, la lactancia, las duchas vaginales y las infecciones vaginales, incluidas las infecciones de transmisión sexual (ITS).",
        },
        {
          heading: "Lo que el moco puede y no puede decirte",
          body: "El moco transparente, resbaladizo y de tipo clara de huevo es una señal de que probablemente estás cerca de la ovulación, en tus días más fértiles. Pero es una señal, no una prueba de que hayas ovulado. Ciclo te permite registrar estos cinco tipos, pero las fases y la ventana fértil que muestra son estimaciones, y no es un método anticonceptivo ni una prueba de fertilidad. Usar el moco para evitar un embarazo exige revisiones diarias cuidadosas, y aprender suele llevar de 3 a 6 ciclos. Con un uso típico, los métodos basados en el conocimiento de la fertilidad solo tienen una eficacia de alrededor del 76%, y no protegen frente a las ITS. Un médico, una enfermera o un servicio de salud sexual pueden aconsejarte.",
        },
        {
          heading: "Cuándo consultar con un médico o una enfermera",
          body: "Los cambios a lo largo del ciclo son normales. Consulta con un médico o una enfermera, o acude a un servicio de salud sexual, si tu flujo tiene un olor fuerte o desagradable, cambia de color o se ve verde, amarillo o espumoso. Hazte una revisión también si tienes picazón, irritación, dolor pélvico o dolor al orinar. Lo mismo si tienes sangrado entre periodos o después de las relaciones sexuales, o un cambio repentino en tu patrón habitual. Pueden ser señales de una infección como la candidiasis (infección por hongos), la vaginosis bacteriana o una ITS. Busca atención urgente si tienes un dolor repentino e intenso en la parte baja del abdomen.",
        },
      ],
      notice: "Esta es información general. Si tu flujo huele fuerte, te causa picazón, te duele o cambia de repente, consulta con un médico o una enfermera.",
    },
    en: {
      title: "Cervical mucus through the cycle",
      summary: "The mucus from your cervix changes through your cycle as hormones rise and fall. Knowing your usual pattern helps you understand your body and notice when something is different.",
      sections: [
        {
          heading: "What cervical mucus is",
          body: "The neck of the womb (cervix) makes mucus, which you see as part of your vaginal discharge, on your underwear or on toilet paper. Healthy discharge keeps the vagina clean and moist and helps protect it from infection. It can be clear or white, and thick and sticky or slippery and wet. It should not have a strong or unpleasant smell. How much there is and how it feels changes through the cycle, mostly because of the hormone oestrogen.",
        },
        {
          heading: "The usual pattern",
          body: "During your period, blood hides any mucus. For a few days afterwards, many people feel dry and notice little or none. As oestrogen rises, mucus increases. At first it is often sticky, and white or cloudy. It may then become creamy. Closer to ovulation it gets wetter and more watery. Just before ovulation there is usually the most, and it is clear, slippery and stretchy, like raw egg white. After ovulation there is often less, and it becomes thicker and stickier again until your next period.",
        },
        {
          heading: "Five types of mucus",
          body: "Mucus is often described in five types. Dry means little or no mucus. Sticky is thick and holds together. Creamy is smooth and white or cloudy, and often comes as your fertile days begin. Watery is thin, wet and clear. Egg white is clear and slippery and stretches between your fingers. Watery and egg-white mucus usually come closest to ovulation, when you are most fertile. Not everyone notices every type in every cycle, and it can take a few cycles of daily checks to learn your own pattern.",
        },
        {
          heading: "How to check",
          body: "The easiest way is to look at the mucus on white toilet paper when you wipe before you pee, or on your underwear. You can also use clean fingers. Notice the colour, how wet it feels and whether it stretches. Some things can change mucus and make it harder to read. These include sex, lubricant, hormonal contraception and some other medicines, breastfeeding, douching and vaginal infections, including sexually transmitted infections (STIs).",
        },
        {
          heading: "What mucus can and cannot tell you",
          body: "Clear, slippery, egg-white mucus is a sign that you are probably near ovulation, in your most fertile days. But it is a sign, not proof that you have ovulated. Ciclo lets you log these five types, but the phases and fertile window it shows are estimates, and it is not contraception or a fertility test. Using mucus to avoid pregnancy takes careful daily checks, and it usually takes 3 to 6 cycles to learn. With typical use, fertility awareness methods are only about 76% effective, and they do not protect against STIs. A doctor, nurse or sexual-health clinic can advise you.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Changes through the cycle are normal. See a doctor or nurse, or go to a sexual-health clinic, if your discharge has a strong or unpleasant smell, changes colour, or looks green, yellow or frothy. Also get checked if you have itching, soreness, pelvic pain or pain when you pee. The same goes for bleeding between periods or after sex, or a sudden change from your usual pattern. These can be signs of an infection such as thrush, bacterial vaginosis or an STI. Get urgent help if you have sudden, severe pain in your lower tummy.",
        },
      ],
      notice: "This is general information. If your discharge smells strong, itches, hurts or suddenly changes, see a doctor or nurse.",
    },
  },
  {
    slug: "normal-cycle-length",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NICHD — About menstruation", href: "https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo" },
    ],
    related: ["irregular-periods", "tracking-your-cycle", "heavy-periods"],
    es: {
      title: "Qué se considera un ciclo normal",
      summary: "La mayoría de los ciclos en personas adultas duran entre unos 21 y 38 días, y los periodos duran de 2 a 7 días. Es normal que cambien algo de un mes a otro. Esto es lo que puedes esperar y cuándo conviene hacerte una revisión.",
      sections: [
        {
          heading: "Rangos normales en personas adultas",
          body: "La duración del ciclo se cuenta desde el primer día de un periodo hasta el día anterior al inicio del siguiente. Los organismos de salud dan rangos normales algo distintos. La Oficina para la Salud de la Mujer de EE. UU. habla de 24 a 38 días, y el NHS, el servicio público de salud del Reino Unido, de 21 a 35 días. Si se juntan, la mayoría de los ciclos en personas adultas duran entre unos 21 y 38 días. La media es de unos 28 días, pero pocas personas tienen exactamente 28 días cada vez.",
        },
        {
          heading: "Algo de variación es normal",
          body: "Tu ciclo no tiene que durar lo mismo cada mes. Varía entre personas, y de un mes a otro en la misma persona. Tus periodos siguen contando como regulares si suelen llegar dentro del rango normal. Registrar las fechas de tus periodos en Ciclo durante unos meses te muestra tu propio rango habitual, y eso te dice más que compararte con una media.",
        },
        {
          heading: "Cuánto duran los periodos",
          body: "Un periodo suele durar de 2 a 7 días, lo más habitual unos 5. En todo un periodo, la mayoría de las personas pierden unos 20 a 90 ml de sangre, más o menos de 1 a 5 cucharadas, aunque algunas sangran más. Hazte una revisión si el sangrado dura más de 7 días. Hazte una revisión también si necesitas una toalla higiénica (compresa) o un tampón nuevo cada 1 a 2 horas.",
        },
        {
          heading: "Cómo cambian los ciclos con la edad",
          body: "Durante unos años después de que empiecen los periodos, son frecuentes los ciclos de más de 38 días. Suelen volverse más regulares en unos 3 años. Si después de ese tiempo siguen siendo largos o irregulares, consulta con un médico o una enfermera. Entre los 20 y los 39 años, los ciclos suelen ser regulares. Entre los 40 y los 49, cuando el cuerpo empieza a acercarse a la menopausia (perimenopausia), los ciclos pueden volver a ser irregulares. Los periodos terminan con la menopausia, normalmente entre mediados de los 40 y mediados de los 50 años.",
        },
        {
          heading: "Qué puede cambiar tu ciclo",
          body: "Los periodos se detienen durante el embarazo, y si das el pecho, pueden tardar un tiempo en volver. El estrés prolongado puede hacer que los periodos sean irregulares. Ganar o perder mucho peso puede hacer que te falten periodos, y tener muy poca grasa corporal puede detener la ovulación. Algunos problemas de salud, como los de tiroides y el síndrome de ovario poliquístico (SOP), pueden alterar tu ciclo, y también algunos medicamentos, entre ellos algunos para la epilepsia o la ansiedad. Los anticonceptivos hormonales y el ejercicio muy intenso también pueden cambiar tus periodos.",
        },
        {
          heading: "Cuándo consultar con un médico o una enfermera",
          body: "Habla con un médico o una enfermera si tus ciclos suelen durar menos de 24 días o más de 38, o si tus periodos regulares se vuelven irregulares. Habla también con un profesional si llevas 3 meses sin periodo y no estás embarazada ni dando el pecho. El sangrado entre periodos o después de las relaciones sexuales también se debe revisar. Busca atención urgente si estás sangrando de forma muy abundante y sientes mareo, que te vas a desmayar o mucha debilidad.",
        },
      ],
      notice: "Esta es información general. Lo normal para ti puede ser distinto de la media; si tu ciclo cambia o te preocupa, habla con un médico o una enfermera.",
    },
    en: {
      title: "What counts as a normal cycle",
      summary: "Most adult cycles last between about 21 and 38 days, and periods last 2 to 7 days. Some change from month to month is normal. Here is what to expect and when to get checked.",
      sections: [
        {
          heading: "Normal ranges for adults",
          body: "Your cycle length is counted from the first day of one period up to the day before the next one starts. Health bodies give slightly different normal ranges. The US Office on Women's Health says 24 to 38 days, and the NHS says 21 to 35 days. Put together, most adult cycles last somewhere between about 21 and 38 days. The average is around 28 days, but few people have exactly 28 days every time.",
        },
        {
          heading: "Some change is normal",
          body: "Your cycle does not need to be the same length every month. It varies between people, and from month to month in the same person. Your periods still count as regular if they usually come within the normal range. Logging your period dates in Ciclo for a few months shows you your own usual range, which tells you more than comparing yourself with an average.",
        },
        {
          heading: "How long periods last",
          body: "A period usually lasts 2 to 7 days, most often about 5. Over a whole period, most people lose about 20 to 90 ml of blood, roughly 1 to 5 tablespoons, although some bleed more heavily. Get checked if bleeding lasts more than 7 days. Also get checked if you need a new pad or tampon every 1 to 2 hours.",
        },
        {
          heading: "How cycles change with age",
          body: "For a few years after periods start, cycles longer than 38 days are common. They usually become more regular within about 3 years. If they are still long or irregular after that, see a doctor or nurse. In your 20s and 30s, cycles tend to be regular. In your 40s, as the body starts moving towards menopause (perimenopause), cycles may become irregular again. Periods stop at menopause, usually in the mid-40s to mid-50s.",
        },
        {
          heading: "What can change your cycle",
          body: "Periods stop in pregnancy, and if you breastfeed, they can take a while to come back. Long-term stress can make periods irregular. Gaining or losing a lot of weight can make you miss periods, and very low body fat can stop ovulation. Health conditions such as thyroid problems and polycystic ovary syndrome (PCOS) can affect your cycle, and so can some medicines, including some for epilepsy or anxiety. Hormonal contraception and exercising very hard can also change your periods.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Talk to a doctor or nurse if your cycles are regularly shorter than 24 days or longer than 38 days, or if regular periods become irregular. Also talk to one if you have no period for 3 months and are not pregnant or breastfeeding. Bleeding between periods or after sex should be checked too. Get urgent help if you are bleeding very heavily and feel dizzy, faint or very weak.",
        },
      ],
      notice: "This is general information. Your own normal may differ from the average; if your cycle changes or worries you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "reproductive-anatomy",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "OpenStax — Anatomy and Physiology 2e, 27.2 Anatomy and physiology of the ovarian reproductive system", href: "https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system" },
      { label: "Planned Parenthood — What are the parts of the female sexual anatomy?", href: "https://www.plannedparenthood.org/learn/health-and-wellness/sexual-and-reproductive-anatomy/what-are-parts-female-sexual-anatomy" },
      { label: "Planned Parenthood — Sexual and reproductive anatomy", href: "https://www.plannedparenthood.org/learn/health-and-wellness/sexual-and-reproductive-anatomy" },
      { label: "NHS — Vaginal discharge", href: "https://www.nhs.uk/conditions/vaginal-discharge/" },
    ],
    related: ["how-the-cycle-works", "vaginal-discharge", "intimate-hygiene"],
    es: {
      title: "Tu anatomía reproductiva",
      summary: "Una guía sencilla de la vulva, la vagina, el cuello del útero, el útero, las trompas de Falopio y los ovarios: dónde está cada parte y qué hace. Cada cuerpo es un poco distinto, y eso es normal.",
      sections: [
        {
          heading: "La vulva y la vagina no son lo mismo",
          body: "La vulva es la parte que se ve por fuera. Incluye los labios externos e internos (labios mayores y menores), el clítoris, el orificio por el que orinas y la abertura de la vagina. La vagina es el conducto elástico de dentro, que va desde la abertura vaginal hasta el cuello del útero (cérvix). Mucha gente dice vagina cuando quiere decir vulva. Conocer las palabras correctas puede ayudarte a describir un problema a un médico o una enfermera.",
        },
        {
          heading: "Las partes de la vulva",
          body: "Delante, sobre el hueso del pubis, hay una almohadilla blanda de tejido graso. Los labios externos son carnosos y suelen estar cubiertos de vello púbico, y los labios internos, más finos, quedan por dentro. Los labios varían mucho de tamaño, forma y color, y es frecuente que los dos lados se vean distintos. La punta del clítoris está arriba, donde se juntan los labios internos. Es muy sensible, y es más grande de lo que parece, porque gran parte está dentro del cuerpo. Debajo está el orificio de la uretra, por donde sale la orina; luego, la abertura de la vagina, y más atrás, el ano.",
        },
        {
          heading: "La vagina",
          body: "La vagina es un conducto muscular de unos 10 cm de largo. Sus paredes tienen pliegues que le permiten estirarse. Por ella sale la sangre del periodo, y por ella nacen los bebés. Un fino trozo de tejido llamado himen puede cubrir en parte la abertura, y los hímenes varían mucho. Unas glándulas cerca de la abertura producen un líquido que mantiene la vagina húmeda durante la excitación. Las bacterias sanas de su interior la mantienen ácida, lo que ayuda a protegerla de infecciones, y el flujo normal la mantiene limpia.",
        },
        {
          heading: "El cuello del útero y el útero",
          body: "El cuello del útero es el extremo inferior y estrecho del útero (matriz), en la parte superior de la vagina. Tiene una abertura diminuta que deja salir la sangre del periodo y entrar los espermatozoides, y produce el moco que cambia a lo largo del ciclo. El útero es un órgano hueco con paredes musculares gruesas. Cuando no hay embarazo, mide unos 7 cm de largo y 5 cm de ancho. Su capa interna (endometrio) se engrosa y se desprende en cada ciclo. Su gruesa pared muscular es la que se contrae durante los cólicos menstruales.",
        },
        {
          heading: "Las trompas de Falopio y los ovarios",
          body: "Dos trompas de Falopio van desde el útero hacia los ovarios. Sus extremos tienen bordes en forma de dedos, y unos pelillos diminutos dentro de las trompas ayudan a llevar el óvulo hacia el útero. A menudo, el óvulo se fecunda dentro de la trompa. Cada uno de los dos ovarios mide unos 2 a 3 cm de largo, más o menos el tamaño de una almendra. Guardan los óvulos y producen hormonas, como estrógeno, progesterona y testosterona. Al nacer, los ovarios tienen unos 1 a 2 millones de óvulos inmaduros. En la pubertad quedan unos 400 mil.",
        },
        {
          heading: "Cada cuerpo es distinto",
          body: "Los cuerpos varían mucho, y las diferencias de tamaño, forma o color suelen ser normales. Algunas personas nacen con cuerpos que no encajan en las ideas típicas de lo femenino o lo masculino. A esto se le llama ser intersexual. Consulta con un médico o una enfermera si notas llagas, ampollas, un bulto nuevo o un cambio en la piel de la vulva. Ve también si tienes picazón, irritación, dolor, un cambio en el flujo vaginal, o sangrado entre periodos o después de las relaciones sexuales.",
        },
      ],
      notice: "Esta es información general. Cada cuerpo es un poco distinto; si algo es nuevo, duele o te preocupa, habla con un médico o una enfermera.",
    },
    en: {
      title: "Your reproductive anatomy",
      summary: "A plain guide to the vulva, vagina, cervix, womb, fallopian tubes and ovaries: where each part is and what it does. Every body looks a little different, and that is normal.",
      sections: [
        {
          heading: "Vulva and vagina are not the same",
          body: "The vulva is the part you can see on the outside. It includes the outer and inner lips (labia), the clitoris, the opening you pee from and the vaginal opening. The vagina is the stretchy tube inside, which leads from the vaginal opening up to the neck of the womb (cervix). Many people say vagina when they mean vulva. Knowing the right words can make it easier to describe a problem to a doctor or nurse.",
        },
        {
          heading: "The parts of the vulva",
          body: "At the front, over the pubic bone, is a soft pad of fatty tissue. The outer lips are fleshy and usually covered with pubic hair, and the thinner inner lips sit inside them. Labia vary a lot in size, shape and colour, and it is common for the two sides to look different. The tip of the clitoris is at the top, where the inner lips meet. It is very sensitive, and it is larger than it looks, because much of it lies inside the body. Below it is the opening of the urethra, where pee comes out, then the vaginal opening, and further back the anus.",
        },
        {
          heading: "The vagina",
          body: "The vagina is a muscular canal about 10 cm long. Its walls have folds that let it stretch. Period blood leaves the body through it, and babies are born through it. A thin piece of tissue called the hymen may partly cover the opening, and hymens vary a lot. Glands near the opening make fluid that keeps the vagina wet during arousal. Healthy bacteria inside keep it acidic, which helps protect it from infection, and normal discharge keeps it clean.",
        },
        {
          heading: "The cervix and womb",
          body: "The cervix is the narrow lower end of the womb (uterus), at the top of the vagina. It has a tiny opening that lets period blood out and sperm in, and it makes the mucus that changes through your cycle. The womb is a hollow organ with thick muscle walls. When you are not pregnant, it is roughly 7 cm long and 5 cm wide. Its inner lining (endometrium) builds up and sheds each cycle. Its thick muscle wall is what squeezes during period cramps.",
        },
        {
          heading: "Fallopian tubes and ovaries",
          body: "Two fallopian tubes lead from the womb towards the ovaries. Their ends have finger-like edges, and tiny hairs inside the tubes help carry an egg towards the womb. An egg is often fertilised inside the tube. The two ovaries are each about 2 to 3 cm long, about the size of an almond. They store eggs and make hormones, including oestrogen, progesterone and testosterone. At birth, the ovaries hold about 1 to 2 million immature eggs. By puberty, about 400,000 remain.",
        },
        {
          heading: "Every body is different",
          body: "Bodies vary a lot, and differences in size, shape or colour are usually normal. Some people are born with bodies that do not fit typical ideas of female or male. This is called being intersex. See a doctor or nurse if you notice sores, blisters, a new lump or a change in the skin of your vulva. Also go if you have itching, soreness, pain, a change in your discharge, or bleeding between periods or after sex.",
        },
      ],
      notice: "This is general information. Every body is a little different; if something is new, painful or worrying, talk to a doctor or nurse.",
    },
  },
  {
    slug: "tracking-your-cycle",
    category: "cycle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NICHD — About menstruation", href: "https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo" },
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
    ],
    related: ["tracking-for-doctor", "normal-cycle-length", "irregular-periods"],
    es: {
      title: "Cómo registrar tu ciclo",
      summary: "Un registro sencillo de tus periodos y síntomas te ayuda a conocer tu propio patrón y a notar los cambios pronto. Aquí verás cómo contar tu ciclo y qué vale la pena anotar.",
      sections: [
        {
          heading: "Cómo contar el día 1 y la duración del ciclo",
          body: "El día 1 del ciclo es el primer día de sangrado del periodo. El ciclo dura hasta el día anterior al inicio del siguiente periodo. Para saber cuánto dura tu ciclo, cuenta los días desde un día 1 hasta el día anterior al siguiente. Por ejemplo, si un periodo empieza el 3 de marzo y el siguiente el 31 de marzo, ese ciclo duró 28 días. La duración del periodo es el número de días que sangras, normalmente de 2 a 7.",
        },
        {
          heading: "Qué vale la pena anotar",
          body: "Empieza por lo básico: el día en que empieza tu periodo, cuántos días dura y cuánto sangras. Después añade lo que sea importante para ti, como cólicos u otros dolores, dolor de cabeza, hinchazón, pechos sensibles, cambios de ánimo o cambios en el moco cervical. Anota también cualquier manchado o sangrado fuera del periodo. Una nota breve sobre el estrés u otros cambios importantes en tu vida puede ayudarte más adelante a entender un ciclo poco habitual.",
        },
        {
          heading: "Los patrones importan más que un solo ciclo",
          body: "Un ciclo más corto, más largo o más abundante de lo normal le puede pasar a cualquiera, porque los ciclos varían de forma natural de un mes a otro. Un patrón a lo largo de varios ciclos te dice mucho más. Al cabo de unos meses puedes ver tu rango habitual, cuánto duran tus periodos y cuándo suelen aparecer los síntomas. Así es más fácil detectar un cambio real, como ciclos que se vuelven mucho más cortos o largos, o periodos que se vuelven más abundantes o dolorosos.",
        },
        {
          heading: "Una señal de tu salud en general",
          body: "Tu ciclo puede reflejar lo que pasa en el resto de tu cuerpo. El estrés prolongado, los cambios grandes de peso, los problemas de tiroides y enfermedades como el síndrome de ovario poliquístico (SOP) pueden hacer que los periodos sean irregulares o que se detengan. El dolor o el sangrado que te impide hacer tus actividades diarias no es algo con lo que tengas que vivir, y el tratamiento puede ayudar. Un registro escrito de tus periodos y síntomas puede ayudar a un médico o una enfermera a encontrar la causa de un problema.",
        },
        {
          heading: "Por qué los pronósticos son estimaciones",
          body: "Ciclo muestra pronósticos del periodo, fases estimadas y una ventana fértil. Son estimaciones, no mediciones. La duración del ciclo puede cambiar de un mes a otro, incluso en la misma persona, así que un pronóstico puede fallar por varios días. Un pronóstico no puede confirmar que ovulaste, y no se puede usar como método anticonceptivo.",
        },
        {
          heading: "Cuándo hablar con un médico o una enfermera",
          body: "Pide consejo si tus ciclos suelen durar menos de 24 días o más de 38, o si tus periodos regulares se vuelven irregulares. Pide consejo también si pasas 3 meses sin periodo y no estás embarazada ni dando el pecho. Consulta con un médico o una enfermera si tienes sangrado entre periodos o después de las relaciones sexuales. Ve también si un periodo dura más de 7 días, o si los analgésicos no te alivian el dolor menstrual. Busca atención urgente si sangras de forma muy abundante y sientes mareo o que te vas a desmayar, o si tienes un dolor repentino e intenso en la parte baja del abdomen.",
        },
      ],
      notice: "Esta es información general. Los pronósticos de la app son estimaciones; si tu ciclo cambia o algo te preocupa, habla con un médico o una enfermera.",
    },
    en: {
      title: "Tracking your cycle",
      summary: "A simple record of your periods and symptoms helps you learn your own pattern and notice changes early. Here is how to count your cycle and what is worth noting.",
      sections: [
        {
          heading: "Counting day 1 and cycle length",
          body: "Day 1 of your cycle is the first day of period bleeding. Your cycle runs until the day before your next period starts. To find your cycle length, count the days from one day 1 up to the day before the next. For example, if one period starts on 3 March and the next on 31 March, that cycle was 28 days long. Your period length is the number of days you bleed, usually 2 to 7.",
        },
        {
          heading: "What is worth noting",
          body: "Start with the basics: the day your period starts, how many days it lasts and how heavy the bleeding is. Then add anything that matters to you, such as cramps or other pain, headaches, bloating, sore breasts, mood changes, or changes in cervical mucus. Note any spotting or bleeding outside your period too. A short note about stress or other big changes in your life can help you make sense of an unusual cycle later.",
        },
        {
          heading: "Patterns matter more than one cycle",
          body: "One cycle that is shorter, longer or heavier than usual can happen to anyone, because cycles naturally vary from month to month. A pattern over several cycles tells you much more. After a few months you can see your usual range, how long your periods last and when symptoms tend to appear. That makes it easier to spot a real change, such as cycles that become much shorter or longer, or periods that get heavier or more painful.",
        },
        {
          heading: "A sign of your overall health",
          body: "Your cycle can reflect what is going on in the rest of your body. Long-term stress, big weight changes, thyroid problems and conditions such as polycystic ovary syndrome (PCOS) can all make periods irregular or stop them. Pain or bleeding that stops you doing everyday things is not something you have to live with, and treatment can help. A written record of your periods and symptoms can help a doctor or nurse find the cause of a problem.",
        },
        {
          heading: "Why predictions are estimates",
          body: "Ciclo shows period predictions, estimated phases and a fertile window. These are estimates, not measurements. Cycle length can change from month to month, even in the same person, so a prediction can be off by several days. A prediction cannot confirm that you ovulated, and it cannot be used as contraception.",
        },
        {
          heading: "When to talk to a doctor or nurse",
          body: "Get advice if your cycles are regularly shorter than 24 days or longer than 38 days, or if regular periods become irregular. Also get advice if you go 3 months without a period and are not pregnant or breastfeeding. See a doctor or nurse about bleeding between periods or after sex. Also go if a period lasts more than 7 days, or if painkillers do not help your period pain. Get urgent help if you bleed very heavily and feel dizzy or faint, or have sudden, severe pain in your lower tummy.",
        },
      ],
      notice: "This is general information. App predictions are estimates; if your cycle changes or something worries you, talk to a doctor or nurse.",
    },
  },
];
