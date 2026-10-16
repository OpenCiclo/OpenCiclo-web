// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const CARE_ARTICLES: LearnArticle[] = [
  {
    slug: "when-to-see-a-doctor",
    category: "care",
    reviewedAt: "2026-10-16",
    sources: [
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NHS — Period problems", href: "https://www.nhs.uk/conditions/periods/period-problems/" },
      { label: "NHS — Iron deficiency anaemia", href: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/" },
      { label: "NHS — Pelvic pain", href: "https://www.nhs.uk/symptoms/pelvic-pain/" },
      { label: "NHS — Toxic shock syndrome", href: "https://www.nhs.uk/conditions/toxic-shock-syndrome/" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
    ],
    related: ["heavy-periods", "tracking-for-doctor", "toxic-shock-syndrome"],
    es: {
      title: "Cuándo ir al médico por tu periodo",
      summary: "Algunos cambios en el periodo merecen una revisión de rutina, y unos pocos necesitan atención urgente. Aquí verás cómo distinguirlos y qué llevar a tu consulta.",
      sections: [
        {
          heading: "Conocer lo que es normal para ti",
          body: "Los periodos varían, así que la mejor guía es lo que es normal para ti. La mayoría de los ciclos en personas adultas duran entre unos 24 y 38 días, y un periodo suele durar de 2 a 7 días. Los periodos suelen llegar con regularidad. Se detienen durante el embarazo y después de la menopausia, y a menudo durante la lactancia. Los periodos irregulares son frecuentes en los primeros años después de que empiezan los periodos y en los años previos a la menopausia. Un cambio claro respecto a tu patrón habitual es un buen motivo para hacerte una revisión.",
        },
        {
          heading: "Pide una cita de rutina",
          body: "Acude a un médico o una enfermera si tus periodos se vuelven irregulares después de haber sido regulares. Pide cita también si tus ciclos suelen ser más cortos de 24 días o más largos de 38 días. Ve si llevas 3 meses sin periodo y no estás embarazada ni dando el pecho. Ve también si los periodos no han empezado a los 15 años, o en los 3 años siguientes a que empezaran a crecer los pechos, o si empezaron antes de los 8 años. El dolor es otro motivo, si los analgésicos como el ibuprofeno no ayudan o si te impide trabajar o estudiar. También lo son los síntomas premenstruales o las migrañas que afectan a tu vida diaria.",
        },
        {
          heading: "Sangrado abundante o inusual",
          body: "Hazte una revisión si tus periodos son abundantes. Algunas señales son cambiar la toalla higiénica o el tampón cada 1 o 2 horas, o necesitar dos productos a la vez. Sangrar durante más de 7 días, expulsar coágulos de más de unos 2.5 cm o que el sangrado traspase a la ropa o a la cama también son señales. El sangrado entre periodos, después de las relaciones sexuales o después de la menopausia siempre debe revisarlo un médico. Sentir mucho cansancio o falta de aire con periodos abundantes puede ser una señal de falta de hierro (anemia).",
        },
        {
          heading: "Pide ayuda el mismo día",
          body: "Si un sangrado abundante te provoca mareo, aturdimiento o debilidad, ponte en contacto con un médico o una enfermera ese mismo día. Haz lo mismo si tienes dolor pélvico con fiebre, flujo vaginal inusual, vómitos o dolor al orinar. Si podrías estar embarazada, aunque no tengas una prueba positiva, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del abdomen, en un lado, o cualquier sangrado. Busca atención de urgencia si tienes un dolor de abdomen repentino e intenso, dolor en la punta del hombro, un sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo que crece fuera del útero (embarazo ectópico).",
        },
        {
          heading: "Busca atención de urgencia",
          body: "Llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias si tienes un sangrado abundante y te desmayas o sientes que te vas a desmayar, o si tienes dolor en el pecho o dificultad para respirar. Haz lo mismo si tienes un dolor repentino e intenso en el abdomen o la pelvis. El síndrome de shock tóxico (SST) es una enfermedad poco frecuente pero grave relacionada con los tampones y las copas menstruales. Si de repente tienes fiebre alta, vómitos o una erupción en la piel, o sientes mareo o que te vas a desmayar, mientras usas un tampón, una copa o un disco menstrual, retíralo y busca atención médica enseguida. Si te encuentras muy mal o con confusión, o tienes dificultad para respirar, llama al número de emergencias de tu país.",
        },
        {
          heading: "Aprovecha al máximo tu consulta",
          body: "Antes de la cita, apunta cuándo empezó y terminó cada periodo, lo abundante que fue el sangrado, cada cuánto cambiabas de producto, y cualquier dolor u otro síntoma. Un diario o calendario de tus periodos y síntomas ayuda al médico o a la enfermera a encontrar la causa de un problema. Ciclo guarda las fechas de tus periodos y los síntomas que registras en un solo lugar, para que puedas revisarlos antes de la consulta. También ayuda llevar una lista de los medicamentos que tomas y de las preguntas que quieres hacer.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si te preocupan tus periodos, habla con un médico o una enfermera.",
    },
    en: {
      title: "When to see a doctor about your period",
      summary: "Some period changes are worth a routine check-up, and a few need urgent care. Here is how to tell the difference, and what to bring to your appointment.",
      sections: [
        {
          heading: "Knowing your normal",
          body: "Periods vary, so the most useful guide is what is normal for you. Most adult cycles last somewhere between about 24 and 38 days, and a period usually lasts 2 to 7 days. Periods usually come regularly. They stop during pregnancy and after menopause, and often while breastfeeding. Irregular periods are common in the first few years after periods start and in the years before menopause. A clear change from your usual pattern is a good reason to get checked.",
        },
        {
          heading: "Book a routine appointment",
          body: "See a doctor or nurse if your periods become irregular after being regular. Also book if your cycles are regularly shorter than 24 days or longer than 38 days. Go if you have had no period for 3 months and are not pregnant or breastfeeding. Also go if periods have not started by age 15, or within 3 years of breasts starting to grow, or if they started before age 8. Pain is another reason, if painkillers such as ibuprofen do not help or it stops you working or studying. So are premenstrual symptoms or migraines that affect your daily life.",
        },
        {
          heading: "Heavy or unusual bleeding",
          body: "Get checked if your periods are heavy. Signs include changing a pad or tampon every 1 to 2 hours, or needing two products at once. Bleeding for more than 7 days, passing clots larger than about 2.5 cm, or bleeding through to your clothes or bedding are also signs. Bleeding between periods, after sex or after menopause should always be checked by a doctor. Feeling very tired or short of breath with heavy periods can be a sign of low iron (anaemia).",
        },
        {
          heading: "Get help the same day",
          body: "If heavy bleeding makes you feel dizzy, light-headed or weak, contact a doctor or nurse the same day. Do the same if you have pelvic pain with a high temperature, unusual discharge, vomiting, or pain when peeing. If you might be pregnant, even without a positive test, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of a pregnancy growing outside the womb (ectopic pregnancy).",
        },
        {
          heading: "Get emergency help",
          body: "Call your local emergency number or go to an emergency department if you are bleeding heavily and you faint or feel about to faint, or you have chest pain or trouble breathing. Do the same for sudden, severe pain in your tummy or pelvis. Toxic shock syndrome (TSS) is a rare but serious illness linked to tampons and cups. If you suddenly get a high fever, vomiting or a rash, or feel dizzy or faint, while using a tampon, cup or disc, take it out and get medical help straight away. If you feel very unwell or confused, or have trouble breathing, call your local emergency number.",
        },
        {
          heading: "Getting the most from your visit",
          body: "Before your appointment, note when each period started and ended, how heavy the bleeding was, how often you changed products, and any pain or other symptoms. A diary or calendar of your periods and symptoms helps a doctor or nurse find the cause of a problem. Ciclo keeps your period dates and logged symptoms in one place, so you can look back before the visit. It also helps to bring a list of any medicines you take and the questions you want to ask.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you are worried about your periods, talk to a doctor or nurse.",
    },
  },
  {
    slug: "cervical-screening",
    category: "care",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Cervical screening", href: "https://www.nhs.uk/tests-and-treatments/cervical-screening/" },
      { label: "MedlinePlus — Pap smear", href: "https://medlineplus.gov/lab-tests/pap-smear/" },
      { label: "WHO — Cervical cancer", href: "https://www.who.int/news-room/fact-sheets/detail/cervical-cancer" },
      { label: "Planned Parenthood — What is a pelvic exam?", href: "https://www.plannedparenthood.org/learn/health-and-wellness/wellness-visit/what-pelvic-exam" },
    ],
    related: ["hpv", "gynecology-visit", "gynecologic-cancers"],
    es: {
      title: "Citología (prueba de Papanicolaou)",
      summary: "La citología es una prueba rápida que ayuda a prevenir el cáncer de cuello uterino al detectar a tiempo cambios en las células. A quién se le ofrece, y cada cuánto, depende de dónde vivas.",
      sections: [
        {
          heading: "Qué es la citología",
          body: "La citología, también llamada prueba de Papanicolaou o cribado de cáncer de cuello uterino, revisa la salud del cuello del útero (cérvix). Busca cambios en las células del cuello del útero antes de que se conviertan en cáncer, para poder tratarlos a tiempo. Según la prueba, en la muestra se busca el virus del papiloma humano (VPH), células anormales o ambas cosas. El cribado es para personas sin síntomas, y detectar y tratar los cambios a tiempo ayuda a prevenir el cáncer de cuello uterino. Sigue haciéndote las pruebas de cribado aunque te hayas vacunado contra el VPH.",
        },
        {
          heading: "A quién se le ofrece y cada cuánto",
          body: "Las edades y la frecuencia cambian según el país, así que sigue las indicaciones del lugar donde vives. La Organización Mundial de la Salud (OMS) recomienda una prueba de alto rendimiento, como la prueba del VPH, cada 5 a 10 años a partir de los 30 años, o cada 3 a 5 años a partir de los 25 años para las mujeres que viven con el VIH. Por ejemplo, en Inglaterra el NHS (el sistema público de salud) invita a las mujeres y a las personas con cuello uterino de 25 a 64 años cada 5 años. En Estados Unidos, el cribado suele empezar a los 21 o a los 25 años y se repite cada 3 o 5 años hasta los 65, según la prueba. Si tienes más de 65 años, o te han extirpado el útero y el cuello uterino, pregunta si todavía necesitas el cribado.",
        },
        {
          heading: "Cómo es la prueba",
          body: "Un médico o una enfermera hace la prueba, y solo dura unos minutos. Te desvistes de la cintura para abajo y te acuestas boca arriba con las rodillas dobladas. Se introduce con suavidad en la vagina un instrumento liso llamado espéculo para poder ver el cuello del útero. Después, con un cepillo pequeño y suave se recogen algunas células, que se envían a un laboratorio. Puedes notar presión o un cólico, pero normalmente no duele. Respirar despacio puede ayudarte a relajarte, y si algo te duele, dilo. En algunos lugares puedes tomar la muestra por tu cuenta para una prueba del VPH, y funciona igual de bien que una muestra tomada por un médico o una enfermera.",
        },
        {
          heading: "Antes y después",
          body: "Intenta pedir la cita para un momento en que no vayas a tener el periodo, porque el sangrado puede afectar al resultado. Unos 5 días después de que termine el periodo es un buen momento. Durante los 2 días antes de la prueba, evita el sexo vaginal, los tampones y las cremas o medicamentos que se aplican dentro de la vagina. Algunas personas tienen un sangrado muy leve después. Los pronósticos de periodo de Ciclo pueden ayudarte a elegir una fecha, pero son estimaciones, así que revisa también tu diario.",
        },
        {
          heading: "Resultados y próximos pasos",
          body: "Si el resultado es normal, por lo general no necesitarás otra prueba hasta el intervalo habitual en tu país. Si se encuentran cambios, normalmente no significa que haya cáncer. Puede que te pidan repetir la prueba, o que te examinen el cuello del útero más de cerca con un instrumento de aumento (colposcopia). Los resultados poco claros también pueden estar relacionados con el embarazo, la menopausia o una infección. El cribado no es una prueba para síntomas: si tienes sangrado entre periodos, después de las relaciones sexuales o después de la menopausia, acude a un médico sin esperar a tu próxima prueba.",
        },
      ],
      notice: "Esta es información general. Las edades y la frecuencia del cribado varían según el país, así que consulta qué se ofrece donde vives.",
    },
    en: {
      title: "Cervical screening (smear or Pap test)",
      summary: "Cervical screening is a quick test that helps prevent cervical cancer by finding cell changes early. Who is invited, and how often, depends on where you live.",
      sections: [
        {
          heading: "What cervical screening is",
          body: "Cervical screening, also called a smear test or Pap test, checks the health of the neck of the womb (cervix). It looks for changes in cervical cells before they turn into cancer, so they can be treated early. Depending on the test, the sample is checked for human papillomavirus (HPV), for abnormal cells, or for both. Screening is for people who have no symptoms, and finding and treating changes early helps prevent cervical cancer. Keep going to screening even if you have had the HPV vaccine.",
        },
        {
          heading: "Who is invited and how often",
          body: "Ages and intervals differ between countries, so follow the advice where you live. The World Health Organization (WHO) recommends a high-performance test, such as an HPV test, every 5 to 10 years from age 30, or every 3 to 5 years from age 25 for women living with HIV. For example, in England the NHS invites women and people with a cervix aged 25 to 64 every 5 years. In the United States, screening usually starts at 21 or 25 and is repeated every 3 or 5 years until 65, depending on the test. If you are over 65, or have had your womb and cervix removed, ask whether you still need screening.",
        },
        {
          heading: "What happens at the test",
          body: "A doctor or nurse does the test, and it takes only a few minutes. You undress from the waist down and lie on your back with your knees bent. A smooth tool called a speculum is gently put into your vagina so the cervix can be seen. Then a small, soft brush collects some cells, which are sent to a lab. You may feel pressure or a cramp, but it does not usually hurt. Breathing slowly can help you relax, and if anything hurts, say so. In some places you can take the sample yourself for an HPV test, which works as well as a sample taken by a doctor or nurse.",
        },
        {
          heading: "Before and after",
          body: "Try to book for a time when you will not have your period, as bleeding can affect the result. About 5 days after a period ends is a good time. For 2 days before the test, avoid sex in the vagina, tampons, and creams or medicines put into the vagina. Some people have very light bleeding afterwards. Ciclo's period predictions can help you choose a date, but they are estimates, so check your log too.",
        },
        {
          heading: "Results and next steps",
          body: "If your result is normal, you will usually not need another test until the usual interval for your country. If changes are found, this usually does not mean cancer. You may be asked to have another test, or a closer look at the cervix with a magnifying instrument (colposcopy). Unclear results can also be linked to pregnancy, menopause or an infection. Screening is not a test for symptoms: if you have bleeding between periods, after sex or after menopause, see a doctor without waiting for your next test.",
        },
      ],
      notice: "This is general information. Screening ages and intervals vary by country, so check what is offered where you live.",
    },
  },
  {
    slug: "gynecology-visit",
    category: "care",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Planned Parenthood — What is a pelvic exam?", href: "https://www.plannedparenthood.org/learn/health-and-wellness/wellness-visit/what-pelvic-exam" },
      { label: "KidsHealth — Pelvic exams (for teens)", href: "https://kidshealth.org/en/teens/pelvic-exams.html" },
      { label: "MedlinePlus — Pap smear", href: "https://medlineplus.gov/lab-tests/pap-smear/" },
    ],
    related: ["cervical-screening", "tracking-for-doctor", "when-to-see-a-doctor"],
    es: {
      title: "Tu consulta de ginecología",
      summary: "Saber qué pasa en una consulta de ginecología puede hacerla más llevadera. Aquí verás qué esperar, cómo es una exploración pélvica y cómo prepararte.",
      sections: [
        {
          heading: "Por qué podrías ir",
          body: "Una consulta de ginecología es una revisión de tu salud reproductiva con un médico o una enfermera. Puedes ir para hacerte la citología o una revisión de rutina, o por un problema como sangrado abundante, falta de periodos, dolor o flujo vaginal inusual. No siempre hace falta una exploración interna. En la adolescencia no suele hacerse, salvo que haya un problema. En Estados Unidos, por ejemplo, normalmente no se necesita una exploración pélvica de rutina antes de los 21 años, salvo que haya un problema.",
        },
        {
          heading: "Hablar de tu salud",
          body: "La mayoría de las consultas empiezan con preguntas. Es probable que te pregunten por tus periodos, como cuándo empezó el último, cuánto duran y lo abundantes que son, y por el dolor u otros síntomas. También pueden preguntarte por el sexo, la anticoncepción, el embarazo, los medicamentos y tu salud en general. Responder con sinceridad te ayuda a recibir la atención adecuada. Llevar las fechas de tus periodos y tus notas de síntomas de Ciclo, y una lista escrita con tus preguntas, lo hace más fácil.",
        },
        {
          heading: "En qué consiste una exploración pélvica",
          body: "En una exploración pélvica, un médico o una enfermera revisa tu vulva y tus órganos reproductivos internos. Te dan privacidad para desvestirte, normalmente de la cintura para abajo, y una bata para taparte. Primero miran la vulva y la entrada de la vagina. Después introducen con suavidad un espéculo para ver la vagina y el cuello del útero, y pueden tomar una muestra para la citología. También pueden introducir 1 o 2 dedos con guante y lubricados en la vagina mientras presionan suavemente la parte baja del abdomen, para palpar el útero y los ovarios.",
        },
        {
          heading: "Qué se siente",
          body: "La exploración pélvica en sí suele durar unos 3 a 5 minutos. Algunas partes pueden resultar incómodas o causar presión, pero no debería doler. Si te duele, dilo enseguida. Respirar despacio y hondo puede ayudar a que tu cuerpo se relaje. Intenta aflojar el abdomen y los hombros. Puedes pedir al médico o a la enfermera que te vaya explicando cada paso.",
        },
        {
          heading: "Planificar tu visita",
          body: "Si puedes, pide la cita para un momento en que no vayas a tener el periodo, sobre todo si te vas a hacer la citología. Durante los 2 días antes de una citología, evita el sexo vaginal, los tampones y las cremas o medicamentos vaginales. Puedes preguntar si una amistad, un familiar o una persona acompañante del propio centro puede estar en la sala. Si la exploración te resulta difícil, por ejemplo por experiencias pasadas, puedes decírselo al centro con antelación y preguntar qué apoyo ofrecen.",
        },
      ],
      notice: "Esta es información general. Puedes hacer preguntas en cualquier momento de la consulta.",
    },
    en: {
      title: "Your gynaecology appointment",
      summary: "Knowing what happens at a gynaecology appointment can make it feel easier. Here is what to expect, how a pelvic exam works, and how to prepare.",
      sections: [
        {
          heading: "Why you might go",
          body: "A gynaecology appointment is a check of your reproductive health with a doctor or nurse. You might go for cervical screening or a routine check, or because of a problem such as heavy bleeding, missed periods, pain or unusual discharge. An internal exam is not always needed. Teens do not usually have one unless there is a problem. In the United States, for example, a routine pelvic exam is usually not needed before age 21 unless there is a problem.",
        },
        {
          heading: "Talking about your health",
          body: "Most appointments start with questions. Expect to be asked about your periods, such as when your last one started, how long periods last and how heavy they are, and about pain or other symptoms. You may also be asked about sex, contraception, pregnancy, medicines and your general health. Honest answers help you get the right care. Bringing your period dates and symptom notes from Ciclo, and a written list of your questions, makes this easier.",
        },
        {
          heading: "What a pelvic exam involves",
          body: "In a pelvic exam, a doctor or nurse checks your vulva and your internal reproductive organs. You are given privacy to undress, usually from the waist down, and a gown to cover yourself. First they look at the vulva and the opening of the vagina. Then they gently insert a speculum to see the vagina and cervix, and may take a sample for cervical screening. They may also put 1 or 2 gloved, lubricated fingers into your vagina while pressing gently on your lower tummy, to feel the womb and ovaries.",
        },
        {
          heading: "How it feels",
          body: "The pelvic exam itself usually takes about 3 to 5 minutes. Some parts may feel uncomfortable or cause pressure, but it should not be painful. If it hurts, say so straight away. Slow, deep breaths can help your body relax. Try to let your tummy and shoulders go loose. You can ask the doctor or nurse to explain each step as they go.",
        },
        {
          heading: "Planning your visit",
          body: "If you can, book for a time when you will not have your period, especially if you are having cervical screening. For 2 days before a screening test, avoid sex in the vagina, tampons, and vaginal creams or medicines. You can ask whether a friend, family member or chaperone can be in the room. If an exam is hard for you, for example because of past experiences, you can tell the clinic in advance and ask what support they offer.",
        },
      ],
      notice: "This is general information. You can ask questions at any point during your appointment.",
    },
  },
  {
    slug: "breast-awareness",
    category: "care",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — How should I check my breasts?", href: "https://www.nhs.uk/common-health-questions/womens-health/how-should-i-check-my-breasts/" },
      { label: "NHS — Symptoms of breast cancer in women", href: "https://www.nhs.uk/conditions/breast-cancer-in-women/symptoms-of-breast-cancer-in-women/" },
      { label: "NHS — Breast pain", href: "https://www.nhs.uk/conditions/breast-pain/" },
    ],
    related: ["breast-pain", "gynecology-visit"],
    es: {
      title: "Conocer tus pechos",
      summary: "Conocer tus pechos significa saber cómo se ven y se sienten normalmente, para notar a tiempo cualquier cambio. Muchos cambios tienen otras causas, pero cualquier cambio nuevo debe revisarse.",
      sections: [
        {
          heading: "Qué significa conocer tus pechos",
          body: "Conocer tus pechos significa familiarizarte con cómo se ven y se sienten normalmente tus pechos o tu tórax. Revisarlos con regularidad hace que sea más fácil notar cambios en su tamaño, su aspecto o su tacto. Lo más importante es saber qué es normal para ti, para que un cambio llame la atención. Intenta revisarlos más o menos una vez al mes.",
        },
        {
          heading: "Tu ciclo y tus pechos",
          body: "Los pechos pueden verse y sentirse distintos en diferentes momentos del ciclo menstrual. Muchas personas los notan más sensibles o hinchados en la semana o las dos semanas antes del periodo, y esto suele pasar cuando termina el periodo. Los pechos también cambian después de la menopausia. Por eso, puede ayudarte fijarte en qué momento del ciclo estás cada vez que te revisas, para comparar tus pechos en el mismo punto de cada ciclo. El diario de Ciclo puede ayudarte a verlo.",
        },
        {
          heading: "Cómo revisarte",
          body: "Ponte delante de un espejo y mira los dos pechos, primero con los brazos abajo y luego con los brazos levantados. Después, usa los dedos para palpar cada pecho o cada lado del tórax con pequeños círculos. Cubre toda la zona hasta la clavícula y hasta cada axila, incluido el pezón. Presiona primero con suavidad y luego con más firmeza, pero nunca tanto que te duela. A algunas personas les resulta más fácil hacerlo acostadas o en la ducha.",
        },
        {
          heading: "Cambios a los que prestar atención",
          body: "Fíjate si hay un bulto o una hinchazón en el pecho, el tórax o la axila, o un cambio en el tamaño o la forma de uno o de los dos pechos. La piel puede tener hoyuelos, como la piel de naranja. También puede cambiar de color, por ejemplo verse más oscura de lo habitual en la piel negra o morena, o roja en la piel blanca. Fíjate también en si un pezón se hunde hacia dentro o tiene una erupción, o si sale líquido del pezón cuando no estás embarazada ni dando el pecho, que puede contener sangre.",
        },
        {
          heading: "Si notas un cambio",
          body: "Acude a un médico o una enfermera si notas alguno de estos cambios, y no esperes a ver si desaparecen. Muchos cambios en los pechos, incluidos los bultos, son frecuentes y pueden deberse a otras afecciones, pero solo una revisión puede confirmarlo. Es poco probable que el dolor en los pechos, por sí solo, sea una señal de cáncer. También puedes preguntar a un médico o una enfermera si donde vives se ofrece el cribado de cáncer de mama (una mamografía) para tu edad.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si notas un cambio en el pecho o el tórax, acude a un médico o una enfermera.",
    },
    en: {
      title: "Breast awareness",
      summary: "Being breast aware means knowing how your breasts usually look and feel, so you notice changes early. Many changes have other causes, but any new change should be checked.",
      sections: [
        {
          heading: "What breast awareness means",
          body: "Breast awareness means getting to know how your breasts or chest normally look and feel. Checking regularly makes it easier to notice any changes in their size, look or feel. What matters most is knowing what is normal for you, so a change stands out. Try to check about once a month.",
        },
        {
          heading: "Your cycle and your breasts",
          body: "Breasts can look and feel different at different points in the menstrual cycle. Many people find them more tender or swollen in the week or two before a period, and this usually settles once the period ends. Breasts also change after menopause. Because of this, it can help to notice where you are in your cycle each time you check, so you can compare your breasts at the same point in each cycle. Ciclo's period log can help you see this.",
        },
        {
          heading: "How to check",
          body: "Stand in front of a mirror and look at both breasts, first with your arms down, then with your arms up. Next, use your fingers to feel each breast or side of your chest in small circles. Cover the whole area up to your collarbone and into each armpit, including the nipple. Press lightly at first, then more firmly, but never so hard that it hurts. Some people find this easier lying down or in the shower.",
        },
        {
          heading: "Changes to look out for",
          body: "Look out for a lump or swelling in your breast, chest or armpit, or a change in the size or shape of one or both breasts. The skin may dimple, like orange peel. It may also change colour, for example looking darker than usual on black or brown skin, or red on white skin. Also look for a nipple that turns inwards or has a rash, or fluid from the nipple when you are not pregnant or breastfeeding, which may contain blood.",
        },
        {
          heading: "If you notice a change",
          body: "See a doctor or nurse if you notice any of these changes, and do not wait to see if they go away. Many breast changes, including lumps, are common and can be caused by other conditions, but only a check can tell. Breast pain on its own is unlikely to be a sign of cancer. You can also ask a doctor or nurse whether breast screening (a mammogram) is offered for your age where you live.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you notice a change in your breast or chest, see a doctor or nurse.",
    },
  },
  {
    slug: "tracking-for-doctor",
    category: "care",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NHS — Period problems", href: "https://www.nhs.uk/conditions/periods/period-problems/" },
      { label: "Office on Women's Health — Premenstrual syndrome (PMS)", href: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome" },
    ],
    related: ["tracking-your-cycle", "when-to-see-a-doctor", "gynecology-visit"],
    es: {
      title: "Usar tu registro del ciclo en una consulta",
      summary: "Unos meses de notas sobre tus periodos y síntomas pueden ayudar a un médico o una enfermera a entender qué está pasando. Aquí verás qué anotar y cómo usarlo.",
      sections: [
        {
          heading: "Por qué ayuda llevar un registro",
          body: "Es fácil olvidar detalles de un mes a otro. Un diario o calendario de tus periodos y síntomas puede ayudar a un médico o una enfermera a detectar patrones y encontrar la causa de un problema. Puede mostrar si los síntomas están relacionados con tu ciclo o con otra cosa. En algunas afecciones, como el síndrome premenstrual (SPM) y el trastorno disfórico premenstrual (TDPM), llevar un registro diario durante al menos 2 ciclos forma parte del diagnóstico.",
        },
        {
          heading: "Qué anotar sobre el periodo",
          body: "Anota el primer y el último día de cada periodo, para que el médico pueda ver cuánto duran tus ciclos y tus periodos. Apunta lo abundante que es el sangrado cada día y cada cuánto cambias de toalla higiénica, tampón o copa menstrual. Anota si hay coágulos o si el sangrado traspasa a la ropa o a la cama. Registra cada día que sangras, no solo el primero, y anota cualquier manchado o sangrado entre periodos o después de las relaciones sexuales.",
        },
        {
          heading: "Dolor, síntomas y estado de ánimo",
          body: "Apunta cualquier dolor: dónde lo notas, su intensidad y si te ayudan los analgésicos. Anota otros síntomas, como dolor de cabeza, hinchazón, dolor en los pechos, cansancio, cambios en el sueño y el estado de ánimo, junto con su gravedad y los días en que aparecen. Hacerlo a diario, durante unos meses, da una imagen más clara que intentar recordarlo después. Si los síntomas afectan a tu trabajo, tus estudios o tus relaciones, anótalo también, porque muestra su impacto.",
        },
        {
          heading: "Otras cosas que llevar",
          body: "Haz una lista de los medicamentos que tomas, incluidos los anticonceptivos, los suplementos y los analgésicos. Anota cualquier cosa que pueda afectar a tu ciclo, como un embarazo reciente, la lactancia, un medicamento nuevo, el estrés o una enfermedad. Escribe tus preguntas antes de la cita, con la que más te importa en primer lugar, para no olvidarlas durante la consulta.",
        },
        {
          heading: "Aprovecha al máximo tu registro",
          body: "Los registros de unos cuantos meses son más útiles que los de un solo mes. Antes de la consulta, repasa tu registro y quédate con los patrones principales, como cuánto suelen durar tus ciclos y cuándo empiezan los síntomas. Sirve cualquier diario, calendario o app. En Ciclo, los periodos, síntomas y notas que registras se guardan en un solo lugar, y los pronósticos se marcan como estimaciones. Comparte tanto como te parezca bien. Tu registro apoya la conversación, pero no es un diagnóstico.",
        },
      ],
      notice: "Esta es información general. Un registro del ciclo te ayuda a hablar con un médico o una enfermera; no puede diagnosticar una afección.",
    },
    en: {
      title: "Using your cycle log at an appointment",
      summary: "A few months of notes about your periods and symptoms can help a doctor or nurse understand what is going on. Here is what to record and how to use it.",
      sections: [
        {
          heading: "Why a record helps",
          body: "It is easy to forget details from one month to the next. A diary or calendar of your periods and symptoms can help a doctor or nurse spot patterns and find the cause of a problem. It can show whether symptoms are linked to your cycle or to something else. For some conditions, such as PMS and PMDD, a daily record kept for at least 2 cycles is part of how they are diagnosed.",
        },
        {
          heading: "Period details to note",
          body: "Note the first and last day of each period, so the doctor can see how long your cycles and periods last. Record how heavy the flow is each day and how often you change pads, tampons or cups. Note any clots or bleeding through to clothes or bedding. Log every day you bleed, not only the first day, and note any spotting or bleeding between periods or after sex.",
        },
        {
          heading: "Pain, symptoms and mood",
          body: "Write down any pain, including where it is, how strong it is and whether painkillers help. Note other symptoms, such as headaches, bloating, breast pain, tiredness, sleep changes and mood, along with how severe they are and on which days they happen. Doing this daily, for a few months, gives a clearer picture than trying to remember later. If symptoms affect work, school or relationships, note that too, as it shows their impact.",
        },
        {
          heading: "Other things to bring",
          body: "Make a list of any medicines you take, including contraception, supplements and painkillers. Note anything that might affect your cycle, such as a recent pregnancy, breastfeeding, a new medicine, stress or illness. Write down your questions beforehand, with the one that matters most to you at the top, so you do not forget them during the visit.",
        },
        {
          heading: "Making the most of your log",
          body: "Records from a few months are more useful than records from one month. Before the visit, look back and pick out the main patterns, such as how long your cycles usually are and when symptoms start. Any diary, calendar or app works. In Ciclo, your logged periods, symptoms and notes are kept in one place, and predictions are marked as estimates. Share as much as you are comfortable with. Your log supports the conversation, but it is not a diagnosis.",
        },
      ],
      notice: "This is general information. A cycle log helps you talk to a doctor or nurse; it cannot diagnose a condition.",
    },
  },
  {
    slug: "gynecologic-cancers",
    category: "care",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "CDC — Symptoms of gynecologic cancers", href: "https://www.cdc.gov/gynecologic-cancer/symptoms/index.html" },
      { label: "NHS — Ovarian cancer: symptoms", href: "https://www.nhs.uk/conditions/ovarian-cancer/symptoms/" },
      { label: "CDC — Reducing risk for gynecologic cancers", href: "https://www.cdc.gov/gynecologic-cancer/prevention/index.html" },
    ],
    related: ["cervical-screening", "postmenopausal-bleeding", "spotting"],
    es: {
      title: "Cánceres ginecológicos: señales que conviene conocer",
      summary: "Conocer las señales de los cánceres ginecológicos te ayuda a actuar a tiempo. Estos síntomas a menudo tienen otras causas, pero cualquiera que dure o que no sea normal para ti debe revisarse.",
      sections: [
        {
          heading: "Qué son estos cánceres",
          body: "Los cánceres ginecológicos empiezan en los órganos reproductivos. Los tipos principales son el cáncer de cuello uterino, de ovario, de útero, de vagina y de vulva. Cada tipo tiene sus propias señales, y los síntomas no son iguales para todo el mundo. Muchos de estos síntomas son frecuentes y pueden deberse a otras afecciones, y la única forma de saber la causa es ir al médico. La citología ayuda a detectar a tiempo cambios en el cuello del útero, pero no revisa los otros tipos, así que conocer las señales es importante. La vacuna contra el virus del papiloma humano (VPH) protege contra los tipos de VPH que causan la mayoría de los cánceres de cuello uterino, de vagina y de vulva.",
        },
        {
          heading: "Sangrado o flujo vaginal inusual",
          body: "Un sangrado o un flujo vaginal inusual puede ser señal de todos estos cánceres, salvo el de vulva. Esto incluye el sangrado entre periodos, después de las relaciones sexuales o después de la menopausia, y los periodos más abundantes de lo habitual para ti. Estos tipos de sangrado siempre debe revisarlos un médico. Un flujo vaginal que no es habitual en ti también merece una revisión.",
        },
        {
          heading: "Cambios en el abdomen, la pelvis y la vejiga",
          body: "Algunas señales se confunden fácilmente con problemas cotidianos. El cáncer de ovario puede causar un abdomen hinchado o sensación de hinchazón, sensación de saciedad enseguida o falta de apetito, y dolor en el abdomen, la pelvis o la espalda. El dolor o la presión en la pelvis también pueden ser una señal de cáncer de útero. Necesitar orinar más a menudo o con más urgencia, y el estreñimiento, pueden aparecer con el cáncer de ovario y el de vagina. El cáncer de ovario también puede causar indigestión, diarrea, cansancio constante y pérdida de peso sin buscarla.",
        },
        {
          heading: "Cambios en la vulva",
          body: "El cáncer de vulva tiene sus propias señales. Entre ellas están el picor, el ardor, el dolor o la sensibilidad en la vulva, y los cambios en el color o en la piel de la vulva, como una erupción, llagas o verrugas. Estos cambios también pueden tener otras causas, pero los cambios que duran debe revisarlos un médico o una enfermera.",
        },
        {
          heading: "Cuándo ir al médico",
          body: "Presta atención a tu cuerpo y conoce lo que es normal para ti. Acude enseguida a un médico por cualquier sangrado vaginal que sea inusual para ti, incluido cualquier sangrado después de la menopausia. Para las demás señales, acude a un médico si una dura 2 semanas o más y no es normal para ti. Si ya has ido al médico y tus síntomas no han desaparecido, han empeorado o aparecen más a menudo, vuelve. Si el médico cree que necesitas más pruebas, puede derivarte de forma urgente a un especialista. Anotar en Ciclo cuándo aparecen los síntomas puede ayudarte a describirlos con claridad.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Acude enseguida a un médico si tienes un sangrado inusual, y también si tienes otros síntomas que duran 2 semanas o más.",
    },
    en: {
      title: "Gynaecological cancers: signs to know",
      summary: "Knowing the signs of gynaecological cancers helps you act early. These symptoms often have other causes, but any that last or are not normal for you should be checked.",
      sections: [
        {
          heading: "What these cancers are",
          body: "Gynaecological cancers start in the reproductive organs. The main types are cervical, ovarian, womb (uterine), vaginal and vulval cancers. Each type has its own signs, and symptoms are not the same for everyone. Many of these symptoms are common and can be caused by other conditions, and the only way to know the cause is to see a doctor. Cervical screening helps find changes in the cervix early, but it does not check for the other types, so knowing the signs matters. The HPV vaccine protects against the types of HPV that cause most cervical, vaginal and vulval cancers.",
        },
        {
          heading: "Unusual bleeding or discharge",
          body: "Unusual bleeding or discharge from the vagina can be a sign of all of these cancers except vulval cancer. This includes bleeding between periods, after sex or after menopause, and periods that are heavier than usual for you. These kinds of bleeding should always be checked by a doctor. Discharge that is unusual for you is also worth getting checked.",
        },
        {
          heading: "Tummy, pelvis and bladder changes",
          body: "Some signs are easy to mistake for everyday problems. Ovarian cancer can cause a swollen tummy or bloating, feeling full quickly or not wanting to eat, and pain in the tummy, pelvis or back. Pelvic pain or pressure can also be a sign of womb cancer. Needing to pee more often or more urgently, and constipation, can happen with ovarian and vaginal cancers. Ovarian cancer can also cause indigestion, diarrhoea, feeling tired all the time and losing weight without trying.",
        },
        {
          heading: "Changes to the vulva",
          body: "Vulval cancer has its own signs. These include itching, burning, pain or tenderness of the vulva, and changes in the colour or skin of the vulva, such as a rash, sores or warts. These changes can have other causes too, but changes that last should be looked at by a doctor or nurse.",
        },
        {
          heading: "When to see a doctor",
          body: "Pay attention to your body and know what is normal for you. See a doctor straight away about any vaginal bleeding that is unusual for you, including any bleeding after menopause. For the other signs, see a doctor if one lasts 2 weeks or longer and is not normal for you. If you have seen a doctor before and your symptoms have not gone away, are worse or happen more often, go back. If a doctor thinks you need more tests, you may be referred urgently to a specialist. Noting when symptoms happen in Ciclo can help you describe them clearly.",
        },
      ],
      notice: "This is general information, not a diagnosis. See a doctor straight away about unusual bleeding, and about other symptoms that last 2 weeks or more.",
    },
  },
  {
    slug: "when-to-seek-care",
    category: "care",
    reviewedAt: "2026-08-18",
    sources: [
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
    ],
    es: {
      title: "Cuándo consultar",
      summary: "Ciclo es una app de registro y pronóstico. No sustituye atención sanitaria.",
      sections: [
        {
          heading: "Señales para pedir cita",
          body: "Sangrado que empapa una compresa cada hora, dolor que no mejora, periodos que desaparecen varios meses, sangrado después de la menopausia, o síntomas que te impiden hacer tu vida.",
        },
        {
          heading: "Urgencias",
          body: "Si hay dolor agudo intenso, mareo, desmayo o sangrado muy abundante de forma súbita, busca atención urgente.",
        },
      ],
      notice: "Los tips de Ciclo son orientación general de bienestar, no consejo médico personalizado.",
    },
    en: {
      title: "When to seek care",
      summary: "Ciclo is a logging and forecast app. It does not replace clinical care.",
      sections: [
        {
          heading: "Reasons to book an appointment",
          body: "Bleeding that soaks a pad every hour, pain that does not ease, periods that stop for several months, bleeding after menopause, or symptoms that stop you living your life.",
        },
        {
          heading: "Urgent care",
          body: "If you have sudden severe pain, dizziness, fainting, or very heavy bleeding all at once, seek urgent care.",
        },
      ],
      notice: "Ciclo tips are general wellbeing guidance, not personalised medical advice.",
    },
  },
];
