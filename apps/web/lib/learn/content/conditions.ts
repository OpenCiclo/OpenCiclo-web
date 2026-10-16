// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const CONDITIONS_ARTICLES: LearnArticle[] = [
  {
    slug: "pcos",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Polyendocrine metabolic ovarian syndrome (PMOS)", href: "https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/" },
      { label: "Office on Women's Health — Polycystic ovary syndrome", href: "https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome" },
    ],
    related: ["irregular-periods", "infertility", "hormonal-acne"],
    es: {
      title: "SOP (ahora también llamado PMOS)",
      summary: "El síndrome de ovario poliquístico (SOP) es una afección hormonal frecuente que puede causar periodos irregulares, acné y exceso de vello. Sus síntomas se pueden controlar, y muchas personas con SOP aun así pueden lograr un embarazo.",
      sections: [
        {
          heading: "Qué es el SOP",
          body: "El síndrome de ovario poliquístico (SOP) es una afección frecuente relacionada con un desequilibrio de hormonas. El sistema público de salud del Reino Unido (NHS) ahora lo llama síndrome ovárico metabólico poliendocrino (PMOS), así que puedes ver cualquiera de los dos nombres. Afecta a alrededor de 1 de cada 10 mujeres en edad fértil. Puede empezar a cualquier edad después de la pubertad, pero la mayoría de las personas descubren que lo tienen cuando tienen veintitantos o treinta y tantos años. No se conoce la causa, pero los problemas con la forma en que el cuerpo usa la insulina y la testosterona parecen influir. Es más probable si un familiar cercano lo tiene o si eres de origen asiático.",
        },
        {
          heading: "Señales frecuentes",
          body: "Muchas personas tienen periodos irregulares, con mucho tiempo entre uno y otro, o les faltan periodos. Los niveles más altos de hormonas de tipo masculino (andrógenos), como la testosterona, pueden causar más vello en la cara, el mentón o el cuerpo (hirsutismo). También pueden hacer que el pelo de la cabeza se vuelva más escaso, y causar piel grasa y acné. Algunas personas suben de peso con facilidad o les cuesta bajar de peso. Otras notan zonas de piel gruesa y oscura en el cuello, las axilas o las ingles, sienten mucho cansancio o tienen el ánimo bajo o ansiedad.",
        },
        {
          heading: "Cómo se diagnostica",
          body: "Un médico te preguntará por tus periodos y tus síntomas, y puede que te revise. Los análisis de sangre pueden medir tus niveles de hormonas y la resistencia a la insulina, que es cuando tu cuerpo no responde bien a la insulina. Una ecografía permite ver tus ovarios. Una vez descartadas otras causas, el SOP suele diagnosticarse si tienes al menos dos de estas tres cosas: periodos irregulares, signos o análisis de sangre que muestran niveles altos de andrógenos, y muchos quistes pequeños en uno o ambos ovarios. Esto significa que puedes tener SOP sin quistes.",
        },
        {
          heading: "Salud a largo plazo",
          body: "El SOP se asocia a un mayor riesgo de diabetes tipo 2, presión arterial alta, colesterol poco saludable y enfermedades del corazón. La Oficina para la Salud de la Mujer de Estados Unidos (Office on Women's Health) indica que más de la mitad de las mujeres con SOP desarrollan diabetes o prediabetes antes de los 40 años. También hay más riesgo de cáncer de útero (matriz), de hígado graso y de apnea del sueño, en la que la respiración se detiene y se reanuda mientras duermes. Conocer estos riesgos te ayuda a ti y a tu médico a vigilarlos.",
        },
        {
          heading: "Tratamiento y qué ayuda",
          body: "El tratamiento busca aliviar los síntomas que más te molestan. Una alimentación equilibrada y el ejercicio regular ayudan a muchas personas. Si tienes sobrepeso, perder alrededor de una décima parte de tu peso corporal puede hacer que los periodos sean más regulares y mejorar las probabilidades de embarazo. Los anticonceptivos hormonales, como la píldora anticonceptiva combinada, pueden ayudar con los periodos irregulares. Otros medicamentos pueden reducir el exceso de vello o el acné, y a veces se usa la metformina, un medicamento para la diabetes. El SOP es una causa frecuente de problemas de fertilidad, pero tiene tratamiento. Pueden ayudar los medicamentos para la fertilidad, como el clomifeno, o una pequeña operación en los ovarios.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus ciclos duran a menudo menos de 24 días o más de 38 días. Consulta también si llevas 3 meses sin periodo y no estás embarazada ni amamantando. Pide también una revisión si el exceso de vello o el acné te molestan, si te cuesta lograr un embarazo o si tienes el ánimo bajo. Registrar tus periodos en Ciclo durante unos meses puede ayudarte a mostrarle a tu médico cuánto duran tus ciclos.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Solo un médico puede diagnosticar el SOP, así que habla con uno si tus periodos son irregulares o si algo te preocupa.",
    },
    en: {
      title: "PCOS (now also called PMOS)",
      summary: "PCOS is a common hormone condition that can cause irregular periods, acne and extra hair growth. Its symptoms can be managed, and many people with PCOS can still get pregnant.",
      sections: [
        {
          heading: "What PCOS is",
          body: "Polycystic ovary syndrome (PCOS) is a common condition linked to an imbalance of hormones. The NHS in the UK now calls it polyendocrine metabolic ovarian syndrome (PMOS), so you may see either name. It affects about 1 in 10 women of childbearing age. It can start at any age after puberty, but most people find out they have it in their 20s or 30s. The cause is not known, but problems with how the body uses insulin and testosterone seem to play a part. It is more likely if a close relative has it or if you are from an Asian background.",
        },
        {
          heading: "Common signs",
          body: "Many people have irregular periods, with long gaps between them, or miss periods. Higher levels of male-type hormones (androgens), such as testosterone, can cause extra hair on the face, chin or body (hirsutism). They can also cause thinning hair on the head, oily skin and acne. Some people gain weight easily or find it hard to lose weight. Others notice thick, dark patches of skin on the neck, armpits or groin, feel very tired, or have low mood or anxiety.",
        },
        {
          heading: "How it is diagnosed",
          body: "A doctor will ask about your periods and symptoms and may examine you. Blood tests can check your hormone levels and insulin resistance, which is when your body does not respond well to insulin. An ultrasound scan can look at your ovaries. Once other causes have been ruled out, PCOS is usually diagnosed if you have at least two of these three: irregular periods, signs or blood test results showing high androgens, and many small cysts on one or both ovaries. This means you can have PCOS without cysts.",
        },
        {
          heading: "Long-term health",
          body: "PCOS is linked to a higher risk of type 2 diabetes, high blood pressure, unhealthy cholesterol and heart disease. The US Office on Women's Health says more than half of women with PCOS develop diabetes or prediabetes before age 40. There is also a higher risk of cancer of the womb (uterus), fatty liver disease, and sleep apnoea, where breathing stops and starts during sleep. Knowing the risks helps you and your doctor watch for them.",
        },
        {
          heading: "Treatment and what helps",
          body: "Treatment aims to ease the symptoms that bother you most. A balanced diet and regular exercise help many people. If you are overweight, losing about a tenth of your body weight can make periods more regular and improve the chance of pregnancy. Hormonal contraception, such as the combined pill, can help with irregular periods. Other medicines can reduce extra hair or acne, and metformin, a diabetes medicine, is sometimes used. PCOS is a common cause of fertility problems, but it is treatable. Fertility medicines such as clomifene, or a small operation on the ovaries, can help.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your cycles are often shorter than 24 days or longer than 38 days. Also see one if you have had no period for 3 months and are not pregnant or breastfeeding. Get checked too if extra hair or acne bothers you, if you are struggling to get pregnant, or if you feel low. Logging your periods in Ciclo for a few months can help you show your doctor how long your cycles are.",
        },
      ],
      notice: "This is general information, not a diagnosis. Only a doctor can diagnose PCOS, so talk to one if your periods are irregular or you are worried.",
    },
  },
  {
    slug: "endometriosis",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "WHO — Endometriosis", href: "https://www.who.int/news-room/fact-sheets/detail/endometriosis" },
      { label: "NHS — Endometriosis", href: "https://www.nhs.uk/conditions/endometriosis/" },
    ],
    related: ["period-pain", "adenomyosis", "painful-sex"],
    es: {
      title: "Endometriosis",
      summary: "La endometriosis es una afección crónica frecuente que puede causar un dolor menstrual intenso. A menudo tarda años en diagnosticarse, así que conocer las señales te ayuda a recibir la atención adecuada.",
      sections: [
        {
          heading: "Qué es la endometriosis",
          body: "La endometriosis es una afección en la que un tejido parecido al revestimiento del útero (matriz) crece fuera del útero. Este tejido causa hinchazón (inflamación) y tejido cicatricial. La Organización Mundial de la Salud (OMS) calcula que afecta a alrededor del 10% de las mujeres en edad reproductiva en todo el mundo, unos 190 millones de personas. Puede empezar en cualquier momento desde el primer periodo hasta la menopausia, y puede tenerla cualquier persona que tenga o haya tenido útero. No se conoce la causa.",
        },
        {
          heading: "Síntomas frecuentes",
          body: "El síntoma principal es el dolor. Puede ser un dolor menstrual intenso que te impide hacer tus actividades normales, o un dolor pélvico que continúa fuera del periodo. Otras señales son los periodos abundantes, el dolor durante o después del sexo, el dolor al defecar o al orinar, la hinchazón, las náuseas y un cansancio extremo. A algunas personas les cuesta lograr un embarazo. La endometriosis también puede afectar a tu salud mental, con problemas como la depresión y la ansiedad.",
        },
        {
          heading: "Por qué el diagnóstico puede tardar años",
          body: "La endometriosis puede ser difícil de diagnosticar. La OMS indica que el tiempo medio hasta el diagnóstico es de entre 4 y 12 años. Un médico te preguntará por tus periodos, el dolor y el sangrado, y puede que te revise. Puede que te hagan una ecografía o una resonancia magnética. Una operación mínimamente invasiva (laparoscopia), en la que se introduce una cámara fina por un pequeño corte, puede confirmarla. Pero no siempre necesitas una operación antes de empezar el tratamiento. Registrar tu sangrado, tus cólicos y otros síntomas en Ciclo durante unos ciclos puede ayudarte a describir con claridad lo que te pasa.",
        },
        {
          heading: "Tratamientos que pueden ayudar",
          body: "No tiene cura, pero el tratamiento puede aliviar el dolor y otros síntomas. Los analgésicos antiinflamatorios (AINE), como el ibuprofeno, pueden aliviar el dolor. Los tratamientos hormonales también pueden ayudar. Entre ellos están la píldora anticonceptiva combinada, el parche o el anillo vaginal, las opciones con progestágeno, como el DIU hormonal o la inyección anticonceptiva, y unos medicamentos llamados análogos de la GnRH. La cirugía puede extirpar las zonas de endometriosis y el tejido cicatricial. Habla con tu médico sobre qué opción te conviene, incluido si quieres lograr un embarazo en el futuro.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si crees que podrías tener endometriosis, o si tus síntomas afectan a tu vida diaria, tu trabajo o tus relaciones. Esto incluye el dolor menstrual que no mejora con analgésicos, el dolor que te impide ir a clase o al trabajo, y el dolor durante el sexo. Puede ayudar llevar un registro de tus síntomas y explicar con claridad cómo te afectan. Si tienes un dolor pélvico repentino e intenso, o un dolor intenso en un lado y podrías estar embarazada, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si el dolor menstrual te impide hacer tus actividades diarias, habla con un médico o una enfermera.",
    },
    en: {
      title: "Endometriosis",
      summary: "Endometriosis is a common long-term condition that can cause severe period pain. It often takes years to diagnose, so knowing the signs helps you get the right care.",
      sections: [
        {
          heading: "What endometriosis is",
          body: "Endometriosis is a condition where tissue similar to the lining of the womb (uterus) grows outside the womb. This tissue causes swelling (inflammation) and scar tissue. The World Health Organization (WHO) estimates that it affects about 10% of women of reproductive age worldwide, around 190 million people. It can start any time from the first period until menopause, and anyone who has or had a womb can get it. The cause is not known.",
        },
        {
          heading: "Common symptoms",
          body: "The main symptom is pain. This can be severe period pain that stops you doing your normal activities, or pelvic pain that carries on outside your period. Other signs include heavy periods, pain during or after sex, pain when you poo or pee, bloating, feeling sick and extreme tiredness. Some people find it hard to get pregnant. Endometriosis can also affect your mental health, including depression and anxiety.",
        },
        {
          heading: "Why diagnosis can take years",
          body: "Endometriosis can be hard to diagnose. WHO says the average time to diagnosis is between 4 and 12 years. A doctor will ask about your periods, pain and bleeding, and may examine you. You may have an ultrasound or MRI scan. A keyhole operation (laparoscopy), with a thin camera put in through a small cut, can confirm it. But you do not always need an operation before you start treatment. Logging your bleeding, cramps and other symptoms in Ciclo for a few cycles can help you describe clearly what is happening.",
        },
        {
          heading: "Treatments that can help",
          body: "There is no cure, but treatment can ease pain and other symptoms. Anti-inflammatory painkillers (NSAIDs) such as ibuprofen can ease pain. Hormone treatments can also help. These include the combined pill, patch or ring, progestogen options such as the hormonal IUD (coil) or the injection, and medicines called GnRH analogues. Surgery can remove patches of endometriosis and scar tissue. Talk with your doctor about which option suits you, including whether you want to get pregnant in the future.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if you think you might have endometriosis, or if your symptoms affect your daily life, work or relationships. This includes period pain that painkillers do not help, pain that stops you going to school or work, and pain during sex. It can help to bring a record of your symptoms and say clearly how they affect you. Get emergency help if you have sudden, severe pelvic pain, or severe pain on one side and you could be pregnant.",
        },
      ],
      notice: "This is general information, not a diagnosis. If period pain stops you doing everyday things, talk to a doctor or nurse.",
    },
  },
  {
    slug: "adenomyosis",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Adenomyosis", href: "https://www.nhs.uk/conditions/adenomyosis/" },
      { label: "Mayo Clinic — Adenomyosis: symptoms and causes", href: "https://www.mayoclinic.org/diseases-conditions/adenomyosis/symptoms-causes/syc-20369138" },
      { label: "Mayo Clinic — Endometrial ablation", href: "https://www.mayoclinic.org/tests-procedures/endometrial-ablation/about/pac-20393932" },
    ],
    related: ["heavy-periods", "endometriosis", "fibroids"],
    es: {
      title: "Adenomiosis",
      summary: "La adenomiosis ocurre cuando el revestimiento del útero crece dentro de su pared muscular. Puede causar periodos abundantes y dolorosos, y hay tratamientos que ayudan.",
      sections: [
        {
          heading: "Qué es la adenomiosis",
          body: "En la adenomiosis, el tejido del revestimiento del útero (endometrio) crece dentro de la capa muscular del útero (matriz). Esto puede hacer que el útero aumente de tamaño, y que notes la parte baja del vientre dolorida o pesada. No es lo mismo que la endometriosis, en la que un tejido parecido al revestimiento del útero crece fuera del útero. La causa no está clara. Se diagnostica con más frecuencia en mujeres mayores de 30 años, y es más probable si tienes más de 30 años y has dado a luz. Pero puede afectar a cualquier persona que tenga periodos. También se asocia a cirugías previas en el útero, como una cesárea.",
        },
        {
          heading: "Síntomas",
          body: "Algunas personas no tienen síntomas, o solo una molestia leve. Cuando hay síntomas, los más frecuentes son los periodos abundantes y los periodos dolorosos. El dolor puede ser tan intenso que te impida hacer tus actividades habituales. Algunas personas también tienen dolor pélvico que no desaparece entre periodos, dolor durante el sexo, o una sensación de hinchazón, pesadez o llenura en el vientre. Un sangrado muy abundante puede bajar tu hierro y causar anemia (no tener suficientes glóbulos rojos sanos), que puede hacerte sentir cansancio y falta de aire.",
        },
        {
          heading: "Cómo se diagnostica",
          body: "Si tienes síntomas, un médico te preguntará por tus periodos y puede que te revise. Una ecografía o una resonancia magnética pueden ayudar a detectar la adenomiosis. Registrar tu sangrado y tus cólicos en Ciclo durante unos ciclos puede ayudarte a mostrarle a un médico lo abundantes y dolorosos que son tus periodos.",
        },
        {
          heading: "Tratamientos que pueden ayudar",
          body: "Los analgésicos antiinflamatorios (AINE) pueden aliviar el dolor, y un medicamento llamado ácido tranexámico puede reducir el sangrado abundante. Los tratamientos hormonales también pueden ayudar. Entre ellos están el DIU hormonal, la píldora solo de progestágeno, la píldora anticonceptiva combinada y el parche anticonceptivo. La cirugía es otra opción. Puede consistir en eliminar el revestimiento del útero (ablación endometrial) o en extirpar el útero (histerectomía). Después de una histerectomía ya no puedes tener un embarazo. La ablación no se recomienda si quieres un embarazo en el futuro, y después de ella sigues necesitando anticoncepción. Habla antes con tu médico sobre tus planes. Los síntomas suelen desaparecer después de la menopausia.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus periodos son abundantes o largos, o si el dolor menstrual interfiere en tu vida diaria. Pide también una revisión si tienes dolor pélvico entre periodos, dolor durante el sexo, sangrado entre periodos o después del sexo, o hinchazón que dura unas 3 semanas. Pide una cita urgente si tu dolor es intenso o peor de lo habitual y los analgésicos no te han ayudado. Si tienes un sangrado muy abundante con mareo o desmayo, o un dolor pélvico repentino e intenso, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos son muy abundantes o dolorosos, habla con un médico o una enfermera.",
    },
    en: {
      title: "Adenomyosis",
      summary: "Adenomyosis is when the lining of the womb grows into its muscle wall. It can cause heavy, painful periods, and there are treatments that help.",
      sections: [
        {
          heading: "What adenomyosis is",
          body: "In adenomyosis, tissue from the womb lining (endometrium) grows into the muscle layer of the womb (uterus). This can make the womb bigger, which can make the lower tummy feel sore or heavy. It is not the same as endometriosis, where tissue like the womb lining grows outside the womb. The cause is not clear. It is most often diagnosed in women over 30, and it is more likely if you are over 30 and have given birth. But it can affect anyone who has periods. Past surgery on the womb, such as a caesarean section, is also linked to it.",
        },
        {
          heading: "Symptoms",
          body: "Some people have no symptoms, or only mild discomfort. When there are symptoms, the most common are heavy periods and painful periods. The pain can be severe enough to stop your usual activities. Some people also have pelvic pain that does not go away between periods, pain during sex, or a bloated, heavy or full feeling in the tummy. Very heavy bleeding can lower your iron and lead to anaemia (too few healthy red blood cells), which can make you tired and short of breath.",
        },
        {
          heading: "Getting a diagnosis",
          body: "If you have symptoms, a doctor will ask about your periods and may examine you. An ultrasound scan or an MRI scan can help show adenomyosis. Logging your bleeding and cramps in Ciclo for a few cycles can help you show a doctor how heavy and painful your periods are.",
        },
        {
          heading: "Treatments that can help",
          body: "Anti-inflammatory painkillers (NSAIDs) can ease pain, and a medicine called tranexamic acid can reduce heavy bleeding. Hormonal treatments can also help. These include the hormonal IUD (coil), the progestogen-only pill, the combined pill and the contraceptive patch. Surgery is another option. This can mean removing the lining of the womb (endometrial ablation) or removing the womb itself (hysterectomy). After a hysterectomy you cannot get pregnant. Ablation is not advised if you want a pregnancy in the future, and you still need contraception after it. Talk with your doctor about your plans first. Symptoms often go away after menopause.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your periods are heavy or long, or if period pain gets in the way of daily life. Also get checked if you have pelvic pain between periods, pain during sex, bleeding between periods or after sex, or bloating that lasts about 3 weeks. Get an urgent appointment if your pain is severe or worse than usual and painkillers have not helped. Get emergency help if you have very heavy bleeding with dizziness or fainting, or sudden, severe pelvic pain.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods are very heavy or painful, talk to a doctor or nurse.",
    },
  },
  {
    slug: "fibroids",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Fibroids", href: "https://www.nhs.uk/conditions/fibroids/" },
      { label: "Office on Women's Health — Uterine fibroids", href: "https://www.womenshealth.gov/a-z-topics/uterine-fibroids" },
    ],
    related: ["heavy-periods", "anemia", "adenomyosis"],
    es: {
      title: "Miomas",
      summary: "Los miomas son bultos frecuentes dentro o alrededor del útero que casi nunca son cáncer. Muchos no causan síntomas, pero algunos provocan periodos abundantes o dolorosos.",
      sections: [
        {
          heading: "Qué son los miomas",
          body: "Los miomas son bultos formados por músculo que se desarrollan dentro o alrededor del útero (matriz). Casi siempre son benignos (no son cáncer): menos de 1 de cada 1000 es cáncer. Pueden ser tan pequeños como una semilla o tan grandes como un pomelo (toronja), y puedes tener uno o varios. Los miomas son muy frecuentes. Se calcula que entre el 20% y el 80% de las mujeres los desarrollan antes de los 50 años. Afectan sobre todo a personas que no han llegado a la menopausia, y suelen encogerse después.",
        },
        {
          heading: "Quién tiene más probabilidades de tenerlos",
          body: "Los miomas son más frecuentes en mujeres de cuarenta y tantos años y a comienzos de los cincuenta. Es más probable que los tengas si tu madre u otro familiar cercano los tuvo. También son más frecuentes en mujeres negras y en mujeres de origen asiático. El sobrepeso también se asocia a una mayor probabilidad de tener miomas. Cualquier persona con útero puede tenerlos.",
        },
        {
          heading: "Síntomas",
          body: "Muchas personas con miomas no tienen síntomas y no saben que los tienen. Cuando los miomas causan síntomas, pueden incluir periodos abundantes o dolorosos, dolor en el vientre, dolor en la parte baja de la espalda y una sensación de llenura o hinchazón en la parte baja del vientre. Algunas personas necesitan orinar con más frecuencia o de repente, o les cuesta defecar. Otras tienen dolor o molestias durante el sexo. Con el tiempo, el sangrado abundante puede bajar tu hierro y causar anemia (no tener suficientes glóbulos rojos sanos).",
        },
        {
          heading: "Pruebas y medicamentos",
          body: "Un médico puede revisarte y pedir una ecografía. La ecografía muestra el número, el tamaño y la posición de los miomas. Si los miomas no causan síntomas, puede que no necesites ningún tratamiento. Para los periodos abundantes o dolorosos, pueden ayudar analgésicos como el ibuprofeno o el naproxeno. Otras opciones son un medicamento llamado ácido tranexámico, o medicamentos hormonales como la píldora anticonceptiva combinada o el DIU hormonal.",
        },
        {
          heading: "Cirugía y otros procedimientos",
          body: "Hay otras opciones que pueden reducir o eliminar los miomas. Entre ellas están una operación para extirpar solo los miomas (miomectomía), un procedimiento que bloquea el riego sanguíneo de los miomas (embolización de las arterias uterinas) y una operación para extirpar el útero (histerectomía). Algunos de estos tratamientos hacen que después no puedas tener un embarazo, y otros pueden hacer que un embarazo posterior tenga más riesgos. Si quizá quieras tener hijos en el futuro, habla de esto con tu médico antes de elegir un tratamiento.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tienes periodos abundantes o dolorosos, dolor en el vientre o en la parte baja de la espalda, necesidad frecuente de orinar o dolor durante el sexo. Los periodos abundantes incluyen cambiar la toalla higiénica (compresa) o el tampón cada 1 a 2 horas, o expulsar coágulos de más de unos 2.5 cm. Registrar tu sangrado en Ciclo puede ayudarte a describir lo abundantes que son tus periodos. El sangrado después de la menopausia siempre debe revisarlo un médico. Si tienes un sangrado muy abundante con mareo o desmayo, o un dolor repentino e intenso en el vientre o la pelvis, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos son abundantes o tienes dolor pélvico, habla con un médico o una enfermera.",
    },
    en: {
      title: "Fibroids",
      summary: "Fibroids are common growths in or around the womb that are almost never cancer. Many cause no symptoms, but some lead to heavy or painful periods.",
      sections: [
        {
          heading: "What fibroids are",
          body: "Fibroids are growths made of muscle that develop in or around the womb (uterus). They are almost always non-cancerous: fewer than 1 in 1,000 is cancer. They can be as small as a seed or as big as a grapefruit, and you can have one or several. Fibroids are very common. Estimates suggest that 20% to 80% of women develop them by age 50. They mainly affect people who have not reached menopause, and they usually shrink afterwards.",
        },
        {
          heading: "Who is more likely to get them",
          body: "Fibroids are most common in women in their 40s and early 50s. You are more likely to get them if your mother or another close relative had them. They are also more common in Black women and women from an Asian background. Being overweight is linked to a higher chance of fibroids too. Anyone with a womb can get them.",
        },
        {
          heading: "Symptoms",
          body: "Many people with fibroids have no symptoms and do not know they have them. When fibroids do cause symptoms, these can include heavy or painful periods, tummy pain, lower back pain, and a feeling of fullness or swelling in the lower tummy. Some people need to pee more often or suddenly, or have trouble pooing. Others have pain or discomfort during sex. Heavy bleeding over time can lower your iron and lead to anaemia (too few healthy red blood cells).",
        },
        {
          heading: "Tests and medicines",
          body: "A doctor may examine you and arrange an ultrasound scan. The scan shows the number, size and position of any fibroids. If fibroids are not causing symptoms, you may not need any treatment. For heavy or painful periods, painkillers such as ibuprofen or naproxen can help. Other options are a medicine called tranexamic acid, or hormonal medicines such as the combined pill or the hormonal IUD (coil).",
        },
        {
          heading: "Surgery and other procedures",
          body: "Other options can shrink or remove fibroids. These include an operation to remove only the fibroids (myomectomy), a procedure that blocks the blood supply to the fibroids (uterine artery embolisation), and an operation to remove the womb (hysterectomy). Some of these treatments mean you cannot get pregnant afterwards, and others can make a later pregnancy riskier. If you may want children in the future, talk with your doctor about this before choosing a treatment.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if you have heavy or painful periods, pain in your tummy or lower back, a frequent need to pee, or pain during sex. Heavy periods include changing a pad or tampon every 1 to 2 hours, or passing clots larger than about 2.5 cm. Tracking your bleeding in Ciclo can help you describe how heavy your periods are. Bleeding after menopause should always be checked by a doctor. Get emergency help if you have very heavy bleeding with dizziness or fainting, or sudden, severe pain in your tummy or pelvis.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods are heavy or you have pelvic pain, talk to a doctor or nurse.",
    },
  },
  {
    slug: "ovarian-cysts",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Ovarian cyst", href: "https://www.nhs.uk/conditions/ovarian-cyst/" },
      { label: "Office on Women's Health — Ovarian cysts", href: "https://www.womenshealth.gov/a-z-topics/ovarian-cysts" },
      { label: "MedlinePlus — Ovarian cysts", href: "https://medlineplus.gov/ovariancysts.html" },
    ],
    related: ["pcos", "endometriosis", "ectopic-pregnancy"],
    es: {
      title: "Quistes de ovario",
      summary: "Los quistes de ovario son sacos llenos de líquido en un ovario. La mayoría son inofensivos y desaparecen solos, pero unos pocos necesitan tratamiento y algunas señales requieren ayuda urgente.",
      sections: [
        {
          heading: "Qué son los quistes de ovario",
          body: "Un quiste de ovario es un saco lleno de líquido que se forma dentro o sobre un ovario. Son muy frecuentes, y la mayoría de las mujeres tienen uno en algún momento. El tipo más frecuente, llamado quiste funcional, se forma como parte del ciclo menstrual. Cada mes, un óvulo crece dentro de un pequeño saco (folículo). Se puede formar un quiste si el folículo no se abre para liberar el óvulo, o si el saco no se encoge después. Estos quistes suelen ser inofensivos y desaparecen en unos meses.",
        },
        {
          heading: "Otros tipos de quiste",
          body: "Con menos frecuencia, los quistes se forman porque las células crecen de una forma inusual. Se llaman quistes patológicos. Algunos quistes están relacionados con afecciones como la endometriosis. La mayoría de los quistes no son cáncer, pero el riesgo de que un quiste sea cáncer es mayor después de la menopausia. El síndrome de ovario poliquístico (SOP, ahora también llamado PMOS) es una afección diferente. Las personas con SOP pueden tener muchos quistes pequeños, además de periodos irregulares y niveles altos de hormonas como la testosterona.",
        },
        {
          heading: "Síntomas",
          body: "La mayoría de los quistes de ovario son pequeños y no causan síntomas. Puede que solo descubras que tienes uno durante una exploración interna (pélvica) o una prueba de imagen. Un quiste suele causar síntomas solo si es muy grande, se rompe o se retuerce, lo que puede cortar el riego sanguíneo del ovario. Los síntomas pueden incluir dolor pélvico en el lado del quiste, sensación de presión, hinchazón o el vientre abultado, necesidad de orinar a menudo, dolor durante el sexo y cambios en tus periodos.",
        },
        {
          heading: "Pruebas y tratamiento",
          body: "Una ecografía puede mostrar el tamaño de un quiste y su aspecto, y puede que te hagan análisis de sangre. Muchos quistes no necesitan tratamiento. Tu médico puede sugerirte esperar y repetir las ecografías para comprobar si el quiste ha desaparecido. Los anticonceptivos hormonales que detienen la ovulación pueden ayudar a prevenir nuevos quistes. Puede que necesites una operación si el quiste duele, dura mucho tiempo o ya has pasado la menopausia. Se puede hacer mediante pequeños cortes en el vientre (laparoscopia).",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta a un médico o una enfermera si tienes síntomas como dolor pélvico, hinchazón, dolor durante el sexo o cambios en tus periodos. Si tienes un dolor repentino e intenso en el vientre o la pelvis, busca ayuda de emergencia de inmediato: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias. Busca también ayuda de emergencia si tienes dolor con fiebre o vómitos, sensación de desmayo, mareo o debilidad, o si respiras rápido. Pueden ser señales de que un quiste se ha roto o retorcido. Si podrías estar embarazada, un dolor intenso en un lado también necesita ayuda de emergencia, porque puede ser una señal de un embarazo ectópico.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Un dolor pélvico repentino e intenso siempre necesita atención médica urgente.",
    },
    en: {
      title: "Ovarian cysts",
      summary: "Ovarian cysts are fluid-filled sacs on an ovary. Most are harmless and go away on their own, but a few need treatment and some signs need urgent help.",
      sections: [
        {
          heading: "What ovarian cysts are",
          body: "An ovarian cyst is a sac filled with fluid that forms in or on an ovary. They are very common, and most women have one at some point. The most common kind, called functional cysts, form as part of the menstrual cycle. Each month an egg grows inside a small sac (follicle). A cyst can form if the follicle does not open to release the egg, or if the sac does not shrink afterwards. These cysts are usually harmless and go away within a few months.",
        },
        {
          heading: "Other types of cyst",
          body: "Less often, cysts form because cells grow in an unusual way. These are called pathological cysts. Some cysts are linked to conditions such as endometriosis. Most cysts are not cancer, but the risk of a cyst being cancer is higher after menopause. Polycystic ovary syndrome (PCOS, now also called PMOS) is a different condition. People with PCOS can have many small cysts, along with irregular periods and high levels of hormones such as testosterone.",
        },
        {
          heading: "Symptoms",
          body: "Most ovarian cysts are small and cause no symptoms. You may only find out about one during an internal (pelvic) examination or a scan. A cyst usually causes symptoms only if it is very large, bursts (ruptures) or twists, which can block the blood supply to the ovary. Symptoms can include pelvic pain on the side of the cyst, a feeling of pressure, bloating or a swollen tummy, needing to pee often, pain during sex, and changes to your periods.",
        },
        {
          heading: "Tests and treatment",
          body: "An ultrasound scan can show the size of a cyst and what it looks like, and you may have blood tests. Many cysts need no treatment. Your doctor may suggest waiting and having repeat scans to check whether the cyst has gone. Hormonal contraception that stops ovulation can help prevent new cysts. You may need an operation if the cyst is painful, stays for a long time, or you have been through menopause. This may be done through small cuts in the tummy (laparoscopy).",
        },
        {
          heading: "When to get help",
          body: "See a doctor or nurse if you have symptoms such as pelvic pain, bloating, pain during sex or changes to your periods. Get emergency help straight away if you have sudden, severe pain in your tummy or pelvis. Also get emergency help if you have pain with a fever or vomiting, feel faint, dizzy or weak, or are breathing fast. These can be signs that a cyst has burst or twisted. If you could be pregnant, severe pain on one side needs emergency help too, as it can be a sign of an ectopic pregnancy.",
        },
      ],
      notice: "This is general information, not a diagnosis. Sudden, severe pelvic pain always needs urgent medical help.",
    },
  },
  {
    slug: "anemia",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Iron deficiency anaemia", href: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/" },
      { label: "NHLBI — Iron-deficiency anemia", href: "https://www.nhlbi.nih.gov/health/anemia/iron-deficiency-anemia" },
      { label: "NHS — Ferrous sulfate: how and when to take it", href: "https://www.nhs.uk/medicines/ferrous-sulfate/how-and-when-to-take-ferrous-sulfate/" },
    ],
    related: ["iron-rich-eating", "heavy-periods", "bleeding-disorders"],
    es: {
      title: "Anemia por falta de hierro",
      summary: "Los periodos abundantes son una de las causas más frecuentes de hierro bajo. Conoce las señales de la anemia por falta de hierro, cómo se detecta y cómo se trata.",
      sections: [
        {
          heading: "Qué es",
          body: "Tu cuerpo usa el hierro para fabricar hemoglobina, la parte de los glóbulos rojos que lleva el oxígeno por todo el cuerpo. Si no tienes suficiente hierro, no puedes fabricar suficientes glóbulos rojos sanos. Esto se llama anemia por falta de hierro (anemia ferropénica). Es el tipo de anemia más frecuente. A menudo se debe a la pérdida de sangre o al embarazo.",
        },
        {
          heading: "Cómo los periodos pueden bajar tu hierro",
          body: "Perder mucha sangre con el periodo cada mes es una de las causas principales, porque con la sangre pierdes hierro. Otras causas son el sangrado en el estómago o el intestino, por ejemplo por una úlcera o por tomar aspirina u otros analgésicos antiinflamatorios (AINE) con regularidad. Un médico buscará la causa, sobre todo si tus periodos no son abundantes, porque a veces hacen falta pruebas para detectar un sangrado oculto en el aparato digestivo. Algunas afecciones, como la celiaquía o la enfermedad de Crohn, hacen que al cuerpo le cueste más absorber el hierro. No obtener suficiente hierro de los alimentos también puede influir, sobre todo durante el embarazo.",
        },
        {
          heading: "Señales a las que prestar atención",
          body: "Las señales más frecuentes son cansancio y falta de energía, falta de aire, notar los latidos del corazón (palpitaciones), piel más pálida de lo habitual y dolores de cabeza. Algunas personas se marean o tienen las manos y los pies fríos. Señales menos frecuentes son la caída del pelo, la lengua dolorida, el picor en la piel, el zumbido en los oídos y las piernas inquietas. Algunas personas tienen ganas de comer cosas que no son alimentos, como hielo o papel (pica).",
        },
        {
          heading: "Pruebas",
          body: "Un médico o una enfermera suele pedir un análisis de sangre llamado hemograma completo. Muestra si tus glóbulos rojos y tu hemoglobina están bajos. Otros análisis de sangre pueden medir cuánto hierro hay en tu sangre y cuánto tiene almacenado tu cuerpo (ferritina). Dile al médico si tus periodos son abundantes. Registrar tu sangrado en Ciclo puede ayudarte a mostrar lo abundantes que son tus periodos.",
        },
        {
          heading: "Tratamiento",
          body: "El tratamiento habitual son las pastillas de hierro. Tómalas como te indique el médico, la enfermera o el farmacéutico o farmacéutica, y guárdalas fuera de la vista y del alcance de los niños, porque el exceso de hierro puede ser mortal para un niño. A menudo se tarda de 3 a 6 meses en reponer las reservas de hierro. Beber zumo (jugo) de naranja después de una pastilla puede ayudar a tu cuerpo a absorber el hierro. Intenta no tomar té, café, leche ni otros lácteos al mismo tiempo. Los efectos secundarios pueden incluir estreñimiento o diarrea, dolor de vientre, ardor de estómago, náuseas y heces más oscuras. Tomar las pastillas con comida o poco después de comer puede ayudar. A veces el hierro se pone directamente en una vena (por vía intravenosa), o hace falta una transfusión de sangre.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta a un médico o una enfermera si crees que podrías tener anemia, sobre todo si tus periodos son abundantes. Abundante significa cambiar la toalla higiénica (compresa) o el tampón cada 1 a 2 horas, usar dos productos a la vez o tener periodos que duran más de 7 días. Si la causa son los periodos abundantes, pregunta también por su tratamiento. Si tienes dolor en el pecho, sientes mucha falta de aire o tienes un sangrado muy abundante con mareo o desmayo, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si crees que tienes el hierro bajo, consulta a un médico o una enfermera para hacerte un análisis de sangre.",
    },
    en: {
      title: "Iron deficiency anaemia",
      summary: "Heavy periods are one of the most common causes of low iron. Learn the signs of iron deficiency anaemia, how it is tested and how it is treated.",
      sections: [
        {
          heading: "What it is",
          body: "Your body uses iron to make haemoglobin, the part of red blood cells that carries oxygen around your body. If you do not have enough iron, you cannot make enough healthy red blood cells. This is called iron deficiency anaemia. It is the most common type of anaemia. It is often caused by losing blood, or by pregnancy.",
        },
        {
          heading: "How periods can lower your iron",
          body: "Losing a lot of blood with your period each month is one of the main reasons, because you lose iron with the blood. Other causes include bleeding in the stomach or bowel, for example from an ulcer or from taking aspirin or other anti-inflammatory painkillers (NSAIDs) regularly. A doctor will look for the cause, especially if your periods are not heavy, because hidden bleeding in the gut sometimes needs tests. Some conditions, such as coeliac disease or Crohn's disease, make it harder for your body to absorb iron. Not getting enough iron from food can also play a part, especially in pregnancy.",
        },
        {
          heading: "Signs to look out for",
          body: "Common signs are tiredness and lack of energy, shortness of breath, a heartbeat you can feel (palpitations), paler skin than usual, and headaches. Some people feel dizzy or have cold hands and feet. Less common signs include hair loss, a sore tongue, itchy skin, ringing in the ears, and restless legs. Some people want to eat things that are not food, such as ice or paper (pica).",
        },
        {
          heading: "Tests",
          body: "A doctor or nurse will usually arrange a blood test called a full blood count. This shows whether your red blood cells and haemoglobin are low. Other blood tests can check how much iron is in your blood and how much your body has stored (ferritin). Tell the doctor if your periods are heavy. Logging your bleeding in Ciclo can help you show how heavy your periods are.",
        },
        {
          heading: "Treatment",
          body: "Iron tablets are the usual treatment. Take them as your doctor, nurse or pharmacist advises, and keep them out of sight and reach of children, because too much iron can be fatal for a child. It often takes 3 to 6 months to refill your iron stores. Drinking orange juice after a tablet may help your body absorb the iron. Try not to have tea, coffee, milk or other dairy foods around the same time. Side effects can include constipation or diarrhoea, tummy pain, heartburn, feeling sick and darker poo. Taking tablets with or soon after food may help. Sometimes iron is given through a drip into a vein, or a blood transfusion is needed.",
        },
        {
          heading: "When to get help",
          body: "See a doctor or nurse if you think you might have anaemia, especially if your periods are heavy. Heavy means changing a pad or tampon every 1 to 2 hours, using two products at once, or periods lasting more than 7 days. If heavy periods are the cause, ask about treatment for them too. Get emergency help if you have chest pain, feel very short of breath, or have very heavy bleeding with dizziness or fainting.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you think your iron is low, see a doctor or nurse for a blood test.",
    },
  },
  {
    slug: "thyroid-and-periods",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Thyroid disease", href: "https://www.womenshealth.gov/a-z-topics/thyroid-disease" },
      { label: "NHS — Underactive thyroid (hypothyroidism)", href: "https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/" },
      { label: "NHS — Overactive thyroid (hyperthyroidism)", href: "https://www.nhs.uk/conditions/overactive-thyroid-hyperthyroidism/" },
    ],
    related: ["irregular-periods", "heavy-periods", "early-menopause"],
    es: {
      title: "Problemas de tiroides y tu ciclo",
      summary: "La tiroides ayuda a controlar cómo usa tu cuerpo la energía, y también influye en tus periodos. Tener demasiada o muy poca hormona tiroidea puede hacer que los periodos sean más ligeros, más abundantes o irregulares.",
      sections: [
        {
          heading: "Qué hace la tiroides",
          body: "La tiroides es una glándula pequeña con forma de mariposa que está en la parte delantera del cuello. Fabrica hormonas que controlan tu metabolismo, lo que incluye lo rápido que tu cuerpo usa la energía y lo rápido que late tu corazón. Los problemas de tiroides son frecuentes en las mujeres: alrededor de 1 de cada 8 tendrá uno a lo largo de su vida. Una tiroides poco activa (hipotiroidismo) produce muy poca hormona. Una tiroides hiperactiva (hipertiroidismo) produce demasiada.",
        },
        {
          heading: "Cómo puede cambiar tus periodos",
          body: "Unos niveles de hormona tiroidea demasiado altos o demasiado bajos pueden cambiar tus periodos. Pueden volverse mucho más ligeros, mucho más abundantes o irregulares. Una tiroides poco activa puede causar periodos irregulares o abundantes. Los problemas de tiroides también pueden hacer que los periodos se detengan durante varios meses o más (amenorrea). Cuando tu ciclo se ve afectado, la ovulación (la liberación de un óvulo) también se ve afectada, así que puede costar más lograr un embarazo. Las enfermedades de la tiroides también se asocian a que los ovarios dejen de funcionar antes de los 40 años (insuficiencia ovárica prematura).",
        },
        {
          heading: "Señales de una tiroides poco activa",
          body: "Los síntomas suelen aparecer poco a poco y empeorar con el tiempo. Pueden incluir mucho cansancio, tener frío cuando los demás no lo tienen, aumento de peso, estreñimiento, ánimo bajo, piel seca, pelo seco o más escaso, voz ronca y dificultad para concentrarte. En Estados Unidos, la causa más frecuente es una afección llamada enfermedad de Hashimoto. Es más frecuente en mujeres y suele empezar entre los 30 y los 50 años.",
        },
        {
          heading: "Señales de una tiroides hiperactiva",
          body: "La tiroides hiperactiva es unas 10 veces más frecuente en mujeres que en hombres, y suele empezar entre los 20 y los 40 años. Las señales incluyen nerviosismo, ansiedad o irritabilidad, dificultad para dormir y latidos rápidos o irregulares. También puedes tener temblor en las manos, sudar más, soportar mal el calor, sentir cansancio o perder peso aunque comas lo mismo de siempre. Algunas personas tienen una hinchazón en el cuello. La causa más frecuente es la enfermedad de Graves, en la que el sistema inmunitario hace que la tiroides produzca demasiada hormona.",
        },
        {
          heading: "Pruebas y tratamiento",
          body: "Un análisis de sangre puede mostrar si tu tiroides funciona bien. Mide la hormona estimulante de la tiroides (TSH) y, a veces, la hormona tiroidea (T4). La tiroides poco activa suele tratarse con pastillas que reponen la hormona que falta. La mayoría de las personas las toman de por vida, con análisis de sangre periódicos para comprobar la dosis. La tiroides hiperactiva se puede tratar con medicamentos que impiden que la tiroides fabrique demasiada hormona, con yodo radiactivo (un tipo de radioterapia) o con cirugía para extirpar parte o toda la tiroides.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus periodos cambian, por ejemplo si se vuelven mucho más abundantes, más ligeros o irregulares, sobre todo si también tienes otras señales de un problema de tiroides. Pide también una revisión si llevas 3 meses sin periodo y no estás embarazada ni amamantando, o si te está costando lograr un embarazo. Si tienes una afección de la tiroides y estás embarazada o planeas un embarazo, díselo a tu equipo médico, porque los problemas de tiroides en el embarazo pueden afectarte a ti y a tu bebé. Registrar tus periodos y síntomas en Ciclo puede ayudar a mostrar qué ha cambiado. Si tienes una tiroides hiperactiva y tus síntomas empeoran mucho de repente, busca ayuda de emergencia, porque puede ser una crisis poco frecuente pero potencialmente mortal: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos cambian y además te encuentras mal, pregunta a un médico o una enfermera por un análisis de sangre de la tiroides.",
    },
    en: {
      title: "Thyroid problems and your cycle",
      summary: "Your thyroid helps control how your body uses energy, and it affects your periods too. Too much or too little thyroid hormone can make periods lighter, heavier or irregular.",
      sections: [
        {
          heading: "What the thyroid does",
          body: "The thyroid is a small, butterfly-shaped gland at the front of your neck. It makes hormones that control your metabolism, which includes how fast your body uses energy and how fast your heart beats. Thyroid problems are common in women: about 1 in 8 women will have one during their life. An underactive thyroid (hypothyroidism) makes too little hormone. An overactive thyroid (hyperthyroidism) makes too much.",
        },
        {
          heading: "How it can change your periods",
          body: "Thyroid hormone levels that are too high or too low can change your periods. They may become much lighter, much heavier or irregular. An underactive thyroid can cause irregular or heavy periods. Thyroid problems can also make periods stop for several months or longer (amenorrhoea). When your cycle is affected, ovulation (the release of an egg) is affected too, so it can be harder to get pregnant. Thyroid disease is also linked to the ovaries stopping working before age 40 (premature ovarian insufficiency).",
        },
        {
          heading: "Signs of an underactive thyroid",
          body: "Symptoms usually come on slowly and get worse over time. They can include feeling very tired, feeling cold when others do not, weight gain, constipation, low mood, dry skin, dry or thinning hair, a hoarse voice and trouble concentrating. In the United States, the most common cause is a condition called Hashimoto's disease. It is most common in women and usually starts between the ages of 30 and 50.",
        },
        {
          heading: "Signs of an overactive thyroid",
          body: "An overactive thyroid is about 10 times more common in women than men, and it usually starts between ages 20 and 40. Signs include feeling nervous, anxious or irritable, trouble sleeping and a fast or irregular heartbeat. You may also have shaking hands, sweat more, find heat hard to cope with, feel tired, or lose weight even when you eat as much as usual. Some people have a swelling in the neck. The most common cause is Graves' disease, where the immune system makes the thyroid produce too much hormone.",
        },
        {
          heading: "Tests and treatment",
          body: "A blood test can show how well your thyroid is working. It measures thyroid-stimulating hormone (TSH) and sometimes thyroid hormone (T4). An underactive thyroid is usually treated with tablets that replace the missing hormone. Most people take them for life, with regular blood tests to check the dose. An overactive thyroid can be treated with medicines that stop the thyroid making too much hormone, with radioiodine treatment (a type of radiotherapy), or with surgery to remove some or all of the thyroid.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your periods change, for example becoming much heavier, lighter or irregular, especially if you also have other signs of a thyroid problem. Also get checked if you have had no period for 3 months and are not pregnant or breastfeeding, or if you are finding it hard to get pregnant. If you have a thyroid condition and are pregnant or planning a pregnancy, tell your care team, as thyroid problems in pregnancy can affect you and your baby. Tracking your periods and symptoms in Ciclo can help show what has changed. If you have an overactive thyroid and your symptoms suddenly get much worse, get emergency help, as this can be a rare but life-threatening flare-up.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods change and you also feel unwell, ask a doctor or nurse about a thyroid blood test.",
    },
  },
  {
    slug: "bleeding-disorders",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "CDC — Signs and symptoms of bleeding disorders in women", href: "https://www.cdc.gov/female-blood-disorders/signs-symptoms/index.html" },
      { label: "CDC — About von Willebrand disease", href: "https://www.cdc.gov/von-willebrand/about/index.html" },
      { label: "CDC — Bleeding disorders in women", href: "https://www.cdc.gov/ncbddd/blooddisorders/women/index.html" },
    ],
    related: ["heavy-periods", "anemia", "when-to-see-a-doctor"],
    es: {
      title: "Trastornos de la coagulación",
      summary: "Los periodos muy abundantes a veces se deben a que la sangre no coagula tan bien como debería. Conocer las señales de un trastorno de la coagulación puede ayudarte a hacerte pruebas y recibir tratamiento.",
      sections: [
        {
          heading: "Qué es un trastorno de la coagulación",
          body: "Cuando sangras, tu sangre forma un coágulo para detener el sangrado. En un trastorno de la coagulación, esto no funciona tan bien como debería, así que el sangrado puede ser más abundante o durar más. El trastorno de la coagulación más frecuente en las mujeres es la enfermedad de von Willebrand. En esta afección, el cuerpo no tiene suficiente cantidad de una proteína que ayuda a coagular la sangre, o la proteína no funciona bien. Casi siempre se hereda de la madre o del padre. Afecta por igual a hombres y mujeres, pero las mujeres suelen notarla por los periodos abundantes o por un sangrado abundante después del parto. Otros tipos incluyen problemas con las plaquetas, las pequeñas células de la sangre que ayudan a formar coágulos.",
        },
        {
          heading: "Con qué frecuencia ocurre",
          body: "En Estados Unidos, hasta 1 de cada 100 mujeres podría tener un trastorno de la coagulación, y muchas no lo saben. La mayoría de las personas con enfermedad de von Willebrand tienen el tipo más leve. Como tantas personas no lo saben, vale la pena conocer las señales, sobre todo si tus periodos son abundantes.",
        },
        {
          heading: "Señales en tus periodos",
          body: "Los periodos abundantes son una señal clave. Tu sangrado puede ser demasiado abundante si tu periodo dura más de 7 días. También puede serlo si empapas una toalla higiénica (compresa) o un tampón cada 1 a 2 horas en tus días más abundantes, expulsas coágulos de más de unos 2.5 cm o tienes sangrados tan fuertes que se desbordan y limitan lo que puedes hacer. Que te hayan dicho que tienes el hierro bajo, o haber recibido tratamiento para la anemia, es otra pista. Un sangrado abundante después de dar a luz también puede ser una señal.",
        },
        {
          heading: "Otras señales a las que prestar atención",
          body: "Presta atención a los sangrados de nariz que empiezan sin una causa clara y duran más de 10 minutos, y a los moretones que salen con facilidad sin un golpe. Otra señal es un sangrado abundante después de un tratamiento dental, una cirugía u otro procedimiento médico. También lo es el sangrado dentro de los músculos o las articulaciones sin una lesión. También importa tener un familiar con un trastorno de la coagulación, como la enfermedad de von Willebrand o la hemofilia.",
        },
        {
          heading: "Pruebas y tratamiento",
          body: "Un médico te preguntará por tus antecedentes de sangrado y los de tu familia, y puede pedir análisis de sangre que miden lo bien que coagula tu sangre. Los trastornos de la coagulación no tienen cura, pero el tratamiento puede mantener el sangrado bajo control y prevenir problemas. Para la enfermedad de von Willebrand, las opciones incluyen un medicamento llamado desmopresina, medicamentos que frenan la disolución de los coágulos, como el ácido tranexámico, la reposición de la proteína de la coagulación que falta y la píldora anticonceptiva para que los periodos sean más ligeros. Algunos analgésicos pueden afectar a la coagulación, así que pregunta a un médico o a un farmacéutico o farmacéutica cuáles son seguros para ti.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Habla con un médico o una enfermera si tienes una o más de estas señales. Registrar en Ciclo lo abundantes que son tus periodos y cuánto duran puede ayudarte a describir tu sangrado. Si sabes que tienes un trastorno de la coagulación, díselo a tu equipo médico antes de una cirugía, un tratamiento dental o el parto. Si tienes un sangrado muy abundante con mareo o desmayo, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos son muy abundantes, o te salen moretones o sangras con facilidad, habla con un médico o una enfermera.",
    },
    en: {
      title: "Bleeding disorders",
      summary: "Very heavy periods are sometimes caused by blood that does not clot as well as it should. Knowing the signs of a bleeding disorder can help you get tested and treated.",
      sections: [
        {
          heading: "What a bleeding disorder is",
          body: "When you bleed, your blood forms a clot to stop the bleeding. In a bleeding disorder, this does not work as well as it should, so bleeding can be heavier or last longer. The most common bleeding disorder in women is von Willebrand disease. In this condition, the body does not have enough of a protein that helps blood clot, or the protein does not work properly. It is almost always passed down from a parent. It affects men and women equally, but women often notice it because of heavy periods or heavy bleeding after childbirth. Other types include problems with platelets, the tiny blood cells that help form clots.",
        },
        {
          heading: "How common it is",
          body: "In the United States, as many as 1 in 100 women may have a bleeding disorder, and many do not know they have one. Most people with von Willebrand disease have the mildest type. Because so many people are unaware, it is worth knowing the signs, especially if your periods are heavy.",
        },
        {
          heading: "Signs in your periods",
          body: "Heavy periods are a key sign. Your bleeding may be too heavy if your period lasts longer than 7 days. It may also be too heavy if you soak through a pad or tampon every 1 to 2 hours on your heaviest days, pass clots larger than about 2.5 cm, or have flooding that limits what you can do. Having been told you are low in iron, or having had treatment for anaemia, is another clue. Heavy bleeding after giving birth can also be a sign.",
        },
        {
          heading: "Other signs to watch for",
          body: "Look out for nosebleeds that start for no clear reason and last longer than 10 minutes, and bruising easily without an injury. Heavy bleeding after dental work, surgery or another medical procedure is another sign. So is bleeding into muscles or joints without an injury. Having a family member with a bleeding disorder, such as von Willebrand disease or haemophilia, also matters.",
        },
        {
          heading: "Tests and treatment",
          body: "A doctor will ask about your own and your family's history of bleeding, and can order blood tests that measure how well your blood clots. Bleeding disorders cannot be cured, but treatment can keep bleeding under control and prevent problems. For von Willebrand disease, options include a medicine called desmopressin, medicines that slow down the breakdown of clots, such as tranexamic acid, replacement of the missing clotting protein, and the contraceptive pill to make periods lighter. Some painkillers can affect clotting, so ask a doctor or pharmacist which ones are safe for you.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Talk to a doctor or nurse if you have one or more of these signs. Logging how heavy your periods are and how long they last in Ciclo can help you describe your bleeding. If you know you have a bleeding disorder, tell your care team before surgery, dental work or giving birth. Get emergency help if you have very heavy bleeding with dizziness or fainting.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods are very heavy or you bruise or bleed easily, talk to a doctor or nurse.",
    },
  },
  {
    slug: "pid",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Pelvic inflammatory disease", href: "https://www.nhs.uk/conditions/pelvic-inflammatory-disease-pid/" },
      { label: "CDC — About pelvic inflammatory disease", href: "https://www.cdc.gov/pid/about/index.html" },
    ],
    related: ["stis", "ectopic-pregnancy", "condoms"],
    es: {
      title: "Enfermedad inflamatoria pélvica (EIP)",
      summary: "La EIP es una infección del útero, las trompas de Falopio o los ovarios, que suele deberse a una infección de transmisión sexual (ITS). Puede ser leve o no dar síntomas, pero tratarla pronto ayuda a proteger tu fertilidad.",
      sections: [
        {
          heading: "Qué es la EIP",
          body: "La enfermedad inflamatoria pélvica (EIP) es una infección del útero (matriz), las trompas de Falopio (los conductos que llevan los óvulos de los ovarios al útero) o los ovarios. Suele deberse a infecciones de transmisión sexual (ITS), como la clamidia y la gonorrea. También puede deberse a bacterias que viven normalmente en la vagina. Es más probable tener EIP si tienes una ITS sin tratar, has tenido EIP antes, tienes más de una pareja sexual o tienes 25 años o menos. También puede aparecer después de un parto, un aborto espontáneo (pérdida del embarazo) o un procedimiento que abre el cuello del útero (cérvix), como la colocación de un DIU (dispositivo intrauterino).",
        },
        {
          heading: "Los síntomas pueden ser leves o no aparecer",
          body: "La EIP puede ser leve, y algunas personas no tienen ningún síntoma, así que puede que no sepas que la tienes. Cuando hay síntomas, pueden incluir dolor en la parte baja del vientre o en la pelvis, dolor profundo durante el sexo y sangrado entre periodos o después del sexo. Los periodos pueden ser más abundantes o más dolorosos de lo que es normal para ti. Puede que notes un flujo vaginal con un aspecto o un olor diferente. Algunas personas tienen fiebre o sensación de ardor al orinar.",
        },
        {
          heading: "Por qué importa tratarla pronto",
          body: "La EIP puede dejar tejido cicatricial dentro y alrededor de las trompas de Falopio, y ese tejido puede bloquearlas. Esto puede hacer que cueste más lograr un embarazo. También aumenta el riesgo de embarazo ectópico, en el que el embarazo crece fuera del útero. La EIP también puede causar dolor pélvico de larga duración. Los antibióticos pueden eliminar la infección. Tratarla pronto reduce la probabilidad de daños duraderos, pero el tratamiento no puede reparar el daño que ya se ha producido. Por eso vale la pena hacerte una revisión pronto, aunque tus síntomas sean leves.",
        },
        {
          heading: "Pruebas y tratamiento",
          body: "Un médico, una enfermera o un servicio de salud sexual te preguntará por tus síntomas y te revisará. Normalmente te tomarán muestras con un hisopo de la vagina y del cuello del útero, y puede que te hagan una prueba de embarazo, un análisis de sangre o una ecografía. El tratamiento principal son los antibióticos, normalmente una inyección y después pastillas durante 2 semanas. Termina todo el tratamiento. Tus parejas sexuales recientes también tienen que hacerse pruebas y recibir tratamiento. Evita el sexo hasta que tú termines todos los antibióticos y tus parejas también, tus síntomas hayan desaparecido y las pruebas muestren que la infección se ha curado.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Pide una cita urgente con un médico, una enfermera o un servicio de salud sexual si crees que tienes EIP o tienes un dolor pélvico que va y viene. Pídela también si tienes síntomas y estás o podrías estar embarazada, o si no te encuentras mejor después de 3 días de antibióticos. Si tienes un dolor intenso o un dolor agudo y repentino en la parte baja del vientre o en la pelvis, dolor en el hombro o en las costillas, fiebre alta, vómitos, mareo, un sangrado vaginal abundante, o te encuentras muy mal, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias. Si podrías estar embarazada y tienes un dolor intenso en un lado, busca ayuda de emergencia, porque puede ser una señal de un embarazo ectópico. Usar condón (preservativo) cada vez que tienes sexo reduce el riesgo de las ITS que causan la EIP.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tienes dolor pélvico o crees que podrías tener una ITS, hazte una revisión con un médico, una enfermera o un servicio de salud sexual.",
    },
    en: {
      title: "Pelvic inflammatory disease (PID)",
      summary: "PID is an infection of the womb, fallopian tubes or ovaries, usually caused by an STI. It can be mild or cause no symptoms, but quick treatment helps protect your fertility.",
      sections: [
        {
          heading: "What PID is",
          body: "Pelvic inflammatory disease (PID) is an infection of the womb (uterus), the fallopian tubes (the tubes that carry eggs from the ovaries to the womb) or the ovaries. It is usually caused by sexually transmitted infections (STIs), such as chlamydia and gonorrhoea. It can also be caused by bacteria that normally live in the vagina. You are more likely to get PID if you have an untreated STI, have had PID before, have more than one sexual partner, or are 25 or younger. It can also follow giving birth, a miscarriage, or a procedure that opens the neck of the womb (cervix), such as having an IUD (coil) fitted.",
        },
        {
          heading: "Symptoms can be mild or missing",
          body: "PID can be mild, and some people have no symptoms at all, so you may not know you have it. When there are symptoms, they can include pain in your lower tummy or pelvis, pain deep inside during sex, and bleeding between periods or after sex. Periods may be heavier or more painful than usual for you. You may notice vaginal discharge that looks or smells different. Some people get a fever or a burning feeling when they pee.",
        },
        {
          heading: "Why quick treatment matters",
          body: "PID can leave scar tissue inside and around the fallopian tubes, which can block them. This can make it harder to get pregnant. It also raises the risk of an ectopic pregnancy, where a pregnancy grows outside the womb. PID can also cause long-term pelvic pain. Antibiotics can clear the infection. Treating it early lowers the chance of lasting damage, but treatment cannot repair damage that has already happened. That is why it is worth getting checked quickly, even if your symptoms are mild.",
        },
        {
          heading: "Tests and treatment",
          body: "A doctor, nurse or sexual health clinic will ask about your symptoms and examine you. They will usually take swabs from your vagina and cervix, and may do a pregnancy test, blood test or scan. The main treatment is antibiotics, usually an injection and then tablets for 2 weeks. Finish the whole course. Recent sexual partners need to be tested and treated too. Avoid sex until you and your partners have finished all the antibiotics, your symptoms have gone, and tests show the infection has cleared.",
        },
        {
          heading: "When to get help",
          body: "Get an urgent appointment with a doctor, nurse or sexual health clinic if you think you have PID or have pelvic pain that comes and goes. Also get one if you have symptoms and are or might be pregnant, or do not feel better after 3 days of antibiotics. Get emergency help if you have severe or sudden sharp pain in your lower tummy or pelvis, pain in your shoulder or ribs, a high temperature, vomiting, dizziness, heavy vaginal bleeding, or feel very unwell. If you could be pregnant and have severe pain on one side, get emergency help, as this can be a sign of an ectopic pregnancy. Using condoms every time you have sex lowers your risk of the STIs that cause PID.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you have pelvic pain or think you may have an STI, get checked by a doctor, nurse or sexual health clinic.",
    },
  },
  {
    slug: "cycle-and-chronic-conditions",
    category: "conditions",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Office on Women's Health — Your menstrual cycle and your health", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle-and-your-health" },
      { label: "Epilepsy Action — Periods and catamenial epilepsy", href: "https://www.epilepsy.org.uk/info/seizure-triggers/periods-and-the-menstrual-cycle" },
      { label: "Asthma + Lung UK — Female hormones and asthma", href: "https://www.asthmaandlung.org.uk/conditions/asthma/asthma-triggers/female-sex-hormones-and-asthma" },
      { label: "NHS — Asthma attack", href: "https://www.nhs.uk/conditions/asthma/asthma-attack/" },
      { label: "NHS — Epilepsy", href: "https://www.nhs.uk/conditions/epilepsy/" },
    ],
    related: ["menstrual-migraine", "tracking-for-doctor", "pmdd"],
    es: {
      title: "Cómo puede afectar tu ciclo a otras afecciones",
      summary: "Los cambios hormonales a lo largo del ciclo pueden empeorar en ciertos momentos algunas afecciones crónicas, como el asma, la epilepsia o la migraña. Llevar un registro puede ayudarte a detectar un patrón.",
      sections: [
        {
          heading: "Por qué puede importar tu ciclo",
          body: "Los niveles de las hormonas estrógeno y progesterona suben y bajan a lo largo del ciclo menstrual. Estos cambios no solo afectan al útero. Si tienes un problema de salud crónico, tus síntomas pueden empeorar en ciertos momentos del ciclo, a menudo en los días justo antes del periodo. Esto puede ocurrir con el asma, la epilepsia, la diabetes, la migraña, el síndrome del intestino irritable (SII) y la depresión. No todas las personas con estas afecciones notan una relación.",
        },
        {
          heading: "Asma",
          body: "Algunas personas notan que sus síntomas de asma empeoran antes o durante el periodo. Los cambios en los niveles hormonales pueden hacer que las vías respiratorias se hinchen más (se inflamen). Si crees que te pasa, lleva un diario de tus síntomas de asma junto con tus periodos y habla con tu médico o con la enfermera que lleva tu asma. Si tienes un inhalador preventivo (de mantenimiento), úsalo todos los días, como te indicó tu médico o tu enfermera. Si una crisis de asma empeora, tu inhalador de alivio (de rescate) no te ayuda como dice tu plan, o no llevas el inhalador encima, busca ayuda de emergencia: llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias.",
        },
        {
          heading: "Epilepsia",
          body: "En algunas personas con epilepsia, las crisis epilépticas son más frecuentes en ciertos momentos del ciclo. Esto se llama epilepsia catamenial, y algunas investigaciones indican que podría afectar a alrededor de 4 de cada 10 mujeres con epilepsia, aunque las cifras varían entre estudios. Las crisis pueden aumentar en los días antes del periodo y durante este, alrededor de la ovulación o en la segunda mitad del ciclo. Llevar un diario de tu ciclo y tus crisis durante 3 meses puede ayudarte a ver un patrón. Si lo ves, habla con tu especialista en epilepsia. Puede que te sugiera medicación adicional en los días de más riesgo. Llama al número de emergencias de tu país si una crisis dura más de 5 minutos o más de lo habitual, o si una crisis sigue a otra sin recuperación entre ellas.",
        },
        {
          heading: "Diabetes, migraña, SII y estado de ánimo",
          body: "Si tienes diabetes, puede costar más controlar tu azúcar en sangre (glucosa) en la segunda mitad del ciclo. La migraña, el SII y la depresión pueden empeorar justo antes de que empiece el periodo. Las personas con depresión también tienen más probabilidades de tener síndrome premenstrual (SPM) o trastorno disfórico premenstrual (TDPM), una forma más grave. Si estás pensando en hacerte daño, busca ayuda de emergencia o contacta ahora con una línea de ayuda en crisis.",
        },
        {
          heading: "Cómo ayuda el registro a tu equipo médico",
          body: "Un registro de tu ciclo junto con tus síntomas es una buena forma de ver un patrón. Registrar en Ciclo tu periodo, tus síntomas, tu estado de ánimo y tus notas durante unos meses puede ayudarte a mostrarle a tu médico o a tu enfermera cuándo empeoran los síntomas. Habla con tu equipo médico sobre cualquier cosa nueva o diferente. No cambies ni dejes ningún medicamento sin consejo médico. Si los síntomas se vuelven graves, sigue tu plan de emergencia o busca ayuda de emergencia.",
        },
      ],
      notice: "Esto es información general, no consejo médico para tu afección. Habla con tu equipo médico antes de cambiar cualquier tratamiento.",
    },
    en: {
      title: "How your cycle can affect other conditions",
      summary: "Hormone changes across your cycle can make some long-term conditions, such as asthma, epilepsy or migraine, worse at certain times. Tracking can help you spot a pattern.",
      sections: [
        {
          heading: "Why your cycle can matter",
          body: "Levels of the hormones oestrogen and progesterone rise and fall across your menstrual cycle. These changes affect more than your womb. If you have a long-term health condition, your symptoms may get worse at certain points in your cycle, often in the days just before your period. This can happen with asthma, epilepsy, diabetes, migraine, irritable bowel syndrome (IBS) and depression. Not everyone with these conditions notices a link.",
        },
        {
          heading: "Asthma",
          body: "Some people find their asthma symptoms get worse before or during their period. Changing hormone levels may make the airways more swollen (inflamed). If you think this happens to you, keep a diary of your asthma symptoms alongside your periods and talk to your doctor or asthma nurse. Use any preventer inhaler every day, as your doctor or nurse advised. Get emergency help if an asthma attack gets worse, your reliever inhaler does not help as your plan says it should, or you do not have your inhaler with you.",
        },
        {
          heading: "Epilepsy",
          body: "For some people with epilepsy, seizures happen more often at certain times in the cycle. This is called catamenial epilepsy, and some research suggests it may affect about 4 in 10 women with epilepsy, though figures differ between studies. Seizures may increase in the days before and during a period, around ovulation, or in the second half of the cycle. Keeping a diary of your cycle and seizures for 3 months can help you see a pattern. If you see one, talk to your epilepsy specialist. They may suggest extra medicine on the days you are most at risk. Call for emergency help if a seizure lasts more than 5 minutes or longer than usual, or one seizure follows another without recovery in between.",
        },
        {
          heading: "Diabetes, migraine, IBS and mood",
          body: "If you have diabetes, your blood sugar (glucose) may be harder to control in the second half of your cycle. Migraine, IBS and depression can all get worse right before a period starts. People with depression are also more likely to have premenstrual syndrome (PMS) or premenstrual dysphoric disorder (PMDD), a more severe form. If you are thinking about harming yourself, get emergency help or contact a crisis line now.",
        },
        {
          heading: "How tracking helps your care team",
          body: "A record of your cycle alongside your symptoms is a good way to see a pattern. Logging your period, symptoms, mood and notes in Ciclo for a few months can help you show your doctor or nurse when symptoms flare. Talk to your care team about anything that is new or different. Do not change or stop any medicine without advice. If symptoms become severe, follow your emergency plan or get emergency help.",
        },
      ],
      notice: "This is general information, not medical advice for your condition. Talk to your care team before changing any treatment.",
    },
  },
];
