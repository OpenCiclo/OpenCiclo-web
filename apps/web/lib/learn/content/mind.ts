// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const MIND_ARTICLES: LearnArticle[] = [
  {
    slug: "mood-and-cycle",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      { label: "Mind — About PMDD", href: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/premenstrual-dysphoric-disorder-pmdd/about-pmdd/" },
      { label: "NIMH — Depression in women: 4 types of depression unique to women", href: "https://www.nimh.nih.gov/health/publications/depression-in-women" },
      { label: "NHS — Postnatal depression", href: "https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/" },
    ],
    related: ["pms", "pmdd", "depression"],
    es: {
      title: "Cambios de ánimo a lo largo del ciclo",
      summary: "Muchas personas notan que su estado de ánimo cambia antes del periodo. Aquí verás cómo pueden influir las hormonas, qué ayuda y cuándo el ánimo bajo es algo más que el SPM.",
      sections: [
        {
          heading: "Cómo puede afectar tu ciclo al estado de ánimo",
          body: "Tus niveles de hormonas suben y bajan a lo largo de cada ciclo menstrual. Muchas personas notan cambios en su estado de ánimo en las semanas antes del periodo. Esto forma parte del síndrome premenstrual (SPM). No se conoce la causa exacta, pero puede estar relacionada con estos cambios en los niveles de hormonas. Cuánto afecta varía mucho de una persona a otra. Algunas personas solo notan pequeños cambios. Para otras, los cambios son mucho más difíciles de llevar.",
        },
        {
          heading: "Emociones frecuentes antes del periodo",
          body: "Entre los cambios emocionales frecuentes están los cambios de ánimo, la irritabilidad, el ánimo bajo, y sentir malestar, ansiedad o más sensibilidad emocional. A menudo aparecen a la vez síntomas físicos. Entre ellos, cansancio o problemas para dormir, hinchazón, pechos doloridos, dolores de cabeza y cambios en el apetito o antojos. Estas emociones son frecuentes y no son una señal de debilidad. El artículo sobre el SPM explica los síntomas con más detalle.",
        },
        {
          heading: "Cuando es algo más que el SPM",
          body: "En un pequeño número de personas, los síntomas premenstruales son mucho más intensos. Esto se llama trastorno disfórico premenstrual (TDPM). Los síntomas aparecen en el tiempo entre la ovulación y el siguiente periodo. Para la mayoría de las personas, ese tiempo dura unas 2 semanas. El TDPM puede causar depresión, ansiedad, ira y pensamientos suicidas. Las investigaciones sugieren que las personas con TDPM pueden ser más sensibles a los cambios hormonales normales del ciclo. El artículo sobre el TDPM explica cómo se diagnostica y se trata.",
        },
        {
          heading: "Otros momentos en que las hormonas pueden afectar al ánimo",
          body: "El estado de ánimo también puede cambiar en otros momentos de grandes cambios hormonales. Tener el ánimo decaído, ansiedad o irritabilidad durante unos días después de dar a luz es muy frecuente y suele pasar en un plazo de 2 semanas. Si el ánimo bajo es intenso o dura más, puede ser depresión posparto. Algunas mujeres también sienten con más fuerza irritabilidad, ansiedad, tristeza o pérdida del disfrute en los años previos a la menopausia (perimenopausia). Ambos tipos de depresión se pueden tratar.",
        },
        {
          heading: "Qué puede ayudar",
          body: "Hacer ejercicio con regularidad, llevar una dieta sana y equilibrada y dormir lo suficiente pueden ayudar a aliviar los síntomas del SPM. El yoga, la meditación u otras formas de reducir el estrés también pueden ayudar, igual que no fumar y no beber demasiado alcohol. Llevar un registro de tu estado de ánimo durante al menos 2 ciclos puede mostrar si los cambios siguen un patrón, y registrar el ánimo en Ciclo junto a tu periodo lo hace más fácil. Si cuidarte por tu cuenta no basta, un médico puede hablar contigo sobre la anticoncepción hormonal, la terapia psicológica (terapia cognitivo-conductual o TCC) o los antidepresivos.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta a un médico o una enfermera si los cambios de ánimo afectan a tu vida diaria o si cuidarte por tu cuenta no ha funcionado. Pide ayuda también si tienes el ánimo bajo la mayor parte del día, casi todos los días, durante 2 semanas o más, en cualquier momento del ciclo. Si piensas en hacerte daño o en quitarte la vida, pide ayuda de emergencia ahora: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si los cambios de ánimo te resultan difíciles de llevar, habla con un médico o una enfermera.",
    },
    en: {
      title: "Mood changes across the cycle",
      summary: "Many people notice their mood shift before a period. Here is how hormones may play a part, what helps, and when low mood is more than PMS.",
      sections: [
        {
          heading: "How your cycle can affect mood",
          body: "Your hormone levels rise and fall across each menstrual cycle. Many people notice changes in their mood in the weeks before a period. This is part of premenstrual syndrome (PMS). The exact cause is not known, but it may be linked to these changing hormone levels. How strongly it affects people varies a lot. Some people notice only small changes. For others, the changes are much harder to live with.",
        },
        {
          heading: "Feelings that are common before a period",
          body: "Common emotional changes include mood swings, feeling irritable or low, and feeling upset, anxious or emotional. Physical symptoms often come at the same time. These include tiredness or trouble sleeping, bloating, sore breasts, headaches and changes in appetite or food cravings. These feelings are common and are not a sign of weakness. The PMS article explains the symptoms in more detail.",
        },
        {
          heading: "When it is more than PMS",
          body: "For a small number of people, premenstrual symptoms are much more severe. This is called premenstrual dysphoric disorder (PMDD). Symptoms come in the time between ovulation and your next period. For most people, this time lasts about 2 weeks. PMDD can cause depression, anxiety, anger and suicidal thoughts. Research suggests that people with PMDD may be more sensitive to the normal hormone changes of the cycle. The PMDD article explains how it is diagnosed and treated.",
        },
        {
          heading: "Other times hormones can affect mood",
          body: "Mood can also change at other times of big hormone shifts. Feeling down, anxious or irritable for a few days after giving birth is very common and usually passes within 2 weeks. If low mood is severe or lasts longer, it may be postnatal depression. Some women also have stronger feelings of irritability, anxiety, sadness or loss of enjoyment in the years leading up to menopause (perimenopause). Both kinds of depression can be treated.",
        },
        {
          heading: "What can help",
          body: "Regular exercise, a healthy, balanced diet and plenty of sleep may help ease PMS symptoms. Yoga, meditation or other ways to lower stress may help too, as can not smoking and not drinking too much alcohol. Keeping a record of your mood for at least 2 cycles can show whether changes follow a pattern, and logging mood in Ciclo alongside your period makes this easier. If self-help is not enough, a doctor can talk to you about hormonal contraception, talking therapy (CBT) or antidepressants.",
        },
        {
          heading: "When to get help",
          body: "See a doctor or nurse if mood changes are affecting your daily life, or if self-help has not worked. Also get help if you feel low most of the day, nearly every day, for 2 weeks or more, at any point in your cycle. If you are thinking about harming yourself or ending your life, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If mood changes are hard to live with, talk to a doctor or nurse.",
    },
  },
  {
    slug: "depression",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "WHO — Depressive disorder (depression)", href: "https://www.who.int/news-room/fact-sheets/detail/depression" },
      { label: "NIMH — Depression", href: "https://www.nimh.nih.gov/health/topics/depression" },
      { label: "NIMH — Depression in women: 4 types of depression unique to women", href: "https://www.nimh.nih.gov/health/publications/depression-in-women" },
    ],
    related: ["mood-and-cycle", "anxiety", "postpartum-depression"],
    es: {
      title: "Depresión",
      summary: "La depresión es más que unos días de tristeza. Es frecuente, influye en cómo te sientes, piensas y afrontas las cosas, y se puede tratar. Aquí verás las señales y por dónde empezar.",
      sections: [
        {
          heading: "Qué es la depresión",
          body: "Todo el mundo está triste o bajo de ánimo a veces. La depresión es distinta. Es una enfermedad que cambia tu estado de ánimo y tu forma de pensar, y hace más difícil manejar cosas cotidianas como dormir, comer o trabajar. Es frecuente: la OMS calcula que alrededor de 1 de cada 20 adultos en el mundo tiene depresión, y es aproximadamente una vez y media más frecuente en las mujeres que en los hombres. Los genes, la química del cuerpo, las situaciones estresantes o difíciles de la vida y tu entorno pueden influir.",
        },
        {
          heading: "Señales a las que prestar atención",
          body: "Las señales principales son un estado de ánimo bajo, triste, irritable o vacío, o perder el interés o el placer por cosas que antes disfrutabas. Otras señales son mucho cansancio, dificultad para concentrarte, dormir o comer más o menos de lo habitual, sentimientos de culpa o de no valer nada, y desesperanza sobre el futuro. Algunas personas tienen dolores y molestias sin una causa física clara. En la depresión, estas emociones duran la mayor parte del día, casi todos los días, durante al menos 2 semanas.",
        },
        {
          heading: "La depresión y tus hormonas",
          body: "Algunos tipos de depresión están relacionados con etapas de cambio hormonal. El trastorno disfórico premenstrual (TDPM) causa un ánimo muy bajo, irritabilidad y otros síntomas en las semanas antes del periodo. La depresión perinatal puede empezar durante el embarazo o después del parto. Algunas mujeres también tienen depresión durante la transición a la menopausia (perimenopausia). Si tu ánimo bajo parece seguir tu ciclo, registrarlo en Ciclo puede ayudarte a mostrarle el patrón a un médico.",
        },
        {
          heading: "Tratamientos que funcionan",
          body: "La depresión se puede tratar, incluso cuando es grave. Los tratamientos habituales son la terapia psicológica, los medicamentos antidepresivos o ambos a la vez. Entre las terapias psicológicas con buena evidencia están la terapia cognitivo-conductual (TCC), la activación conductual, la terapia interpersonal y la terapia de resolución de problemas. La terapia puede ser presencial o en línea. Un médico o una enfermera puede repasar las opciones contigo y ayudarte a elegir la que más te convenga.",
        },
        {
          heading: "Cosas que puedes hacer por ti",
          body: "Los pequeños pasos pueden ayudarte a recuperarte. Intenta seguir haciendo cosas que antes disfrutabas, aunque sea poco tiempo. Mantén el contacto con tus amistades y tu familia. Intenta hacer actividad física a menudo. Un paseo corto es un buen comienzo. Mantén horarios regulares para comer y dormir cuando puedas. Evita o reduce el alcohol, y evita las drogas ilegales.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta a un médico o una enfermera si has tenido señales de depresión la mayor parte del día, casi todos los días, durante 2 semanas o más. Pide cita antes si te está costando sobrellevarlo. La depresión puede afectar a cualquiera, y pedir ayuda es un primer paso normal. Si piensas en hacerte daño o en quitarte la vida, pide ayuda de emergencia ahora: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si crees que podrías tener depresión, habla con un médico o una enfermera.",
    },
    en: {
      title: "Depression",
      summary: "Depression is more than a few sad days. It is common, it affects how you feel, think and cope, and it can be treated. Here are the signs and where to start.",
      sections: [
        {
          heading: "What depression is",
          body: "Everyone feels sad or low at times. Depression is different. It is an illness that changes your mood and your thinking, and makes everyday things like sleep, meals and work harder to manage. It is common: the WHO estimates that about 1 in 20 adults worldwide have depression, and it is about 1.5 times more common in women than in men. Genes, body chemistry, stressful or difficult life events and your surroundings can all play a part.",
        },
        {
          heading: "Signs to look out for",
          body: "The main signs are a low, sad, irritable or empty mood, or losing interest or pleasure in things you used to enjoy. Other signs include feeling very tired, finding it hard to concentrate, sleeping or eating more or less than usual, feeling guilty or worthless, and feeling hopeless about the future. Some people have aches and pains with no clear physical cause. With depression, these feelings last most of the day, nearly every day, for at least 2 weeks.",
        },
        {
          heading: "Depression and your hormones",
          body: "Some types of depression are linked to times of hormone change. Premenstrual dysphoric disorder (PMDD) causes severe low mood, irritability and other symptoms in the weeks before a period. Perinatal depression can start during pregnancy or after giving birth. Some women also have depression during the change to menopause (perimenopause). If your low mood seems to follow your cycle, logging it in Ciclo can help you show a doctor the pattern.",
        },
        {
          heading: "Treatment that works",
          body: "Depression can be treated, even when it is severe. Common treatments are talking therapy, antidepressant medicines, or both together. Talking therapies with good evidence include cognitive behavioural therapy (CBT), behavioural activation, interpersonal therapy and problem-solving therapy. Therapy can be face to face or online. A doctor or nurse can talk through the options with you and help you choose what suits you.",
        },
        {
          heading: "Things you can do for yourself",
          body: "Small steps can support your recovery. Try to keep doing things you used to enjoy, even for a short time. Stay in touch with friends and family. Try to be active often. A short walk is a good start. Keep to regular times for eating and sleeping where you can. Avoid or cut down on alcohol, and avoid illegal drugs.",
        },
        {
          heading: "When to get help",
          body: "See a doctor or nurse if you have had signs of depression most of the day, nearly every day, for 2 weeks or more. Go sooner if you are struggling to cope. Depression can affect anyone, and asking for help is a normal first step. If you are thinking about harming yourself or ending your life, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you think you may have depression, talk to a doctor or nurse.",
    },
  },
  {
    slug: "anxiety",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Generalised anxiety disorder (GAD)", href: "https://www.nhs.uk/mental-health/conditions/generalised-anxiety-disorder/overview/" },
      { label: "NIMH — Anxiety disorders", href: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      { label: "NIMH — Depression in women: 4 types of depression unique to women", href: "https://www.nimh.nih.gov/health/publications/depression-in-women" },
      { label: "NHS — Panic disorder", href: "https://www.nhs.uk/mental-health/conditions/panic-disorder/" },
    ],
    related: ["mood-and-cycle", "depression", "pmdd"],
    es: {
      title: "Ansiedad",
      summary: "Sentir ansiedad de vez en cuando es normal. Cuando la preocupación es difícil de controlar y se interpone en tu vida diaria, el apoyo y el tratamiento pueden ayudar.",
      sections: [
        {
          heading: "Preocupación cotidiana y trastornos de ansiedad",
          body: "La mayoría de las personas sienten ansiedad a veces, por ejemplo antes de un examen o de una conversación difícil. Eso no significa que tengas un trastorno de ansiedad. En un trastorno de ansiedad, la preocupación no se va. Aparece en muchos ámbitos de tu vida y puede hacerse más intensa con el tiempo. Entre los tipos están el trastorno de ansiedad generalizada (TAG), el trastorno de pánico, el trastorno de ansiedad social y las fobias. El TAG es un trastorno frecuente y afecta a más mujeres que hombres. Es más probable si tus familiares cercanos tienen ansiedad o depresión, después de situaciones estresantes o traumáticas, o si vives con una enfermedad de larga duración que causa dolor.",
        },
        {
          heading: "Cómo se puede sentir la ansiedad",
          body: "La señal principal del TAG es un estrés o una preocupación difícil de controlar que afecta a tu vida diaria. Puedes sentir inquietud, tensión o irritabilidad, tener dificultad para concentrarte o cansarte con facilidad. La ansiedad también afecta al cuerpo. Puede causar problemas para dormir, molestias de estómago, latidos fuertes o fuera de lo normal (palpitaciones) y sensación de aturdimiento o mareo. Puede venir acompañada de ánimo bajo o depresión. Un ataque de pánico es una oleada repentina de miedo intenso, a menudo sin una razón clara. El corazón puede acelerarse, y puedes sudar, temblar, tener náuseas, mareo o falta de aire, o dolor en el pecho. La mayoría de los ataques duran de 5 a 20 minutos. Asustan, pero no dañan tu cuerpo.",
        },
        {
          heading: "La ansiedad y tu ciclo",
          body: "En algunas personas, los cambios hormonales pueden influir en la ansiedad. Sentir ansiedad, malestar o más sensibilidad emocional es una parte frecuente del síndrome premenstrual (SPM) en las semanas antes del periodo. La ansiedad intensa, la irritabilidad o el ánimo bajo antes del periodo pueden ser una señal de trastorno disfórico premenstrual (TDPM). La ansiedad también puede aparecer junto a la depresión durante el embarazo, después del parto o en torno a la menopausia. Anotar tu estado de ánimo en Ciclo puede mostrar si tu ansiedad sigue tu ciclo.",
        },
        {
          heading: "Qué puede ayudar",
          body: "Hablar de cómo te sientes con alguien de confianza puede ayudar. También puede ayudar aprender ejercicios de respiración para calmarte, hacer actividad física con regularidad, comer de forma saludable y dormir lo suficiente. Intenta reducir el café, el té, los refrescos de cola y las bebidas energéticas. Intenta no recurrir al alcohol, el tabaco, las apuestas o las drogas ilegales para manejar la ansiedad. Si la ansiedad afecta a tu vida, un médico puede ofrecerte tratamiento. Las principales opciones son la terapia psicológica, normalmente la terapia cognitivo-conductual (TCC), y los medicamentos, sobre todo un tipo de antidepresivo llamado ISRS.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta a un médico o una enfermera si crees que podrías tener un trastorno de ansiedad, o si la preocupación es difícil de controlar y afecta a tu vida diaria. El dolor en el pecho o la dificultad para respirar también pueden tener otras causas. Si no tienes claro que sea un ataque de pánico, pide ayuda de emergencia (por ejemplo, 911 en México o 112 en España). Si piensas en hacerte daño o en quitarte la vida, pide ayuda de emergencia ahora: llama al número de emergencias de tu país o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si la preocupación afecta a tu vida diaria, habla con un médico o una enfermera.",
    },
    en: {
      title: "Anxiety",
      summary: "Feeling anxious now and then is normal. When worry is hard to control and gets in the way of daily life, support and treatment can help.",
      sections: [
        {
          heading: "Everyday worry and anxiety disorders",
          body: "Most people feel anxious sometimes, for example before a test or a hard conversation. That does not mean you have an anxiety disorder. With an anxiety disorder, the worry stays. It comes up in many parts of your life and may get stronger over time. Types include generalised anxiety disorder (GAD), panic disorder, social anxiety disorder and phobias. GAD is a common condition, and it affects more women than men. It is more likely if close relatives have anxiety or depression, after stressful or traumatic events, or if you live with a painful long-term condition.",
        },
        {
          heading: "How anxiety can feel",
          body: "The main sign of GAD is stress or worry that is hard to control and affects your daily life. You may feel restless, tense or irritable, find it hard to concentrate, or get tired easily. Anxiety affects the body too. It can cause trouble sleeping, stomach problems, a pounding or unusual heartbeat (palpitations), and feeling lightheaded or dizzy. Low mood or depression can come with it. A panic attack is a sudden rush of strong fear, often for no clear reason. Your heart may race, and you may sweat, shake, feel sick, dizzy or short of breath, or have chest pain. Most attacks last 5 to 20 minutes. They are frightening, but they do not harm your body.",
        },
        {
          heading: "Anxiety and your cycle",
          body: "Hormone changes can affect anxiety for some people. Feeling anxious, upset or emotional is a common part of premenstrual syndrome (PMS) in the weeks before a period. Severe anxiety, irritability or low mood before periods can be a sign of premenstrual dysphoric disorder (PMDD). Anxiety can also come with depression during pregnancy, after birth or around menopause. Noting your mood in Ciclo can show whether your anxiety follows your cycle.",
        },
        {
          heading: "What can help",
          body: "Talking to someone you trust about how you feel can help. So can learning calming breathing exercises, being active regularly, eating a healthy diet and getting enough sleep. Try to cut down on coffee, tea, cola and energy drinks. Try not to use alcohol, cigarettes, gambling or illegal drugs to manage anxiety. If anxiety is affecting your life, a doctor can offer treatment. The main options are talking therapy, usually cognitive behavioural therapy (CBT), and medicine, most often a type of antidepressant called an SSRI.",
        },
        {
          heading: "When to get help",
          body: "See a doctor or nurse if you think you might have an anxiety disorder, or if worry is hard to control and is affecting your daily life. Chest pain or trouble breathing can also have other causes. If you are not sure it is a panic attack, get emergency help. If you are thinking about harming yourself or ending your life, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If worry is affecting your daily life, talk to a doctor or nurse.",
    },
  },
  {
    slug: "postpartum-depression",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Postnatal depression", href: "https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/" },
      { label: "NIMH — Perinatal depression", href: "https://www.nimh.nih.gov/health/publications/perinatal-depression" },
      { label: "WHO — Depressive disorder (depression)", href: "https://www.who.int/news-room/fact-sheets/detail/depression" },
      { label: "NHS — Postpartum psychosis", href: "https://www.nhs.uk/mental-health/conditions/post-partum-psychosis/" },
    ],
    related: ["periods-after-birth", "depression", "mood-and-cycle"],
    es: {
      title: "Depresión posparto",
      summary: "Tener el ánimo bajo unos días después del parto es muy frecuente. Si el ánimo bajo es intenso o dura más de 2 semanas, puede ser depresión posparto, que se puede tratar.",
      sections: [
        {
          heading: "Tristeza posparto o depresión",
          body: "Muchas personas tienen el ánimo decaído, ansiedad o irritabilidad durante unos días después de dar a luz. A menudo se llama tristeza posparto o «baby blues». Es muy frecuente y suele pasar en un plazo de 2 semanas. La depresión posparto (también llamada depresión postnatal) es distinta. Es un problema de salud mental frecuente, y las emociones son más intensas o duran más. Puede empezar durante el embarazo, poco después del parto o en cualquier momento durante el año siguiente.",
        },
        {
          heading: "Señales a las que prestar atención",
          body: "Las señales incluyen el ánimo bajo, no poder disfrutar de nada y sentir desesperanza o que no puedes con todo. Puedes sentir culpa o que no vales nada, o sentir que eres una mala madre o un mal padre. Algunas personas se preocupan todo el tiempo, sienten inquietud o irritabilidad, no pueden dormir aunque tengan la oportunidad de descansar, o les cuesta concentrarse. Puedes tener emociones difíciles hacia tu bebé o que te cueste crear un vínculo con él. Tener estas emociones no es culpa tuya.",
        },
        {
          heading: "Por qué ocurre",
          body: "Pueden influir varias cosas. Entre ellas, los cambios hormonales del embarazo y el parto, la falta de sueño y las exigencias físicas y emocionales de cuidar a un bebé recién nacido. Otras fuentes de estrés, como la presión en el trabajo o un trauma pasado, pueden sumarse. Es más probable que la tengas si ya has tenido depresión o trastorno bipolar, o si los ha tenido un familiar cercano. Las parejas, incluidos los padres, también pueden tener depresión después de la llegada de un bebé.",
        },
        {
          heading: "Tratamiento y apoyo",
          body: "La depresión posparto se puede tratar. Las opciones incluyen terapias psicológicas como la terapia cognitivo-conductual (TCC), los medicamentos antidepresivos o ambos. Muchos antidepresivos son seguros durante la lactancia. Si estás dando el pecho, pregunta a un médico cuáles te convienen. Mantener el contacto con tus amistades y tu familia también puede ayudar. No tienes que esperar a sentirte muy mal para pedir apoyo.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Habla con un médico, una enfermera o una matrona o partera si crees que podrías tener depresión posparto, o si el ánimo bajo dura más de 2 semanas después del parto. Si piensas en hacerte daño a ti o a tu bebé, o en quitarte la vida, pide ayuda de emergencia ahora: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o a una línea de ayuda en crisis de tu país.",
        },
        {
          heading: "Una urgencia poco frecuente: la psicosis posparto",
          body: "La psicosis posparto es una enfermedad poco frecuente pero grave. Afecta a alrededor de 1 de cada 1000 madres y suele empezar de repente en las 2 primeras semanas después del parto, a menudo en cuestión de horas o días. Las señales incluyen ver u oír cosas que no están ahí, creer cosas que no son ciertas, sentir una euforia inusual o desconfianza, cambios de ánimo muy rápidos y confusión. Es una urgencia médica. Si notas estas señales en ti o en otra persona, pide ayuda de emergencia de inmediato. Con tratamiento, la mayoría de las personas se recuperan por completo. Si tienes trastorno bipolar o has tenido psicosis antes, díselo a tu médico o a tu matrona o partera durante el embarazo.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si lo estás pasando mal después de tener un bebé, habla con un médico, una enfermera o una matrona o partera.",
    },
    en: {
      title: "Postnatal depression",
      summary: "Feeling low for a few days after birth is very common. If low mood is severe or lasts longer than 2 weeks, it may be postnatal depression, which can be treated.",
      sections: [
        {
          heading: "Baby blues or depression",
          body: "Many people feel down, anxious or irritable for a few days after giving birth. This is often called the baby blues. It is very common and usually passes within 2 weeks. Postnatal depression (also called postpartum depression) is different. It is a common mental health condition, and the feelings are more severe or last longer. It can begin during pregnancy, soon after birth, or at any time up to a year after.",
        },
        {
          heading: "Signs to look out for",
          body: "Signs include low mood, finding it hard to enjoy anything, and feeling hopeless or unable to cope. You may feel guilty or worthless, or feel that you are a bad parent. Some people worry all the time, feel restless or irritable, cannot sleep even when they get the chance to rest, or find it hard to concentrate. You may have difficult feelings about your baby or find it hard to bond. Having these feelings is not your fault.",
        },
        {
          heading: "Why it happens",
          body: "Several things may play a part. These include the hormone changes of pregnancy and birth, lack of sleep, and the physical and emotional demands of caring for a new baby. Other stress, such as pressure at work or past trauma, can add to it. You are more likely to have it if you or a close relative have had depression or bipolar disorder before. Partners, including fathers, can also have depression after a baby arrives.",
        },
        {
          heading: "Treatment and support",
          body: "Postnatal depression can be treated. Options include talking therapies such as cognitive behavioural therapy (CBT), antidepressant medicines, or both. Many antidepressants are safe to use while breastfeeding. If you are breastfeeding, ask a doctor which ones suit you. Staying connected with friends and family can also help. You do not have to wait until you feel very unwell to ask for support.",
        },
        {
          heading: "When to get help",
          body: "Talk to a doctor, nurse or midwife if you think you might have postnatal depression, or if low mood lasts more than 2 weeks after the birth. If you are thinking about harming yourself or your baby, or about ending your life, get emergency help or contact a crisis line now.",
        },
        {
          heading: "A rare emergency: postpartum psychosis",
          body: "Postpartum psychosis is a rare but serious illness. It affects about 1 in 1,000 mothers and usually starts suddenly in the first 2 weeks after birth, often within hours or days. Signs include seeing or hearing things that are not there, believing things that are not true, feeling unusually high or suspicious, fast-changing moods and confusion. It is a medical emergency. If you notice these signs in yourself or someone else, get emergency help straight away. With treatment, most people recover fully. If you have bipolar disorder or have had psychosis before, tell your doctor or midwife during pregnancy.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you are struggling after having a baby, talk to a doctor, nurse or midwife.",
    },
  },
  {
    slug: "stress-and-cycle",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Missed or late periods", href: "https://www.nhs.uk/conditions/stopped-or-missed-periods/" },
      { label: "NICHD — What causes amenorrhea?", href: "https://www.nichd.nih.gov/health/topics/amenorrhea/conditioninfo/causes" },
      { label: "NHS — 10 stress busters", href: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/" },
    ],
    related: ["missed-periods", "irregular-periods", "anxiety"],
    es: {
      title: "El estrés y tu ciclo",
      summary: "El estrés puede retrasar el periodo o incluso detenerlo durante un tiempo. Aquí verás cómo afecta el estrés a tu ciclo, formas de sobrellevarlo y cuándo conviene consultar por la falta del periodo.",
      sections: [
        {
          heading: "Cómo afecta el estrés a tu periodo",
          body: "Tu ciclo está controlado por hormonas, y las señales empiezan en el cerebro. Una pequeña zona del cerebro llamada hipotálamo ayuda a regular muchos procesos del cuerpo, entre ellos tu ciclo. Un estrés físico o emocional intenso puede alterar su funcionamiento. Entonces puede liberar más despacio, o dejar de liberar, una hormona de la que depende el ciclo. Como resultado, el periodo puede retrasarse, o los periodos pueden detenerse durante un tiempo.",
        },
        {
          heading: "Otras razones por las que el periodo puede retrasarse",
          body: "El estrés es solo una de las posibles razones de un retraso o una falta del periodo. Otras son el embarazo, la lactancia, una pérdida de peso repentina, hacer mucho ejercicio, algunos tipos de anticoncepción hormonal, la perimenopausia, el síndrome de ovario poliquístico (SOP) y los problemas de tiroides. Un entrenamiento muy intenso, comer muy poco y el estrés también pueden sumarse y detener los periodos a la vez. Si el periodo se retrasa y es posible que estés embarazada, haz primero una prueba de embarazo.",
        },
        {
          heading: "Formas de manejar el estrés",
          body: "No siempre puedes cambiar una situación estresante, pero hay formas de afrontarla mejor. Hacer actividad física puede ayudar a calmar las emociones intensas. Pasa tiempo con personas que te apoyan, y reserva tiempo para descansar, para tus aficiones o para relajarte. Céntrate en lo que puedes controlar e intenta aceptar lo que no. Intenta no depender del alcohol, el tabaco o la cafeína para sobrellevarlo. Ayudar a otras personas, por ejemplo haciendo voluntariado, también puede ayudarte a afrontar mejor los momentos difíciles.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si te han faltado 3 periodos seguidos y no estás embarazada ni dando el pecho, o si tus periodos se han vuelto irregulares. Hazte también una revisión si la falta del periodo viene con otros cambios, como aumento o pérdida de peso, cansancio, vello nuevo en la cara, o piel seca o grasa. Registrar tus periodos y tu estado de ánimo en Ciclo puede mostrar si las semanas de estrés coinciden con los retrasos. Si el estrés te resulta difícil de manejar o afecta a tu ánimo casi todos los días, un médico o una enfermera también pueden ayudarte con eso. Si piensas en hacerte daño, pide ayuda de emergencia ahora: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si tus periodos se detienen o cambian, habla con un médico o una enfermera.",
    },
    en: {
      title: "Stress and your cycle",
      summary: "Stress can delay or even stop your period for a while. Here is how stress affects your cycle, ways to cope, and when a missed period needs checking.",
      sections: [
        {
          heading: "How stress affects your period",
          body: "Your cycle is controlled by hormones, and the signals start in your brain. A small area of the brain called the hypothalamus helps run many body processes, including your cycle. Severe physical or emotional stress can upset how it works. It may then slow or stop releasing a hormone that the cycle depends on. As a result, a period can come late, or periods can stop for a while.",
        },
        {
          heading: "Other reasons a period can be late",
          body: "Stress is only one possible reason for a late or missed period. Others include pregnancy, breastfeeding, sudden weight loss, doing a lot of exercise, some types of hormonal contraception, perimenopause, PCOS and thyroid problems. Very heavy training, eating too little and stress can also add up and stop periods together. If your period is late and you could be pregnant, take a pregnancy test first.",
        },
        {
          heading: "Ways to manage stress",
          body: "You cannot always change a stressful situation, but there are ways to cope with it better. Being active can help calm strong feelings. Spend time with people who support you, and make time for rest, hobbies or relaxing. Focus on what you can control and try to accept what you cannot. Try not to rely on alcohol, smoking or caffeine to cope. Helping others, for example by volunteering, may also help you cope better with hard times.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if you have missed 3 periods in a row and are not pregnant or breastfeeding, or if your periods have become irregular. Also get checked if a missed period comes with other changes, such as weight gain or loss, tiredness, new hair growth on your face, or dry or oily skin. Logging your periods and mood in Ciclo can show whether stressful weeks line up with late periods. If stress feels hard to manage or affects your mood most days, a doctor or nurse can help with that too. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods stop or change, talk to a doctor or nurse.",
    },
  },
  {
    slug: "body-image",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Body image", href: "https://womenshealth.gov/mental-health/body-image-and-mental-health/body-image" },
      { label: "NHS — Eating disorders", href: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/eating-disorders/overview/" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
    ],
    related: ["eating-disorders", "depression", "healthy-eating"],
    es: {
      title: "Imagen corporal",
      summary: "La imagen corporal es lo que piensas y sientes sobre tu cuerpo. Mirarte con más amabilidad es bueno para tu salud mental, y se puede aprender con la práctica.",
      sections: [
        {
          heading: "Qué significa la imagen corporal",
          body: "La imagen corporal es cómo ves tu cuerpo y cómo te sientes con él, en el espejo o en tu mente. Una imagen corporal sana significa sentirte a gusto en tu cuerpo y que, en general, te guste tu aspecto. Además, tu cuerpo cambia de forma natural con el tiempo, e incluso a lo largo de un ciclo. Por ejemplo, la hinchazón antes del periodo es frecuente.",
        },
        {
          heading: "Qué influye en cómo te ves",
          body: "Muchas cosas influyen en la imagen corporal. Los medios y la publicidad suelen mostrar mujeres delgadas y jóvenes, y las imágenes a menudo están retocadas. Las personas de tu entorno también cuentan. Los niños y las niñas absorben ideas de los adultos: las hijas de madres que hacen dieta tienen el doble de probabilidades de pensar en hacer dieta ellas mismas. Que se burlen de ti o te acosen por tu aspecto en la infancia también puede influir en cómo te ves más adelante.",
        },
        {
          heading: "Por qué importa para tu salud",
          body: "Una imagen corporal negativa puede bajar tu autoestima, lo que puede afectar a muchos aspectos de tu vida. También puede aumentar el riesgo de algunos problemas de salud mental, como la depresión y los trastornos de la conducta alimentaria. Algunas personas sienten una angustia muy grande por defectos pequeños o imaginarios en su aspecto. Esto puede ser una señal de trastorno dismórfico corporal (TDC), que es una enfermedad grave. Un médico o una enfermera puede ayudarte.",
        },
        {
          heading: "Construir una mirada más amable hacia tu cuerpo",
          body: "La imagen corporal puede cambiar con la práctica. Los pensamientos amables se vuelven más fáciles con la práctica. Intenta darte cuenta de los pensamientos duros sobre tu cuerpo y cambiarlos por otros más justos. Fijarte en las partes de ti que te gustan puede ayudar. Aprender a aceptar tu aspecto es mejor para ti que intentar cambiarlo siempre. Recuerda que muchas imágenes de los medios y los anuncios están retocadas. Pasar menos tiempo con contenidos que te hacen sentir peor contigo también puede ayudar.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Habla con un médico o una enfermera si las preocupaciones por tu cuerpo te ocupan mucho tiempo o afectan a tu ánimo, a tu alimentación o a tu vida diaria. Comer muy poco, hacer mucho más ejercicio de lo habitual o dejar de tener el periodo pueden ser señales de alarma de un trastorno de la conducta alimentaria. Conviene revisarlas pronto, y hay apoyo disponible. Si piensas en hacerte daño, pide ayuda de emergencia ahora: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general. Si las preocupaciones por tu cuerpo están afectando a tu vida, habla con un médico o una enfermera.",
    },
    en: {
      title: "Body image",
      summary: "Body image is how you think and feel about your body. A kinder view of yourself is good for your mental health, and it can grow with practice.",
      sections: [
        {
          heading: "What body image means",
          body: "Body image is how you see your body and how you feel about it, in the mirror or in your own mind. A healthy body image means feeling at ease in your body and mostly happy with how you look. Your body also changes naturally over time, and even across a cycle. Bloating before a period, for example, is common.",
        },
        {
          heading: "What shapes how you see yourself",
          body: "Many things affect body image. Media and advertising tend to show women who are thin and young, and the images are often edited. The people around you matter too. Children pick up ideas from adults: daughters whose mothers diet are twice as likely to think about dieting themselves. Being teased or bullied about your looks as a child can also shape how you see yourself later.",
        },
        {
          heading: "Why it matters for your health",
          body: "A negative body image can lower your self-esteem, which can affect many parts of your life. It can also raise the risk of some mental health problems, such as depression and eating disorders. Some people become very distressed about small or imagined flaws in how they look. This can be a sign of body dysmorphic disorder (BDD), which is a serious illness. A doctor or nurse can help.",
        },
        {
          heading: "Building a kinder view of your body",
          body: "Body image can change with practice. Kind thoughts get easier with practice. Try to notice harsh thoughts about your body and swap them for fairer ones. Focusing on the parts of yourself you like can help. Learning to accept how you look is better for you than always trying to change it. Remember that many images in media and adverts are edited. Spending less time with content that makes you feel worse about yourself may help too.",
        },
        {
          heading: "When to get help",
          body: "Talk to a doctor or nurse if worries about your body take up a lot of your time or affect your mood, eating or daily life. Eating very little, exercising much more than usual, or losing your periods can be warning signs of an eating disorder. These are worth getting checked early, and support is available. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information. If worries about your body are affecting your life, talk to a doctor or nurse.",
    },
  },
  {
    slug: "eating-disorders",
    category: "mind",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Eating disorders", href: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/eating-disorders/overview/" },
      { label: "NIMH — Eating disorders", href: "https://www.nimh.nih.gov/health/topics/eating-disorders" },
      { label: "NICHD — What causes amenorrhea?", href: "https://www.nichd.nih.gov/health/topics/amenorrhea/conditioninfo/causes" },
      { label: "NHS — Osteoporosis: causes", href: "https://www.nhs.uk/conditions/osteoporosis/causes/" },
    ],
    related: ["red-s", "body-image", "missed-periods"],
    es: {
      title: "Trastornos de la conducta alimentaria",
      summary: "Los trastornos de la conducta alimentaria son problemas de salud mental graves, y se pueden tratar. Aquí verás las señales, cómo pueden afectar al periodo y cómo pedir ayuda pronto.",
      sections: [
        {
          heading: "Qué es un trastorno de la conducta alimentaria",
          body: "Un trastorno de la conducta alimentaria es un problema de salud mental. Las personas con un trastorno de este tipo pueden usar la comida, o el control sobre la comida, como forma de sobrellevar emociones difíciles. Estos trastornos son graves y pueden poner en peligro la vida, pero se pueden tratar con éxito. Cualquier persona puede desarrollar uno, aunque afectan con más frecuencia a adolescentes y adultos jóvenes. Puede ser más probable que lo desarrolles si alguien de tu familia ha tenido un trastorno de la conducta alimentaria, o si vives con ansiedad o baja autoestima.",
        },
        {
          heading: "Tipos de trastornos de la conducta alimentaria",
          body: "La anorexia consiste en intentar controlar el peso no comiendo lo suficiente, haciendo demasiado ejercicio, o ambas cosas. La bulimia supone perder el control al comer y después intentar deshacerse de la comida o evitar ganar peso de formas dañinas. El trastorno por atracón consiste en comer de forma habitual cantidades muy grandes de comida, a menudo sin sentirte capaz de parar, hasta notar el estómago incómodamente lleno. El trastorno de evitación o restricción de la ingesta de alimentos (ARFID, por sus siglas en inglés) consiste en evitar ciertos alimentos, limitar cuánto comes, o ambas cosas. Cuando los síntomas no encajan en un tipo concreto, puede llamarse «otro trastorno de la conducta alimentaria especificado» (OSFED, por sus siglas en inglés).",
        },
        {
          heading: "Señales a las que prestar atención",
          body: "Las señales incluyen pasar mucho tiempo preocupándote por tu peso o la forma de tu cuerpo, comer muy poco y hacer demasiado ejercicio. El estado de ánimo puede cambiar, con tendencia a aislarte, ansiedad o ánimo bajo. Tu cuerpo también puede dar señales, como sentir frío, cansancio o mareo, e hinchazón, estreñimiento o diarrea. En otra persona, puedes notar que come muy rápido, que va mucho al baño después de comer o que lleva ropa holgada y ancha.",
        },
        {
          heading: "Por qué puede detenerse el periodo",
          body: "No tener el periodo es una de las señales de un trastorno de la conducta alimentaria, y es una señal de alarma importante. Cuando el cuerpo no recibe suficiente comida, una parte del cerebro llamada hipotálamo puede frenar la hormona de la que depende el ciclo. Los periodos pueden volverse irregulares o detenerse. El estrógeno ayuda a mantener los huesos fuertes. El estrógeno bajo que acompaña a la pérdida del periodo, junto con una mala nutrición, puede debilitar los huesos con el tiempo.",
        },
        {
          heading: "Pedir ayuda",
          body: "Si crees que podrías tener un trastorno de la conducta alimentaria, consulta a un médico o una enfermera lo antes posible. El tratamiento suele incluir terapia psicológica y revisiones de salud periódicas, y la recuperación es distinta para cada persona. Pedir ayuda pronto te da la mejor oportunidad de recuperarte por completo. Si te preocupa otra persona, hazle saber que te importa y anímala a ir al médico. Pide ayuda de emergencia (por ejemplo, 911 en México o 112 en España) si una persona con un trastorno de la conducta alimentaria se desmaya, tiene dolor en el pecho o tiene el corazón muy acelerado o irregular. Si piensas en hacerte daño o en quitarte la vida, pide ayuda de emergencia ahora: llama al número de emergencias de tu país o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si te preocupa tu alimentación o la de otra persona, habla con un médico o una enfermera.",
    },
    en: {
      title: "Eating disorders",
      summary: "Eating disorders are serious mental health conditions, and they can be treated. Here are the signs, how they can affect periods, and how to get help early.",
      sections: [
        {
          heading: "What an eating disorder is",
          body: "An eating disorder is a mental health condition. People with an eating disorder may use food, or control over food, as a way to cope with hard feelings. Eating disorders are serious and can be life-threatening, but they can be treated successfully. Anyone can develop one, though teenagers and young adults are affected most often. You may be more likely to develop one if someone in your family has had an eating disorder, or if you live with anxiety or low self-esteem.",
        },
        {
          heading: "Types of eating disorder",
          body: "Anorexia involves trying to control your weight by not eating enough, exercising too much, or both. Bulimia means losing control over eating, then trying to get rid of the food or avoid weight gain in harmful ways. Binge eating disorder means regularly eating very large amounts of food, often feeling unable to stop, until you feel uncomfortably full. ARFID (avoidant restrictive food intake disorder) means avoiding certain foods, limiting how much you eat, or both. When symptoms do not fit one type, it may be called OSFED (other specified feeding or eating disorder).",
        },
        {
          heading: "Signs to look out for",
          body: "Signs include spending a lot of time worrying about your weight or body shape, eating very little, and exercising too much. Mood can change, with feeling withdrawn, anxious or low. Your body may also show signs, such as feeling cold, tired or dizzy, and bloating, constipation or diarrhoea. In someone else, you might notice them eating very fast, going to the toilet a lot after eating, or wearing loose, baggy clothes.",
        },
        {
          heading: "Why periods can stop",
          body: "Not getting your period is one of the signs of an eating disorder, and it is an important warning sign. When the body does not get enough food, a part of the brain called the hypothalamus can slow down the hormone that the cycle depends on. Periods may become irregular or stop. Oestrogen helps keep bones strong. The low oestrogen that comes with lost periods, together with poor nutrition, can weaken bones over time.",
        },
        {
          heading: "Getting help",
          body: "If you think you might have an eating disorder, see a doctor or nurse as soon as you can. Treatment usually includes talking therapy and regular health checks, and recovery looks different for everyone. Getting help early gives you the best chance of a full recovery. If you are worried about someone else, let them know you care and encourage them to see a doctor. Get emergency help if someone with an eating disorder faints, has chest pain, or has a very fast or uneven heartbeat. If you are thinking about harming yourself or ending your life, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you are worried about your eating or someone else's, talk to a doctor or nurse.",
    },
  },
];
