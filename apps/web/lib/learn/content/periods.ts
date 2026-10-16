// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const PERIODS_ARTICLES: LearnArticle[] = [
  {
    slug: "period-basics",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NHS — Vaginal bleeding between periods or after sex", href: "https://www.nhs.uk/symptoms/vaginal-bleeding-between-periods-or-after-sex/" },
      { label: "NHS — Heavy periods", href: "https://www.nhs.uk/conditions/heavy-periods/" },
    ],
    related: ["period-blood", "period-products", "normal-cycle-length"],
    es: {
      title: "Periodos: qué esperar",
      summary: "Un periodo es cuando tu cuerpo desprende el revestimiento del útero. Aquí verás cuánto suelen durar los periodos, cuánta sangre es habitual y cómo cambian a lo largo de la vida.",
      sections: [
        {
          heading: "Qué es un periodo",
          body: "Cada mes, el revestimiento del útero (matriz) se va engrosando. Durante el periodo, tu cuerpo desprende este revestimiento. El revestimiento sale en forma de sangre y tejido. Pasa por el cérvix (el cuello del útero) y sale del cuerpo por la vagina. Ese sangrado es tu periodo. El primer día de sangrado es también el primer día de un nuevo ciclo menstrual.",
        },
        {
          heading: "Cuánto dura y cada cuánto llega",
          body: "Un periodo suele durar unos 5 días, pero es habitual cualquier duración de 2 a 7 días. Tu ciclo es el tiempo que va desde el primer día de un periodo hasta el inicio del siguiente. Muchas personas tienen el periodo más o menos cada 28 días, pero es habitual tenerlo con más o menos frecuencia. La mayoría de los ciclos en personas adultas duran entre unos 21 y 38 días. Un ciclo también puede ser un poco más corto o más largo de un mes a otro.",
        },
        {
          heading: "Cuánta sangre es normal",
          body: "La mayoría de las personas pierden unos 20 a 90 ml de sangre en todo el periodo, es decir, de 1 a 5 cucharadas aproximadamente. En promedio, son unas 2 o 3 cucharadas. Algunas personas sangran más. La cantidad suele cambiar a lo largo de los días del periodo y puede variar de un mes a otro. La sangre suele ser roja cuando el sangrado es más abundante. Los días más ligeros puede verse rosa o marrón.",
        },
        {
          heading: "Cómo cambian los periodos a lo largo de la vida",
          body: "En promedio, el primer periodo llega hacia los 12 años, pero empezar en cualquier momento entre los 8 y los 15 está dentro de lo habitual. Durante unos años después del primer periodo, los ciclos suelen ser irregulares, y es frecuente que duren más de 38 días. Los periodos también suelen ser más abundantes en la adolescencia. En la década de los 20 y de los 30, los ciclos suelen ser más regulares. En la década de los 40, a medida que el cuerpo se acerca a la menopausia, los ciclos pueden volverse irregulares. Los periodos pueden desaparecer un mes o unos meses y luego volver. La menopausia suele llegar entre mediados de los 40 y mediados de los 50 años.",
        },
        {
          heading: "Cuándo hablar con un médico o una enfermera",
          body: "Registrar tus periodos en Ciclo puede ayudarte a notar cambios. Habla con un médico o una enfermera si tus ciclos suelen durar menos de 24 días o más de 38. Habla también con ellos si llevas 3 meses sin periodo y no estás embarazada ni dando el pecho. Consulta también si el primer periodo llega antes de los 8 años, si no ha llegado a los 15 o si no ha llegado en los 3 años siguientes a que empezaran a crecer los pechos. Si el dolor o el sangrado te impiden ir a clase o al trabajo, o hacer tus actividades habituales, pide ayuda, porque se puede tratar. Un médico o una enfermera siempre debe revisar el sangrado entre periodos, después de las relaciones sexuales o después de la menopausia.",
        },
        {
          heading: "Cuándo pedir ayuda urgente",
          body: "Consulta también con un médico o una enfermera si necesitas cambiarte la toalla higiénica (compresa) o el tampón cada 1 o 2 horas, o si tu periodo dura más de 7 días. Llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias si sangras mucho y te desmayas o sientes que te vas a desmayar, o si tienes dolor en el pecho o te cuesta respirar. Si el sangrado abundante te causa mareo, aturdimiento o debilidad, ponte en contacto con un médico o una enfermera ese mismo día. Busca ayuda de emergencia si tienes un dolor repentino e intenso en el abdomen.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si tus periodos cambian o te preocupan, habla con un médico o una enfermera.",
    },
    en: {
      title: "Periods: what to expect",
      summary: "A period is when your body sheds the lining of the womb. Here is how long periods usually last, how much blood is typical and how periods change through life.",
      sections: [
        {
          heading: "What a period is",
          body: "Each month, the lining of your womb (uterus) builds up. During a period, your body sheds this lining. The lining comes away as blood and tissue. It passes through the cervix (the neck of the womb) and leaves your body through the vagina. This bleeding is your period. The first day of bleeding is also the first day of a new menstrual cycle.",
        },
        {
          heading: "How long it lasts and how often",
          body: "A period usually lasts about 5 days, but anything from 2 to 7 days is common. Your cycle is the time from the first day of one period to the start of the next. Many people have a period about every 28 days, but it is common to have them more or less often than this. Most adult cycles last somewhere between about 21 and 38 days. A cycle can also be a bit shorter or longer from one month to the next.",
        },
        {
          heading: "How much blood is normal",
          body: "Most people lose about 20 to 90 ml of blood in a whole period, which is roughly 1 to 5 tablespoons. On average, it is about 2 to 3 tablespoons. Some people bleed more than this. The amount usually changes over the days of a period, and it can differ from month to month. Blood is usually red when the flow is heaviest. On lighter days it may look pink or brown.",
        },
        {
          heading: "How periods change through life",
          body: "On average, a first period comes at about age 12, but starting any time from 8 to 15 is within the usual range. For a few years after the first period, cycles are often irregular, and cycles longer than 38 days are common. Periods also tend to be heavier in the teenage years. In your 20s and 30s, cycles are usually more regular. In your 40s, as your body moves towards menopause, cycles may become irregular. Periods can stop for a month or a few months and then start again. Menopause usually happens between the mid-40s and mid-50s.",
        },
        {
          heading: "When to talk to a doctor or nurse",
          body: "Logging your periods in Ciclo can help you notice changes. Talk to a doctor or nurse if your cycles are often shorter than 24 days or longer than 38 days. Also talk to them if you have had no period for 3 months and are not pregnant or breastfeeding. Get checked too if a first period comes before age 8, has not come by 15, or has not come within 3 years of breast growth. If pain or bleeding stops you going to school or work, or doing things you usually do, get help, because it can be treated. Bleeding between periods, after sex or after menopause should always be checked by a doctor or nurse.",
        },
        {
          heading: "When to get urgent help",
          body: "Also see a doctor or nurse if you need to change a pad or tampon every 1 to 2 hours, or if your period lasts more than 7 days. Call your local emergency number or go to an emergency department if you are bleeding heavily and you faint or feel about to faint, or you have chest pain or trouble breathing. If heavy bleeding makes you feel dizzy, light-headed or weak, contact a doctor or nurse the same day. Get emergency help for sudden, severe pain in your tummy.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods change or worry you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "period-products",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS inform — Choosing period products", href: "https://www.nhsinform.scot/healthy-living/womens-health/girls-and-young-women-puberty-to-around-25/periods-and-menstrual-health/choosing-period-products/" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "New Jersey Department of Health — Menstrual discs", href: "https://www.nj.gov/health/womenshealth/reproductive-health/periods-menstruation/period-products/menstrual-discs.shtml" },
      { label: "FDA — The facts on tampons and tampon safety", href: "https://www.fda.gov/consumers/consumer-updates/facts-tampons-and-tampon-safety" },
      { label: "Planned Parenthood — How to use menstrual hygiene products", href: "https://www.plannedparenthood.org/learn/health-and-wellness/menstruation/how-to-use-menstrual-hygiene-products" },
    ],
    related: ["toxic-shock-syndrome", "heavy-periods", "period-basics"],
    es: {
      title: "Toallas higiénicas, tampones, copas y ropa interior menstrual",
      summary: "No hay un único producto menstrual que sea el mejor. Aquí verás cómo funcionan las toallas higiénicas, los tampones, las copas, los discos y la ropa interior menstrual, cómo elegir y cómo usarlos con seguridad.",
      sections: [
        {
          heading: "Toallas higiénicas y ropa interior menstrual",
          body: "Las toallas higiénicas (compresas) se colocan dentro de la ropa interior y absorben la sangre. Se sujetan con una tira adhesiva. Las hay de distintos tamaños y niveles de absorción, incluidas las nocturnas, para que puedas elegir según cuánto sangras. Cambia la toalla higiénica cada pocas horas. Las desechables van a la basura, no al inodoro. Las toallas de tela reutilizables se pueden lavar y volver a usar. La ropa interior menstrual lleva capas absorbentes incorporadas. Necesitarás varias prendas y una forma de lavarlas. En los días de poco sangrado, una prenda puede durar hasta un día más o menos, pero en los días de mucho sangrado puede que tengas que cambiarla cada 4 a 6 horas. Consulta las indicaciones del fabricante.",
        },
        {
          heading: "Tampones",
          body: "Los tampones se llevan dentro de la vagina. Absorben la sangre allí, así que no llega a la ropa interior. Cada caja indica el nivel de absorción de los tampones, para que puedas elegir según cuánto sangras. Usa la absorción más baja que te funcione, y usa tampones solo mientras estés sangrando. Cambia el tampón cada 4 a 8 horas, y nunca lo dejes puesto más de 8 horas. Puedes llevar uno por la noche si vas a dormir 8 horas o menos. Cámbialo en cuanto te levantes.",
        },
        {
          heading: "Copas y discos menstruales",
          body: "La copa menstrual es una copa pequeña y flexible, normalmente de silicona de grado médico. Se coloca dentro de la vagina y recoge la sangre hasta que la vacías, en lugar de absorberla. El disco menstrual es más ancho y menos profundo. Se coloca en la parte alta de la vagina, cerca del cérvix (el cuello del útero), encajado detrás del hueso púbico. La copa o el disco se sacan, se vacían, se enjuagan y se vuelven a colocar. La mayoría de las copas y los discos se pueden llevar hasta unas 12 horas, pero vacíalos antes si se llenan, algo que puede pasar en los días de mucho sangrado. Sigue siempre las instrucciones de tu producto. Algunos discos son desechables.",
        },
        {
          heading: "Cómo elegir",
          body: "El mejor producto es el que se adapta a tu cuerpo, a tu sangrado y a tu día. El sangrado suele cambiar durante el periodo, así que algunas personas usan productos distintos según el día, por ejemplo un tampón o una copa los días de más sangrado y una toalla higiénica los días de menos. Piensa en la comodidad, en si puedes lavar los productos reutilizables y en cómo vas a tirar los desechables. Está bien probar varias opciones hasta encontrar la que te funcione.",
        },
        {
          heading: "Usar los productos con seguridad",
          body: "Lávate las manos antes de ponerte o quitarte un tampón, una copa o un disco. Todo lo que se lleva dentro de la vagina tiene un pequeño riesgo de síndrome de shock tóxico (SST), una enfermedad poco frecuente pero grave, así que nunca lo dejes puesto más tiempo del que indican las instrucciones. Si mientras usas un tampón, una copa o un disco te da de repente fiebre alta, vómitos o una erupción en la piel, o sientes mareo o que te vas a desmayar, sácatelo y busca atención médica de inmediato. Si te sientes muy mal, notas confusión o te cuesta respirar, llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España). Si notas un flujo vaginal desagradable y crees que puedes haber olvidado un tampón, consulta con un médico o una enfermera lo antes posible.",
        },
      ],
      notice: "Esta es información general. Sigue siempre las instrucciones de tu producto y habla con un médico o una enfermera si notas que algo no va bien.",
    },
    en: {
      title: "Pads, tampons, cups and period underwear",
      summary: "There is no single best period product. Here is how pads, tampons, cups, discs and period underwear work, how to choose, and how to use them safely.",
      sections: [
        {
          heading: "Pads and period underwear",
          body: "Pads sit inside your underwear and soak up blood, held in place by a sticky strip. They come in different sizes and absorbencies, including overnight pads, so you can match them to your flow. Change a pad every few hours. Disposable pads go in the bin, not down the toilet. Reusable cloth pads can be washed and used again. Period underwear has absorbent layers built in. You will need several pairs and a way to wash them. One pair may last up to about a day on light days, but on heavy days you may need to change every 4 to 6 hours. Check the maker's advice.",
        },
        {
          heading: "Tampons",
          body: "Tampons are worn inside the vagina. They soak up blood there, so it does not reach your underwear. Each pack shows how absorbent the tampons are, so you can match them to your flow. Use the lowest absorbency that works for you, and only use tampons while you are bleeding. Change a tampon every 4 to 8 hours, and never leave one in for more than 8 hours. You can wear one overnight if you will sleep for 8 hours or less. Change it as soon as you get up.",
        },
        {
          heading: "Menstrual cups and discs",
          body: "A menstrual cup is a small, flexible cup, usually made of medical-grade silicone. It sits inside the vagina and holds blood until you empty it, rather than soaking it up. A menstrual disc is a wider, shallower shape. It sits high in the vagina, near the cervix (the neck of the womb), tucked behind the pubic bone. You take out a cup or disc, empty it, rinse it and put it back. Most cups and discs can be worn for up to about 12 hours, but empty them sooner if they are full, which can happen on heavy days. Always follow the instructions for your product. Some discs are disposable.",
        },
        {
          heading: "How to choose",
          body: "The best product is the one that suits your body, your flow and your day. Flow usually changes during a period, so some people use different products on different days, such as a tampon or cup on heavy days and a pad on light days. Think about comfort, whether you can wash reusable products, and how you will throw away disposable ones. It is fine to try a few options before you find what works for you.",
        },
        {
          heading: "Using products safely",
          body: "Wash your hands before you put in or take out a tampon, cup or disc. Anything worn inside the vagina carries a small risk of toxic shock syndrome (TSS), a rare but serious illness, so never leave it in longer than the instructions say. If you suddenly get a high fever, vomiting or a rash, or feel dizzy or faint, while using a tampon, cup or disc, take it out and get medical help straight away. If you feel very unwell or confused, or have trouble breathing, call your local emergency number. If you notice an unpleasant discharge and think you may have forgotten a tampon, see a doctor or nurse as soon as you can.",
        },
      ],
      notice: "This is general information. Always follow the instructions that come with your product, and talk to a doctor or nurse if something feels wrong.",
    },
  },
  {
    slug: "toxic-shock-syndrome",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Toxic shock syndrome", href: "https://www.nhs.uk/conditions/toxic-shock-syndrome/" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
      { label: "FDA — The facts on tampons and tampon safety", href: "https://www.fda.gov/consumers/consumer-updates/facts-tampons-and-tampon-safety" },
    ],
    related: ["period-products", "period-basics"],
    es: {
      title: "Síndrome de shock tóxico",
      summary: "El síndrome de shock tóxico (SST) es poco frecuente, pero puede poner en peligro la vida. Conoce las señales de alarma, qué hacer de inmediato y cómo reducir el riesgo con los tampones y las copas.",
      sections: [
        {
          heading: "Qué es el SST",
          body: "El síndrome de shock tóxico (SST) es una enfermedad poco frecuente, pero que puede poner en peligro la vida. Lo causan unos venenos (toxinas) que producen ciertas bacterias. Mucha gente lo conoce por su relación con los tampones. También puede ocurrir con copas o discos menstruales, con un capuchón cervical o un diafragma anticonceptivo, después de dar a luz, o por un corte, una quemadura o un forúnculo infectados. Puede afectar a cualquier persona, incluidos niños y niñas y personas que no tienen periodos. Los casos relacionados con los tampones se han vuelto mucho menos frecuentes con los años.",
        },
        {
          heading: "Señales de alarma",
          body: "Los síntomas pueden empezar de repente y parecerse a los de la gripe. Incluyen fiebre alta o sensación de calor, frío y escalofríos, dolores musculares, vómitos y diarrea. Otras señales son un dolor intenso en los brazos, las piernas o todo el cuerpo; palmas de las manos, plantas de los pies, lengua o blanco de los ojos de color rojo intenso; y piel hinchada o que se pela. Puede salirte una erupción que parece una quemadura de sol o que al tacto parece papel de lija. Puedes sentir mareo, confusión o que te vas a desmayar, sobre todo al ponerte de pie. Tómate en serio estas señales si llevas puesto un tampón, una copa o un disco, o si has usado uno hace poco.",
        },
        {
          heading: "Qué hacer de inmediato",
          body: "Si tienes alguna de estas señales mientras usas un tampón, una copa o un disco, o poco después de usarlo, sácatelo si todavía lo llevas puesto. Después busca atención médica de inmediato, ese mismo día. No esperes a ver si mejora. Si no puedes conseguir ayuda rápido, llama al número de emergencias de tu país.",
        },
        {
          heading: "Cuándo llamar a emergencias",
          body: "Llama ahora al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias si alguien tiene confusión, arrastra las palabras al hablar o dice cosas sin sentido. Haz lo mismo si le falta el aire, respira muy rápido o se desmaya. También necesitan ayuda de emergencia la piel, los labios o la lengua de color azulado, gris, pálido o con manchas, una erupción que no desaparece al presionar un vaso de vidrio transparente sobre ella, o zonas grandes de piel que se pelan. El SST puede empeorar rápido, así que no esperes.",
        },
        {
          heading: "Cómo se trata el SST",
          body: "El SST necesita tratamiento urgente en el hospital. El tratamiento puede incluir antibióticos, líquidos por vía intravenosa (suero), medicamentos para mantener la presión arterial y oxígeno. Algunas personas necesitan una operación para limpiar un corte o una herida infectados. Como el SST puede llegar a poner en peligro la vida, siempre es mejor que te revisen rápido, aunque al final sea algo leve.",
        },
        {
          heading: "Cómo reducir el riesgo",
          body: "Lávate las manos antes de ponerte o quitarte un tampón, una copa o un disco, y sigue las instrucciones del producto. Usa el tampón de menor absorción que sea suficiente para tu sangrado. Cámbialo cada 4 a 8 horas y nunca lo lleves más de 8 horas. Usa tampones solo cuando estés sangrando. No dejes una copa, un disco u otro dispositivo puesto más tiempo del que indican las instrucciones. Mantén limpios los cortes y las quemaduras. El SST es más probable si ya lo has tenido antes, así que pregunta a un médico si estos productos son seguros para ti.",
        },
      ],
      notice: "Esta es información general. Si te sientes muy mal mientras usas un tampón, una copa o un disco, sácatelo y busca ayuda de emergencia.",
    },
    en: {
      title: "Toxic shock syndrome",
      summary: "Toxic shock syndrome (TSS) is rare but can be life-threatening. Know the warning signs, what to do straight away, and how to lower your risk with tampons and cups.",
      sections: [
        {
          heading: "What TSS is",
          body: "Toxic shock syndrome (TSS) is a rare but life-threatening illness. It is caused by poisons (toxins) made by certain bacteria. Many people know it from its link with tampons. It can also happen with menstrual cups, discs, a contraceptive cap or diaphragm, after giving birth, or from an infected cut, burn or boil. It can affect anyone, including children and people who do not have periods. Cases linked to tampons have become much less common over the years.",
        },
        {
          heading: "Signs to watch for",
          body: "Symptoms can start suddenly and may feel like flu. They include a high temperature or feeling hot, cold and shivery, muscle aches, vomiting and diarrhoea. Other signs are severe pain in your arms, legs or all over your body, bright red palms, soles, tongue or whites of the eyes, and swollen or peeling skin. You may get a rash that looks like sunburn or feels like sandpaper. You may feel dizzy, confused or faint, especially when you stand up. Take these signs seriously if you have a tampon, cup or disc in, or have recently used one.",
        },
        {
          heading: "What to do straight away",
          body: "If you have any of these signs while using a tampon, cup or disc, or soon after using one, take it out if it is still in. Then get medical help straight away, the same day. Do not wait to see if it gets better. If you cannot get help quickly, call your local emergency number.",
        },
        {
          heading: "When to call an emergency number",
          body: "Call your local emergency number or go to an emergency department now if someone is confused, has slurred speech or is not making sense. Do the same if they are breathless or breathing very fast, or faint. Blue, grey, pale or blotchy skin, lips or tongue, a rash that does not fade when you press a clear glass on it, or large areas of peeling skin also need emergency help. TSS can get worse quickly, so do not wait.",
        },
        {
          heading: "How TSS is treated",
          body: "TSS needs urgent treatment in hospital. Treatment can include antibiotics, fluids through a drip, medicine to support blood pressure, and oxygen. Some people need an operation to clean out an infected cut or wound. Because TSS can become life-threatening, it is always better to get checked quickly, even if it turns out to be something minor.",
        },
        {
          heading: "How to lower your risk",
          body: "Wash your hands before you put in or take out a tampon, cup or disc, and follow the product instructions. Use the lowest absorbency tampon that handles your flow. Change it every 4 to 8 hours and never wear one for more than 8 hours. Only use tampons when you are bleeding. Do not leave a cup, disc or other device in for longer than the instructions say. Keep cuts and burns clean. TSS is more likely if you have had it before, so ask a doctor whether these products are safe for you.",
        },
      ],
      notice: "This is general information. If you feel very unwell while using a tampon, cup or disc, take it out and get emergency help.",
    },
  },
  {
    slug: "heavy-periods",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Heavy periods", href: "https://www.nhs.uk/conditions/heavy-periods/" },
      { label: "CDC — About heavy menstrual bleeding", href: "https://www.cdc.gov/female-blood-disorders/about/heavy-menstrual-bleeding.html" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NHS — Vaginal bleeding between periods or after sex", href: "https://www.nhs.uk/symptoms/vaginal-bleeding-between-periods-or-after-sex/" },
    ],
    related: ["anemia", "bleeding-disorders", "fibroids"],
    es: {
      title: "Periodos abundantes",
      summary: "Los periodos abundantes son frecuentes y tienen tratamiento. Aprende a reconocer cuándo el sangrado es abundante, qué puede causarlo y qué ayuda puede ofrecerte un médico o una enfermera.",
      sections: [
        {
          heading: "Señales de que tu periodo es abundante",
          body: "La mayoría de las personas pierden unos 20 a 90 ml de sangre en un periodo, de 1 a 5 cucharadas aproximadamente, pero algunas sangran más de forma natural. Tu periodo puede ser abundante si necesitas cambiarte la toalla higiénica (compresa) o el tampón cada 1 o 2 horas, o vaciar la copa más a menudo de lo que indican las instrucciones. Otras señales son usar dos productos a la vez, como una toalla higiénica y un tampón, o sangrar durante más de 7 días. Expulsar coágulos de más de unos 2.5 cm (el tamaño de una moneda grande) es otra señal. También lo es que la sangre traspase y manche tu ropa o la cama.",
        },
        {
          heading: "Cómo puede afectarte",
          body: "El sangrado abundante es uno de los problemas del periodo por los que más se consulta al médico. Puede hacer que evites el ejercicio u otras actividades, o que faltes al trabajo o a clase. Perder mucha sangre cada mes también puede causar anemia. La anemia puede provocarte cansancio, debilidad, falta de energía o falta de aire. Si los periodos abundantes interfieren en tu vida, eso ya es motivo suficiente para pedir ayuda.",
        },
        {
          heading: "Posibles causas",
          body: "A menudo no se encuentra una causa clara, y para algunas personas los periodos abundantes son normales. Entre las causas conocidas están los miomas, la endometriosis, la adenomiosis, la enfermedad inflamatoria pélvica y el síndrome de ovario poliquístico (SOP, que ahora también se llama PMOS). Los trastornos de la coagulación de la sangre, como la enfermedad de von Willebrand, pueden causar periodos abundantes. También algunos medicamentos, como algunos anticoagulantes (medicamentos que hacen que la sangre coagule menos) y la quimioterapia. En raras ocasiones, los periodos abundantes pueden ser una señal de cáncer de útero.",
        },
        {
          heading: "Tratamientos que pueden ayudar",
          body: "El tratamiento depende de la causa y de lo que mejor te vaya. Entre las opciones están el DIU hormonal, también llamado sistema intrauterino, y la píldora anticonceptiva combinada. También pueden ayudar medicamentos sin hormonas, como el ácido tranexámico, o analgésicos antiinflamatorios como el naproxeno o el ácido mefenámico. Si no funcionan, un especialista puede proponerte un procedimiento para eliminar el revestimiento del útero (ablación endometrial), quitar los miomas o extirpar el útero (histerectomía).",
        },
        {
          heading: "Cuándo consultar con un médico o una enfermera",
          body: "Consulta con un médico o una enfermera si los periodos abundantes afectan a tu día a día, si llevas tiempo con periodos abundantes o si a menudo sientes cansancio o falta de aire. Consulta también si tienes un dolor intenso durante el periodo, sangrado entre periodos o después de las relaciones sexuales, o dolor al orinar, al defecar o al tener relaciones sexuales. Ponte en contacto con un médico o una enfermera ese mismo día si empapas una o más toallas higiénicas o tampones cada hora durante varias horas seguidas. Registrar en Ciclo cuánto sangras cada día puede ayudarte a mostrarle al médico lo que está pasando.",
        },
        {
          heading: "Cuándo pedir ayuda urgente",
          body: "Llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España) o ve a urgencias si sangras mucho y te desmayas o sientes que te vas a desmayar, o si tienes dolor en el pecho o te cuesta respirar. Si el sangrado abundante te causa mareo, aturdimiento o debilidad, ponte en contacto con un médico o una enfermera ese mismo día. Si podrías estar embarazada, aunque no hayas tenido una prueba de embarazo positiva, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del abdomen, en un solo lado, o cualquier sangrado. Busca ayuda de emergencia si tienes un dolor repentino e intenso en el abdomen, dolor en la punta del hombro, sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo que crece fuera del útero (embarazo ectópico).",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si tu sangrado es muy abundante o sientes que te vas a desmayar, busca atención médica.",
    },
    en: {
      title: "Heavy periods",
      summary: "Heavy periods are common and can be treated. Learn the signs that bleeding is heavy, what can cause it, and the help a doctor or nurse can offer.",
      sections: [
        {
          heading: "Signs your period is heavy",
          body: "Most people lose about 20 to 90 ml of blood in a period, roughly 1 to 5 tablespoons, but some people naturally bleed more. Your period may be heavy if you need to change a pad or tampon every 1 to 2 hours, or empty a cup more often than the instructions say. Other signs are using two products at once, such as a pad and a tampon, or bleeding for more than 7 days. Passing clots larger than about 2.5 cm (the size of a large coin) is another sign. So is blood leaking onto your clothes or bedding.",
        },
        {
          heading: "How it can affect you",
          body: "Heavy bleeding is one of the period problems that doctors hear about most often. It can make you avoid exercise or other activities, or take time off work or school. Losing a lot of blood every month can also lead to anaemia. This can leave you feeling tired, weak, low in energy or short of breath. If heavy periods are getting in the way of your life, that alone is a good reason to get help.",
        },
        {
          heading: "Possible causes",
          body: "Often no clear cause is found, and heavy periods can be normal for some people. Known causes include fibroids, endometriosis, adenomyosis, pelvic inflammatory disease and polycystic ovary syndrome (PCOS, now also called PMOS). Bleeding disorders such as von Willebrand disease can cause heavy periods. So can some medicines, including some blood thinners (anticoagulants) and chemotherapy. Rarely, heavy periods can be a sign of womb cancer.",
        },
        {
          heading: "Treatments that can help",
          body: "Treatment depends on the cause and what suits you. Options include a hormonal IUD (coil), also called an intrauterine system, and the combined contraceptive pill. Medicines without hormones can also help, such as tranexamic acid, or anti-inflammatory painkillers such as naproxen or mefenamic acid. If these do not help, a specialist may suggest a procedure to remove the womb lining (endometrial ablation), removing fibroids, or removing the womb (hysterectomy).",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if heavy periods are affecting your daily life, if you have had heavy periods for some time, or if you often feel tired or short of breath. Also see them if you have severe pain during your periods, bleeding between periods or after sex, or pain when you pee, poo or have sex. Contact a doctor or nurse the same day if you soak through one or more pads or tampons every hour for several hours in a row. Logging how heavy each day is in Ciclo can help you show a doctor what is happening.",
        },
        {
          heading: "When to get urgent help",
          body: "Call your local emergency number or go to an emergency department if you are bleeding heavily and you faint or feel about to faint, or you have chest pain or trouble breathing. If heavy bleeding makes you feel dizzy, light-headed or weak, contact a doctor or nurse the same day. If you might be pregnant, even without a positive test, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of a pregnancy growing outside the womb (ectopic pregnancy).",
        },
      ],
      notice: "This is general information, not a diagnosis. If your bleeding is very heavy or you feel faint, get medical help.",
    },
  },
  {
    slug: "period-pain",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Period pain", href: "https://www.nhs.uk/conditions/period-pain/" },
      { label: "MedlinePlus — Period pain", href: "https://medlineplus.gov/periodpain.html" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
    ],
    related: ["heavy-periods", "endometriosis", "adenomyosis"],
    es: {
      title: "Dolor menstrual y cólicos",
      summary: "Los cólicos son muy frecuentes, sobre todo los primeros días del periodo. Aquí verás por qué ocurren, qué ayuda y cuándo el dolor es motivo para consultar.",
      sections: [
        {
          heading: "Por qué puede doler el periodo",
          body: "Durante el periodo, el útero (matriz) se contrae para ayudar a expulsar su revestimiento. Unas sustancias químicas llamadas prostaglandinas, que produce el propio útero, hacen que su músculo se tense y se relaje, y eso es lo que notas como cólicos. Algunas personas producen más prostaglandinas que otras, y esa es una de las razones por las que el dolor varía tanto. Más de la mitad de las personas que tienen periodos sienten algo de dolor. Cuando no hay otro problema de salud detrás, el dolor menstrual suele empezar en los primeros años después de que empiezan los periodos y tiende a disminuir con la edad.",
        },
        {
          heading: "Cómo se suele sentir",
          body: "El dolor menstrual suele notarse como cólicos en la parte baja del abdomen que pueden extenderse a la parte baja de la espalda y a los muslos. Algunas personas sienten un dolor sordo y constante; otras tienen oleadas de dolor agudo. Suele empezar justo antes del periodo o al principio, y normalmente dura hasta 3 días. Tener periodos más largos o más abundantes, empezar a tener periodos antes de los 11 años, fumar y tener mucho estrés se relacionan con más dolor.",
        },
        {
          heading: "Qué ayuda en casa",
          body: "El calor es una de las cosas más sencillas que puedes probar: una almohadilla térmica o una bolsa de agua caliente sobre el abdomen, o un baño o una ducha calientes. Moverte con suavidad, por ejemplo caminar, nadar, ir en bicicleta o hacer yoga, puede aliviar los cólicos a algunas personas, aunque sea lo último que tengas ganas de hacer. Un masaje suave en el abdomen y la parte baja de la espalda, técnicas de relajación como la meditación, y beber menos alcohol y fumar menos también pueden ayudar.",
        },
        {
          heading: "Medicamentos que pueden ayudar",
          body: "Los analgésicos antiinflamatorios (AINE), como el ibuprofeno o el naproxeno, alivian la mayor parte del dolor menstrual. Tomarlos en cuanto empieza el periodo puede controlar mejor el dolor que esperar a que sea fuerte. El paracetamol es otra opción. Lee la información que viene con el medicamento y pregunta a un farmacéutico o farmacéutica si no tienes claro que un medicamento sea adecuado para ti. Si el dolor sigue siendo fuerte, un médico puede recetarte otros antiinflamatorios, o anticoncepción hormonal como la píldora anticonceptiva, el implante, la inyección o un DIU hormonal, que hace más fino el revestimiento del útero y a menudo hace que los periodos sean más ligeros y menos dolorosos.",
        },
        {
          heading: "Cuando el dolor tiene otra causa",
          body: "A veces el dolor menstrual se debe a un problema de salud, como la endometriosis, la adenomiosis, los miomas o la enfermedad inflamatoria pélvica. En algunas personas, un DIU también puede hacer que los periodos duelan más. El dolor por estas causas suele empeorar con el tiempo en lugar de mejorar, puede empezar más tarde en la vida y puede venir con otros síntomas, como sangrado abundante o irregular o dolor durante las relaciones sexuales. Registrar tus cólicos y tu sangrado en Ciclo durante unos ciclos puede ayudarte a mostrarle al médico cuándo aparece el dolor y cuánto dura.",
        },
        {
          heading: "Cuándo consultar con un médico o una enfermera",
          body: "Pide cita si los analgésicos y el autocuidado no te ayudan, si el dolor te impide trabajar, estudiar o dormir, o si tus periodos se vuelven más dolorosos, más abundantes o irregulares. Consulta también si tienes más de 25 años y tienes cólicos intensos por primera vez, si tienes dolor cuando no estás con el periodo, dolor durante las relaciones sexuales o al orinar, o fiebre junto con el dolor menstrual. Busca atención médica urgente ese mismo día si el dolor es intenso o mucho peor de lo habitual y los analgésicos no te han ayudado.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si tu dolor menstrual es intenso o cambia, habla con un médico o una enfermera.",
    },
    en: {
      title: "Period pain and cramps",
      summary: "Cramps are very common, especially in the first days of a period. Here is why they happen, what helps, and when pain is a reason to get checked.",
      sections: [
        {
          heading: "Why periods can hurt",
          body: "During a period, the womb (uterus) squeezes to help push out its lining. Chemicals called prostaglandins, made by the womb, make its muscle tighten and relax, and this is what you feel as cramps. Some people make more prostaglandins than others, which is one reason pain varies so much. More than half of people who have periods get some pain. When there is no other health problem behind it, period pain often starts in the first years after periods begin and tends to ease with age.",
        },
        {
          heading: "What it usually feels like",
          body: "Period pain is usually felt as cramps in the lower tummy that can spread to the lower back and thighs. Some people feel a dull, constant ache; others get sharp waves of pain. It often starts just before or at the start of a period and usually lasts up to 3 days. Having periods that are longer or heavier, starting periods before age 11, smoking and high stress are all linked to more pain.",
        },
        {
          heading: "What helps at home",
          body: "Heat is one of the simplest things to try: a heat pad or hot water bottle on your tummy, or a warm bath or shower. Gentle movement such as walking, swimming, cycling or yoga can ease cramps for some people, even if it is the last thing you feel like doing. A gentle massage of the tummy and lower back, relaxation techniques such as meditation, and cutting down on alcohol and smoking may also help.",
        },
        {
          heading: "Medicines that can help",
          body: "Anti-inflammatory painkillers (NSAIDs) such as ibuprofen or naproxen relieve most period pain. Taking them as soon as your period starts may control pain better than waiting until it is bad. Paracetamol is another option. Read the leaflet and ask a pharmacist if you are not sure a medicine is right for you. If pain is still strong, a doctor can prescribe other anti-inflammatory medicines, or hormonal contraception such as the pill, implant, injection or a hormonal IUD (coil), which thins the womb lining and often makes periods lighter and less painful.",
        },
        {
          heading: "When pain has another cause",
          body: "Sometimes period pain comes from a health condition, such as endometriosis, adenomyosis, fibroids or pelvic inflammatory disease. An IUD (coil) can also make periods more painful for some people. Pain from these causes often gets worse over time instead of better, may start later in life, and can come with other symptoms such as heavy or irregular bleeding or pain during sex. Logging your cramps and bleeding in Ciclo for a few cycles can help you show a doctor when the pain comes and how long it lasts.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Book an appointment if painkillers and self-care do not help, if pain stops you working, studying or sleeping, or if your periods become more painful, heavier or irregular. Also get checked if you are over 25 and get severe cramps for the first time, if you have pain when you are not on your period, pain during sex or when you pee, or a fever with period pain. Get urgent medical help the same day if your pain is severe or much worse than usual and painkillers have not helped.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your period pain is severe or changes, talk to a doctor or nurse.",
    },
  },
  {
    slug: "irregular-periods",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Irregular periods", href: "https://www.nhs.uk/conditions/irregular-periods/" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "Office on Women's Health — Your menstrual cycle", href: "https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle" },
    ],
    related: ["normal-cycle-length", "pcos", "missed-periods"],
    es: {
      title: "Periodos irregulares",
      summary: "Es normal que tu ciclo varíe un poco. Descubre qué puede hacer que los periodos sean irregulares, cuándo es de esperar y cuándo vale la pena hablar con un médico o una enfermera.",
      sections: [
        {
          heading: "Qué significa irregular",
          body: "Tu ciclo es el tiempo que va desde el primer día de un periodo hasta el primer día del siguiente. La mayoría de los ciclos en personas adultas duran entre unos 21 y 38 días, y un ciclo puede ser un poco más corto o más largo de un mes a otro. Se dice que los periodos son irregulares cuando el tiempo entre uno y otro cambia una y otra vez, o cuando a menudo es de menos de 24 días o de más de 38. A veces el periodo directamente no llega.",
        },
        {
          heading: "Cuándo es de esperar",
          body: "Los periodos irregulares son normales durante los primeros años después de que empiezan. En esta etapa son frecuentes los ciclos de más de 38 días. También son normales en los años previos a la menopausia. La menopausia suele llegar entre mediados de los 40 y mediados de los 50 años. El embarazo detiene los periodos, así que la falta de un periodo suele ser una señal temprana de embarazo. Algunos anticonceptivos hormonales, como la píldora solo de progestágeno, la inyección anticonceptiva y el DIU hormonal, también pueden hacer que el sangrado sea irregular.",
        },
        {
          heading: "Otras causas frecuentes",
          body: "El estrés y la ansiedad, perder o ganar mucho peso y hacer ejercicio muy intenso pueden afectar a tu ciclo. Los trastornos alimentarios también pueden alterar los periodos. Entre los problemas de salud que pueden causar periodos irregulares están el síndrome de ovario poliquístico (SOP, que ahora también se llama PMOS), los problemas de tiroides, los niveles altos de la hormona prolactina, la diabetes mal controlada y la enfermedad inflamatoria pélvica. Otra causa es la insuficiencia ovárica prematura (IOP), cuando los ovarios dejan de funcionar con normalidad antes de los 40 años. Algunos medicamentos también pueden influir.",
        },
        {
          heading: "Cómo encontrar la causa",
          body: "Los periodos irregulares no siempre necesitan tratamiento. Un médico o una enfermera te preguntará por tus periodos y por cualquier otro síntoma. Puede pedirte pruebas o derivarte a un especialista para encontrar la causa. El tratamiento depende de lo que haya detrás. Puede consistir en tratar un problema como uno de tiroides, o en usar anticoncepción hormonal. Registrar las fechas de tus periodos en Ciclo hace que el patrón sea más fácil de mostrar, aunque sus pronósticos son menos seguros cuando tus ciclos varían.",
        },
        {
          heading: "Cuándo hablar con un médico o una enfermera",
          body: "Habla con un médico o una enfermera si tus ciclos suelen durar menos de 24 días o más de 38, si tus periodos eran regulares y se han vuelto irregulares, o si un periodo dura más de 7 días. Consulta también si llevas 3 meses sin periodo y no estás embarazada ni dando el pecho. Lo mismo si sangras entre periodos, o si buscas un embarazo y no llega. También vale la pena consultar si tienes periodos irregulares junto con aumento de peso, cansancio, más vello en la cara, o piel seca o grasa. Si podrías estar embarazada y tienes dolor en la parte baja del abdomen, en un solo lado, busca atención médica ese mismo día.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si tu ciclo cambia o te preocupa, habla con un médico o una enfermera.",
    },
    en: {
      title: "Irregular periods",
      summary: "It is normal for your cycle to vary a little. Learn what can make periods irregular, when it is expected, and when it is worth talking to a doctor or nurse.",
      sections: [
        {
          heading: "What irregular means",
          body: "Your cycle is the time from the first day of one period to the first day of the next. Most adult cycles last somewhere between about 21 and 38 days, and a cycle can be a bit shorter or longer from one month to the next. Periods are called irregular when the gap between them keeps changing, or is often shorter than 24 days or longer than 38 days. Sometimes a period is missed altogether.",
        },
        {
          heading: "Times when it is expected",
          body: "Irregular periods are normal for the first few years after periods start. During this time, cycles longer than 38 days are common. They are also normal in the years leading up to menopause. Menopause usually happens between the mid-40s and mid-50s. Pregnancy stops periods, so a missed period is often an early sign of pregnancy. Some hormonal contraception, such as the progestogen-only pill, the contraceptive injection and the hormonal IUD (coil), can also make bleeding irregular.",
        },
        {
          heading: "Other common causes",
          body: "Stress and anxiety, losing or gaining a lot of weight, and exercising very hard can all affect your cycle. Eating disorders can also disrupt periods. Health conditions that can cause irregular periods include polycystic ovary syndrome (PCOS, now also called PMOS), thyroid problems, high levels of the hormone prolactin, diabetes that is not well controlled, and pelvic inflammatory disease. Another cause is premature ovarian insufficiency (POI), when the ovaries stop working normally before age 40. Some medicines can also play a part.",
        },
        {
          heading: "Finding the cause",
          body: "Irregular periods do not always need treatment. A doctor or nurse will ask about your periods and any other symptoms. They may arrange tests or refer you to a specialist to find the cause. Treatment depends on what is behind it. It might mean treating a condition such as a thyroid problem, or using hormonal contraception. Logging your period dates in Ciclo makes the pattern easier to show, though its predictions are less certain when your cycles vary.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Talk to a doctor or nurse if your cycles are often shorter than 24 days or longer than 38 days, if your periods were regular and have become irregular, or if a period lasts more than 7 days. Also get checked if you have had no period for 3 months and are not pregnant or breastfeeding. The same applies if you bleed between periods, or if you are trying to get pregnant and it is not happening. Irregular periods together with weight gain, tiredness, extra hair on your face, or dry or oily skin are also worth checking. If you might be pregnant and have pain low down on one side of your tummy, get medical help the same day.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your cycle changes or worries you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "missed-periods",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Missed or late periods", href: "https://www.nhs.uk/symptoms/missed-or-late-periods/" },
      { label: "Office on Women's Health — Period problems", href: "https://www.womenshealth.gov/menstrual-cycle/period-problems" },
      { label: "NHS — Irregular periods", href: "https://www.nhs.uk/conditions/irregular-periods/" },
      { label: "NHS — Vaginal bleeding between periods or after sex", href: "https://www.nhs.uk/symptoms/vaginal-bleeding-between-periods-or-after-sex/" },
      { label: "NHS — Ectopic pregnancy", href: "https://www.nhs.uk/conditions/ectopic-pregnancy/" },
    ],
    related: ["pregnancy-tests", "irregular-periods", "stress-and-cycle"],
    es: {
      title: "Periodos que se retrasan o no llegan",
      summary: "Que el periodo se retrase o no llegue es frecuente y a menudo no es grave. El embarazo es una de las razones, pero el estrés, los cambios de peso, el ejercicio, los anticonceptivos y algunos problemas de salud también pueden influir.",
      sections: [
        {
          heading: "El embarazo es una posible razón",
          body: "Si has tenido relaciones sexuales, lo primero que hay que pensar es en un embarazo, porque la falta del periodo suele ser una señal temprana de embarazo. Durante el embarazo no hay periodos. Si hay cualquier posibilidad de que estés embarazada, hazte una prueba de embarazo. Dar el pecho también puede hacer que el periodo no llegue. En algunas personas no vuelve hasta que dejan de dar el pecho.",
        },
        {
          heading: "Otras razones frecuentes",
          body: "Los retrasos o la falta del periodo tienen muchas causas, y la mayoría de las veces no son motivo de preocupación. El estrés es una de ellas. Un estrés intenso que dura mucho tiempo puede alterar las señales del cerebro que controlan tu ciclo. Perder peso de repente, los cambios grandes de peso y hacer mucho ejercicio también pueden retrasar o detener los periodos. Algunos anticonceptivos hormonales, como la píldora anticonceptiva, la inyección anticonceptiva y el DIU hormonal, pueden hacer que te saltes periodos.",
        },
        {
          heading: "Problemas de salud que conviene conocer",
          body: "A veces, la falta de periodos indica un problema de salud. Por ejemplo, el síndrome de ovario poliquístico (SOP, que ahora también se llama PMOS), una tiroides hiperactiva o hipoactiva, la diabetes y las enfermedades del corazón. Otros problemas hormonales también pueden detener los periodos. Los trastornos alimentarios, sobre todo la anorexia, también pueden hacerlo. En los años previos a la menopausia, los periodos también pueden volverse menos regulares y saltarse algunos meses. La menopausia suele llegar entre mediados de los 40 y mediados de los 50 años.",
        },
        {
          heading: "Cuándo consultar con un médico o una enfermera",
          body: "Aunque no sea nada grave, vale la pena que te revisen. Consulta con un médico o una enfermera si te has saltado 3 periodos seguidos, o llevas 3 meses sin periodo, y no estás embarazada ni dando el pecho. Consulta también si a los 15 años todavía no te ha venido el periodo, o si tus periodos se han vuelto irregulares. Lo mismo si la falta de un periodo viene con aumento o pérdida de peso, cansancio, más vello en la cara, o piel seca o grasa. Registrar tus periodos en Ciclo puede ayudarte a ver exactamente cuánto tiempo ha pasado.",
        },
        {
          heading: "Cuándo pedir ayuda urgente",
          body: "Si podrías estar embarazada, aunque no hayas tenido una prueba de embarazo positiva, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del abdomen, en un solo lado, o cualquier sangrado. Busca ayuda de emergencia si tienes un dolor repentino e intenso en el abdomen, dolor en la punta del hombro, sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo que crece fuera del útero (embarazo ectópico).",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si no te llega el periodo o podrías estar embarazada, habla con un médico o una enfermera.",
    },
    en: {
      title: "Missed or late periods",
      summary: "A late or missed period is common and often not serious. Pregnancy is one reason, but stress, weight changes, exercise, contraception and some health conditions can also play a part.",
      sections: [
        {
          heading: "Pregnancy is one possible reason",
          body: "If you have had sex, pregnancy is the first thing to think about, because a missed period is often an early sign of pregnancy. Periods stop during pregnancy. If there is any chance you could be pregnant, take a pregnancy test. Breastfeeding can also keep periods away. For some people they do not return until breastfeeding ends.",
        },
        {
          heading: "Other common reasons",
          body: "Late or missed periods have many causes, and most of the time it is nothing to worry about. Stress is one of them. Severe stress that lasts a long time can upset the signals from your brain that control your cycle. Sudden weight loss, large changes in weight and doing a lot of exercise can also delay or stop periods. Some hormonal contraception, such as the pill, the contraceptive injection and the hormonal IUD (coil), can mean you miss periods.",
        },
        {
          heading: "Health conditions to know about",
          body: "Sometimes missed periods point to a health condition. These include polycystic ovary syndrome (PCOS, now also called PMOS), an overactive or underactive thyroid, diabetes and heart disease. Other hormone problems can also stop periods. Eating disorders, especially anorexia, can stop periods too. Periods can also become less regular and skip months in the years before menopause. Menopause usually happens between the mid-40s and mid-50s.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Even when it is nothing serious, it is worth getting checked. See a doctor or nurse if you have missed 3 periods in a row, or have had no period for 3 months, and you are not pregnant or breastfeeding. Also go if your periods have not started by age 15, or if they have become irregular. The same applies if a missed period comes with weight gain or loss, tiredness, extra hair on your face, or dry or oily skin. Logging your periods in Ciclo can help you see exactly how long it has been.",
        },
        {
          heading: "When to get urgent help",
          body: "If you might be pregnant, even without a positive test, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of a pregnancy growing outside the womb (ectopic pregnancy).",
        },
      ],
      notice: "This is general information, not a diagnosis. If you have missed periods or could be pregnant, talk to a doctor or nurse.",
    },
  },
  {
    slug: "spotting",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Vaginal bleeding between periods or after sex", href: "https://www.nhs.uk/symptoms/vaginal-bleeding-between-periods-or-after-sex/" },
      { label: "MedlinePlus Medical Encyclopedia — Vaginal bleeding between periods", href: "https://medlineplus.gov/ency/article/003156.htm" },
      { label: "KidsHealth — Could I get pregnant if I have sex during my period?", href: "https://kidshealth.org/en/teens/sex-during-period.html" },
      { label: "NHS — Ectopic pregnancy", href: "https://www.nhs.uk/conditions/ectopic-pregnancy/" },
    ],
    related: ["periods-on-birth-control", "cervical-screening", "postmenopausal-bleeding"],
    es: {
      title: "Sangrado o manchado entre periodos",
      summary: "El sangrado leve entre periodos o después de las relaciones sexuales tiene muchas causas y a menudo no es grave, pero siempre se debe revisar. Aquí verás las causas habituales y las señales que necesitan atención urgente.",
      sections: [
        {
          heading: "Qué es el manchado",
          body: "El manchado es un sangrado leve fuera de tu periodo normal. Puede que notes un poco de sangre en la ropa interior o al limpiarte. Los médicos pueden llamar al sangrado entre periodos «sangrado intermenstrual». El sangrado después de las relaciones sexuales está relacionado y comparte algunas de las mismas causas. La mayoría de las veces la causa no es grave. Aun así, un médico o una enfermera siempre debe revisar el sangrado entre periodos o después de las relaciones sexuales.",
        },
        {
          heading: "Hormonas y anticonceptivos",
          body: "Los cambios en los niveles de hormonas pueden causar manchado. Los anticonceptivos hormonales también pueden causarlo, sobre todo si te saltas píldoras, o si dejas y vuelves a empezar la píldora anticonceptiva, el parche o el anillo. Un DIU puede causar manchado de vez en cuando. Algunas personas tienen un sangrado leve alrededor de la ovulación, que suele ocurrir unas 2 semanas antes del periodo. Este sangrado se puede confundir con un periodo. El estrés y una tiroides hipoactiva también pueden causar sangrado entre periodos.",
        },
        {
          heading: "Otras causas posibles",
          body: "Unos pequeños bultos de tejido llamados pólipos, y también los miomas, pueden causar sangrado entre periodos. Las infecciones, incluidas las infecciones de transmisión sexual (ITS) como la clamidia, pueden inflamar el cérvix (el cuello del útero) o el útero y causar sangrado. El sangrado después de las relaciones sexuales también puede deberse a sequedad vaginal o a cambios en la superficie del cérvix (ectropión cervical). Los medicamentos anticoagulantes, una exploración o un procedimiento pélvico reciente y los problemas del embarazo, como un aborto espontáneo (pérdida del embarazo), también pueden causar sangrado. A veces es una señal de cáncer o de lesiones precancerosas del cérvix o del útero.",
        },
        {
          heading: "Qué pasa en la consulta",
          body: "Puedes consultar con un médico o una enfermera, o ir a un servicio de salud sexual. Te preguntarán por tus síntomas y tu historial de salud, y puede que te exploren. Según lo que encuentren, pueden ofrecerte una prueba de embarazo, pruebas de ITS o análisis de sangre. Algunas personas necesitan una ecografía, o que les examinen más de cerca el cérvix (colposcopia) o el interior del útero (histeroscopia). Registrar en Ciclo los días de manchado puede ayudarte a explicar cuándo ocurre el sangrado.",
        },
        {
          heading: "Cuándo pedir ayuda",
          body: "Consulta por cualquier sangrado entre periodos o después de las relaciones sexuales. Ponte también en contacto con un médico o una enfermera si tienes cualquier sangrado después de la menopausia, o si el sangrado viene con dolor pélvico, cansancio o mareo. Si podrías estar embarazada, aunque no hayas tenido una prueba de embarazo positiva, ponte en contacto con un médico o una enfermera ese mismo día si tienes dolor en la parte baja del abdomen, en un solo lado, o cualquier sangrado. Busca ayuda de emergencia si tienes un dolor repentino e intenso en el abdomen, dolor en la punta del hombro, sangrado abundante, o mucho mareo o sensación de desmayo. Pueden ser señales de un embarazo que crece fuera del útero (embarazo ectópico). Si el sangrado es muy abundante y te desmayas o sientes que te vas a desmayar, llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España).",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Un médico o una enfermera siempre debe revisar el sangrado entre periodos, después de las relaciones sexuales o después de la menopausia.",
    },
    en: {
      title: "Bleeding or spotting between periods",
      summary: "Light bleeding between periods or after sex has many causes and is often not serious, but it should always be checked. Here are the usual causes and the signs that need urgent care.",
      sections: [
        {
          heading: "What spotting is",
          body: "Spotting is light bleeding outside your normal period. You might notice a little blood on your underwear or when you wipe. Doctors may call bleeding between periods intermenstrual bleeding. Bleeding after sex is related and shares some of the same causes. Most of the time the cause is not serious. Even so, bleeding between periods or after sex should always be checked by a doctor or nurse.",
        },
        {
          heading: "Hormones and contraception",
          body: "Changes in hormone levels can cause spotting. Hormonal contraception can cause spotting too, especially if you skip pills, or stop and start the pill, patch or ring. An IUD (coil) can cause occasional spotting. Some people have light bleeding around ovulation, which often happens about 2 weeks before a period. This can be mistaken for a period. Stress and an underactive thyroid can also cause bleeding between periods.",
        },
        {
          heading: "Other possible causes",
          body: "Small growths called polyps, and fibroids, can cause bleeding between periods. Infections, including sexually transmitted infections (STIs) such as chlamydia, can inflame the cervix (the neck of the womb) or the womb and cause bleeding. Bleeding after sex can also come from vaginal dryness or from changes to the surface of the cervix (cervical ectropion). Blood-thinning medicines, a recent pelvic examination or procedure, and pregnancy problems such as miscarriage can also cause bleeding. Sometimes it is a sign of cancer or pre-cancer of the cervix or womb.",
        },
        {
          heading: "What happens at an appointment",
          body: "You can see a doctor or nurse, or go to a sexual health clinic. They will ask about your symptoms and health history, and may examine you. Depending on what they find, they may offer a pregnancy test, STI tests or blood tests. Some people need an ultrasound scan, or a closer look at the cervix (colposcopy) or inside the womb (hysteroscopy). Logging spotting days in Ciclo can help you describe when the bleeding happens.",
        },
        {
          heading: "When to get help",
          body: "Get checked for any bleeding between periods or after sex. Also contact a doctor or nurse if you have any bleeding after menopause, or if bleeding comes with pelvic pain, tiredness or dizziness. If you might be pregnant, even without a positive test, contact a doctor or nurse the same day if you have pain low down on one side of your tummy or any bleeding. Get emergency help for sudden, severe tummy pain, pain in the tip of your shoulder, heavy bleeding, or feeling very dizzy or faint. These can be signs of a pregnancy growing outside the womb (ectopic pregnancy). If bleeding is very heavy and you faint or feel about to faint, call your local emergency number.",
        },
      ],
      notice: "This is general information, not a diagnosis. Bleeding between periods, after sex or after menopause should always be checked by a doctor or nurse.",
    },
  },
  {
    slug: "period-blood",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
      { label: "KidsHealth — Is period blood always red?", href: "https://kidshealth.org/en/teens/blood-color.html" },
      { label: "NHS — Heavy periods", href: "https://www.nhs.uk/conditions/heavy-periods/" },
      { label: "Mayo Clinic — Vaginal odor: causes", href: "https://www.mayoclinic.org/symptoms/vaginal-odor/basics/causes/sym-20050664" },
    ],
    related: ["heavy-periods", "bacterial-vaginosis", "toxic-shock-syndrome"],
    es: {
      title: "Sangre menstrual: color, coágulos y olor",
      summary: "La sangre menstrual puede cambiar de color, tener pequeños coágulos y un olor suave, y esto suele ser normal. Aquí verás qué esperar y qué cambios conviene revisar.",
      sections: [
        {
          heading: "Cómo puede cambiar el color",
          body: "La sangre menstrual no siempre es de color rojo vivo. Cuando el sangrado es más abundante, suele ser roja. Los días más ligeros puede verse rosa, rojo oscuro o marrón. La sangre rojo oscuro o marrón es habitual al principio o al final del periodo, cuando el sangrado es más ligero. El rojo vivo es más habitual en los días de más sangrado. El color puede cambiar dentro del mismo periodo, y es normal.",
        },
        {
          heading: "Coágulos y restos de tejido",
          body: "La sangre menstrual no es solo sangre. También lleva tejido del revestimiento del útero, que tu cuerpo va desprendiendo. Por eso su textura puede variar y puede contener pequeños coágulos o trocitos de tejido. Los coágulos pequeños pueden ser parte de un periodo normal. Los coágulos de más de unos 2.5 cm, el tamaño de una moneda grande, pueden ser una señal de periodos abundantes. También lo es necesitar cambiarte la toalla higiénica (compresa) o el tampón cada 1 o 2 horas, o sangrar durante más de 7 días.",
        },
        {
          heading: "Qué olor es normal",
          body: "Es normal que la vagina tenga un olor suave. Algunas personas casi no notan ninguno. El olor puede cambiar un poco a lo largo del ciclo y puede ser más fuerte después de sudar o de tener relaciones sexuales. Un olor fuerte, a pescado o desagradable es diferente y puede indicar un problema. Entre las posibles causas están una infección como la vaginosis bacteriana o la tricomoniasis, o un tampón olvidado. No necesitas lavar el interior de la vagina (duchas vaginales). Puede alterar el equilibrio natural de bacterias que hay allí.",
        },
        {
          heading: "Cambios que conviene revisar",
          body: "Consulta con un médico o una enfermera si a menudo expulsas coágulos de más de unos 2.5 cm, o si tus periodos son muy abundantes o duran más de 7 días. Consulta también si notas un olor fuerte o poco habitual que no desaparece. El picor (comezón), el ardor, la irritación o un flujo vaginal poco habitual también merecen una revisión. Si crees que puedes haberte dejado un tampón dentro, consulta pronto. Añadir en Ciclo una nota o un síntoma personalizado sobre el color, los coágulos o el olor puede ayudarte a explicar qué ha cambiado.",
        },
        {
          heading: "Cuándo pedir ayuda urgente",
          body: "Si mientras usas un tampón, una copa o un disco te da de repente fiebre alta, vómitos o una erupción en la piel, o sientes mareo o que te vas a desmayar, sácatelo y busca atención médica de inmediato. Si te sientes muy mal, notas confusión o te cuesta respirar, llama al número de emergencias de tu país (por ejemplo, 911 en México o 112 en España). Pueden ser señales del síndrome de shock tóxico (SST), una enfermedad poco frecuente pero grave. Llama al número de emergencias de tu país o ve a urgencias si sangras mucho y te desmayas o sientes que te vas a desmayar, o si tienes dolor en el pecho o te cuesta respirar. Si el sangrado abundante te causa mareo, aturdimiento o debilidad, ponte en contacto con un médico o una enfermera ese mismo día.",
        },
      ],
      notice: "Esta es información general, no un diagnóstico. Si notas un cambio en tu periodo que te preocupa, habla con un médico o una enfermera.",
    },
    en: {
      title: "Period blood: colour, clots and smell",
      summary: "Period blood can change colour, contain small clots and have a mild smell, and this is usually normal. Here is what to expect and which changes are worth checking.",
      sections: [
        {
          heading: "How the colour can change",
          body: "Period blood is not always bright red. When your flow is heaviest, it is usually red. On lighter days it may look pink, dark red or brown. Darker red or brown blood is common at the start or end of a period, when the flow is lighter. Bright red is more common on the heaviest days. The colour can change within the same period, and this is normal.",
        },
        {
          heading: "Clots and bits of tissue",
          body: "Period blood is not only blood. It also carries tissue from the womb lining as your body sheds it. So its texture can vary, and it may contain small clots or bits of tissue. Small clots can be part of a normal period. Clots larger than about 2.5 cm, the size of a large coin, can be a sign of heavy periods. So can needing to change a pad or tampon every 1 to 2 hours, or bleeding for more than 7 days.",
        },
        {
          heading: "What a normal smell is",
          body: "It is normal for the vagina to have a light smell. Some people notice almost none. The smell can change a little through your cycle and may be stronger after sweating or sex. A strong, fishy or unpleasant smell is different and may point to a problem. Possible causes include an infection such as bacterial vaginosis or trichomoniasis, or a tampon that has been forgotten. You do not need to wash inside your vagina (douching). It can upset the natural balance of bacteria there.",
        },
        {
          heading: "Changes worth checking",
          body: "See a doctor or nurse if you often pass clots larger than about 2.5 cm, or if your periods are very heavy or last more than 7 days. Also get checked if you notice a strong or unusual smell that does not go away. Itching, burning, soreness or an unusual discharge are also worth checking. If you think a tampon may have been left inside, get checked soon. Adding a note or a custom tag in Ciclo about colour, clots or smell can help you describe what has changed.",
        },
        {
          heading: "When to get urgent help",
          body: "If you suddenly get a high fever, vomiting or a rash, or feel dizzy or faint, while using a tampon, cup or disc, take it out and get medical help straight away. If you feel very unwell or confused, or have trouble breathing, call your local emergency number. These can be signs of toxic shock syndrome, a rare but serious illness. Call your local emergency number or go to an emergency department if you are bleeding heavily and you faint or feel about to faint, or you have chest pain or trouble breathing. If heavy bleeding makes you feel dizzy, light-headed or weak, contact a doctor or nurse the same day.",
        },
      ],
      notice: "This is general information, not a diagnosis. If you notice a change in your period that worries you, talk to a doctor or nurse.",
    },
  },
  {
    slug: "delaying-a-period",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — How can I delay my period?", href: "https://www.nhs.uk/common-health-questions/travel-health/how-can-i-delay-my-period/" },
      { label: "NHS Specialist Pharmacy Service — Choosing a medicine to delay periods", href: "https://sps.nhs.uk/articles/choosing-a-medicine-to-delay-periods/" },
    ],
    related: ["the-pill", "patch-ring-injection", "periods-on-birth-control"],
    es: {
      title: "Retrasar o saltarse un periodo",
      summary: "Puedes retrasar un periodo por unas vacaciones o un evento con pastillas hormonales o cambiando la forma de usar algunos anticonceptivos. Un médico, una enfermera o un farmacéutico o farmacéutica pueden ayudarte, pero tienes que planificarlo con tiempo.",
      sections: [
        {
          heading: "Tus opciones",
          body: "Es posible retrasar un periodo, por ejemplo por unas vacaciones o un evento importante. Hay dos formas principales. Si usas la píldora anticonceptiva combinada, el parche anticonceptivo o el anillo vaginal, es posible que puedas saltarte la pausa habitual. Si no usas ninguno de estos métodos, un médico puede recetarte una pastilla que contiene un progestágeno (un tipo de hormona), como la noretisterona. Antes, habla con un médico, una enfermera o un farmacéutico o farmacéutica, porque la mejor opción depende de tu salud y del método que uses.",
        },
        {
          heading: "Con la píldora, el parche o el anillo",
          body: "Si tomas la píldora anticonceptiva combinada, normalmente puedes retrasar el sangrado empezando el siguiente envase justo después, sin hacer la pausa. Cómo hacerlo depende del tipo de píldora, así que consúltalo con un farmacéutico o farmacéutica, un médico o una enfermera. El sangrado que tienes con la píldora es un sangrado por deprivación, no un periodo real. Suele empezar unos 3 días después de dejar de tomarla. El parche y el anillo también se pueden usar sin pausa. Si todavía no tomas la píldora, tendrías que empezar unas semanas antes.",
        },
        {
          heading: "Pastillas de progestágeno",
          body: "Si no quieres usar la píldora combinada, un médico puede recetarte una pastilla de progestágeno, como la llamada noretisterona. Tienes que empezar a tomarla al menos 3 días antes de la fecha prevista del periodo. Si hace falta, se puede tomar durante un máximo de unas 3 a 4 semanas. Normalmente el periodo llega en un plazo de unos 3 días después de dejarla. Estas pastillas no funcionan como anticonceptivo, así que usa otro método, como el condón (preservativo), si necesitas evitar un embarazo. En algunos lugares solo se receta por motivos médicos, así que pregunta qué opciones hay donde vives.",
        },
        {
          heading: "Seguridad y qué esperar",
          body: "Estos medicamentos no son adecuados para todo el mundo. Un médico o una enfermera te preguntará por tu salud, incluidos coágulos de sangre previos, migrañas o presión arterial alta, porque pueden descartar algunas opciones. La noretisterona puede aumentar el riesgo de coágulos de sangre, así que un médico revisará tu historial médico antes de recetarla. Con algunos tipos de píldora puedes saltarte las pausas todo el tiempo que quieras, pero cuanto más tiempo lo hagas, más probable es tener sangrado intermenstrual o manchado. El parche puede causar reacciones en la piel. Lo bien que funciona retrasar el periodo varía de una persona a otra, y también cuánto tarda en llegar el sangrado después de dejarlo.",
        },
        {
          heading: "Planifica con tiempo",
          body: "Retrasar un periodo funciona mejor si lo planificas. Habla con un médico, una enfermera o un farmacéutico o farmacéutica unas semanas antes de la fecha que tienes en mente, sobre todo si tendrías que empezar un método nuevo. Las pastillas de progestágeno hay que empezarlas unos días antes de la fecha prevista del periodo, así que ayuda saber más o menos cuándo será. Los pronósticos de periodo de Ciclo pueden darte una idea, pero son estimaciones. Si ya tomas la píldora, revisa tu envase para saber cuándo te tocaría la pausa.",
        },
      ],
      notice: "Esta es información general. Habla con un médico, una enfermera o un farmacéutico o farmacéutica antes de usar cualquier medicamento o anticonceptivo para retrasar un periodo.",
    },
    en: {
      title: "Delaying or skipping a period",
      summary: "You can delay a period for a holiday or event with hormone tablets or by changing how you take some contraception. A doctor, nurse or pharmacist can help, but you need to plan ahead.",
      sections: [
        {
          heading: "Your options",
          body: "It is possible to delay a period, for example for a holiday or a big event. There are two main ways. If you use the combined pill, the contraceptive patch or the vaginal ring, you may be able to skip the usual break. If you do not use one of these, a doctor can prescribe a tablet that contains a progestogen hormone, such as norethisterone. Talk to a doctor, nurse or pharmacist first, because the right choice depends on your health and the method you use.",
        },
        {
          heading: "With the pill, patch or ring",
          body: "If you take the combined pill, you can usually delay bleeding by starting your next pack straight away instead of having a break. How you do this depends on the type of pill, so check with a pharmacist, doctor or nurse. The bleed you get on the pill is a withdrawal bleed, not a true period. It usually starts about 3 days after you stop. The patch and the ring can also be used without a break. If you do not already take the pill, you would need to start it a few weeks ahead.",
        },
        {
          heading: "Progestogen tablets",
          body: "If you do not want to use the combined pill, a doctor can prescribe a progestogen tablet, such as one called norethisterone. You need to start it at least 3 days before your period is due. It can be taken for up to about 3 to 4 weeks if needed. Your period usually starts within about 3 days of stopping. These tablets do not work as contraception, so use another method, such as condoms, if you need to avoid pregnancy. In some places it is only prescribed for medical reasons, so ask what is available where you live.",
        },
        {
          heading: "Safety and what to expect",
          body: "These medicines are not suitable for everyone. A doctor or nurse will ask about your health, including any past blood clots, migraines or high blood pressure, because these can rule out some options. Norethisterone can raise the risk of blood clots, so a doctor will check your medical history before prescribing it. With some types of pill you can skip breaks for as long as you like, but breakthrough bleeding or spotting becomes more likely the longer you go. The patch can cause skin reactions. How well delaying works varies from person to person, and so does how soon bleeding starts after you stop.",
        },
        {
          heading: "Plan ahead",
          body: "Delaying a period works best with planning. Talk to a doctor, nurse or pharmacist a few weeks before the date you have in mind, especially if you would need to start a new method. Progestogen tablets must be started a few days before your period is due, so it helps to know roughly when that will be. Ciclo's period predictions can give you an idea, but they are estimates. If you already take the pill, check your pack so you know when your break would fall.",
        },
      ],
      notice: "This is general information. Talk to a doctor, nurse or pharmacist before using any medicine or contraception to delay a period.",
    },
  },
  {
    slug: "period-myths",
    category: "periods",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Periods", href: "https://www.nhs.uk/conditions/periods/" },
      { label: "KidsHealth — All about periods", href: "https://kidshealth.org/en/teens/menstruation.html" },
      { label: "KidsHealth — Could I get pregnant if I have sex during my period?", href: "https://kidshealth.org/en/teens/sex-during-period.html" },
      { label: "KidsHealth — Can I use a tampon if I'm a virgin?", href: "https://kidshealth.org/en/teens/use-tampon.html" },
    ],
    related: ["period-basics", "period-products", "sex-during-period"],
    es: {
      title: "Mitos y realidades sobre el periodo",
      summary: "Mucho de lo que se oye sobre los periodos no es verdad. Aquí tienes algunos mitos frecuentes sobre los ciclos, la sangre, el embarazo, los tampones y el ejercicio, y lo que dicen las fuentes de salud.",
      sections: [
        {
          heading: "Mito: todos los ciclos duran 28 días",
          body: "Realidad: 28 días es solo un promedio. Muchas personas tienen el periodo más o menos cada 28 días, pero es habitual tenerlo con más o menos frecuencia. La mayoría de los ciclos en personas adultas duran entre unos 21 y 38 días. También es normal que la duración cambie un poco de un mes a otro.",
        },
        {
          heading: "Mito: se pierde mucha sangre",
          body: "Realidad: puede parecer mucha sangre, pero en todo el periodo suelen ser solo unas pocas cucharadas. Una cantidad típica es de unos 20 a 90 ml, de 1 a 5 cucharadas aproximadamente. Algunas personas sí sangran más que esto. Si tus periodos te parecen muy abundantes o interfieren en tu vida, vale la pena hablar con un médico o una enfermera.",
        },
        {
          heading: "Mito: no hay riesgo de embarazo durante el periodo",
          body: "Realidad: puede haber embarazo si tienes relaciones sexuales en cualquier momento del ciclo, también durante el periodo. Los espermatozoides pueden sobrevivir dentro del cuerpo hasta 7 días después de las relaciones sexuales. Un ovario suele liberar un óvulo (ovulación) unas 2 semanas antes del siguiente periodo, pero el momento puede variar, y a veces ocurre poco después de que termina un periodo. Algunas personas también tienen un sangrado leve alrededor de la ovulación y lo confunden con un periodo. Si no quieres un embarazo, usa anticonceptivos siempre. Solo el condón (preservativo) protege además de las infecciones de transmisión sexual (ITS), y algunas ITS pueden transmitirse más fácilmente durante el periodo.",
        },
        {
          heading: "Mito: un tampón se puede perder dentro",
          body: "Realidad: un tampón no se puede perder dentro de ti. La parte alta de la vagina termina en el cérvix (el cuello del útero), y la pequeña abertura del cérvix es demasiado pequeña para que pase un tampón. El tampón se queda en la vagina hasta que lo sacas. Eso sí, se puede olvidar. Si no lo encuentras o no llegas a él, o notas un flujo vaginal desagradable, consulta pronto con un médico o una enfermera.",
        },
        {
          heading: "Mito: los tampones afectan a la virginidad",
          body: "Realidad: usar tampones no afecta a la virginidad. A veces un tampón puede estirar el tejido fino de la entrada de la vagina (himen), pero eso no es lo mismo que tener relaciones sexuales. Cualquier persona que tenga periodos puede usar tampones, y al principio puede ser más fácil uno de tamaño pequeño.",
        },
        {
          heading: "Mito: no deberías nadar ni hacer deporte",
          body: "Realidad: tener el periodo no significa que tengas que quedarte al margen. Puedes seguir haciendo ejercicio, practicando deporte y haciendo lo que te gusta. Para nadar y hacer deporte, a muchas personas los tampones les resultan más prácticos que las toallas higiénicas (compresas). Puedes elegir lo que mejor le siente a tu cuerpo cada día del periodo.",
        },
      ],
      notice: "Esta es información general. Si tienes alguna pregunta sobre tus periodos, un médico o una enfermera puede ayudarte.",
    },
    en: {
      title: "Period myths and facts",
      summary: "Many things people hear about periods are not true. Here are some common myths about cycles, blood, pregnancy, tampons and exercise, and what health sources say.",
      sections: [
        {
          heading: "Myth: every cycle is 28 days",
          body: "Fact: 28 days is only an average. Many people have a period about every 28 days, but it is common to have them more or less often. Most adult cycles last somewhere between about 21 and 38 days. It is also normal for the length to change a little from one month to the next.",
        },
        {
          heading: "Myth: you lose a lot of blood",
          body: "Fact: period blood can seem like a lot, but the total over a whole period is usually only a few tablespoons. A typical amount is about 20 to 90 ml, roughly 1 to 5 tablespoons. Some people do bleed more heavily than this. If your periods feel very heavy or get in the way of your life, it is worth talking to a doctor or nurse.",
        },
        {
          heading: "Myth: you cannot get pregnant on your period",
          body: "Fact: pregnancy is possible from sex at any point in your cycle, including during a period. Sperm can survive inside the body for up to 7 days after sex. An ovary usually releases an egg (ovulation) around 2 weeks before the next period, but the timing can vary, and sometimes it comes soon after a period ends. Some people also have light bleeding around ovulation and mistake it for a period. If you do not want to get pregnant, use contraception every time. Only condoms also protect against STIs, and some STIs can spread more easily during a period.",
        },
        {
          heading: "Myth: a tampon can get lost",
          body: "Fact: a tampon cannot get lost inside you. The top of the vagina ends at the cervix (the neck of the womb), and the tiny opening in the cervix is far too small for a tampon to get through. The tampon stays in the vagina until you take it out. It can be forgotten, though. If you cannot find or reach it, or you notice an unpleasant discharge, see a doctor or nurse soon.",
        },
        {
          heading: "Myth: tampons affect virginity",
          body: "Fact: using a tampon does not affect virginity. A tampon can sometimes stretch the thin tissue at the opening of the vagina (hymen), but that is not the same as having sex. Anyone who has periods can use tampons, and a slim size can be easier at first.",
        },
        {
          heading: "Myth: you should not swim or do sport",
          body: "Fact: having your period does not mean you need to sit things out. You can keep exercising, playing sport and doing the things you enjoy. For swimming and sport, many people find tampons more convenient than pads. You can choose what feels right for your body on each day of your period.",
        },
      ],
      notice: "This is general information. If you have a question about your own periods, a doctor or nurse can help.",
    },
  },
];
