// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const PREGNANCY_ARTICLES: LearnArticle[] = [
  {
    slug: "early-pregnancy-signs",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Signs and symptoms of pregnancy", href: "https://www.nhs.uk/pregnancy/trying-for-a-baby/signs-and-symptoms-of-pregnancy/" },
      { label: "NHS — Doing a pregnancy test", href: "https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/" },
      { label: "NHS — Ectopic pregnancy", href: "https://www.nhs.uk/conditions/ectopic-pregnancy/" },
      { label: "MedlinePlus — Miscarriage", href: "https://medlineplus.gov/miscarriage.html" },
      { label: "CDC — Urgent maternal warning signs", href: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html" },
    ],
    related: ["pregnancy-tests", "missed-periods", "ectopic-pregnancy"],
    es: {
      title: "Primeras señales de embarazo",
      summary: "Para la mayoría de las personas, la primera señal de embarazo es un periodo que no llega. Las náuseas, el cansancio y los pechos doloridos también son frecuentes, pero no todo el mundo los tiene.",
      sections: [
        {
          heading: "La falta del periodo",
          body: "Para la mayoría de las personas, la primera pista es un periodo que no llega. Si tus ciclos varían mucho, puede ser más difícil saber cuándo un periodo se retrasa. Registrar tus periodos en Ciclo puede ayudarte a notar cuándo uno no ha llegado. La mayoría de las pruebas de embarazo funcionan desde el primer día de retraso del periodo. Si no sabes cuándo te toca el periodo, haz la prueba al menos 21 días después de la última vez que tuviste relaciones sexuales sin anticoncepción.",
        },
        {
          heading: "Náuseas y cansancio",
          body: "Muchas personas tienen náuseas o vómitos al principio del embarazo. Se conocen como náuseas del embarazo o náuseas matutinas, pero pueden aparecer a cualquier hora del día. Suelen empezar hacia las 4 a 6 semanas de embarazo (contando desde el primer día de tu último periodo). Muchas personas sienten mucho cansancio, sobre todo en los 3 primeros meses. Si tienes náuseas intensas y vomitas mucho, busca atención médica de inmediato.",
        },
        {
          heading: "Otros cambios que puedes notar",
          body: "Puede que tus pechos aumenten de tamaño, estén sensibles o notes hormigueo en ellos. Puede que necesites orinar más a menudo, también por la noche. Algunas personas tienen estreñimiento, más flujo vaginal sin dolor ni irritación, un sabor metálico extraño en la boca o antojos de comidas nuevas. No hay dos embarazos iguales, y puede que tengas solo algunas de estas señales, o ninguna. Las señales por sí solas no te lo pueden confirmar; una prueba de embarazo es la forma de saberlo.",
        },
        {
          heading: "Sangrado leve o manchado",
          body: "En las primeras semanas, algunas personas tienen un sangrado muy leve o un poco de manchado, que puede parecer un periodo escaso. Se llama sangrado de implantación. Como el sangrado en el embarazo también puede tener otras causas, ponte en contacto con un médico, una enfermera o una matrona o partera si tienes cualquier sangrado y crees que podrías estar embarazada, sobre todo si también tienes dolor.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Si la prueba sale positiva, ponte en contacto pronto con un médico, una enfermera o una matrona o partera. Si es posible que estés embarazada, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del vientre, en un lado, o cualquier sangrado. Pide ayuda de emergencia (por ejemplo, 911 en México o 112 en España) si tienes un dolor de vientre repentino e intenso, dolor en la punta del hombro, un sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo ectópico.",
        },
      ],
      notice: "Esta es información general. Solo una prueba de embarazo puede decirte si estás embarazada. Si te preocupa algún síntoma, habla con un médico, una enfermera o una matrona o partera.",
    },
    en: {
      title: "Early signs of pregnancy",
      summary: "For most people, the first sign of pregnancy is a period that does not come. Feeling sick, tiredness and sore breasts are common too, but not everyone gets them.",
      sections: [
        {
          heading: "A missed period",
          body: "For most people, the first clue is a period that does not come. If your cycles vary a lot, it can be harder to tell when a period is late. Logging your periods in Ciclo can make it easier to notice when one has not come. Most pregnancy tests work from the first day of a missed period. If you do not know when your period is due, test at least 21 days after you last had sex without contraception.",
        },
        {
          heading: "Feeling sick and tired",
          body: "Many people feel sick or are sick in early pregnancy. It is often called morning sickness, but it can come at any hour. It usually starts when you are around 4 to 6 weeks pregnant (counted from the first day of your last period). Many people feel very tired, mostly in the first 3 months. If you have severe sickness and are vomiting a lot, get medical help straight away.",
        },
        {
          heading: "Other changes you may notice",
          body: "Your breasts may get bigger, feel tender or tingle. You may need to pee more often, including at night. Some people get constipation, more vaginal discharge without soreness or irritation, a strange metallic taste in the mouth, or cravings for new foods. No two pregnancies are alike, and you may have only some of these signs, or none. Signs alone cannot tell you for sure; a pregnancy test is the way to find out.",
        },
        {
          heading: "Light bleeding or spotting",
          body: "In the first few weeks, some people have a very light bleed or a little spotting, which can look like a light period. This is called implantation bleeding. Because bleeding in pregnancy can also have other causes, contact a doctor, nurse or midwife if you have any bleeding and think you might be pregnant, especially if you also have pain.",
        },
        {
          heading: "When to get help",
          body: "If your test is positive, contact a doctor, nurse or midwife soon. If you could be pregnant, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of an ectopic pregnancy.",
        },
      ],
      notice: "This is general information. Only a pregnancy test can tell you if you are pregnant. If you are worried about any symptom, talk to a doctor, nurse or midwife.",
    },
  },
  {
    slug: "pregnancy-tests",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Doing a pregnancy test", href: "https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/" },
      { label: "MedlinePlus — Pregnancy test", href: "https://medlineplus.gov/lab-tests/pregnancy-test/" },
      { label: "NHS — Ectopic pregnancy", href: "https://www.nhs.uk/conditions/ectopic-pregnancy/" },
      { label: "Office on Women's Health — Pregnancy tests", href: "https://www.womenshealth.gov/a-z-topics/pregnancy-tests" },
    ],
    related: ["early-pregnancy-signs", "unplanned-pregnancy", "healthy-pregnancy"],
    es: {
      title: "Pruebas de embarazo",
      summary: "La mayoría de las pruebas de embarazo caseras funcionan desde el primer día de retraso del periodo. Un resultado positivo casi siempre es correcto; uno negativo es menos seguro si haces la prueba pronto.",
      sections: [
        {
          heading: "Cómo funcionan las pruebas de embarazo",
          body: "Las pruebas de embarazo buscan una hormona llamada gonadotropina coriónica humana (hCG). La produce la placenta, que crece en el útero y alimenta al bebé. Tu cuerpo empieza a producir hCG unos 6 días después de que se fecunde un óvulo. Las pruebas caseras analizan la orina. Los análisis de sangre en una clínica pueden detectar cantidades más pequeñas de hCG, a veces antes de la falta del periodo.",
        },
        {
          heading: "Cuándo hacer la prueba",
          body: "La mayoría de las pruebas caseras funcionan desde el primer día de retraso del periodo. Algunas pruebas más sensibles se pueden usar antes de la falta del periodo, pero el resultado es más fiable si esperas a que el periodo se retrase. Si no sabes cuándo te toca el periodo, haz la prueba al menos 21 días después de la última vez que tuviste relaciones sexuales sin anticoncepción. La primera orina de la mañana suele tener más hCG. Evita beber mucho líquido antes de la prueba, porque puede diluir la hormona. Puedes registrar el resultado en Ciclo junto a las fechas de tu periodo.",
        },
        {
          heading: "Cómo leer el resultado",
          body: "Sigue las instrucciones de tu prueba, incluido cuánto tiempo hay que esperar. Después de orinar en la tira, el resultado aparece en pocos minutos. Si se usan bien, las pruebas caseras son fiables. Cualquier línea o signo más que puedas ver, aunque sea tenue, lo más probable es que signifique que estás embarazada. Una línea tenue puede indicar que el embarazo está en sus inicios y que tu nivel de hCG aún es bajo. Las pruebas de orina caseras tienen una precisión de alrededor del 97% al 99% cuando se hacen una o dos semanas después de la falta del periodo.",
        },
        {
          heading: "Si la prueba sale negativa",
          body: "Un resultado negativo es menos fiable, sobre todo si hiciste la prueba pronto. Puede que tu cuerpo aún no haya producido suficiente hCG para que la prueba la detecte. Si sigues pensando que podrías estar embarazada, espera unos días y repite la prueba. Algunos medicamentos también pueden afectar al resultado, así que revisa el folleto de instrucciones o pregunta a un farmacéutico o farmacéutica. Si una segunda prueba es negativa y el periodo sigue sin llegar, consulta a un médico o una enfermera.",
        },
        {
          heading: "Después de una prueba positiva",
          body: "Decidas lo que decidas, conviene que veas pronto a un médico, una enfermera o una matrona o partera. Si piensas seguir con el embarazo, recibir atención pronto es importante. Si no tienes claro qué quieres hacer, un centro de salud sexual o de planificación familiar puede hablar contigo sobre tus opciones. Si es posible que estés embarazada, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del vientre, en un lado, o cualquier sangrado. Pide ayuda de emergencia (por ejemplo, 911 en México o 112 en España) si tienes un dolor de vientre repentino e intenso, dolor en la punta del hombro, un sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo ectópico.",
        },
      ],
      notice: "Esta es información general. Si el resultado no está claro o el periodo sigue sin llegar, habla con un médico, una enfermera o un centro de salud sexual.",
    },
    en: {
      title: "Pregnancy tests",
      summary: "Most home pregnancy tests work from the first day of a missed period. A positive result is almost always right; a negative one is less certain if you test early.",
      sections: [
        {
          heading: "How pregnancy tests work",
          body: "Pregnancy tests look for a hormone called human chorionic gonadotrophin (hCG). It is made by the placenta, which grows in the womb and feeds the baby. Your body starts making hCG around 6 days after an egg is fertilised. Home tests check your pee. Blood tests at a clinic can pick up smaller amounts of hCG, sometimes before a missed period.",
        },
        {
          heading: "When to test",
          body: "Most home tests work from the first day of a missed period. Some more sensitive tests can be used before a missed period, but the result is more reliable if you wait until your period is late. If you do not know when your period is due, test at least 21 days after you last had sex without contraception. Your first pee of the morning usually has the most hCG. Avoid drinking a lot of fluid before testing, because it can dilute the hormone. You can log your result in Ciclo next to your period dates.",
        },
        {
          heading: "Reading the result",
          body: "Follow the instructions that come with your test, including how long to wait. After you pee on the stick, the result shows within a few minutes. Used the right way, home tests are reliable. Any line or plus sign you can see, even a faint one, most likely means you are pregnant. A faint line can mean the pregnancy is early and your hCG level is still low. Home urine tests are about 97% to 99% accurate when done a week or two after a missed period.",
        },
        {
          heading: "If the test is negative",
          body: "A negative result is less reliable, especially if you tested early. Your body may not have made enough hCG yet for the test to find it. If you still think you might be pregnant, wait a few days and test again. Some medicines can also affect the result, so check the leaflet or ask a pharmacist. If a second test is negative and your period still has not come, see a doctor or nurse.",
        },
        {
          heading: "After a positive test",
          body: "Whatever you decide, it helps to see a doctor, nurse or midwife soon. If you plan to continue the pregnancy, getting care early matters. If you are not sure what you want to do, a sexual-health or family-planning clinic can talk through your options. If you could be pregnant, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of an ectopic pregnancy.",
        },
      ],
      notice: "This is general information. If your result is unclear or your period still has not come, talk to a doctor, nurse or sexual-health clinic.",
    },
  },
  {
    slug: "healthy-pregnancy",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "MedlinePlus — Prenatal care", href: "https://medlineplus.gov/prenatalcare.html" },
      { label: "Office on Women's Health — Prenatal care and tests", href: "https://www.womenshealth.gov/pregnancy/youre-pregnant-now-what/prenatal-care-and-tests" },
      { label: "CDC — Urgent maternal warning signs", href: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html" },
      { label: "NHS — Vitamins, supplements and nutrition in pregnancy", href: "https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/" },
      { label: "NHS — Foods to avoid in pregnancy", href: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/" },
    ],
    related: ["preconception-health", "periods-after-birth", "postpartum-depression"],
    es: {
      title: "Control prenatal y embarazo saludable",
      summary: "Las revisiones periódicas durante el embarazo ayudan a detectar problemas a tiempo. Aquí verás qué incluye el control prenatal, hábitos que ayudan y señales de alarma que necesitan atención de inmediato.",
      sections: [
        {
          heading: "Qué es el control prenatal",
          body: "El control prenatal (también llamado atención prenatal) es la atención sanitaria que recibes mientras estás embarazada. Incluye revisiones y pruebas periódicas. Ayuda a cuidar tu salud y la del bebé, y permite que un médico o una matrona o partera detecte problemas a tiempo. Si piensas seguir con el embarazo, ponte en contacto con un médico, una enfermera o una matrona o partera en cuanto sepas que estás embarazada.",
        },
        {
          heading: "Qué pasa en las revisiones",
          body: "En algunos países, como Estados Unidos, un calendario habitual es una revisión más o menos una vez al mes hasta la semana 28, dos veces al mes de la semana 28 a la 36, y después cada semana hasta el parto. Tu propio calendario puede ser distinto. En la mayoría de las visitas te toman la presión arterial y el peso, se comprueba el latido del corazón del bebé y te miden el vientre para seguir su crecimiento. También te ofrecerán pruebas, como análisis de sangre y ecografías (ultrasonidos).",
        },
        {
          heading: "Vitaminas y medicamentos",
          body: "Toma 400 microgramos de ácido fólico al día hasta las 12 semanas de embarazo. Ayuda a prevenir defectos congénitos del cerebro y la columna. Pregunta también por la vitamina D. No tomes suplementos de vitamina A (retinol) ni aceite de hígado de pescado, porque un exceso de vitamina A puede dañar al bebé. Pregunta a tu médico o a tu matrona o partera sobre una alimentación saludable y cuánto peso es adecuado que ganes. Habla siempre con ellos antes de empezar o dejar cualquier medicamento, incluidos los que compras por tu cuenta y los remedios a base de plantas.",
        },
        {
          heading: "Comidas y bebidas que conviene evitar",
          body: "Algunos alimentos pueden transmitir infecciones como la listeria o la toxoplasmosis, o contener demasiada vitamina A. Evita los quesos blandos de corteza blanca, como el brie, salvo que estén bien cocinados. Evita también el paté, la carne cruda o poco cocinada, los embutidos y carnes curadas que se comen fríos, el hígado, el marisco crudo, y el tiburón, el pez espada y el marlín. Limita el atún y el pescado azul o graso, no tomes más de 200 mg de cafeína al día y evita el alcohol. Los consejos cambian un poco de un país a otro, así que pregunta a tu matrona o partera qué se aplica en tu caso.",
        },
        {
          heading: "Hábitos que te protegen a ti y al bebé",
          body: "Evita el tabaco, el alcohol y las drogas durante el embarazo, porque pueden dañar tu salud y la del bebé. Si te cuesta dejarlos, pide apoyo a un médico, una enfermera o una matrona o partera. Ir a todas tus revisiones también es importante, aunque te encuentres bien, porque los controles periódicos permiten a tu médico o a tu matrona o partera detectar problemas a tiempo.",
        },
        {
          heading: "Señales de alarma que necesitan atención ya",
          body: "Busca atención médica de inmediato si tienes sangrado o pérdida de líquido por la vagina, o un dolor de vientre intenso que no se va. Haz lo mismo si tienes un dolor de cabeza que no se va o empeora, cambios en la vista, o una hinchazón extrema de las manos o la cara. Otras señales urgentes son fiebre de 38°C o más, dolor en el pecho, el corazón muy acelerado, dificultad para respirar, desmayos, vómitos intensos o un cansancio extremo. También lo es una pierna o un brazo con dolor, enrojecido o hinchado, o que el bebé se mueva menos o deje de moverse. Di que estás embarazada. Si tienes pensamientos de hacerte daño a ti o a tu bebé, pide ayuda de emergencia ahora: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general. Tu médico o tu matrona o partera es quien mejor conoce tu embarazo. Si notas que algo no va bien, ponte en contacto con ellos o busca ayuda urgente.",
    },
    en: {
      title: "Prenatal care and a healthy pregnancy",
      summary: "Regular check-ups during pregnancy help spot problems early. Here is what prenatal care involves, habits that help, and warning signs that need care straight away.",
      sections: [
        {
          heading: "What prenatal care is",
          body: "Prenatal care (also called antenatal care) is the health care you get while you are pregnant. It includes regular check-ups and tests. It helps keep you and the baby healthy and lets a doctor or midwife spot problems early. If you plan to continue your pregnancy, contact a doctor, nurse or midwife as soon as you know you are pregnant.",
        },
        {
          heading: "What happens at check-ups",
          body: "In some countries, such as the US, a typical pattern is a check-up about once a month until 28 weeks, twice a month from 28 to 36 weeks, and then every week until the birth. Your own schedule may differ. At most visits your blood pressure and weight are checked, the baby's heartbeat is checked, and your tummy is measured to follow the baby's growth. You will also be offered tests, such as blood tests and ultrasound scans.",
        },
        {
          heading: "Vitamins and medicines",
          body: "Take 400 micrograms of folic acid every day until you are 12 weeks pregnant. It helps prevent birth defects of the brain and spine. Ask about vitamin D too. Do not take vitamin A (retinol) supplements or fish liver oil, because too much vitamin A can harm the baby. Ask your doctor or midwife about healthy eating and how much weight gain is right for you. Always talk to them before you start or stop any medicine, including medicines you buy yourself and herbal remedies.",
        },
        {
          heading: "Food and drink to avoid",
          body: "Some foods can carry infections such as listeria or toxoplasmosis, or contain too much vitamin A. Avoid soft cheeses with a white rind, such as brie, unless thoroughly cooked. Also avoid pâté, raw or undercooked meat, cold cured meats, liver, raw shellfish, and shark, swordfish and marlin. Limit tuna and oily fish, have no more than 200 mg of caffeine a day, and avoid alcohol. Advice differs a little between countries, so ask your midwife what applies to you.",
        },
        {
          heading: "Habits that protect you and the baby",
          body: "Avoid smoking, alcohol and drugs during pregnancy, as they can harm you and the baby. If you find it hard to stop, ask a doctor, nurse or midwife for support. Going to all your check-ups matters too, even when you feel well, because regular checks let your doctor or midwife spot problems early.",
        },
        {
          heading: "Warning signs that need care now",
          body: "Get medical help straight away if you have bleeding or fluid leaking from your vagina, or severe tummy pain that does not go away. Do the same for a headache that will not go away or gets worse, changes in your vision, or extreme swelling of your hands or face. Other urgent signs are a fever of 38°C or higher, chest pain, a racing heart, trouble breathing, fainting, severe vomiting, or extreme tiredness. So is a painful, red or swollen leg or arm, or a baby that moves less or stops moving. Say that you are pregnant. If you have thoughts of harming yourself or your baby, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information. Your doctor or midwife knows your pregnancy best. If something feels wrong, contact them or get urgent help.",
    },
  },
  {
    slug: "miscarriage",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Miscarriage", href: "https://www.nhs.uk/conditions/miscarriage/" },
      { label: "MedlinePlus — Miscarriage", href: "https://medlineplus.gov/miscarriage.html" },
      { label: "Mayo Clinic — Miscarriage: symptoms and causes", href: "https://www.mayoclinic.org/diseases-conditions/pregnancy-loss-miscarriage/symptoms-causes/syc-20354298" },
      { label: "Office on Women's Health — Pregnancy loss", href: "https://www.womenshealth.gov/pregnancy/youre-pregnant-now-what/pregnancy-loss" },
    ],
    related: ["ectopic-pregnancy", "healthy-pregnancy", "depression"],
    es: {
      title: "Aborto espontáneo",
      summary: "Perder un embarazo puede ser muy duro. Aquí verás las señales de un aborto espontáneo, cuándo pedir ayuda, qué pasa después y dónde encontrar apoyo.",
      sections: [
        {
          heading: "Qué es un aborto espontáneo",
          body: "Un aborto espontáneo (pérdida del embarazo) es cuando un embarazo termina por sí solo, más o menos en la primera mitad de la gestación. Según el país, los médicos usan este término para una pérdida antes de las 20 o de las 24 semanas. El aborto espontáneo es frecuente. Alrededor de 10 a 20 de cada 100 embarazos conocidos terminan en aborto espontáneo, y la cifra real es mayor, porque muchos ocurren antes de que la persona sepa que está embarazada. La mayoría ocurren en los 3 primeros meses. Perder un embarazo en cualquier etapa puede ser doloroso y angustiante, y todo lo que sientas es válido.",
        },
        {
          heading: "Por qué ocurre",
          body: "La mayoría de los abortos espontáneos ocurren porque el embarazo no se está desarrollando bien. A menudo se debe a un problema genético, como un cromosoma de más o de menos. La probabilidad es mayor a partir de los 35 años, cuando el padre del bebé tiene 45 años o más, y con algunas enfermedades de larga duración, como una diabetes mal controlada. Un aborto espontáneo normalmente no se debe a nada que hayas hecho. La mayoría de las veces ocurre por azar y no es culpa de nadie. Cosas cotidianas como el ejercicio, el sexo, el trabajo normal o una discusión no lo provocan.",
        },
        {
          heading: "Señales a las que prestar atención",
          body: "La señal principal es el sangrado por la vagina, desde un manchado leve hasta un sangrado más abundante. También puedes tener cólicos o dolor en la parte baja del vientre o de la espalda, o notar que sale líquido o tejido por la vagina. El sangrado o el dolor no siempre significan un aborto espontáneo. Aun así, ponte en contacto de inmediato con un médico, una enfermera o una matrona o partera si tienes cualquier sangrado, pérdida de líquido por la vagina o un flujo que no es habitual en ti.",
        },
        {
          heading: "Cuándo pedir ayuda de emergencia",
          body: "Si estás embarazada o podrías estarlo, llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias si tienes un dolor de vientre repentino, agudo y muy fuerte, dolor en la punta del hombro, o un sangrado abundante que empapa una compresa o toalla sanitaria poco después de ponértela. Haz lo mismo si tienes dolor o sangrado y además tienes mucho mareo, sensación de desmayo o náuseas, o tienes la piel muy pálida. Estas señales también pueden indicar un embarazo ectópico, que necesita tratamiento urgente.",
        },
        {
          heading: "Qué pasa después",
          body: "Un médico puede usar análisis de sangre u orina y una ecografía interna para ver qué está pasando. Si se confirma un aborto espontáneo temprano, suele haber tres opciones. Puedes esperar a que el embarazo se expulse por sí solo, lo que suele tardar unas 2 semanas, aunque puede tardar más. Puedes tomar medicamentos que ayuden a expulsarlo. O puedes someterte a un procedimiento breve, en el que se introduce un tubo fino por la vagina hasta el útero para retirar el tejido del embarazo.",
        },
        {
          heading: "Apoyo y el futuro",
          body: "El duelo después de un aborto espontáneo es normal, sea cual sea la etapa del embarazo. Hay apoyo disponible, y la orientación psicológica puede ayudarte a sobrellevarlo. Después de un aborto espontáneo, muchas personas tienen más adelante un embarazo saludable. Si decides volver a intentarlo, un médico puede explicarte los posibles riesgos. Si has tenido 3 o más abortos espontáneos, pregunta a un médico por pruebas para buscar una causa.",
        },
      ],
      notice: "Esta es información general. Si tienes sangrado o dolor en el embarazo, ponte en contacto con un médico, una enfermera o una matrona o partera. Si el dolor es intenso, pide ayuda de emergencia.",
    },
    en: {
      title: "Miscarriage",
      summary: "Losing a pregnancy can be very hard. Here are the signs of miscarriage, when to get help, what happens next and where to find support.",
      sections: [
        {
          heading: "What miscarriage is",
          body: "A miscarriage is when a pregnancy ends on its own in roughly the first half of pregnancy. Depending on the country, doctors use the word for a loss before 20 or 24 weeks. Miscarriage is common. About 10 to 20 in every 100 known pregnancies end in miscarriage, and the true number is higher, because many happen before a person knows they are pregnant. Most happen in the first 3 months. Losing a pregnancy at any stage can be painful and upsetting, and whatever you feel is valid.",
        },
        {
          heading: "Why it happens",
          body: "Most miscarriages happen because the pregnancy is not developing properly. This is often linked to a genetic problem, such as an extra or missing chromosome. The chance is higher from age 35, when the baby's father is 45 or over, and with some long-term health conditions, such as diabetes that is not well controlled. A miscarriage is usually not caused by anything you did. Most of the time it happens by chance and is no one's fault. Everyday things such as exercise, sex, normal work or an argument do not cause it.",
        },
        {
          heading: "Signs to look out for",
          body: "The main sign is bleeding from the vagina, from light spotting to heavier bleeding. You may also have cramps or pain in your lower tummy or lower back, or notice fluid or tissue coming from your vagina. Bleeding or pain does not always mean a miscarriage. Still, contact a doctor, nurse or midwife straight away if you have any bleeding, fluid leaking from your vagina, or discharge that is unusual for you.",
        },
        {
          heading: "When to get emergency help",
          body: "If you are pregnant or could be, call your local emergency number or go to an emergency department if you have sudden, sharp and very bad tummy pain, pain in the tip of your shoulder, or heavy bleeding that soaks a pad soon after you put it on. Do the same if you have pain or bleeding and also feel very dizzy, faint or sick, or look very pale. These signs can also point to an ectopic pregnancy, which needs urgent treatment.",
        },
        {
          heading: "What happens next",
          body: "A doctor may use blood or urine tests and an internal ultrasound scan to see what is happening. If an early miscarriage is confirmed, there are usually three options. You can wait for the pregnancy to pass on its own, which usually takes about 2 weeks, but can take longer. You can take medicine to help it pass. Or you can have a short procedure, where a thin tube is passed through the vagina into the womb to remove the pregnancy tissue.",
        },
        {
          heading: "Support and the future",
          body: "Grief after a miscarriage is normal, whatever the stage of pregnancy. Support is available, and counselling may help you cope. After a miscarriage, many people later have a healthy pregnancy. If you decide to try again, a doctor can talk you through any risks. If you have had 3 or more miscarriages, ask a doctor about tests to look for a cause.",
        },
      ],
      notice: "This is general information. If you have bleeding or pain in pregnancy, contact a doctor, nurse or midwife. If pain is severe, get emergency help.",
    },
  },
  {
    slug: "ectopic-pregnancy",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Ectopic pregnancy", href: "https://www.nhs.uk/conditions/ectopic-pregnancy/" },
      { label: "MedlinePlus — Ectopic pregnancy", href: "https://medlineplus.gov/ectopicpregnancy.html" },
    ],
    related: ["miscarriage", "early-pregnancy-signs", "pid"],
    es: {
      title: "Embarazo ectópico",
      summary: "Un embarazo ectópico crece fuera del útero y no puede seguir adelante. Puede convertirse en una urgencia médica, así que conviene conocer las señales de alarma y pedir ayuda rápido.",
      sections: [
        {
          heading: "Qué es un embarazo ectópico",
          body: "Un embarazo ectópico es cuando un óvulo fecundado se implanta y empieza a crecer fuera del útero. Lo más frecuente es que ocurra en una de las trompas de Falopio, que llevan los óvulos desde los ovarios hasta el útero. En el Reino Unido, alrededor de 1 de cada 90 embarazos es ectópico. Por desgracia, el embarazo no puede convertirse en un bebé y no se puede salvar. Si sigue creciendo, la trompa puede romperse y causar una hemorragia grave dentro del cuerpo.",
        },
        {
          heading: "Síntomas que conviene conocer",
          body: "Algunas personas no tienen síntomas al principio, o solo las señales habituales del embarazo, como la falta del periodo, los pechos doloridos o las náuseas. Cuando aparecen síntomas, suele ser entre la semana 4 y la 12 de embarazo. Pueden incluir dolor en la parte baja del vientre, en un lado, sangrado vaginal o un flujo marrón y acuoso, y molestias al orinar o al defecar. Si tienes alguno de estos síntomas y es posible que estés embarazada, ponte en contacto con un médico o una enfermera ese mismo día.",
        },
        {
          heading: "Pide ayuda de emergencia",
          body: "Llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias si tienes un dolor de vientre repentino, agudo y muy fuerte, dolor en la punta del hombro, o un sangrado abundante que empapa una compresa o toalla sanitaria poco después de ponértela. Haz lo mismo si tienes dolor o sangrado y además tienes mucho mareo, sensación de desmayo o náuseas, o tienes la piel muy pálida. Pueden ser señales de que la trompa se ha roto, lo que pone en peligro la vida.",
        },
        {
          heading: "Quién tiene más riesgo",
          body: "Un embarazo ectópico es más probable si ya has tenido uno, si has tenido enfermedad inflamatoria pélvica (EIP) o si te han operado de las trompas de Falopio. También es más probable si el embarazo se logró con un tratamiento de fertilidad como la fecundación in vitro (FIV, en la que un óvulo se fecunda en un laboratorio), o mientras usabas un DIU (dispositivo intrauterino) de cobre u hormonal. Fumar y tener más edad, sobre todo más de 35 años, también aumentan el riesgo.",
        },
        {
          heading: "Tratamiento",
          body: "Como el embarazo no puede continuar, tiene que retirarse o terminar por sí solo. A veces los médicos hacen un seguimiento de cerca para ver si termina sin tratamiento. Si no, el tratamiento es una inyección de un medicamento llamado metotrexato para terminar el embarazo, o una cirugía mínimamente invasiva (laparoscopia) para retirarlo. Tu equipo médico te explicará qué opción es la más segura para ti.",
        },
        {
          heading: "Después de un embarazo ectópico",
          body: "Perder un embarazo así puede ser muy duro. Muchas personas sienten un duelo profundo, y está bien pedir apoyo. Muchas personas que han tenido un embarazo ectópico tienen después un embarazo saludable. Si tienes un nuevo embarazo, ponte en contacto pronto con un médico o una enfermera y cuéntale que tuviste un embarazo ectópico, porque puede repetirse.",
        },
      ],
      notice: "Esta es información general. Si es posible que estés embarazada y tienes un dolor de vientre repentino e intenso, dolor en la punta del hombro o una fuerte sensación de desmayo, pide ayuda de emergencia ahora.",
    },
    en: {
      title: "Ectopic pregnancy",
      summary: "An ectopic pregnancy grows outside the womb and cannot continue. It can become a medical emergency, so it helps to know the warning signs and get help fast.",
      sections: [
        {
          heading: "What an ectopic pregnancy is",
          body: "An ectopic pregnancy is when a fertilised egg implants and starts to grow outside the womb. This most often happens in one of the fallopian tubes, which carry eggs from the ovaries to the womb. In the UK, about 1 in 90 pregnancies is ectopic. Sadly, the pregnancy cannot develop into a baby and cannot be saved. If it keeps growing, the tube can burst and cause serious bleeding inside the body.",
        },
        {
          heading: "Symptoms to know",
          body: "Some people have no symptoms at first, or only the usual signs of pregnancy, such as a missed period, sore breasts or feeling sick. When symptoms do appear, it is usually between the 4th and 12th week of pregnancy. They can include pain low down on one side of your tummy, vaginal bleeding or a brown watery discharge, and discomfort when you pee or poo. If you have any of these and could be pregnant, contact a doctor or nurse the same day.",
        },
        {
          heading: "Get emergency help",
          body: "Call your local emergency number or go to an emergency department if you have sudden, sharp and very bad tummy pain, pain in the tip of your shoulder, or heavy bleeding that soaks a pad soon after you put it on. Do the same if you have pain or bleeding and also feel very dizzy, faint or sick, or look very pale. These can be signs that the tube has burst, which is life-threatening.",
        },
        {
          heading: "Who is more at risk",
          body: "An ectopic pregnancy is more likely if you have had one before, have had pelvic inflammatory disease (PID), or have had surgery on your fallopian tubes. It is also more likely if you got pregnant through fertility treatment such as IVF (where an egg is fertilised in a lab), or while using a copper or hormonal coil (IUD). Smoking and being older, especially over 35, raise the risk too.",
        },
        {
          heading: "Treatment",
          body: "Because the pregnancy cannot continue, it needs to be removed or to end on its own. Sometimes doctors watch closely to see if it ends without treatment. Otherwise, treatment is an injection of a medicine called methotrexate to end the pregnancy, or keyhole surgery (laparoscopy) to remove it. Your care team will explain which option is safest for you.",
        },
        {
          heading: "After an ectopic pregnancy",
          body: "Losing a pregnancy this way can be very hard. Many people feel deep grief, and it is fine to ask for support. Many people who have had an ectopic pregnancy go on to have a healthy pregnancy later. If you get pregnant again, contact a doctor or nurse early and tell them about your past ectopic pregnancy, because it can happen again.",
        },
      ],
      notice: "This is general information. If you could be pregnant and have sudden severe tummy pain, shoulder-tip pain or feel very faint, get emergency help now.",
    },
  },
  {
    slug: "unplanned-pregnancy",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Planned Parenthood — Pregnancy options", href: "https://www.plannedparenthood.org/learn/pregnancy/pregnancy-options" },
      { label: "Healthdirect — Making decisions about unplanned pregnancies", href: "https://www.healthdirect.gov.au/making-decisions-about-pregnancy" },
      { label: "NHS — Doing a pregnancy test", href: "https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/" },
      { label: "NHS inform — Your options if you're pregnant", href: "https://www.nhsinform.scot/healthy-living/womens-health/middle-years-around-25-to-50-years/sexual-health-contraception-and-pregnancy-options/your-options-if-youre-pregnant/" },
    ],
    related: ["pregnancy-tests", "choosing-contraception", "healthy-pregnancy"],
    es: {
      title: "Embarazo no planificado: tus opciones",
      summary: "Si estás embarazada y no lo habías planeado, tienes opciones. La decisión es tuya, y un médico, una enfermera o una clínica pueden ayudarte a pensarlo.",
      sections: [
        {
          heading: "Primero, confirma el embarazo",
          body: "Si crees que podrías estar embarazada, una prueba de embarazo casera puede decírtelo desde el primer día de retraso del periodo. Un resultado positivo casi siempre es correcto. El siguiente paso es ver a un médico o una enfermera, o ir a un centro de salud sexual o de planificación familiar. Allí pueden confirmar el embarazo y ayudarte a calcular de cuántas semanas estás. Esto importa porque algunas opciones dependen de lo avanzado que esté el embarazo.",
        },
        {
          heading: "Tus opciones",
          body: "Hay tres opciones principales. Puedes continuar con el embarazo y criar al bebé, por tu cuenta o con una pareja. Puedes continuar con el embarazo y dar al bebé en adopción, para que otra persona o familia lo críe de forma permanente. En algunos lugares, el bebé también puede quedar al cuidado de una familia de acogida o de familiares (acogimiento en familia extensa). O puedes tener un aborto inducido (interrupción del embarazo), que pone fin al embarazo con medicamentos o con un procedimiento médico.",
        },
        {
          heading: "La decisión es tuya",
          body: "Esta decisión es personal, y no hay dos situaciones iguales. Tú eres la persona más indicada para decidir qué es lo mejor para ti, y nadie debería presionarte en ningún sentido. A muchas personas les ayuda hablar con alguien de confianza, como su pareja, una amistad o un familiar, pero no tienes por qué hacerlo. Si alguien te está presionando o no te sientes a salvo, díselo a un médico, una enfermera o una clínica. Tómate el tiempo que necesites, teniendo en cuenta que los plazos pueden influir en qué opciones tienes disponibles.",
        },
        {
          heading: "Dónde pedir consejo",
          body: "Un médico, una enfermera o un centro de salud sexual o de planificación familiar pueden darte información precisa sobre todas tus opciones. Puedes preguntarles cómo protegen la confidencialidad de lo que les cuentas. Algunos servicios solo hablan de algunas opciones, así que puede ayudarte elegir uno que te explique todas sin juzgarte. Las leyes y los servicios de atención al embarazo, adopción y aborto cambian de un país a otro, y a veces dentro de un mismo país, así que la información local es importante.",
        },
        {
          heading: "Cuidarte",
          body: "Decidas lo que decidas, el apoyo emocional y práctico puede ayudarte. Si sigues con el embarazo, empieza el control prenatal lo antes posible. Si es posible que estés embarazada, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del vientre, en un lado, o cualquier sangrado. Pide ayuda de emergencia (por ejemplo, 911 en México o 112 en España) si tienes un dolor de vientre repentino e intenso, dolor en la punta del hombro, un sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo ectópico.",
        },
      ],
      notice: "Esta es información general, no un consejo sobre qué elegir. Para recibir apoyo, habla con un médico, una enfermera o un centro de salud sexual o de planificación familiar.",
    },
    en: {
      title: "Unplanned pregnancy: your options",
      summary: "If you are pregnant and did not plan to be, you have options. The decision is yours, and a doctor, nurse or clinic can help you think it through.",
      sections: [
        {
          heading: "First, confirm the pregnancy",
          body: "If you think you might be pregnant, a home pregnancy test can tell you from the first day of a missed period. A positive result is almost always correct. The next step is to see a doctor or nurse, or visit a sexual-health or family-planning clinic. They can confirm the pregnancy and help work out how many weeks pregnant you are. This matters because some options depend on how far along the pregnancy is.",
        },
        {
          heading: "Your options",
          body: "There are three main options. You can continue the pregnancy and raise the child, alone or with a partner. You can continue the pregnancy and place the child for adoption, so that another person or family raises them permanently. In some places, the child can also be cared for by foster carers or by relatives (kinship care). Or you can have an abortion, which ends the pregnancy with medicine or a medical procedure.",
        },
        {
          heading: "The decision is yours",
          body: "This choice is personal, and no two situations are the same. You are the best person to decide what is right for you, and no one should pressure you either way. Many people find it helps to talk to someone they trust, such as a partner, friend or family member, but you do not have to. If someone is pressuring you or you do not feel safe, tell a doctor, nurse or clinic. Take the time you need, while keeping in mind that timing can affect which options are open to you.",
        },
        {
          heading: "Where to get advice",
          body: "A doctor, nurse, or a sexual-health or family-planning clinic can give you accurate information about all your options. You can ask them how they keep what you tell them private. Some services only discuss some options, so it can help to choose one that will talk you through all of them without judgement. Laws and services for pregnancy care, adoption and abortion differ from country to country, and sometimes within a country, so local advice matters.",
        },
        {
          heading: "Looking after yourself",
          body: "Whatever you decide, emotional and practical support can help. If you continue the pregnancy, start prenatal care as soon as you can. If you could be pregnant, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of an ectopic pregnancy.",
        },
      ],
      notice: "This is general information, not advice on what to choose. For support, talk to a doctor, nurse or sexual-health or family-planning clinic.",
    },
  },
  {
    slug: "periods-after-birth",
    category: "pregnancy",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Natural family planning", href: "https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/" },
      { label: "CDC — Urgent maternal warning signs", href: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html" },
      { label: "NHS — Your body after the birth", href: "https://www.nhs.uk/pregnancy/labour-and-birth/your-body/" },
      { label: "Pregnancy, Birth and Baby — Periods after pregnancy", href: "https://www.pregnancybirthbaby.org.au/womens-health/postnatal-health/periods-after-pregnancy" },
    ],
    related: ["choosing-contraception", "postpartum-depression", "irregular-periods"],
    es: {
      title: "El periodo después del parto",
      summary: "Después del parto sangras durante unas semanas, pero no es un periodo. El periodo puede volver en pocas semanas o tras muchos meses, según cómo alimentes a tu bebé.",
      sections: [
        {
          heading: "El sangrado después del parto no es un periodo",
          body: "Después de dar a luz, sangras por la vagina durante unas semanas. Este sangrado (loquios) es abundante y de color rojo intenso al principio, así que necesitarás compresas o toallas sanitarias de máxima absorción. En las semanas siguientes se vuelve más ligero, pasa a un tono marrón y luego se detiene. Es una parte normal de la recuperación y es distinto de tu primer periodo. Usa compresas, no tampones, hasta después de tu revisión, unas 6 semanas después del parto, porque los tampones pueden aumentar la probabilidad de infección.",
        },
        {
          heading: "Cuándo vuelve el periodo",
          body: "Si das el biberón, o combinas el biberón con la lactancia materna, tu primer periodo podría llegar ya a las 5 o 6 semanas del parto. Si solo das el pecho, puede que el periodo no vuelva durante varios meses y, en algunas personas que siguen dando el pecho, no hasta 1 o 2 años después. Puede que tus periodos no sean como antes del embarazo, y el dolor menstrual puede sentirse distinto. Si han cambiado y te preocupa, habla con un médico o una enfermera. Registrar tu sangrado en Ciclo puede ayudarte a ver cuándo vuelven tus periodos.",
        },
        {
          heading: "Puede haber embarazo antes del primer periodo",
          body: "Es posible un nuevo embarazo ya a las 3 semanas del parto, aunque estés dando el pecho y el periodo no haya vuelto. Esto se debe a que tu cuerpo puede liberar un óvulo antes de que vuelva tu primer periodo. Si no quieres un embarazo, empieza a usar un método anticonceptivo en los 21 días siguientes al parto. Un médico, una enfermera o una matrona o partera pueden ayudarte a elegir un método que te convenga, también durante la lactancia.",
        },
        {
          heading: "La lactancia como método anticonceptivo",
          body: "La lactancia puede ayudar a prevenir un embarazo, pero solo en condiciones estrictas. Se llama método de la amenorrea de la lactancia (MELA). Solo funciona si se cumplen todas estas condiciones: tu bebé tiene menos de 6 meses, tu periodo no ha vuelto y tu bebé solo toma leche materna, sin leche de fórmula ni comida sólida. Además, tienes que dar el pecho al menos cada 4 horas durante el día y cada 6 horas por la noche. Con el uso típico es eficaz en un 98%, lo que significa que unas 2 de cada 100 mujeres tienen un embarazo en un plazo de 6 meses. Si cambia alguna condición, necesitas otro método.",
        },
        {
          heading: "Sangrado abundante después del parto",
          body: "Pide ayuda de emergencia (por ejemplo, 911 en México o 112 en España) si el sangrado se vuelve de repente mucho más abundante o es muy abundante, sobre todo si sientes que te vas a desmayar o el corazón te late muy rápido. Ponte en contacto con tu matrona o partera o con tu médico ese mismo día si empapas una compresa cada 1 o 2 horas, expulsas coágulos grandes o el sangrado vuelve a ser de color rojo intenso. A menudo se ofrece una revisión unas 6 semanas después del parto.",
        },
        {
          heading: "Otras señales de alarma en el primer año",
          body: "Durante el año siguiente al parto, busca atención médica de inmediato si tienes fiebre de 38°C o más, un dolor de vientre intenso que no se va, dolor en el pecho, dificultad para respirar, o una pierna con dolor, enrojecida o hinchada. Haz lo mismo si tienes un dolor de cabeza que no se va o empeora, cambios en la vista, o una hinchazón extrema de las manos o la cara. Di que tuviste un parto hace poco. Si tienes pensamientos de hacerte daño a ti o a tu bebé, pide ayuda de emergencia ahora: llama al número de emergencias de tu país o a una línea de ayuda en crisis de tu país.",
        },
      ],
      notice: "Esta es información general. Si el sangrado después del parto se vuelve de repente más abundante o te encuentras mal, ponte en contacto con tu matrona o partera o con tu médico, o pide ayuda de emergencia.",
    },
    en: {
      title: "Periods after giving birth",
      summary: "After birth you bleed for a few weeks, but this is not a period. Periods can return within weeks or after many months, depending on how you feed your baby.",
      sections: [
        {
          heading: "Bleeding after birth is not a period",
          body: "After you give birth, you bleed from your vagina for a few weeks. This bleeding (lochia) is heavy and bright red at first, so you will need super-absorbent pads. Over the following weeks it gets lighter, turns brownish and then stops. This is a normal part of recovery and is different from your first period. Use pads, not tampons, until after your check-up about 6 weeks after the birth, because tampons can raise the chance of infection.",
        },
        {
          heading: "When periods come back",
          body: "If you bottle feed, or combine bottle feeding with breastfeeding, your first period could come as soon as 5 to 6 weeks after the birth. If you breastfeed only, your periods may not return for several months, and for some people who keep breastfeeding, not for 1 to 2 years. Your periods may not be the same as before pregnancy, and period pain may feel different. If they have changed and you are worried, talk to a doctor or nurse. Logging your bleeding in Ciclo can help you see when your periods return.",
        },
        {
          heading: "You can get pregnant before your first period",
          body: "You can get pregnant again as early as 3 weeks after the birth, even if you are breastfeeding and your periods have not come back. This is because your body can release an egg before your first period comes back. If you do not want to get pregnant, start contraception within 21 days of the birth. A doctor, nurse or midwife can help you choose a method that suits you, including while breastfeeding.",
        },
        {
          heading: "Breastfeeding as contraception",
          body: "Breastfeeding can help prevent pregnancy, but only under strict conditions. This is called the lactational amenorrhoea method. It only works if all of these are true: your baby is under 6 months old, your periods have not come back, and your baby has only breast milk, with no formula or solid food. You also need to breastfeed at least every 4 hours in the day and every 6 hours at night. With typical use it is 98% effective, meaning about 2 in 100 women get pregnant within 6 months. If any condition changes, you need another method.",
        },
        {
          heading: "Heavy bleeding after birth",
          body: "Get emergency help if your bleeding suddenly gets much heavier or is very heavy, especially if you feel faint or your heart is racing. Contact your midwife or doctor the same day if you soak a pad every 1 to 2 hours, pass large clots, or your bleeding turns bright red again. A check-up is often offered about 6 weeks after the birth.",
        },
        {
          heading: "Other warning signs in the first year",
          body: "In the year after birth, get medical help straight away if you have a fever of 38°C or higher, severe tummy pain that does not go away, chest pain, trouble breathing, or a painful, red or swollen leg. Do the same for a headache that will not go away or gets worse, changes in your vision, or extreme swelling of your hands or face. Say that you gave birth recently. If you have thoughts of harming yourself or your baby, get emergency help or contact a crisis line now.",
        },
      ],
      notice: "This is general information. If your bleeding after birth suddenly gets heavier or you feel unwell, contact your midwife or doctor, or get emergency help.",
    },
  },
];
