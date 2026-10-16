// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const FERTILITY_ARTICLES: LearnArticle[] = [
  {
    slug: "fertile-window",
    category: "fertility",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Periods and fertility in the menstrual cycle", href: "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/" },
      { label: "Planned Parenthood — Fertility awareness methods", href: "https://www.plannedparenthood.org/learn/birth-control/fertility-awareness" },
      { label: "Office on Women's Health — Trying to conceive", href: "https://www.womenshealth.gov/pregnancy/you-get-pregnant/trying-conceive" },
      { label: "NHS — Natural family planning", href: "https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/" },
    ],
    related: ["ovulation", "fertility-awareness", "trying-to-conceive"],
    es: {
      title: "Tu ventana fértil",
      summary: "Solo puedes quedarte embarazada durante más o menos una semana de cada ciclo, alrededor de la ovulación. Aquí verás cómo funciona la ventana fértil y por qué la estimación de cualquier app es solo orientativa.",
      sections: [
        {
          heading: "Qué es la ventana fértil",
          body: "Tu ventana fértil son los pocos días de cada ciclo en los que las relaciones sexuales pueden dar lugar a un embarazo. Depende de cuánto tiempo pueden sobrevivir un óvulo y los espermatozoides. Después de la ovulación (cuando un ovario libera un óvulo), el óvulo vive unas 12 a 24 horas. Los espermatozoides pueden sobrevivir dentro del cuerpo hasta 7 días después de las relaciones sexuales. Así que la ventana dura alrededor de una semana: los días antes de la ovulación y el propio día de la ovulación.",
        },
        {
          heading: "Cuándo suele ser",
          body: "La ovulación suele ocurrir unos 10 a 16 días antes del siguiente periodo. No siempre cae a mitad del ciclo. Si tienes un ciclo regular de 28 días, es probable que seas fértil alrededor del día 14, contando el primer día de sangrado como día 1. En los ciclos más cortos la ventana llega antes, y en los más largos, después. Quedarse embarazada poco después de un periodo no es muy probable, pero puede pasar si ovulas pronto o tienes un ciclo corto.",
        },
        {
          heading: "Señales de que se acerca la ovulación",
          body: "Alrededor de la ovulación, el flujo vaginal (moco cervical) a menudo se vuelve transparente, fino y elástico, algo parecido a la clara de huevo cruda. Las pruebas de ovulación también pueden ayudar. Detectan una subida repentina (pico) de una hormona llamada hormona luteinizante (LH). Este pico empieza unas 36 horas antes de la ovulación. Estas señales pueden variar. Incluso en la misma persona, el número de días antes de la ovulación puede cambiar de un mes a otro.",
        },
        {
          heading: "Por qué cualquier estimación es solo orientativa",
          body: "Una app solo puede estimar la ventana fértil. No puede ver lo que hace tu cuerpo este mes. Ciclo muestra una ventana fértil estimada, pero no puede confirmar que hayas ovulado y no es un método anticonceptivo. Incluso los métodos basados en el conocimiento de la fertilidad, que registran varias señales del cuerpo cada día y se aprenden con una persona formada para enseñarlos, solo tienen una eficacia de alrededor del 76% con un uso típico. Eso significa que unas 24 de cada 100 personas que los usan se quedan embarazadas en un año.",
        },
        {
          heading: "Buscar o evitar un embarazo",
          body: "Si estás buscando un bebé, no necesitas encontrar el día exacto. Tener relaciones sexuales cada 2 a 3 días a lo largo del ciclo hace que sea probable que haya espermatozoides cuando ovules. Si quieres evitar un embarazo, usa un método anticonceptivo fiable en lugar de una ventana fértil estimada. Un médico, una enfermera o un servicio de salud sexual pueden ayudarte a elegir el método que mejor te vaya.",
        },
      ],
      notice: "Esta es información general. Una ventana fértil estimada no es un método anticonceptivo. Si necesitas ayuda para buscar o evitar un embarazo, habla con un médico o una enfermera.",
    },
    en: {
      title: "Your fertile window",
      summary: "You can only get pregnant during about a week of each cycle, around ovulation. Here is how the fertile window works and why any app's estimate is only a guide.",
      sections: [
        {
          heading: "What the fertile window is",
          body: "Your fertile window is the small number of days in each cycle when sex can lead to pregnancy. It depends on how long an egg and sperm can survive. After ovulation (when an ovary releases an egg), the egg lives for about 12 to 24 hours. Sperm can survive inside the body for up to 7 days after sex. So the window is about a week long: the days before ovulation and the day of ovulation itself.",
        },
        {
          heading: "When it usually falls",
          body: "Ovulation usually happens about 10 to 16 days before your next period. It does not always fall in the middle of the cycle. If you have a regular 28-day cycle, you are likely to be fertile around day 14, counting the first day of bleeding as day 1. In shorter cycles the window comes earlier, and in longer cycles it comes later. Getting pregnant soon after a period is not very likely, but it can happen if you ovulate early or have a short cycle.",
        },
        {
          heading: "Signs that ovulation is near",
          body: "Around ovulation, vaginal discharge (cervical mucus) often becomes clear, thin and stretchy, a bit like raw egg white. Ovulation tests can also help. They detect a sudden rise (surge) in a hormone called luteinising hormone (LH). The surge starts about 36 hours before ovulation. These signs can vary. Even in the same person, the number of days before ovulation can change from month to month.",
        },
        {
          heading: "Why any estimate is only a guide",
          body: "An app can only estimate a fertile window. It cannot see what your body is doing this month. Ciclo shows an estimated fertile window, but it cannot confirm that you have ovulated and it is not a form of contraception. Even fertility awareness methods, which track several body signs every day and are learned from a trained teacher, are only about 76% effective with typical use. That means about 24 in 100 people using them get pregnant in a year.",
        },
        {
          heading: "Planning or avoiding pregnancy",
          body: "If you are trying for a baby, you do not need to find the exact day. Having sex every 2 to 3 days through your cycle means sperm are likely to be there when you ovulate. If you want to avoid pregnancy, use a reliable method of contraception rather than an estimated fertile window. A doctor, nurse or sexual-health clinic can help you choose a method that suits you.",
        },
      ],
      notice: "This is general information. An estimated fertile window is not contraception. For help planning or avoiding pregnancy, talk to a doctor or nurse.",
    },
  },
  {
    slug: "fertility-awareness",
    category: "fertility",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Natural family planning", href: "https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/" },
      { label: "Planned Parenthood — Fertility awareness methods", href: "https://www.plannedparenthood.org/learn/birth-control/fertility-awareness" },
      { label: "Office on Women's Health — Trying to conceive", href: "https://www.womenshealth.gov/pregnancy/you-get-pregnant/trying-conceive" },
    ],
    related: ["fertile-window", "ovulation-tests", "choosing-contraception"],
    es: {
      title: "Métodos basados en el conocimiento de la fertilidad",
      summary: "El conocimiento de la fertilidad consiste en registrar señales del cuerpo para saber cuáles son tus días fértiles. Puede funcionar bien si se aprende de forma correcta, pero con un uso típico es mucho menos fiable.",
      sections: [
        {
          heading: "Qué es el conocimiento de la fertilidad",
          body: "Los métodos basados en el conocimiento de la fertilidad, también llamados planificación familiar natural, te ayudan a saber en qué días del ciclo podrías quedarte embarazada. Registras señales de tu cuerpo cada día. Para evitar un embarazo, en tus días fértiles evitas las relaciones sexuales o usas otro método, como el condón (preservativo). Algunas personas usan lo mismo que han aprendido para elegir cuándo tener relaciones cuando quieren un bebé.",
        },
        {
          heading: "Las señales que registras",
          body: "Hay varios métodos. El método de la temperatura usa la temperatura del cuerpo en reposo, que sube un poco justo después de la ovulación. El método del moco cervical sigue los cambios del flujo vaginal, que se vuelve transparente y resbaladizo alrededor de la ovulación. El método del calendario usa la duración de tus ciclos anteriores. Usar los tres a la vez, lo que a veces se llama método sintotérmico, es más eficaz que confiar en uno solo.",
        },
        {
          heading: "Qué eficacia tiene",
          body: "La eficacia depende mucho de lo cuidadosamente que se use el método. El NHS, el servicio público de salud del Reino Unido, dice que con un uso perfecto el conocimiento de la fertilidad tiene una eficacia de entre el 91% y el 99% para evitar un embarazo. Con un uso típico, que tiene en cuenta los errores que la gente comete en la vida real, solo tiene una eficacia del 76%: unas 24 de cada 100 mujeres que lo usan se quedan embarazadas en un año.",
        },
        {
          heading: "Aprenderlo bien es importante",
          body: "El conocimiento de la fertilidad requiere habilidad y constancia, y funciona mejor cuando lo aprendes con alguien formado. El NHS recomienda aprenderlo con un profesional sanitario con formación específica en conocimiento de la fertilidad. Dice que aprender bien el método puede llevar de 2 a 3 ciclos. Tienes que registrar tus señales todos los días. Los métodos funcionan peor si tus ciclos son irregulares, así que puede que no sean para todo el mundo.",
        },
        {
          heading: "Apps, ITS y otros límites",
          body: "El conocimiento de la fertilidad no te protege de las infecciones de transmisión sexual (ITS), así que usa también condón si podrías estar en riesgo. Ciclo registra el moco cervical y las pruebas de ovulación, pero no la temperatura, y su ventana fértil es una estimación, no un método anticonceptivo. Si quieres ayuda para elegir un método fiable, habla con un médico, una enfermera o un servicio de salud sexual.",
        },
      ],
      notice: "Esta es información general. El conocimiento de la fertilidad necesita una formación adecuada para funcionar bien y no protege frente a las ITS. Pregunta a un médico o una enfermera por tus opciones.",
    },
    en: {
      title: "Fertility awareness methods",
      summary: "Fertility awareness means tracking body signs to work out your fertile days. It can work well when learned properly, but with typical use it is much less reliable.",
      sections: [
        {
          heading: "What fertility awareness is",
          body: "Fertility awareness methods, also called natural family planning, help you work out the days in your cycle when you could get pregnant. You record signs from your body every day. To avoid pregnancy, you then avoid sex or use another method, such as condoms, on your fertile days. Some people use the same skills to time sex when they want a baby.",
        },
        {
          heading: "The signs you track",
          body: "There are several methods. The temperature method uses your body temperature at rest, which rises slightly just after ovulation. The cervical mucus method follows changes in your vaginal discharge, which becomes clear and slippery around ovulation. The calendar method uses the length of your past cycles. Using all three together, sometimes called the symptothermal method, is more effective than relying on one alone.",
        },
        {
          heading: "How effective it is",
          body: "Effectiveness depends a lot on how carefully the method is used. The NHS says that with perfect use, fertility awareness is between 91% and 99% effective at preventing pregnancy. With typical use, which allows for the mistakes people make in real life, it is only 76% effective: about 24 in 100 women using it get pregnant in a year.",
        },
        {
          heading: "Learning it properly matters",
          body: "Fertility awareness takes skill and commitment, and it works best when you learn it from someone trained. The NHS advises learning it from a health professional who is specially trained in fertility awareness. It says it can take 2 to 3 cycles to learn the method properly. You need to record your signs every day. The methods work less well if your cycles are irregular, so they may not suit everyone.",
        },
        {
          heading: "Apps, STIs and other limits",
          body: "Fertility awareness does not protect you from sexually transmitted infections (STIs), so use condoms as well if you could be at risk. Ciclo logs cervical mucus and ovulation tests but not temperature, and its fertile window is an estimate, not contraception. If you want help choosing a reliable method, talk to a doctor, nurse or sexual-health clinic.",
        },
      ],
      notice: "This is general information. Fertility awareness needs proper training to work well and does not protect against STIs. Ask a doctor or nurse about your options.",
    },
  },
  {
    slug: "trying-to-conceive",
    category: "fertility",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Trying to get pregnant", href: "https://www.nhs.uk/pregnancy/trying-for-a-baby/trying-to-get-pregnant/" },
      { label: "NHS — Infertility", href: "https://www.nhs.uk/conditions/infertility/" },
      { label: "CDC — Infertility FAQs", href: "https://www.cdc.gov/reproductive-health/infertility-faq/index.html" },
      { label: "Office on Women's Health — Preconception health", href: "https://womenshealth.gov/pregnancy/you-get-pregnant/preconception-health" },
      { label: "NHS — Vitamins and supplements in pregnancy", href: "https://www.nhs.uk/pregnancy/keeping-well/pregnancy-vitamins-and-supplements/" },
    ],
    related: ["fertile-window", "preconception-health", "infertility"],
    es: {
      title: "Buscar un embarazo",
      summary: "La mayoría de las parejas en las que la mujer tiene menos de 40 años consiguen un embarazo en un año de relaciones sexuales regulares sin anticonceptivos. Aquí verás cómo influye el momento de las relaciones, qué ayuda y cuándo pedir ayuda.",
      sections: [
        {
          heading: "Cuánto suele tardar",
          body: "Conseguir un embarazo suele llevar más tiempo de lo que la gente espera. Más de 8 de cada 10 parejas en las que la mujer tiene menos de 40 años consiguen un embarazo de forma natural en un año, si tienen relaciones sexuales regulares sin anticonceptivos cada 2 o 3 días. Por eso es frecuente que tarde varios meses. A mucha gente le pasa que no se queda embarazada en los primeros ciclos.",
        },
        {
          heading: "Elegir el momento en torno a la ovulación",
          body: "Es más probable quedarse embarazada alrededor de la ovulación, cuando un ovario libera un óvulo. Esto suele pasar unos 10 a 16 días antes del siguiente periodo, así que llega más tarde en un ciclo largo y antes en uno corto. Los espermatozoides pueden vivir hasta 7 días, así que las relaciones sexuales de los días previos a la ovulación también cuentan. Tener relaciones cada 2 a 3 días a lo largo del ciclo hace que no necesites dar con el día exacto.",
        },
        {
          heading: "Hábitos que ayudan",
          body: "Toma 400 microgramos de ácido fólico cada día desde antes de empezar a buscar el embarazo hasta las 12 semanas de embarazo, y pregunta también por la vitamina D. También ayuda recibir apoyo para dejar de fumar, igual que no beber alcohol. Un peso demasiado bajo o demasiado alto puede hacer más difícil quedarse embarazada, así que un médico o una enfermera pueden ayudarte a conseguir un peso saludable. Si tomas un medicamento recetado, no lo dejes sin hablar antes con tu médico.",
        },
        {
          heading: "La salud de tu pareja también importa",
          body: "Los problemas de fertilidad pueden afectar tanto a hombres como a mujeres. Un semen de mala calidad es una de las razones frecuentes por las que a las parejas les cuesta conseguir un embarazo. Una pareja masculina puede cuidar su propia salud reproductiva bebiendo menos alcohol, dejando de fumar o de consumir drogas, comiendo bien y reduciendo el estrés. Las parejas en las que el hombre tiene 40 años o más también tienen más probabilidades de tener dificultades para conseguir un embarazo.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta con un médico o una enfermera si llevas un año o más intentándolo. Ve antes si tienes más edad: las guías de Estados Unidos (CDC) recomiendan ir al médico tras 6 meses intentándolo a partir de los 35 años, y las del Reino Unido (NHS) dicen que las mujeres de 36 años o más deberían ir antes. Ve pronto también si tus periodos son irregulares o se han detenido, si tienes endometriosis o si ya sabes de un posible problema de fertilidad.",
        },
      ],
      notice: "Esta es información general. Si tienes algún problema de salud o tomas medicamentos de forma habitual, habla con un médico o una enfermera antes de empezar a buscar el embarazo.",
    },
    en: {
      title: "Trying to get pregnant",
      summary: "Most couples where the woman is under 40 get pregnant within a year of regular sex without contraception. Here is how timing works, what helps, and when to ask for help.",
      sections: [
        {
          heading: "How long it usually takes",
          body: "Getting pregnant often takes longer than people expect. More than 8 in 10 couples where the woman is under 40 get pregnant naturally within a year, if they have regular sex without contraception every 2 or 3 days. So it is common for it to take several months. Not getting pregnant in the first few cycles happens to many people.",
        },
        {
          heading: "Timing sex around ovulation",
          body: "You are most likely to get pregnant around ovulation, when an ovary releases an egg. This usually happens about 10 to 16 days before your next period, so it comes later in a long cycle and earlier in a short one. Sperm can live for up to 7 days, so sex in the days before ovulation counts. Having sex every 2 to 3 days through your cycle means you do not need to pinpoint the exact day.",
        },
        {
          heading: "Habits that help",
          body: "Take 400 micrograms of folic acid every day from before you try until you are 12 weeks pregnant, and ask about vitamin D too. Getting support to stop smoking and not drinking alcohol both help. A weight that is too low or too high can make it harder to get pregnant, so a doctor or nurse can help you aim for a healthy weight. If you take a prescribed medicine, do not stop it before talking to your doctor.",
        },
        {
          heading: "Your partner's health matters too",
          body: "Fertility problems can affect men as well as women. Poor-quality semen is one of the common reasons couples find it hard to conceive. A male partner can look after his own reproductive health by drinking less alcohol, stopping smoking or drug use, eating well and reducing stress. Couples where the man is 40 or older are also more likely to have difficulty conceiving.",
        },
        {
          heading: "When to ask for help",
          body: "See a doctor or nurse if you have been trying for a year or more. Go sooner if you are older: US guidance (CDC) advises seeing a doctor after 6 months of trying from age 35, and UK guidance (NHS) says women aged 36 and over should go sooner. Also go early if your periods are irregular or have stopped, you have endometriosis, or you already know of a possible fertility problem.",
        },
      ],
      notice: "This is general information. If you have a health condition or take regular medicines, talk to a doctor or nurse before you start trying.",
    },
  },
  {
    slug: "preconception-health",
    category: "fertility",
    reviewedAt: "2026-10-16",
    sources: [
      { label: "Office on Women's Health — Preconception health", href: "https://womenshealth.gov/pregnancy/you-get-pregnant/preconception-health" },
      { label: "CDC — About folic acid", href: "https://www.cdc.gov/folic-acid/about/index.html" },
      { label: "NHS — Trying to get pregnant", href: "https://www.nhs.uk/pregnancy/trying-for-a-baby/trying-to-get-pregnant/" },
      { label: "NHS — Vitamins and supplements in pregnancy", href: "https://www.nhs.uk/pregnancy/keeping-well/pregnancy-vitamins-and-supplements/" },
    ],
    related: ["trying-to-conceive", "healthy-eating", "alcohol-smoking"],
    es: {
      title: "Cuidar tu salud antes del embarazo",
      summary: "Algunos pasos antes de quedarte embarazada, como tomar ácido fólico y revisar tus medicamentos y vacunas, pueden ayudarte a ti y a un futuro bebé.",
      sections: [
        {
          heading: "Por qué importan los meses previos",
          body: "Tu salud antes del embarazo influye en cómo va el embarazo. El cerebro y la columna vertebral del bebé empiezan a formarse en las primeras semanas, muchas veces antes de que sepas que estás embarazada. Alrededor de la mitad de los embarazos no son planeados, así que estos pasos son útiles para cualquier persona que pueda quedarse embarazada. La Oficina para la Salud de la Mujer de EE. UU. sugiere empezar a prepararse al menos 3 meses antes del embarazo.",
        },
        {
          heading: "Ácido fólico",
          body: "El ácido fólico es una forma de la vitamina llamada folato. Ayuda a prevenir defectos congénitos graves del cerebro y la columna vertebral (defectos del tubo neural), como la espina bífida. Los Centros para el Control y la Prevención de Enfermedades de EE. UU. (CDC) recomiendan que todas las personas que puedan quedarse embarazadas tomen 400 microgramos de ácido fólico al día, y que empiecen al menos 1 mes antes de buscar el embarazo. Sigue tomándolo hasta las 12 semanas de embarazo. Viene en suplementos y en algunos alimentos enriquecidos, como los cereales de desayuno. Pregunta a un médico antes de empezar si tienes diabetes o una enfermedad de la sangre como la anemia falciforme o la talasemia, si tomas medicamentos para la epilepsia o el VIH, o si tú, el padre biológico del bebé, un embarazo anterior o cualquiera de las dos familias se han visto afectados por un defecto del tubo neural. Puede que necesites una dosis más alta.",
        },
        {
          heading: "Una revisión antes de empezar",
          body: "Una visita a un médico o una enfermera antes de buscar el embarazo es una buena ocasión para revisar tu salud. Cuéntales todos los medicamentos que tomas, incluidos los que compras por tu cuenta, los remedios de hierbas y los suplementos. No dejes por tu cuenta un medicamento recetado. Comprueba que tienes las vacunas al día. Si tienes una enfermedad de larga duración como asma, diabetes o epilepsia, pregunta cuál es la mejor forma de controlarla antes del embarazo y durante él.",
        },
        {
          heading: "Hábitos del día a día",
          body: "Deja de fumar y de beber alcohol antes de buscar el embarazo. Un peso demasiado bajo o demasiado alto puede hacer más difícil quedarse embarazada, así que pide apoyo si lo necesitas. Evita los productos químicos dañinos en el trabajo y en casa, y mantente lejos de los excrementos de gato y de roedores, que pueden transmitir infecciones. Tu pareja puede cuidar su propia salud bebiendo menos, dejando de fumar, comiendo bien y reduciendo el estrés.",
        },
      ],
      notice: "Esta es información general. Si tienes algún problema de salud o tomas medicamentos de forma habitual, habla con un médico o una enfermera antes de buscar el embarazo.",
    },
    en: {
      title: "Getting healthy before pregnancy",
      summary: "A few steps before you conceive, such as taking folic acid and reviewing your medicines and vaccines, can help both you and a future baby.",
      sections: [
        {
          heading: "Why the months before matter",
          body: "Your health before pregnancy affects how the pregnancy goes. A baby's brain and spine start to form in the first few weeks, often before you know you are pregnant. About half of all pregnancies are not planned, so these steps are useful for anyone who could get pregnant. The US Office on Women's Health suggests starting to prepare at least 3 months before you get pregnant.",
        },
        {
          heading: "Folic acid",
          body: "Folic acid is a form of the vitamin folate. It helps prevent serious birth defects of the brain and spine (neural tube defects), such as spina bifida. The US Centers for Disease Control and Prevention (CDC) advises everyone who could become pregnant to get 400 micrograms of folic acid every day, and to start at least 1 month before trying. Keep taking it until you are 12 weeks pregnant. It comes in supplements and in some fortified foods, such as breakfast cereals. Ask a doctor before you start if you have diabetes or a blood condition such as sickle cell anaemia or thalassaemia, take medicine for epilepsy or HIV, or if you, the baby's biological father, a past pregnancy or either family has been affected by a neural tube defect. You may need a higher dose.",
        },
        {
          heading: "A check-up before you try",
          body: "A visit to a doctor or nurse before you try is a good chance to review your health. Tell them about every medicine you take, including medicines you buy yourself, herbal remedies and supplements. Do not stop a prescribed medicine on your own. Check that your vaccinations are up to date. If you have a long-term condition such as asthma, diabetes or epilepsy, ask how best to manage it before and during pregnancy.",
        },
        {
          heading: "Everyday habits",
          body: "Stop smoking and drinking alcohol before you try to get pregnant. A weight that is too low or too high can make it harder to get pregnant, so ask for support if you need it. Avoid harmful chemicals at work and at home, and stay away from cat and rodent droppings, which can spread infection. Partners can help their own health by drinking less, stopping smoking, eating well and reducing stress.",
        },
      ],
      notice: "This is general information. If you have a health condition or take regular medicines, talk to a doctor or nurse before you try to get pregnant.",
    },
  },
  {
    slug: "age-and-fertility",
    category: "fertility",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "CDC — Infertility FAQs", href: "https://www.cdc.gov/reproductive-health/infertility-faq/index.html" },
      { label: "Mayo Clinic — Pregnancy after 35", href: "https://www.mayoclinic.org/healthy-lifestyle/getting-pregnant/in-depth/pregnancy/art-20045756" },
      { label: "NHS — Infertility", href: "https://www.nhs.uk/conditions/infertility/" },
      { label: "CDC — About folic acid", href: "https://www.cdc.gov/folic-acid/about/index.html" },
    ],
    related: ["infertility", "trying-to-conceive", "healthy-pregnancy"],
    es: {
      title: "La edad y la fertilidad",
      summary: "La fertilidad baja con la edad, a partir de los 30 años aproximadamente, y más deprisa desde mediados de los 30. La mayoría de las parejas en las que la mujer tiene menos de 40 años siguen consiguiendo un embarazo en un año.",
      sections: [
        {
          heading: "Por qué cambia la fertilidad con la edad",
          body: "Naces con una reserva limitada de óvulos. Con los años, bajan tanto el número de óvulos como su calidad. La menor calidad de los óvulos es la razón principal de que la fertilidad baje con la edad. El cambio se nota más entre mediados y finales de los 30 años. Por eso, conseguir un embarazo puede llevar más tiempo a medida que te haces mayor.",
        },
        {
          heading: "Qué dicen las cifras",
          body: "Los Centros para el Control y la Prevención de Enfermedades de EE. UU. (CDC) dicen que la probabilidad de que una mujer tenga un bebé baja rápido cada año a partir de los 30 años, más o menos. Aun así, más de 8 de cada 10 parejas en las que la mujer tiene menos de 40 años consiguen un embarazo en un año de relaciones sexuales regulares sin anticonceptivos. La edad también aumenta la probabilidad de aborto espontáneo (pérdida del embarazo) y de que el bebé tenga una enfermedad genética. La edad del hombre también importa: las parejas en las que el hombre tiene 40 años o más tienen más probabilidades de tener dificultades para conseguir un embarazo.",
        },
        {
          heading: "El embarazo después de los 35",
          body: "Muchas personas tienen embarazos y bebés sanos después de los 35. Es más probable tener gemelos, y algunos riesgos son mayores, como la diabetes que empieza en el embarazo (diabetes gestacional), la presión arterial alta, que el bebé nazca antes de tiempo o con poco peso, y necesitar una cesárea. El riesgo de aborto espontáneo, de muerte fetal y de alteraciones cromosómicas también aumenta con la edad. Las revisiones periódicas durante el embarazo ayudan.",
        },
        {
          heading: "Prepararte",
          body: "Si esperas quedarte embarazada más adelante en la vida, los mismos pasos ayudan a cualquier edad. Toma ácido fólico, deja de fumar y de beber alcohol, y pide a un médico o una enfermera que revise tus problemas de salud y tus medicamentos antes de empezar a buscar el embarazo. Cuando ya estés embarazada, ir a todas tus revisiones permite que un médico o una matrona (partera) detecten problemas a tiempo.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Si tienes menos de 35 años, consulta con un médico o una enfermera tras un año intentándolo. A partir de los 35, las guías de Estados Unidos recomiendan ir tras 6 meses intentándolo, y las del Reino Unido dicen que las mujeres de 36 años o más no deberían esperar un año entero. Si tienes más de 40, plantéate pedir pruebas enseguida. A cualquier edad, ve pronto si tus periodos son irregulares o se han detenido, o si sabes de un posible problema de fertilidad.",
        },
      ],
      notice: "Esta es información general. La fertilidad de cada persona es distinta. Si te preocupa cómo afecta tu edad a tu fertilidad, habla con un médico o una enfermera.",
    },
    en: {
      title: "Age and fertility",
      summary: "Fertility falls with age, from around 30 and more steeply from the mid-30s. Most couples where the woman is under 40 still conceive within a year.",
      sections: [
        {
          heading: "Why fertility changes with age",
          body: "You are born with a limited supply of eggs. Over the years both the number of eggs and their quality go down. Lower egg quality is the main reason fertility falls with age. The change becomes more noticeable in the mid- to late 30s. Because of this, getting pregnant can take longer as you get older.",
        },
        {
          heading: "What the numbers say",
          body: "The US Centers for Disease Control and Prevention (CDC) says a woman's chance of having a baby falls quickly each year after about age 30. Even so, more than 8 in 10 couples where the woman is under 40 get pregnant within a year of regular sex without contraception. Age also raises the chance of miscarriage and of a baby having a genetic condition. A man's age matters too: couples where the man is 40 or older are more likely to have trouble conceiving.",
        },
        {
          heading: "Pregnancy after 35",
          body: "Many people have healthy pregnancies and babies after 35. Twins become more likely, and some risks are higher, including diabetes that starts in pregnancy (gestational diabetes), high blood pressure, a baby born early or small, and needing a caesarean birth. The risk of miscarriage, stillbirth and chromosome conditions also rises with age. Regular check-ups during pregnancy help.",
        },
        {
          heading: "Getting ready",
          body: "If you hope to get pregnant later in life, the same steps help at any age. Take folic acid, stop smoking and alcohol, and ask a doctor or nurse to review any health conditions and medicines before you try. Once you are pregnant, going to all your check-ups lets a doctor or midwife spot problems early.",
        },
        {
          heading: "When to get help",
          body: "If you are under 35, see a doctor or nurse after a year of trying. From 35, US guidance advises going after 6 months of trying, and UK guidance says women aged 36 and over should not wait a full year. If you are over 40, consider asking for tests straight away. At any age, go early if your periods are irregular or have stopped, or you know of a possible fertility problem.",
        },
      ],
      notice: "This is general information. Everyone's fertility is different. If you are worried about your age and fertility, talk to a doctor or nurse.",
    },
  },
  {
    slug: "infertility",
    category: "fertility",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "WHO — Infertility", href: "https://www.who.int/news-room/fact-sheets/detail/infertility" },
      { label: "NHS — Infertility", href: "https://www.nhs.uk/conditions/infertility/" },
      { label: "CDC — Infertility FAQs", href: "https://www.cdc.gov/reproductive-health/infertility-faq/index.html" },
    ],
    related: ["trying-to-conceive", "age-and-fertility", "pcos"],
    es: {
      title: "Infertilidad y cuándo pedir ayuda",
      summary: "La infertilidad es no conseguir un embarazo tras un año de relaciones sexuales regulares sin anticonceptivos. Es frecuente, afecta a hombres y mujeres, y hay ayuda disponible.",
      sections: [
        {
          heading: "Qué significa infertilidad",
          body: "Los médicos hablan de infertilidad cuando no se produce un embarazo tras 12 meses o más de relaciones sexuales regulares sin anticonceptivos. Es frecuente. En todo el mundo, alrededor de 1 de cada 6 personas en edad reproductiva se ven afectadas, según la Organización Mundial de la Salud (OMS). Se llama infertilidad primaria si nunca has estado embarazada, e infertilidad secundaria si ya has estado embarazada antes.",
        },
        {
          heading: "Causas frecuentes",
          body: "Las causas pueden venir de cualquiera de los dos miembros de la pareja, de ambos, o quedar sin explicación. En las mujeres, entre las causas frecuentes están no ovular con regularidad, problemas de los ovarios como el SOP (síndrome de ovario poliquístico, que ahora también se llama PMOS), trompas de Falopio bloqueadas o dañadas y la endometriosis. A veces los miomas pueden influir. En los hombres, los problemas incluyen tener pocos espermatozoides, o espermatozoides con una forma poco habitual o que no se mueven bien. En alrededor de una cuarta parte de los casos no se encuentra la causa.",
        },
        {
          heading: "Lo que puede influir en la fertilidad",
          body: "La fertilidad disminuye con la edad. Fumar, beber mucho alcohol, tener sobrepeso o bajo peso, y mucho estrés físico o emocional también pueden influir. Algunas infecciones de transmisión sexual (ITS) también pueden afectar la fertilidad. Algunos de estos factores se pueden cambiar, y un médico o una enfermera pueden ayudarte con apoyo para dejar de fumar o alcanzar un peso saludable.",
        },
        {
          heading: "Cuándo ir al médico",
          body: "Si tienes menos de 35 años, consulta con un médico o una enfermera tras un año intentándolo. A partir de los 35, las guías de Estados Unidos recomiendan ir tras 6 meses intentándolo, y las del Reino Unido dicen que las mujeres de 36 años o más deberían ir antes de que pase un año. Con más de 40, vale la pena pedir pruebas enseguida. A cualquier edad, ve pronto si tus periodos son irregulares o se han detenido, si tienes endometriosis o si sabes de un posible problema. Tu historial de ciclos en Ciclo puede ayudar a mostrarle al médico tu patrón.",
        },
        {
          heading: "Pruebas y tratamiento",
          body: "Un médico puede pedir pruebas para buscar una causa, a los dos miembros de la pareja si hace falta. El tratamiento depende de la causa. Puede incluir medicamentos para ayudarte a ovular, cirugía o reproducción asistida, como colocar los espermatozoides directamente en el útero (inseminación intrauterina, IIU) o la fecundación in vitro (FIV, en la que los óvulos se fecundan en un laboratorio y luego se colocan en el útero). El acceso y lo que cuesta varían mucho de un país a otro. La infertilidad puede causar mucho estrés, ansiedad y ánimo bajo, así que pregunta también por apoyo emocional.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si te preocupa tu fertilidad, habla con un médico o una enfermera.",
    },
    en: {
      title: "Infertility and when to get help",
      summary: "Infertility means not getting pregnant after a year of regular sex without contraception. It is common, affects men and women, and help is available.",
      sections: [
        {
          heading: "What infertility means",
          body: "Doctors call it infertility when a pregnancy does not happen after 12 months or more of regular sex without contraception. It is common. Worldwide, about 1 in 6 people of reproductive age are affected, according to the World Health Organization (WHO). It is called primary infertility if you have never been pregnant, and secondary infertility if you have been pregnant before.",
        },
        {
          heading: "Common causes",
          body: "Causes can come from either partner, from both, or remain unexplained. In women, common causes include not ovulating regularly, conditions of the ovaries such as PCOS (polycystic ovary syndrome, now also called PMOS), blocked or damaged fallopian tubes and endometriosis. Fibroids can sometimes play a part. In men, problems include low numbers of sperm, or sperm that are an unusual shape or do not move well. In about a quarter of cases, no cause is found.",
        },
        {
          heading: "Things that can affect fertility",
          body: "Fertility declines with age. Smoking, drinking a lot of alcohol, being overweight or underweight, and a lot of physical or emotional stress can also play a part. Some sexually transmitted infections (STIs) can affect fertility, too. Some of these factors can be changed, and a doctor or nurse can help with support to stop smoking or reach a healthy weight.",
        },
        {
          heading: "When to see a doctor",
          body: "If you are under 35, see a doctor or nurse after a year of trying. From 35, US guidance advises going after 6 months of trying, and UK guidance says women aged 36 and over should go sooner than a year. Over 40, it is worth asking for tests straight away. At any age, go early if your periods are irregular or have stopped, you have endometriosis, or you know of a possible problem. Your cycle history from Ciclo can help show the doctor your pattern.",
        },
        {
          heading: "Tests and treatment",
          body: "A doctor can arrange tests to look for a cause, in both partners where needed. Treatment depends on the cause. It may include medicines to help you ovulate, surgery, or assisted conception such as putting sperm directly into the womb (IUI, intrauterine insemination) or IVF (in vitro fertilisation, where eggs are fertilised in a lab and then put into the womb). Access and cost vary a lot between countries. Infertility can bring real stress, anxiety and low mood, so ask about emotional support as well.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you are worried about your fertility, talk to a doctor or nurse.",
    },
  },
  {
    slug: "ovulation-tests",
    category: "fertility",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "MedlinePlus — Ovulation home test", href: "https://medlineplus.gov/ency/article/007062.htm" },
      { label: "Office on Women's Health — Trying to conceive", href: "https://www.womenshealth.gov/pregnancy/you-get-pregnant/trying-conceive" },
      { label: "CDC — Infertility FAQs", href: "https://www.cdc.gov/reproductive-health/infertility-faq/index.html" },
    ],
    related: ["ovulation", "fertile-window", "fertility-awareness"],
    es: {
      title: "Pruebas de ovulación y registro de la temperatura",
      summary: "Las pruebas de ovulación y los gráficos de temperatura pueden ayudarte a encontrar tus días más fértiles cuando buscas un bebé. Aquí verás cómo funcionan y lo que no pueden decirte.",
      sections: [
        {
          heading: "Cómo funcionan las pruebas de ovulación",
          body: "Las pruebas de ovulación buscan en la orina la hormona luteinizante (LH). Una subida repentina de LH, llamada pico de LH, provoca la ovulación. Empieza unas 36 horas antes de que se libere un óvulo. Un resultado positivo significa que probablemente ovularás en las siguientes 24 a 36 horas. Eres más fértil en los 2 a 3 días antes de la ovulación y hasta más o menos un día después. Es un buen momento para tener relaciones sexuales si buscas un bebé.",
        },
        {
          heading: "Cuándo empezar a hacer las pruebas",
          body: "Empieza a hacer las pruebas unos 3 a 5 días antes de cuando esperas ovular. La ovulación suele ocurrir 10 a 16 días antes del siguiente periodo, así que la duración habitual de tu ciclo te ayuda a elegir cuándo empezar. Puedes orinar directamente sobre la tira de la prueba o mojarla en orina recogida en un recipiente limpio. No bebas mucho líquido antes de hacer la prueba, y sigue las instrucciones que vienen con ella.",
        },
        {
          heading: "Lo que las pruebas de ovulación no pueden decirte",
          body: "Un resultado positivo muestra la subida de una hormona. No demuestra que se haya liberado un óvulo. Si te saltas un día de pruebas, puede que no detectes el pico. Puede que las pruebas tampoco detecten el pico si tus ciclos son irregulares. Algunos medicamentos hormonales y algunos medicamentos para la fertilidad pueden cambiar los niveles de LH y el resultado. Puede haber falsos positivos, pero son poco frecuentes.",
        },
        {
          heading: "Registrar tu temperatura",
          body: "La temperatura del cuerpo en reposo (temperatura corporal basal) sube un poco justo después de la ovulación, normalmente solo unos 0.2 a 0.4°C (0.4 a 0.8°F). La subida indica que probablemente ya has ovulado, pero no cuándo exactamente. Como tus días más fértiles llegan antes de que la temperatura alcance su punto más alto, un gráfico es más útil para conocer tu patrón habitual a lo largo de varios ciclos.",
        },
        {
          heading: "Registro y cuándo pedir ayuda",
          body: "Ciclo te permite registrar los resultados de las pruebas de ovulación y el moco cervical junto a tus periodos, pero no registra la temperatura y no puede confirmar que hayas ovulado. Si llevas un año buscando un embarazo sin conseguirlo, consulta con un médico o una enfermera. Ve a los 6 meses si tienes 35 años o más, y antes si tus periodos son irregulares o se han detenido.",
        },
      ],
      notice: "Esta es información general. Las pruebas de ovulación y los gráficos de temperatura no son métodos anticonceptivos. Si te está costando conseguir un embarazo, habla con un médico o una enfermera.",
    },
    en: {
      title: "Ovulation tests and temperature tracking",
      summary: "Ovulation tests and temperature charts can help you find your most fertile days when trying for a baby. Here is how they work and what they cannot tell you.",
      sections: [
        {
          heading: "How ovulation tests work",
          body: "Ovulation tests check your pee for luteinising hormone (LH). A sudden rise in LH, called the LH surge, triggers ovulation. It starts about 36 hours before an egg is released. A positive test means you will probably ovulate in the next 24 to 36 hours. You are most fertile in the 2 to 3 days before ovulation and for up to about a day after it. This is a good time to have sex if you are trying for a baby.",
        },
        {
          heading: "When to start testing",
          body: "Start testing about 3 to 5 days before you expect to ovulate. Ovulation usually happens 10 to 16 days before your next period, so your usual cycle length helps you choose when to begin. You can pee on the test stick or dip it in pee collected in a clean container. Do not drink a lot of fluid before testing, and follow the instructions that come with your test.",
        },
        {
          heading: "What ovulation tests cannot tell you",
          body: "A positive test shows a rise in a hormone. It does not prove that an egg was released. If you skip a day of testing, you may miss the surge. Tests may also not pick up a surge if your cycles are irregular. Some hormone medicines and fertility medicines can change LH levels and the result. False positive results can happen, but they are rare.",
        },
        {
          heading: "Tracking your temperature",
          body: "Your body temperature at rest (basal body temperature) rises slightly just after ovulation, usually by only about 0.2 to 0.4°C (0.4 to 0.8°F). The rise shows that ovulation has probably happened, but not exactly when. Because your most fertile days come before your temperature reaches its highest point, a chart is most useful for learning your usual pattern over several cycles.",
        },
        {
          heading: "Logging and when to get help",
          body: "Ciclo lets you log ovulation test results and cervical mucus next to your periods, but it does not log temperature and cannot confirm that you have ovulated. If you have been trying for a year without getting pregnant, see a doctor or nurse. Go after 6 months if you are 35 or older, and sooner if your periods are irregular or have stopped.",
        },
      ],
      notice: "This is general information. Ovulation tests and temperature charts are not contraception. If you are having trouble getting pregnant, talk to a doctor or nurse.",
    },
  },
];
