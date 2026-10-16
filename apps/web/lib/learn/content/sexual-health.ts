// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const SEXUAL_HEALTH_ARTICLES: LearnArticle[] = [
  {
    slug: "stis",
    category: "sexual-health",
    reviewedAt: "2026-10-16",
    sources: [
      { label: "WHO — Sexually transmitted infections (STIs)", href: "https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)" },
      { label: "NHS — Sexually transmitted infections (STIs)", href: "https://www.nhs.uk/conditions/sexually-transmitted-infections/" },
      { label: "CDC — About sexually transmitted infections (STIs)", href: "https://www.cdc.gov/sti/about/index.html" },
      { label: "NHS — HIV prevention", href: "https://www.nhs.uk/conditions/hiv-and-aids/prevention/" },
      { label: "CDC — HIV testing (window periods)", href: "https://www.cdc.gov/hiv/testing/index.html" },
      { label: "Hampshire and Isle of Wight Healthcare NHS — Testing for STIs", href: "https://letstalkaboutit.nhs.uk/test" },
    ],
    related: ["safer-sex", "hpv", "pid"],
    es: {
      title: "Infecciones de transmisión sexual (ITS)",
      summary: "Las ITS son muy frecuentes y a menudo no causan síntomas. Hacerse pruebas es rápido y rutinario, y todas las ITS tienen tratamiento; muchas se curan por completo.",
      sections: [
        {
          heading: "Qué son las ITS",
          body: "Las infecciones de transmisión sexual (ITS) son infecciones que pasan de una persona a otra por contacto sexual, incluido el sexo vaginal, anal y oral. Pueden estar causadas por bacterias, virus o parásitos. Las ITS son muy frecuentes. En todo el mundo, cada día se transmiten más de 1 millón de ITS curables entre personas de 15 a 49 años. Algunas ITS también pueden pasar de la madre al bebé durante el embarazo, el parto o la lactancia.",
        },
        {
          heading: "Las ITS más frecuentes",
          body: "Cuatro ITS frecuentes suelen poder curarse con antibióticos: la clamidia, la gonorrea, la sífilis y la tricomoniasis. Otras cuatro están causadas por virus: el herpes, el VIH, la hepatitis B y el virus del papiloma humano (VPH). Estas no se pueden curar, pero hay medicamentos que ayudan a controlar el herpes y el VIH, y la mayoría de las infecciones por VPH desaparecen solas. Hay vacunas que protegen contra el VPH y la hepatitis B.",
        },
        {
          heading: "Señales a las que prestar atención",
          body: "Muchas ITS no causan síntomas, así que puedes tener una sin saberlo y transmitirla. Cuando hay señales, pueden incluir flujo inusual por la vagina o el ano, dolor al orinar, picor alrededor de los genitales o el ano, una erupción en la piel y sangrado vaginal inusual. Los bultos, verrugas, ampollas o llagas alrededor de los genitales o el ano también pueden ser señales. Algunas ITS causan dolor en el bajo vientre.",
        },
        {
          heading: "Hacerse pruebas",
          body: "Hacerte pruebas es la única forma de saberlo con seguridad. Hazte pruebas si tienes síntomas, una pareja nueva o una pareja con síntomas. Las pruebas de ITS son una parte rutinaria de la atención sanitaria. En muchos lugares puedes ir a un servicio de salud sexual sin que te derive un médico, y algunos servicios ofrecen kits para hacerte la prueba en casa. Las pruebas suelen consistir en una muestra de orina, una muestra con hisopo o un análisis de sangre. Algunas ITS pueden tardar hasta 3 meses después del sexo en aparecer en una prueba, así que puede que tengas que repetirla más adelante.",
        },
        {
          heading: "Tratamiento y aviso a tus parejas",
          body: "Si una prueba muestra una ITS, te ofrecerán tratamiento. Muchas ITS se tratan con antibióticos. Toma todo el tratamiento que te den. Tus parejas actuales y tus exparejas recientes deberían saberlo para que también puedan hacerse pruebas y recibir tratamiento. Si prefieres no decírselo tú, el servicio de salud sexual a menudo puede avisarles por ti sin dar tu nombre. Usar condón (preservativo) correctamente cada vez que tienes sexo es una de las mejores formas de reducir el riesgo.",
        },
        {
          heading: "Por qué importa y cuándo actuar rápido",
          body: "Las ITS sin tratar pueden causar problemas duraderos. La clamidia y la gonorrea son causas importantes de enfermedad inflamatoria pélvica (EIP) y de infertilidad. El herpes, la gonorrea y la sífilis pueden aumentar la probabilidad de contraer el VIH, y el VPH puede causar cáncer de cuello uterino y otros cánceres. Busca atención médica urgente si tienes un dolor intenso en el bajo vientre con fiebre alta, vómitos o si te sientes muy mal. Puede ser una señal de EIP. Si crees que has tenido una exposición al VIH, ve enseguida a un servicio de salud sexual o a urgencias. Un medicamento llamado PEP (profilaxis posexposición) puede reducir la probabilidad de infección, pero hay que empezarlo en un plazo de 72 horas.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tienes síntomas o crees que puedes tener una ITS, hazte pruebas en un servicio de salud sexual o con un médico o una enfermera.",
    },
    en: {
      title: "Sexually transmitted infections (STIs)",
      summary: "STIs are very common and often cause no symptoms. Testing is quick and routine, and every STI can be treated, with many cured completely.",
      sections: [
        {
          heading: "What STIs are",
          body: "Sexually transmitted infections (STIs) are infections that pass from one person to another through sexual contact, including vaginal, anal and oral sex. They can be caused by bacteria, viruses or parasites. STIs are very common. Worldwide, more than 1 million curable STIs are passed on every day among people aged 15 to 49. Some STIs can also pass from a mother to her baby during pregnancy, birth or breastfeeding.",
        },
        {
          heading: "The most common STIs",
          body: "Four common STIs can usually be cured with antibiotics: chlamydia, gonorrhoea, syphilis and trichomoniasis. Four others are caused by viruses: herpes, HIV, hepatitis B and human papillomavirus (HPV). These cannot be cured, but medicines can help control herpes and HIV, and most HPV infections clear by themselves. Vaccines can protect against HPV and hepatitis B.",
        },
        {
          heading: "Signs to look out for",
          body: "Many STIs cause no symptoms, so you can have one without knowing and pass it on. When there are signs, they can include unusual discharge from the vagina or anus, pain when you pee, itching around the genitals or anus, a rash, and unusual bleeding from the vagina. Lumps, warts, blisters or sores around the genitals or anus can also be signs. Some STIs cause pain in the lower tummy.",
        },
        {
          heading: "Getting tested",
          body: "Testing is the only way to know for sure. Get tested if you have symptoms, a new partner, or a partner with symptoms. STI testing is a routine part of health care. In many places you can go to a sexual health clinic without a referral, and some clinics offer home testing kits. Tests usually involve a pee sample, a swab or a blood test. Some STIs can take up to 3 months after sex to show up on a test, so you may need to test again later.",
        },
        {
          heading: "Treatment and telling partners",
          body: "If a test shows an STI, you will be offered treatment. Many STIs are treated with antibiotics. Take all of the treatment you are given. Your current partners, and recent ex-partners, should be told so they can get tested and treated too. If you would rather not tell them yourself, the clinic can often do this for you without giving your name. Using condoms correctly every time you have sex is one of the best ways to lower your risk.",
        },
        {
          heading: "Why it matters and when to act fast",
          body: "Untreated STIs can cause lasting problems. Chlamydia and gonorrhoea are major causes of pelvic inflammatory disease (PID) and infertility. Herpes, gonorrhoea and syphilis can raise the chance of getting HIV, and HPV can cause cervical and other cancers. Get urgent medical help if you have severe pain in your lower tummy with a high temperature, being sick or feeling very unwell. This can be a sign of PID. If you think you have been exposed to HIV, go to a sexual health clinic or emergency department straight away. Medicine called PEP can lower the chance of infection, but it must be started within 72 hours.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you have symptoms or think you may have an STI, get tested at a sexual health clinic or by a doctor or nurse.",
    },
  },
  {
    slug: "safer-sex",
    category: "sexual-health",
    reviewedAt: "2026-10-16",
    sources: [
      { label: "Planned Parenthood — Safer sex", href: "https://www.plannedparenthood.org/learn/stds-hiv-safer-sex/safer-sex" },
      { label: "WHO — Sexually transmitted infections (STIs)", href: "https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)" },
      { label: "NHS — Sexually transmitted infections (STIs)", href: "https://www.nhs.uk/conditions/sexually-transmitted-infections/" },
      { label: "NHS — HIV prevention", href: "https://www.nhs.uk/conditions/hiv-and-aids/prevention/" },
      { label: "CDC — HIV testing (window periods)", href: "https://www.cdc.gov/hiv/testing/index.html" },
      { label: "Hampshire and Isle of Wight Healthcare NHS — Testing for STIs", href: "https://letstalkaboutit.nhs.uk/test" },
      { label: "NHS — Emergency contraception", href: "https://www.nhs.uk/contraception/emergency-contraception/" },
    ],
    related: ["condoms", "stis", "choosing-contraception"],
    es: {
      title: "Sexo más seguro",
      summary: "Sexo más seguro significa reducir la probabilidad de ITS y de un embarazo que no deseas. Los condones, las pruebas regulares, las vacunas y hablar con sinceridad con tus parejas ayudan.",
      sections: [
        {
          heading: "Qué significa sexo más seguro",
          body: "Sexo más seguro significa tomar medidas para protegerte a ti y a tus parejas de las infecciones de transmisión sexual (ITS), y del embarazo si no lo deseas. Ninguna medida por sí sola elimina todos los riesgos, pero combinar varias los reduce mucho. Lo que te funcione dependerá de ti, de tus parejas y del tipo de sexo que tengas.",
        },
        {
          heading: "Sexo con menos y con más riesgo",
          body: "Algunos tipos de sexo tienen muy poco riesgo. Entre ellos están la masturbación, frotarse con la ropa puesta y tocar los genitales de tu pareja con las manos. Esto es de bajo riesgo siempre que sus fluidos corporales no lleguen a tu boca ni a tus genitales. Besarse, el sexo oral y compartir juguetes sexuales tienen algo de riesgo. El sexo vaginal o anal sin condón (preservativo) es el que más riesgo tiene.",
        },
        {
          heading: "Condones y otras barreras",
          body: "Usados correctamente cada vez, los condones son una de las formas más eficaces de protegerse de las ITS, incluido el VIH. También son el único método anticonceptivo que protege tanto del embarazo como de las ITS. Puedes usar condones, condones internos, barreras bucales (diques dentales) o guantes para el sexo oral, anal y vaginal. Usar lubricante con el condón también hace el sexo más seguro, sobre todo el sexo anal. Con condones de látex, usa un lubricante a base de agua o de silicona, porque los productos a base de aceite pueden hacer que el condón se rompa.",
        },
        {
          heading: "Pruebas y vacunas",
          body: "Hacerte pruebas de ITS con regularidad forma parte del sexo más seguro, aunque siempre uses condón y te encuentres bien, porque muchas ITS no dan síntomas. En muchos lugares puedes ir a un servicio de salud sexual sin que te derive un médico, y algunos servicios ofrecen kits para hacerte la prueba en casa. Las vacunas pueden protegerte de dos ITS: el virus del papiloma humano (VPH) y la hepatitis B. Pregunta a un médico o una enfermera si tienes las vacunas al día. Si tienes más probabilidad de contraer el VIH, pregunta en un servicio de salud sexual por la PrEP (profilaxis preexposición), un medicamento que reduce esa probabilidad.",
        },
        {
          heading: "Hablar con tus parejas",
          body: "Puede ayudar hablar del sexo más seguro antes de tener sexo. Podrías hablar de cuándo se hizo pruebas cada persona por última vez, de qué método anticonceptivo usa cada una y de usar condón. Si sabes que tienes una ITS, díselo a tu pareja antes de tener sexo. El alcohol y las drogas pueden hacer que te cueste más mantener lo que habías decidido, así que ayuda dejarlo acordado cuando no hayas bebido ni consumido drogas.",
        },
        {
          heading: "Si algo sale mal",
          body: "Si es posible un embarazo, puedes elegir usar condón junto con otro método anticonceptivo. Un médico, una enfermera o un servicio de salud sexual pueden ayudarte a elegir. Si un condón se rompe o se sale, o has tenido sexo sin protección, actúa rápido. La anticoncepción de emergencia funciona mejor cuanto antes la uses y debe usarse en un plazo de 3 a 5 días. Si hay riesgo de VIH, pregunta en un servicio de salud sexual o en urgencias por la PEP (profilaxis posexposición), un medicamento que hay que empezar en un plazo de 72 horas. Pregunta también por las pruebas de ITS. Algunas ITS tardan hasta 3 meses en aparecer en una prueba, así que pueden recomendarte repetirla más adelante.",
        },
      ],
      notice: "Esto es información general. Para recibir consejo sobre pruebas o anticoncepción adaptado a ti, habla con un médico, una enfermera o un servicio de salud sexual.",
    },
    en: {
      title: "Safer sex",
      summary: "Safer sex means lowering the chance of STIs and of pregnancy you do not want. Condoms, regular testing, vaccines and honest talk with partners all help.",
      sections: [
        {
          heading: "What safer sex means",
          body: "Safer sex means taking steps to protect yourself and your partners from sexually transmitted infections (STIs), and from pregnancy if you do not want one. No single step removes every risk, but using a few together lowers it a lot. What suits you will depend on you, your partners and the kinds of sex you have.",
        },
        {
          heading: "Lower and higher risk sex",
          body: "Some kinds of sex carry very little risk. These include masturbation, rubbing against each other with clothes on, and touching a partner's genitals with your hands. This is low risk as long as their body fluids do not get into your mouth or genitals. Kissing, oral sex and sharing sex toys carry some risk. Vaginal or anal sex without a condom carries the most risk.",
        },
        {
          heading: "Condoms and other barriers",
          body: "Used correctly every time, condoms are one of the most effective ways to protect against STIs, including HIV. They are also the only type of contraception that protects against both pregnancy and STIs. You can use condoms, internal condoms, dental dams or gloves for oral, anal and vaginal sex. Using lubricant with a condom also makes sex safer, especially anal sex. With latex condoms, use a water-based or silicone-based lubricant, because oil-based products can make condoms break.",
        },
        {
          heading: "Testing and vaccines",
          body: "Regular STI testing is part of safer sex, even if you always use condoms and feel well, because many STIs have no symptoms. In many places you can go to a sexual health clinic without a referral, and some clinics offer home testing kits. Vaccines can protect you against two STIs, human papillomavirus (HPV) and hepatitis B. Ask a doctor or nurse whether you are up to date. If you have a higher chance of getting HIV, ask a sexual health clinic about PrEP, a medicine that lowers that chance.",
        },
        {
          heading: "Talking with partners",
          body: "It can help to talk about safer sex before you have sex. You might talk about when you were each last tested, which contraception you use, and using condoms. If you know you have an STI, tell a partner before you have sex. Alcohol and drugs can make it harder to stick to the choices you want, so it helps to agree on things while you are sober.",
        },
        {
          heading: "If something goes wrong",
          body: "If pregnancy is possible, you may choose to use condoms together with another kind of contraception. A doctor, nurse or sexual health clinic can help you choose. If a condom splits or slips off, or you had sex without protection, act quickly. Emergency contraception works best the sooner you use it and must be used within 3 to 5 days. If HIV is a risk, ask a sexual health clinic or emergency department about PEP, a medicine that must be started within 72 hours. Ask about STI testing too. Some STIs take up to 3 months to show on a test, so they may suggest testing again later.",
        },
      ],
      notice: "This is general information. For advice on testing or contraception that suits you, talk to a doctor, nurse or sexual health clinic.",
    },
  },
  {
    slug: "hpv",
    category: "sexual-health",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "CDC — About HPV", href: "https://www.cdc.gov/hpv/about/index.html" },
      { label: "WHO — Human papillomavirus and cancer", href: "https://www.who.int/news-room/fact-sheets/detail/human-papilloma-virus-and-cancer" },
      { label: "WHO — Sexually transmitted infections (STIs)", href: "https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)" },
      { label: "NHS — Sexually transmitted infections (STIs)", href: "https://www.nhs.uk/conditions/sexually-transmitted-infections/" },
      { label: "MedlinePlus — HPV", href: "https://medlineplus.gov/hpv.html" },
    ],
    related: ["cervical-screening", "stis", "gynecologic-cancers"],
    es: {
      title: "El VPH y la vacuna contra el VPH",
      summary: "El VPH es un virus muy frecuente que se transmite por el sexo. La mayoría de las infecciones desaparecen solas, pero algunas pueden causar cáncer. La vacuna y las pruebas de detección del cáncer de cuello uterino ayudan a protegerte de este cáncer.",
      sections: [
        {
          heading: "Qué es el VPH",
          body: "El virus del papiloma humano (VPH) es un virus muy frecuente. Se transmite por el contacto estrecho piel con piel durante el sexo vaginal, anal u oral. Casi todas las personas sexualmente activas tendrán el VPH en algún momento, normalmente sin saberlo. Una persona puede transmitirlo aunque no tenga señales ni síntomas. Tener el VPH no quiere decir que nadie haya hecho nada malo, ni tú ni tu pareja. Algunos tipos de VPH causan verrugas en los genitales o el ano, o a su alrededor. Otros tipos, de alto riesgo, pueden causar cáncer.",
        },
        {
          heading: "La mayoría de las infecciones desaparecen",
          body: "El VPH no suele causar síntomas. Alrededor de 9 de cada 10 infecciones por VPH desaparecen solas en 2 años, sin causar ningún daño. Así que tener el VPH no significa que vayas a tener cáncer. No fumar, o dejar de fumar, reduce la probabilidad de que una infección se quede en el cuerpo durante mucho tiempo.",
        },
        {
          heading: "Cómo el VPH puede causar cáncer",
          body: "A veces una infección por un tipo de VPH de alto riesgo no desaparece y se mantiene durante años. Una infección duradera como esta es la causa del cáncer de cuello uterino. También se relaciona con cánceres de vulva, vagina, ano, pene y la parte de atrás de la garganta. El cáncer de cuello uterino suele tardar entre 15 y 20 años en desarrollarse después de una infección por VPH. Por este largo intervalo, las pruebas de detección periódicas pueden encontrar cambios a tiempo, antes de que se conviertan en cáncer.",
        },
        {
          heading: "La vacuna contra el VPH",
          body: "Hay vacunas seguras y muy eficaces que protegen contra el VPH. La vacuna funciona mejor cuando se pone antes de cualquier exposición al virus. Por eso se ofrece a personas jóvenes, a menudo entre los 9 y los 14 años, antes de que empiecen a tener sexo. Si no te la pusieron o no sabes si te la pusieron, pregunta a un médico o una enfermera si vale la pena ponértela ahora.",
        },
        {
          heading: "Pruebas de detección y condones",
          body: "Sigue haciéndote las pruebas de detección del cáncer de cuello uterino cuando te llamen. Las edades y la frecuencia con la que te llaman varían de un país a otro. Los condones (preservativos) reducen la probabilidad de transmitir el VPH, pero no protegen del todo, porque no cubren toda la piel alrededor de los genitales. Aun así, usar condón protege de muchas otras infecciones de transmisión sexual (ITS).",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si notas bultos, verrugas o llagas alrededor de los genitales o el ano. El sangrado entre periodos, después del sexo o después de la menopausia siempre debe revisarse. Estas señales suelen tener otras causas, pero es importante que te las revisen.",
        },
      ],
      notice: "Esto es información general. Pregunta a un médico o una enfermera por la vacuna contra el VPH y por cuándo te toca la prueba de detección del cáncer de cuello uterino.",
    },
    en: {
      title: "HPV and the HPV vaccine",
      summary: "HPV is a very common virus passed on through sex. Most infections clear by themselves, but some can lead to cancer. The vaccine and cervical screening help protect you from cervical cancer.",
      sections: [
        {
          heading: "What HPV is",
          body: "Human papillomavirus (HPV) is a very common virus. It spreads through close skin-to-skin contact during vaginal, anal or oral sex. Nearly everyone who is sexually active will get HPV at some point, usually without knowing. A person can pass it on even when they have no signs or symptoms. Having HPV does not mean that you or a partner did anything wrong. Some types of HPV cause warts on or around the genitals or anus. Other, high-risk types can lead to cancer.",
        },
        {
          heading: "Most infections go away",
          body: "HPV usually causes no symptoms. About 9 in 10 HPV infections clear by themselves within 2 years, without causing any harm. So having HPV does not mean you will get cancer. Not smoking, or stopping smoking, lowers the chance that an infection will stay in the body for a long time.",
        },
        {
          heading: "How HPV can lead to cancer",
          body: "Sometimes an infection with a high-risk type of HPV does not clear and stays for years. A long-lasting infection like this is the cause of cervical cancer. It is also linked to cancers of the vulva, vagina, anus, penis and the back of the throat. Cervical cancer usually takes 15 to 20 years to develop after an HPV infection. This long gap is why regular cervical screening can find changes early, before they become cancer.",
        },
        {
          heading: "The HPV vaccine",
          body: "Safe and highly effective vaccines protect against HPV. The vaccine works best when given before a person is ever exposed to the virus. This is why it is offered to young people, often between the ages of 9 and 14, before they start having sex. If you missed it or are not sure whether you had it, ask a doctor or nurse whether it is worth having now.",
        },
        {
          heading: "Screening and condoms",
          body: "Keep going to cervical screening when you are invited. The ages and how often you are invited vary between countries. Condoms lower the chance of passing on HPV, but they do not protect fully, because they do not cover all the skin around the genitals. Using condoms still protects against many other sexually transmitted infections (STIs).",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if you notice lumps, warts or sores around your genitals or anus. Bleeding between periods, after sex or after menopause should always be checked. These signs often have other causes, but it is important to get them looked at.",
        },
      ],
      notice: "This is general information. Ask a doctor or nurse about the HPV vaccine and when you are due for cervical screening.",
    },
  },
  {
    slug: "libido",
    category: "sexual-health",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Low sex drive (loss of libido)", href: "https://www.nhs.uk/conditions/loss-of-libido/" },
      { label: "Better Health Channel — Libido", href: "https://www.betterhealth.vic.gov.au/health/healthyliving/libido" },
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
    ],
    related: ["mood-and-cycle", "stress-and-cycle", "painful-sex"],
    es: {
      title: "El deseo sexual y tu ciclo",
      summary: "El deseo sexual varía mucho entre personas y con el tiempo. Las hormonas, la salud, el estrés y las relaciones influyen, y tener poco deseo solo es un problema si te molesta.",
      sections: [
        {
          heading: "No hay un nivel normal",
          body: "El deseo sexual (libido) es cuántas ganas tienes de tener sexo. Las personas son muy distintas en la frecuencia con la que quieren tener sexo. Algunas quieren cada día y otras rara vez o nunca. Ninguna cantidad es la correcta. El deseo también funciona de formas distintas. En algunas personas aparece sin mucho estímulo. En otras crece como respuesta al momento o la situación adecuados. Las dos cosas son normales.",
        },
        {
          heading: "Cambios a lo largo del ciclo",
          body: "Los niveles hormonales suben y bajan a lo largo de cada ciclo menstrual. Algunas personas notan que su interés por el sexo también cambia. Por ejemplo, tener menos deseo sexual puede ser una de las señales del síndrome premenstrual (SPM) en los días antes del periodo. Otras personas no notan ningún patrón. Como cada persona es tan distinta, la guía más útil es tu propia experiencia. Registrar tu deseo sexual en Ciclo durante algunos ciclos puede mostrar si tienes un patrón propio.",
        },
        {
          heading: "Anticoncepción, embarazo y menopausia",
          body: "Algunas personas sienten menos interés por el sexo mientras usan anticonceptivos hormonales, como la píldora, el parche o el implante, aunque los estudios no han demostrado que la píldora combinada cambie el deseo sexual. El embarazo, el parto y la lactancia cambian los niveles hormonales y pueden afectar al deseo. Los niveles hormonales también bajan con la edad, sobre todo alrededor de la menopausia, y esto puede reducir el deseo. La sequedad vaginal, que puede hacer el sexo menos cómodo, también puede reducir el interés.",
        },
        {
          heading: "Estrés, salud y relaciones",
          body: "Muchas otras cosas afectan al deseo. El estrés, la ansiedad y la depresión pueden reducirlo, y la depresión también puede traer cansancio y pérdida de interés por cosas que normalmente disfrutas. Algunos medicamentos, como algunos antidepresivos y medicamentos para la presión arterial, pueden reducir el deseo sexual, y también beber demasiado alcohol. Las enfermedades de larga duración, como la diabetes, las enfermedades del corazón o una tiroides poco activa (hipotiroidismo), pueden influir. Los problemas en una relación también suelen afectar a tu vida sexual.",
        },
        {
          heading: "Cuándo el poco deseo es un problema",
          body: "Tener menos deseo sexual solo es un problema si te molesta o te causa dificultades con tu pareja. Si es así, puede ayudar pensar en qué ha cambiado últimamente, como un medicamento o un anticonceptivo nuevo, la llegada de un bebé o una época de estrés. Hablar abiertamente con tu pareja sobre lo que quiere cada persona también puede ayudar.",
        },
        {
          heading: "Pedir ayuda",
          body: "Consulta a un médico o una enfermera si te preocupa tu deseo sexual, si crees que un medicamento o tu anticonceptivo lo está afectando, o si no ha vuelto después del embarazo. La ayuda depende de la causa. Puede consistir en cambiar un medicamento o el tipo de anticonceptivo, tratar la depresión o los síntomas de la menopausia, usar lubricante para la sequedad, hacer terapia de pareja o acudir a terapia sexual.",
        },
      ],
      notice: "Esto es información general. Si te preocupan los cambios en tu deseo sexual, habla con un médico o una enfermera.",
    },
    en: {
      title: "Sex drive and your cycle",
      summary: "Sex drive varies a lot between people and over time. Hormones, health, stress and relationships all play a part, and low desire is only a problem if it bothers you.",
      sections: [
        {
          heading: "There is no normal level",
          body: "Sex drive (libido) means how much you want sex. People differ a lot in how often they want sex. Some want it every day and some rarely or never. No amount is the correct one. Desire also works in different ways. For some people it appears without much prompting. For others it grows in response to the right moment or situation. Both are normal.",
        },
        {
          heading: "Changes across your cycle",
          body: "Hormone levels rise and fall through each menstrual cycle. Some people notice their interest in sex changes too. For example, a lower sex drive can be one of the signs of premenstrual syndrome (PMS) in the days before a period. Other people notice no pattern at all. Because people differ so much, the most useful guide is your own experience. Logging sex drive in Ciclo for a few cycles can show whether you have a pattern of your own.",
        },
        {
          heading: "Contraception, pregnancy and menopause",
          body: "Some people feel less interested in sex while using hormonal contraception, such as the pill, patch or implant, although studies have not shown that the combined pill changes sex drive. Pregnancy, giving birth and breastfeeding all change hormone levels and can affect desire. Hormone levels also fall as you get older, especially around menopause, and this can lower desire. Vaginal dryness, which can make sex less comfortable, can also reduce interest.",
        },
        {
          heading: "Stress, health and relationships",
          body: "Many other things affect desire. Stress, anxiety and depression can all lower it, and depression can also bring tiredness and a loss of interest in things you usually enjoy. Some medicines, including some antidepressants and blood pressure medicines, can reduce sex drive, and so can drinking too much alcohol. Long-term conditions such as diabetes, heart disease or an underactive thyroid can play a part. Problems in a relationship often affect your sex life too.",
        },
        {
          heading: "When low desire is a problem",
          body: "A lower sex drive is only a problem if it bothers you or causes difficulties with a partner. If it does, it can help to think about what has changed recently, such as a new medicine or contraception, a new baby, or a stressful time. Talking openly with a partner about what you each want can also help.",
        },
        {
          heading: "Getting help",
          body: "See a doctor or nurse if you are worried about your sex drive, if you think a medicine or your contraception is affecting it, or if it has not returned after pregnancy. Help depends on the cause. It might mean changing a medicine or type of contraception, treatment for depression or menopause symptoms, lubricant for dryness, relationship counselling, or seeing a sex therapist.",
        },
      ],
      notice: "This is general information. If changes in your sex drive worry you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "painful-sex",
    category: "sexual-health",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Vaginismus", href: "https://www.nhs.uk/conditions/vaginismus/" },
      { label: "NHS — Thrush in men and women", href: "https://www.nhs.uk/conditions/thrush-in-men-and-women/" },
      { label: "NHS — Vaginal dryness", href: "https://www.nhs.uk/conditions/vaginal-dryness/" },
      { label: "Mayo Clinic — Painful intercourse (dyspareunia)", href: "https://www.mayoclinic.org/diseases-conditions/painful-intercourse/symptoms-causes/syc-20375967" },
    ],
    related: ["endometriosis", "pelvic-floor", "menopause-symptoms"],
    es: {
      title: "Dolor durante las relaciones sexuales",
      summary: "El dolor durante las relaciones sexuales tiene muchas causas posibles, desde la sequedad y las infecciones hasta el vaginismo o la endometriosis. No tienes por qué aguantarlo, y hay ayuda.",
      sections: [
        {
          heading: "El sexo no debería doler",
          body: "El sexo no tiene por qué ser doloroso. Si duele, es una señal de que algo necesita atención, y no hace falta seguir ni sentir vergüenza. Puedes parar en cualquier momento. Anotar cuándo aparece el dolor y dónde lo sientes puede ayudar a un médico o una enfermera a encontrar la causa. Las notas de Ciclo son un lugar donde guardarlo.",
        },
        {
          heading: "Causas frecuentes",
          body: "El dolor durante las relaciones sexuales tiene muchas causas posibles. La sequedad vaginal es una causa frecuente. Es más probable alrededor de la menopausia y después, durante el embarazo o la lactancia, con algunos medicamentos como los anticonceptivos hormonales o los antidepresivos, o cuando no hay suficiente excitación. Las infecciones como la candidiasis (infección por hongos) y algunas infecciones de transmisión sexual (ITS) pueden causar dolor o ardor. Una reacción a los condones (preservativos) o al jabón puede irritar la piel. El dolor que se siente muy adentro puede deberse a enfermedades como la endometriosis, la enfermedad inflamatoria pélvica (EIP) o los miomas. El estrés y la preocupación también pueden hacer que se tensen los músculos del suelo pélvico.",
        },
        {
          heading: "Vaginismo",
          body: "El vaginismo es cuando los músculos que rodean la vagina se tensan por sí solos cuando algo está a punto de entrar, como un pene, un dedo o un tampón, o durante una prueba de detección del cáncer de cuello uterino. Esto puede causar un dolor con ardor o escozor. No es algo que hagas a propósito. La causa no siempre está clara. Se relaciona con el miedo o la preocupación por el sexo, una experiencia dolorosa en el pasado, una agresión o un abuso sexual, un parto o una exploración difíciles, o una enfermedad dolorosa como la candidiasis.",
        },
        {
          heading: "Tratamientos que ayudan",
          body: "El tratamiento depende de la causa. La candidiasis y las ITS se pueden tratar con medicamentos. Un lubricante a base de agua antes del sexo, o una crema hidratante vaginal usada con regularidad, pueden ayudar con la sequedad. Si la sequedad está relacionada con la menopausia, un médico puede ofrecerte un tratamiento con estrógeno. El vaginismo se suele tratar trabajando los sentimientos sobre la penetración y acostumbrándose a ella poco a poco. Esto puede incluir terapia psicológica para las preocupaciones relacionadas con el sexo (terapia psicosexual), relajación, ejercicios de suelo pélvico y dilatadores vaginales, un juego de piezas lisas de tamaño pequeño a más grande que usas a tu propio ritmo.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico, una enfermera o un servicio de salud sexual si el sexo te duele a menudo o el dolor vuelve una y otra vez, si crees que tienes vaginismo, o si tienes flujo vaginal inusual, llagas o picor. Te harán algunas preguntas y puede que te examinen brevemente para descartar una infección. El sangrado después del sexo siempre debe revisarse. Busca atención médica urgente si tienes un dolor repentino e intenso en el bajo vientre, sobre todo si podrías estar embarazada, o dolor de vientre con fiebre alta, vómitos o si te sientes muy mal.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si el sexo te resulta doloroso, habla con un médico, una enfermera o un servicio de salud sexual.",
    },
    en: {
      title: "Pain during sex",
      summary: "Pain during sex has many possible causes, from dryness and infections to vaginismus or endometriosis. You do not have to put up with it, and help is available.",
      sections: [
        {
          heading: "Sex should not hurt",
          body: "Sex is not supposed to be painful. If it hurts, it is a sign that something needs attention, and there is no need to keep going or to feel embarrassed. You can stop at any time. Noting when the pain happens, and where you feel it, can help a doctor or nurse find the cause. Ciclo's notes are one place to keep this.",
        },
        {
          heading: "Common causes",
          body: "Pain during sex has many possible causes. Vaginal dryness is a common one. It is more likely around and after menopause, during pregnancy or breastfeeding, with some medicines such as hormonal contraception or antidepressants, or when you are not fully aroused. Infections such as thrush and some sexually transmitted infections (STIs) can cause soreness or stinging. A reaction to condoms or soap can irritate the skin. Pain felt deep inside can come from conditions such as endometriosis, pelvic inflammatory disease (PID) or fibroids. Stress and worry can also make the pelvic floor muscles tighten.",
        },
        {
          heading: "Vaginismus",
          body: "Vaginismus is when the muscles around the vagina tighten on their own when something is about to go in, such as a penis, finger or tampon, or during cervical screening. This can cause burning or stinging pain. It is not something you do on purpose. The cause is not always clear. It is linked to fear or worry about sex, a past painful experience, sexual assault or abuse, a difficult birth or examination, or a painful condition like thrush.",
        },
        {
          heading: "Treatments that help",
          body: "Treatment depends on the cause. Thrush and STIs can be treated with medicine. A water-based lubricant before sex, or a vaginal moisturiser used regularly, can help with dryness. If dryness is linked to menopause, a doctor may offer oestrogen treatment. Vaginismus is usually treated by working on feelings about penetration and slowly getting used to it. This can include talking therapy for sex-related worries (psychosexual therapy), relaxation, pelvic floor exercises, and vaginal trainers, a set of smooth shapes from small to larger that you use at your own pace.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor, nurse or sexual health clinic if sex is often painful or the pain keeps coming back, if you think you have vaginismus, or if you have unusual discharge, sores or itching. They will ask some questions and may take a quick look to rule out an infection. Bleeding after sex should always be checked. Get urgent medical help if you have sudden, severe pain in your lower tummy, especially if you could be pregnant, or tummy pain with a high temperature, being sick or feeling very unwell.",
        },
      ],
      notice: "This is general information, not a diagnosis. If sex is painful, talk to a doctor, nurse or sexual health clinic.",
    },
  },
  {
    slug: "consent-relationships",
    category: "sexual-health",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Planned Parenthood — Sexual consent", href: "https://www.plannedparenthood.org/learn/relationships/sexual-consent" },
      { label: "Office on Women's Health — Am I being abused?", href: "https://www.womenshealth.gov/relationships-and-safety/signs-abuse" },
      { label: "Office on Women's Health — Relationships and safety", href: "https://www.womenshealth.gov/relationships-and-safety" },
      { label: "NHS — Emergency contraception", href: "https://www.nhs.uk/contraception/emergency-contraception/" },
      { label: "NHS — HIV prevention", href: "https://www.nhs.uk/conditions/hiv-and-aids/prevention/" },
    ],
    related: ["safer-sex", "emergency-contraception", "stis"],
    es: {
      title: "Consentimiento y relaciones sanas",
      summary: "El consentimiento es aceptar de forma libre y clara una actividad sexual, cada vez. Aquí verás cómo es el consentimiento real y las señales de una relación sana o no sana.",
      sections: [
        {
          heading: "Qué significa el consentimiento",
          body: "El consentimiento es un sí claro y activo a una actividad sexual. Es la forma en que cada persona le muestra a la otra que quiere lo que está pasando. Las dos personas tienen que darlo, cada vez y para cada tipo de actividad sexual. Esto vale con una pareja nueva y con una pareja de muchos años. La actividad sexual sin consentimiento es agresión sexual o violación.",
        },
        {
          heading: "Qué hace que el consentimiento sea real",
          body: "El consentimiento real se da libremente, sin presión ni manipulación, y no bajo los efectos de drogas o alcohol. Es informado: si alguien dice que usará condón (preservativo) y luego no lo hace, no hay un consentimiento completo. Es entusiasta, es decir, solo haces lo que quieres hacer, no lo que sientes que se espera de ti. Es específico: decir que sí a una cosa, como besarse, no es un sí a nada más.",
        },
        {
          heading: "Siempre puedes cambiar de opinión",
          body: "Puedes parar o decir que no en cualquier momento, incluso a mitad y aunque antes hayas dicho que sí. El silencio no es consentimiento. Lo que alguien lleva puesto, adónde va o lo que haya hecho en el pasado nunca cuenta como un sí. Una persona muy borracha, drogada, dormida o inconsciente no puede aceptar tener sexo.",
        },
        {
          heading: "Preguntar a tu pareja",
          body: "La forma más clara de saberlo es preguntar. Preguntas sencillas como «¿Está bien así?» o «¿Quieres seguir?» funcionan bien. Fíjate también en el lenguaje corporal. Si tu pareja parece dudar, se queda en silencio, se tensa o se aparta, para y pregúntale cómo está. Una buena pareja se alegrará de que preguntes y respetará tu respuesta.",
        },
        {
          heading: "Relaciones sanas y no sanas",
          body: "En una relación sana sientes que te respetan y que estás a salvo. Puedes decir que no al sexo, o a cualquier otra cosa, sin miedo a lo que pueda pasar. Puedes ver a tus amistades y a tu familia, tomar tus propias decisiones, ser tú y hablar con sinceridad cuando hay un desacuerdo. Las señales de alarma incluyen una pareja que te presiona u obliga a tener sexo, vigila todo lo que haces o te exige tus contraseñas, controla tu dinero o tu anticoncepción, te aleja de tus amistades y tu familia, te menosprecia, o te amenaza o te hace daño. Sentir a menudo presión, control o miedo con tu pareja también es una señal de alarma.",
        },
        {
          heading: "Si no te sientes a salvo",
          body: "Si una relación no te parece segura, o alguien te hizo algo sexual sin tu consentimiento, no es tu culpa. No tienes que pasar por esto a solas. Puedes hablar con un médico o una enfermera, con un servicio de salud sexual o con una línea de ayuda local contra la violencia doméstica. Después de un acto sexual sin consentimiento, intenta recibir atención médica lo antes posible. La anticoncepción de emergencia debe usarse en un plazo de 3 a 5 días y funciona mejor cuanto antes la tomes. El medicamento que reduce la probabilidad de VIH (PEP, profilaxis posexposición) debe empezarse en un plazo de 72 horas. Un médico o un servicio de salud sexual también pueden hacerte pruebas de ITS. Si estás en peligro ahora mismo, llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España).",
        },
      ],
      notice: "Si no te sientes a salvo en una relación, mereces apoyo. Habla con alguien de confianza, con un médico o con una línea de ayuda local, o llama al número de emergencias de tu país si estás en peligro.",
    },
    en: {
      title: "Consent and healthy relationships",
      summary: "Consent means freely and clearly agreeing to sexual activity, every time. Here is what real consent looks like, and the signs of a healthy or unhealthy relationship.",
      sections: [
        {
          heading: "What consent means",
          body: "Consent is a clear, active yes to sexual activity. It is how each person shows the other that they want what is happening. Both people need to give it, every time, for every kind of sexual activity. This is true with a new partner and with a long-term partner. Sexual activity without consent is sexual assault or rape.",
        },
        {
          heading: "What makes consent real",
          body: "Real consent is given freely, without pressure or manipulation, and not under the influence of drugs or alcohol. It is informed: if someone says they will use a condom and then does not, there is no full consent. It is enthusiastic, meaning you only do what you want to do, not what you feel is expected. It is specific, so saying yes to one thing, like kissing, is not a yes to anything else.",
        },
        {
          heading: "You can always change your mind",
          body: "You can stop or say no at any point, even partway through and even if you have said yes before. Silence is not consent. What someone wears, where they go or what they have done in the past never counts as a yes. Someone who is very drunk, high, asleep or unconscious is not able to agree to sex.",
        },
        {
          heading: "Checking in with a partner",
          body: "The clearest way to know is to ask. Simple questions like 'Is this OK?' or 'Do you want to keep going?' work well. Pay attention to body language too. If a partner seems unsure, goes quiet, tenses up or pulls away, stop and check. A good partner will be glad you asked and will respect your answer.",
        },
        {
          heading: "Healthy and unhealthy relationships",
          body: "In a healthy relationship, you feel respected and safe. You can say no to sex, or to anything else, without fear of what will happen. You can see friends and family, make your own decisions, be yourself, and talk honestly when you disagree. Warning signs include a partner who pressures or forces you into sex, keeps track of everything you do or demands your passwords, controls your money or your contraception, keeps you from friends and family, puts you down, or threatens or hurts you. Often feeling pressured, controlled or scared around a partner is a warning sign too.",
        },
        {
          heading: "If you feel unsafe",
          body: "If a relationship feels unsafe, or someone did something sexual to you without your consent, it is not your fault. You do not have to deal with it alone. You can talk to a doctor or nurse, a sexual health clinic, or a local domestic abuse helpline. After sex without consent, try to get medical help as soon as you can. Emergency contraception must be used within 3 to 5 days and works best the sooner you take it. Medicine that lowers the chance of HIV (PEP) must be started within 72 hours. A doctor or clinic can also test you for STIs. If you are in danger right now, call your local emergency number.",
        },
      ],
      notice: "If you feel unsafe in a relationship, you deserve support. Talk to someone you trust, a doctor or a local helpline, or call emergency services if you are in danger.",
    },
  },
  {
    slug: "sex-during-period",
    category: "sexual-health",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "Planned Parenthood — Can I have sex during my period?", href: "https://www.plannedparenthood.org/blog/can-i-have-sex-during-my-period-can-i-get-pregnant-during-my-period" },
      { label: "NHS — Periods and fertility in the menstrual cycle", href: "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/" },
      { label: "KidsHealth — Could I get pregnant if I have sex during my period?", href: "https://kidshealth.org/en/teens/sex-during-period.html" },
      { label: "NHS — Emergency contraception", href: "https://www.nhs.uk/contraception/emergency-contraception/" },
    ],
    related: ["fertile-window", "condoms", "emergency-contraception"],
    es: {
      title: "Sexo durante el periodo",
      summary: "Tener sexo durante el periodo está bien si las dos personas lo desean. Aun así puede haber un embarazo o una ITS, así que la anticoncepción y el condón siguen siendo importantes.",
      sections: [
        {
          heading: "Es tu decisión",
          body: "Tener sexo durante el periodo no es perjudicial, y hacerlo o no es una decisión tuya y de tu pareja. A algunas personas les gusta y otras prefieren no hacerlo, y las dos opciones están bien. Algunas personas notan que tener un orgasmo ayuda a aliviar los cólicos menstruales. Si prefieres esperar, siempre hay otras formas de cercanía y caricias.",
        },
        {
          heading: "Aun así puede haber embarazo",
          body: "Un embarazo es menos probable durante el periodo, pero puede ocurrir. Los espermatozoides pueden sobrevivir dentro del cuerpo hasta 7 días después del sexo. La ovulación (cuando un ovario libera un óvulo) suele ocurrir unos 10 a 16 días antes de tu siguiente periodo. Si tienes ciclos cortos, u ovulas antes de lo habitual, la ovulación puede ocurrir poco después de que termine tu periodo. Los espermatozoides del sexo durante el periodo aún podrían estar vivos entonces. Además, un sangrado ligero no siempre es un periodo. Algunas personas sangran un poco alrededor de la ovulación, que es cuando el embarazo es más probable.",
        },
        {
          heading: "La anticoncepción y las ITS siguen importando",
          body: "Sea cual sea el día del periodo, el sexo puede provocar un embarazo o una infección de transmisión sexual (ITS). Algunas ITS también pueden pasar de una persona a otra más fácilmente durante el periodo. Sigue usando anticoncepción si no quieres un embarazo. El condón (preservativo) es el único método anticonceptivo que también protege de las ITS, así que úsalo cada vez si te preocupan las ITS. La ventana fértil de Ciclo es solo una estimación, así que no confíes en ella para evitar un embarazo.",
        },
        {
          heading: "Consejos prácticos",
          body: "Una toalla oscura en la cama puede facilitar la limpieza, y algunas personas prefieren tener sexo en la ducha. Quítate el tampón antes del sexo con penetración. Si tienes cólicos o cansancio, el sexo más lento o suave, u otras formas de caricias, pueden resultar más agradables. Habla con tu pareja sobre lo que resulta cómodo para las dos personas.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "El sexo no debería doler. Consulta a un médico o una enfermera si el sexo te duele, o si sangras después del sexo cuando no tienes el periodo, porque esto siempre debe revisarse. Si has tenido sexo sin anticoncepción y no quieres un embarazo, pregunta lo antes posible por la anticoncepción de emergencia a un farmacéutico o farmacéutica, a un médico o en un servicio de salud sexual. Debe usarse en un plazo de 3 a 5 días, y funciona mejor cuanto antes la uses.",
        },
      ],
      notice: "Esto es información general. El sexo durante el periodo puede llevar a un embarazo o a una ITS, así que sigue usando anticoncepción y condón.",
    },
    en: {
      title: "Sex during your period",
      summary: "Sex during your period is fine if you both want it. You can still get pregnant or get an STI, so contraception and condoms still matter.",
      sections: [
        {
          heading: "It is your choice",
          body: "Having sex during your period is not harmful, and whether you do is up to you and your partner. Some people enjoy it and some prefer not to, and both are fine. Some find that having an orgasm helps ease period cramps. If you would rather wait, other kinds of closeness and touch are always an option.",
        },
        {
          heading: "You can still get pregnant",
          body: "Pregnancy is less likely during a period, but it can happen. Sperm can survive inside the body for up to 7 days after sex. Ovulation (when an ovary releases an egg) usually happens about 10 to 16 days before your next period. If you have a short cycle, or you ovulate earlier than usual, ovulation can happen soon after your period ends. Sperm from sex during your period could still be alive then. Also, light bleeding is not always a period. Some people bleed a little around ovulation, which is when pregnancy is most likely.",
        },
        {
          heading: "Contraception and STIs still matter",
          body: "Whatever day of your period it is, sex can still lead to pregnancy or a sexually transmitted infection (STI). Some STIs may also pass between partners more easily during a period. Keep using contraception if you do not want to get pregnant. Condoms are the only kind of contraception that also protects against STIs, so use one every time if STIs are a concern. Ciclo's fertile window is only an estimate, so do not rely on it to prevent pregnancy.",
        },
        {
          heading: "Practical tips",
          body: "A dark towel on the bed can make cleaning up easier, and some people prefer having sex in the shower. Take out a tampon before penetrative sex. If you have cramps or feel tired, slower or gentler sex, or other kinds of touch, may feel better. Talk with your partner about what feels comfortable for you both.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Sex should not hurt. See a doctor or nurse if sex is painful, or if you bleed after sex when you are not on your period, as this should always be checked. If you had sex without contraception and do not want to be pregnant, ask a pharmacist, doctor or sexual health clinic about emergency contraception as soon as possible. It needs to be used within 3 to 5 days, and it works better the sooner you use it.",
        },
      ],
      notice: "This is general information. You can get pregnant or get an STI from sex during your period, so keep using contraception and condoms.",
    },
  },
];
