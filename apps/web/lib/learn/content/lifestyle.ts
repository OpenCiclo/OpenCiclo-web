// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { LearnArticle } from "@/lib/learn/articles";

export const LIFESTYLE_ARTICLES: LearnArticle[] = [
  {
    slug: "iron-rich-eating",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Iron", href: "https://www.nhs.uk/conditions/vitamins-and-minerals/iron/" },
      { label: "NIH Office of Dietary Supplements — Iron", href: "https://ods.od.nih.gov/factsheets/Iron-Consumer/" },
    ],
    related: ["anemia", "heavy-periods", "healthy-eating"],
    es: {
      title: "El hierro y tu periodo",
      summary: "Las personas que menstrúan necesitan más hierro, y el sangrado abundante aumenta el riesgo de tenerlo bajo. Aquí verás cuánto necesitas, dónde encontrarlo y cuándo hacerte una revisión.",
      sections: [
        {
          heading: "Por qué importa el hierro",
          body: "Tu cuerpo usa el hierro para fabricar hemoglobina. Es la proteína de los glóbulos rojos que lleva el oxígeno de los pulmones al resto del cuerpo. El hierro también ayuda a llevar oxígeno a los músculos. Cuando sangras, pierdes glóbulos rojos y el hierro que contienen. Esta es una de las razones por las que los periodos abundantes aumentan el riesgo de tener el hierro bajo.",
        },
        {
          heading: "Cuánto necesitas",
          body: "La mayoría de las personas pueden obtener todo el hierro que necesitan con una alimentación variada. Las necesidades cambian según el país, la edad y el sexo. Por ejemplo, el NHS (el sistema público de salud del Reino Unido) recomienda 14.8 mg al día para las mujeres de 19 a 49 años, y 8.7 mg al día para los hombres y para las mujeres de 50 años o más. Las adolescentes, las personas con periodos abundantes y las mujeres embarazadas están entre los grupos con más probabilidad de tener el hierro bajo.",
        },
        {
          heading: "Alimentos ricos en hierro",
          body: "Algunas buenas fuentes son la carne roja, la carne de ave, el pescado y los mariscos. Entre las fuentes vegetales están las legumbres, como los frijoles rojos (alubias rojas), los garbanzos y el edamame, además de los guisantes (chícharos), las espinacas, los frutos secos y la fruta deshidratada, como los albaricoques secos y las pasas. Muchos cereales de desayuno y panes llevan hierro añadido (están enriquecidos o fortificados). Si no comes carne, comer muchos de estos alimentos vegetales puede ayudarte a obtener suficiente.",
        },
        {
          heading: "Cómo ayudar a tu cuerpo a absorber el hierro",
          body: "Tu cuerpo absorbe mejor el hierro de los alimentos vegetales cuando los comes con alimentos ricos en vitamina C. Los cítricos, las fresas, los pimientos, los tomates y el brócoli son buenas opciones. Comer algo de carne, ave o mariscos en la misma comida también ayuda. Por ejemplo, puedes tomar frijoles con salsa de tomate, lentejas con pimientos o un cereal enriquecido con fresas.",
        },
        {
          heading: "Señales de hierro bajo",
          body: "Perder mucha sangre en cada periodo puede causar anemia por falta de hierro (anemia ferropénica). Esto significa que tu cuerpo no tiene suficiente hierro para fabricar los glóbulos rojos que necesita. Las señales incluyen cansancio, debilidad y falta de energía, malestar de estómago y dificultad para concentrarte o recordar cosas. Registrar tu sangrado en Ciclo puede ayudarte a explicarle a un médico lo abundantes que son tus periodos.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus periodos son abundantes. Por ejemplo, si cambias de compresa o tampón cada 1 a 2 horas, o si sangras durante más de 7 días. Consulta también si a menudo sientes cansancio o debilidad. Pregunta si deberían revisarte los niveles de hierro. Algunas personas necesitan pastillas de hierro, pero habla antes con un médico o con un farmacéutico o farmacéutica, porque demasiado hierro puede causar efectos secundarios. Guarda las pastillas de hierro fuera de la vista y del alcance de los niños. Busca ayuda urgente si tienes un sangrado muy abundante con mareo o desmayo.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos son abundantes o sientes cansancio todo el tiempo, habla con un médico o una enfermera.",
    },
    en: {
      title: "Iron and your period",
      summary: "People with periods need more iron, and heavy bleeding raises the risk of running low. Here is how much you need, where to find it, and when to get checked.",
      sections: [
        {
          heading: "Why iron matters",
          body: "Your body uses iron to make haemoglobin. This is the protein in red blood cells that carries oxygen from your lungs to the rest of your body. Iron also helps bring oxygen to your muscles. When you bleed, you lose red blood cells and the iron inside them. This is one reason heavy periods raise the risk of low iron.",
        },
        {
          heading: "How much you need",
          body: "Most people can get all the iron they need from a varied diet. Needs differ by country, age and sex. As one example, the NHS advises 14.8 mg a day for women aged 19 to 49, and 8.7 mg a day for men and for women aged 50 and over. Teenage girls, people with heavy periods and pregnant women are among the groups most likely to run low.",
        },
        {
          heading: "Foods rich in iron",
          body: "Good sources include red meat, poultry, fish and seafood. Plant sources include beans and lentils, such as kidney beans, chickpeas and edamame, as well as peas, spinach, nuts and dried fruit such as apricots and raisins. Many breakfast cereals and breads have iron added (they are fortified). If you do not eat meat, eating plenty of these plant foods can help you get enough.",
        },
        {
          heading: "Helping your body absorb iron",
          body: "Your body absorbs iron from plant foods better when you eat them with foods rich in vitamin C. Citrus fruits, strawberries, peppers, tomatoes and broccoli are all good choices. Eating some meat, poultry or seafood in the same meal helps too. For example, you could have beans in tomato sauce, lentils with peppers, or a fortified cereal with strawberries.",
        },
        {
          heading: "Signs of low iron",
          body: "Losing a lot of blood each period can lead to iron deficiency anaemia. This means your body does not have enough iron to make the red blood cells it needs. Signs include tiredness, weakness and lack of energy, an upset stomach, and trouble concentrating or remembering things. Logging your bleeding in Ciclo can help you describe how heavy your periods are to a doctor.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your periods are heavy. For example, you change a pad or tampon every 1 to 2 hours, or you bleed for more than 7 days. Also see them if you often feel tired or weak. Ask whether your iron levels should be checked. Some people need iron tablets, but talk to a doctor or pharmacist first, as too much iron can cause side effects. Keep iron tablets out of sight and reach of children. Get urgent help if you have very heavy bleeding with dizziness or fainting.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods are heavy or you feel tired all the time, talk to a doctor or nurse.",
    },
  },
  {
    slug: "healthy-eating",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — 8 tips for healthy eating", href: "https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/eight-tips-for-healthy-eating/" },
      { label: "WHO — Healthy diet", href: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
    ],
    related: ["iron-rich-eating", "calcium-vitamin-d", "cravings-appetite"],
    es: {
      title: "Comer bien",
      summary: "Comer bien tiene que ver con la variedad y el equilibrio a lo largo del tiempo, no con reglas estrictas ni dietas. Aquí tienes lo básico en lo que coinciden la mayoría de las organizaciones de salud.",
      sections: [
        {
          heading: "Equilibrio, no reglas",
          body: "No hay una única forma correcta de comer. Una alimentación sana es distinta según tu edad, tu nivel de actividad, tu cultura y los alimentos a los que tienes acceso. Comer una gran variedad de alimentos ayuda a que tu cuerpo obtenga todos los nutrientes que necesita. Con el tiempo, una alimentación equilibrada ayuda a proteger contra la mala nutrición y las enfermedades de larga duración, como las enfermedades del corazón.",
        },
        {
          heading: "Fruta, verdura y cereales integrales",
          body: "La fruta y la verdura son una buena base para la mayoría de las comidas. El NHS (el sistema público de salud del Reino Unido) sugiere comer al menos 5 porciones al día de una mezcla de fruta y verdura. Para los alimentos con almidón, como el pan, el arroz, la pasta y las patatas (papas), elige versiones integrales o con más fibra cuando puedas. La pasta integral, el arroz integral y las patatas con piel son cambios fáciles.",
        },
        {
          heading: "Pescado, grasas y sal",
          body: "El NHS sugiere comer pescado al menos dos veces por semana, incluida una porción de pescado graso (azul), como salmón, trucha o caballa. Comer mucha grasa saturada puede subir el colesterol en sangre, y el colesterol alto hace más probables las enfermedades del corazón. Cocinar al vapor o hervir en lugar de freír es una forma fácil de usar menos grasa. Usar menos sal y menos salsas saladas al cocinar también ayuda.",
        },
        {
          heading: "Bebidas, azúcar y desayuno",
          body: "Bebe suficiente líquido para no deshidratarte. El NHS sugiere de 6 a 8 vasos al día. Tomar a menudo alimentos y bebidas azucarados aumenta el riesgo de caries, así que ayuda tomarlos con menos frecuencia. Si desayunas, una opción rica en fibra y baja en grasa, azúcar y sal puede formar parte de una alimentación equilibrada.",
        },
        {
          heading: "La alimentación alrededor del periodo",
          body: "Muchas personas notan cambios en el apetito o antojos en los días antes del periodo. Es una parte frecuente del síndrome premenstrual (SPM) y no es motivo para sentir culpa. Una alimentación sana y equilibrada es una de las medidas de autocuidado que el NHS sugiere para el SPM. Si tus periodos son abundantes, vale la pena incluir alimentos ricos en hierro, ya que el sangrado abundante aumenta el riesgo de tener el hierro bajo.",
        },
        {
          heading: "Cuándo pedir consejo",
          body: "Comer bien funciona mejor junto con actividad física regular, que puede reducir el riesgo de problemas de salud graves. Habla con un médico, una enfermera o un nutricionista si tienes algún problema de salud, estás embarazada o necesitas ayuda con una dieta especial. Habla también con alguien si las preocupaciones por la comida o por tu cuerpo te ocupan mucho tiempo, porque puede ser una señal de que necesitas más apoyo.",
        },
      ],
      notice: "Esto es información general. Para recibir consejos adaptados a tu salud, habla con un médico, una enfermera o un nutricionista.",
    },
    en: {
      title: "Eating well",
      summary: "Eating well is about variety and balance over time, not strict rules or diets. Here are the basics most health bodies agree on.",
      sections: [
        {
          heading: "Balance, not rules",
          body: "There is no single right way to eat. A healthy diet looks different depending on your age, how active you are, your culture and the foods you can get. Eating a wide range of foods helps your body get all the nutrients it needs. Over time, a balanced diet helps protect against poor nutrition and long-term illnesses such as heart disease.",
        },
        {
          heading: "Fruit, vegetables and wholegrains",
          body: "Fruit and vegetables are a good base for most meals. The NHS suggests eating at least 5 portions of a mix of fruit and vegetables every day. For starchy foods such as bread, rice, pasta and potatoes, choose wholegrain or higher-fibre kinds when you can. Wholewheat pasta, brown rice and potatoes with their skins on are easy swaps.",
        },
        {
          heading: "Fish, fats and salt",
          body: "The NHS suggests having fish at least twice a week, including one portion of oily fish such as salmon, trout or mackerel. Eating a lot of saturated fat can raise your blood cholesterol, and high cholesterol makes heart disease more likely. Steaming or boiling instead of frying is one easy way to use less fat. Using less salt and fewer salty sauces when you cook helps too.",
        },
        {
          heading: "Drinks, sugar and breakfast",
          body: "Drink enough fluids so you do not get dehydrated. The NHS suggests 6 to 8 glasses a day. Having sugary foods and drinks often raises the risk of tooth decay, so it helps to have them less often. If you eat breakfast, a choice that is high in fibre and low in fat, sugar and salt can be part of a balanced diet.",
        },
        {
          heading: "Eating around your period",
          body: "Many people notice changes in appetite or food cravings in the days before a period. This is a common part of PMS and nothing to feel guilty about. A healthy, balanced diet is one of the self-help steps the NHS suggests for PMS. If your periods are heavy, foods rich in iron are worth including, as heavy bleeding raises the risk of low iron.",
        },
        {
          heading: "When to get advice",
          body: "Eating well works best alongside regular activity, which can lower the risk of serious health conditions. Talk to a doctor, nurse or dietitian if you have a health condition, are pregnant, or need help with a special diet. Also talk to someone if worries about food or your body take up a lot of your time, as this can be a sign that you need more support.",
        },
      ],
      notice: "This is general information. For advice that fits your health needs, talk to a doctor, nurse or dietitian.",
    },
  },
  {
    slug: "calcium-vitamin-d",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NIH Office of Dietary Supplements — Calcium", href: "https://ods.od.nih.gov/factsheets/Calcium-Consumer/" },
      { label: "NIH Office of Dietary Supplements — Vitamin D", href: "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/" },
      { label: "NHS — Osteoporosis: causes", href: "https://www.nhs.uk/conditions/osteoporosis/causes/" },
      { label: "KidsHealth — Female athlete triad", href: "https://kidshealth.org/en/teens/triad.html" },
    ],
    related: ["bone-health", "red-s", "healthy-eating"],
    es: {
      title: "Calcio y vitamina D",
      summary: "El calcio y la vitamina D trabajan juntos para mantener tus huesos fuertes. Aquí verás por qué importan a cualquier edad, dónde encontrarlos y quién puede necesitar más.",
      sections: [
        {
          heading: "Por qué tus huesos los necesitan",
          body: "Casi todo el calcio de tu cuerpo está almacenado en los huesos y los dientes, donde los hace duros y fuertes. Tus músculos y nervios también necesitan calcio. La vitamina D ayuda a tu cuerpo a absorber el calcio de los alimentos, así que los dos trabajan en equipo. La vitamina D también ayuda a que los músculos, los nervios y el sistema inmunitario funcionen bien. Si te faltan durante mucho tiempo, los huesos pueden volverse débiles y frágiles (osteoporosis), lo que aumenta el riesgo de fracturas.",
        },
        {
          heading: "Huesos, hormonas y tu ciclo",
          body: "Para los huesos importan las hormonas, además de la alimentación. El estrógeno ayuda a mantener los huesos fuertes. El estrógeno bajo, una mala nutrición y muy poco calcio o vitamina D pueden causar pérdida de masa ósea. Esta es una de las razones por las que conviene consultar si tus periodos se detienen por comer poco o por entrenar con mucha intensidad. Después de la menopausia, los niveles de estrógeno bajan y los huesos pueden perder fuerza rápidamente. El cuerpo también absorbe y retiene menos calcio. Por eso el calcio y la vitamina D son aún más importantes en las etapas más avanzadas de la vida.",
        },
        {
          heading: "Dónde encontrar calcio",
          body: "La leche, el yogur y el queso son ricos en calcio. Otras fuentes son las sardinas y el salmón en lata comidos con sus espinas blandas, y verduras verdes como la col rizada (kale), el brócoli y el pak choi. Muchas bebidas vegetales, como las de soya o almendra, y algunos jugos de fruta llevan calcio añadido. Si evitas los lácteos, por ejemplo porque sigues una alimentación vegana o tienes intolerancia a la lactosa, puede ser más difícil obtener suficiente, así que busca alimentos enriquecidos.",
        },
        {
          heading: "Obtener suficiente vitamina D",
          body: "La luz del sol sobre la piel ayuda a tu cuerpo a fabricar vitamina D. El vidrio la bloquea, así que sentarte junto a una ventana no sirve. Fabricas menos en días nublados o con contaminación (esmog), a medida que te haces mayor y si tienes la piel más oscura. Las mejores fuentes naturales en los alimentos son pescados como el salmón, la trucha, la caballa y el atún. Las yemas de huevo, el queso y los champiñones tienen pequeñas cantidades. En algunos países, la leche y otros alimentos llevan vitamina D añadida.",
        },
        {
          heading: "Cuánto necesitas",
          body: "Las recomendaciones cambian entre países y con la edad, así que consulta las indicaciones de tu país. Por ejemplo, los Institutos Nacionales de Salud de Estados Unidos (NIH) recomiendan 1000 mg de calcio al día para adultos de 19 a 50 años, que suben a 1200 mg para las mujeres de 51 a 70 años. Las personas de 9 a 18 años necesitan más, 1300 mg al día. El mismo organismo recomienda 15 microgramos (600 UI) de vitamina D al día para la mayoría de las personas de 1 a 70 años.",
        },
        {
          heading: "Suplementos y consejo",
          body: "Tomar demasiado calcio o vitamina D en suplementos puede causar problemas, como náuseas, estreñimiento y cálculos renales (piedras en el riñón). Algunas personas pueden necesitar un suplemento, por ejemplo si evitas los lácteos, tienes la piel más oscura, estás embarazada o das el pecho, o ya has pasado la menopausia. Pregunta a un médico, una enfermera o un farmacéutico o farmacéutica antes de empezar a tomar uno. La leche materna por sí sola no da a los bebés suficiente vitamina D, así que pregunta por esto si das el pecho.",
        },
      ],
      notice: "Esto es información general. Las recomendaciones sobre calcio y vitamina D cambian según el país, así que consulta con un médico, una enfermera o un farmacéutico o farmacéutica.",
    },
    en: {
      title: "Calcium and vitamin D",
      summary: "Calcium and vitamin D work together to keep your bones strong. Here is why they matter at every age, where to find them, and who may need more.",
      sections: [
        {
          heading: "Why your bones need them",
          body: "Almost all the calcium in your body is stored in your bones and teeth, where it makes them hard and strong. Your muscles and nerves need calcium too. Vitamin D helps your body absorb calcium from food, so the two work as a team. Vitamin D also helps your muscles, nerves and immune system work well. Without enough of them over time, bones can become weak and fragile (osteoporosis), which raises the risk of breaks.",
        },
        {
          heading: "Bones, hormones and your cycle",
          body: "Hormones matter for bones as well as food. Oestrogen helps keep bones strong. Low oestrogen, poor nutrition and too little calcium or vitamin D can all lead to bone loss. This is one reason periods that stop because of under-eating or very heavy training are worth getting checked. After menopause, oestrogen levels fall and bones can lose strength quickly. The body also absorbs and holds on to less calcium. This makes calcium and vitamin D even more important in later life.",
        },
        {
          heading: "Where to find calcium",
          body: "Milk, yoghurt and cheese are rich in calcium. Other sources include tinned sardines and salmon eaten with their soft bones, and green vegetables such as kale, broccoli and pak choi. Many plant-based drinks, such as soy and almond drinks, and some fruit juices have calcium added. If you avoid dairy, for example because you are vegan or lactose intolerant, it can be harder to get enough, so look for fortified foods.",
        },
        {
          heading: "Getting enough vitamin D",
          body: "Sunlight on your skin helps your body make vitamin D. Glass blocks this, so sitting by a window does not help. You make less on cloudy or smoggy days, as you get older, and if you have darker skin. The best natural food sources are fish such as salmon, trout, mackerel and tuna. Egg yolks, cheese and mushrooms have small amounts. In some countries, milk and other foods have vitamin D added.",
        },
        {
          heading: "How much you need",
          body: "Advice differs between countries and changes with age, so check your local guidance. As one example, the US National Institutes of Health advises 1,000 mg of calcium a day for adults aged 19 to 50, rising to 1,200 mg for women aged 51 to 70. Children and teens aged 9 to 18 need more, 1,300 mg a day. The same body advises 15 micrograms (600 IU) of vitamin D a day for most people aged 1 to 70.",
        },
        {
          heading: "Supplements and advice",
          body: "Too much calcium or vitamin D from supplements can cause problems, such as feeling sick, constipation and kidney stones. Some people may need a supplement, for example if you avoid dairy, have darker skin, are pregnant or breastfeeding, or are past menopause. Ask a doctor, nurse or pharmacist before you start one. Breast milk alone does not give babies enough vitamin D, so ask about this if you are breastfeeding.",
        },
      ],
      notice: "This is general information. Advice on calcium and vitamin D differs by country, so check with a doctor, nurse or pharmacist.",
    },
  },
  {
    slug: "exercise-and-periods",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NHS — Physical activity guidelines for adults aged 19 to 64", href: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/" },
      { label: "NHS — Period pain", href: "https://www.nhs.uk/conditions/period-pain/" },
      { label: "WHO — Physical activity", href: "https://www.who.int/news-room/fact-sheets/detail/physical-activity" },
      { label: "Office on Women's Health — Physical activity and your menstrual cycle", href: "https://www.womenshealth.gov/getting-active/physical-activity-menstrual-cycle" },
    ],
    related: ["red-s", "period-pain", "pms"],
    es: {
      title: "Moverte durante todo el ciclo",
      summary: "Puedes seguir moviéndote durante el periodo, y el ejercicio suave puede incluso aliviar los cólicos. Aquí verás cuánta actividad ayuda y cuándo el entrenamiento intenso puede hacer que el periodo se detenga.",
      sections: [
        {
          heading: "Ejercicio durante el periodo",
          body: "No hace falta dejar de hacer actividad física cuando tienes el periodo. El ejercicio suave, como caminar, nadar, ir en bicicleta o hacer yoga, puede ayudar a aliviar el dolor menstrual, aunque no tengas ganas de moverte. Las personas que hacen ejercicio con regularidad suelen tener menos cólicos dolorosos, y la actividad física puede ayudar con el síndrome premenstrual (SPM) incluso cuando tienes poca energía. Usa el producto menstrual que te resulte más cómodo para tu actividad. Si tienes cansancio o cólicos, una sesión más suave está bien.",
        },
        {
          heading: "Cómo ayuda la actividad",
          body: "La actividad regular reduce el riesgo de enfermedades del corazón y de accidente cerebrovascular. También puede reducir los síntomas de depresión y ansiedad y mejorar tu sensación de bienestar. En la infancia y la adolescencia, ayuda a ganar forma física y a tener huesos sanos. Cualquier cantidad de actividad es mejor que nada, y toda cuenta.",
        },
        {
          heading: "Cuánto conviene hacer",
          body: "El NHS (el sistema público de salud del Reino Unido) recomienda a las personas adultas de 19 a 64 años hacer al menos 150 minutos de actividad moderada a la semana, como caminar a paso rápido, bailar o ir en bicicleta. O puedes hacer 75 minutos de actividad intensa, como correr o nadar rápido. Lo mejor es repartirlo en 4 o 5 días, o hacerlo todos los días. También se recomienda hacer actividades para fortalecer los músculos, como yoga, pilates, levantar pesas o cargar bolsas pesadas de la compra, al menos 2 días a la semana. Evitar pasar largos ratos seguidos sin levantarte también ayuda.",
        },
        {
          heading: "Escuchar a tu cuerpo",
          body: "No necesitas un plan de entrenamiento especial para cada fase del ciclo. Las mismas recomendaciones de actividad sirven todo el mes. Algunos días, los cólicos, el cansancio o un sangrado abundante pueden hacer que una sesión intensa no te siente bien, y está bien elegir algo más suave. Registrar tu actividad y tus síntomas en Ciclo puede mostrarte cómo sueles sentirte a lo largo del ciclo.",
        },
        {
          heading: "Cuando el entrenamiento detiene el periodo",
          body: "Hacer mucho ejercicio puede volver irregulares los periodos o hacer que se detengan, sobre todo si no comes lo suficiente para cubrir la energía que gastas. Cuando la causa es tener muy poca energía para el entrenamiento que haces, se llama deficiencia energética relativa en el deporte (RED-S). Perder el periodo es una señal de alarma. El estrógeno bajo, una mala nutrición y muy poco calcio o vitamina D pueden causar pérdida de masa ósea y hacer más probables las fracturas por estrés.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Consulta a un médico o una enfermera si tus periodos se detienen, llegan con menos frecuencia o se vuelven irregulares mientras entrenas. Consulta también si te lesionas una y otra vez, por ejemplo con fracturas por estrés. Pide también una revisión si el dolor menstrual o un sangrado abundante te impiden a menudo hacer actividad física. Busca ayuda urgente si tienes un sangrado muy abundante con mareo o desmayo.",
        },
      ],
      notice: "Esto es información general. Si tus periodos se detienen o cambian mientras entrenas, habla con un médico o una enfermera.",
    },
    en: {
      title: "Staying active through your cycle",
      summary: "You can keep moving during your period, and gentle exercise may even ease cramps. Here is how much activity helps, and when hard training can stop periods.",
      sections: [
        {
          heading: "Exercise on your period",
          body: "There is no need to stop being active when you have your period. Gentle exercise such as walking, swimming, cycling or yoga may help ease period pain, even if you do not feel like moving. People who exercise regularly often have fewer painful cramps, and being active may help PMS even when your energy is low. Wear whichever period product feels most comfortable for your activity. If you feel tired or crampy, a lighter session is fine.",
        },
        {
          heading: "How activity helps",
          body: "Regular activity lowers the risk of heart disease and stroke. It can also reduce symptoms of depression and anxiety and improve your sense of well-being. For children and teens, it helps build fitness and healthy bones. Any amount of activity is better than none, and all of it counts.",
        },
        {
          heading: "How much to aim for",
          body: "The NHS advises adults aged 19 to 64 to do at least 150 minutes of moderate activity a week, such as brisk walking, dancing or cycling. Or you can do 75 minutes of vigorous activity, such as running or fast swimming. It is best to spread this over 4 to 5 days, or every day. Muscle-strengthening activity, such as yoga, pilates, lifting weights or carrying heavy shopping, is advised on at least 2 days a week. Breaking up long spells of sitting helps too.",
        },
        {
          heading: "Listening to your body",
          body: "You do not need a special workout plan for each phase of your cycle. The same activity advice applies all month. Some days, cramps, tiredness or heavy bleeding may make a hard session feel wrong, and it is fine to choose something gentler. Logging your activity and symptoms in Ciclo can show you how you tend to feel across your cycle.",
        },
        {
          heading: "When training stops your periods",
          body: "Exercising a lot can make periods irregular or stop them, especially if you do not eat enough to cover the energy you use. When the cause is too little energy for the training you do, it is called relative energy deficiency in sport (RED-S). Lost periods are a warning sign. Low oestrogen, poor nutrition and too little calcium or vitamin D can cause bone loss and make stress fractures more likely.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "See a doctor or nurse if your periods stop, come less often or become irregular while you are training. Also go if you keep getting injuries such as stress fractures. Also get checked if period pain or heavy bleeding regularly stops you being active. Get urgent help if you have very heavy bleeding with dizziness or fainting.",
        },
      ],
      notice: "This is general information. If your periods stop or change while you are training, talk to a doctor or nurse.",
    },
  },
  {
    slug: "red-s",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "NICHD — What causes amenorrhea?", href: "https://www.nichd.nih.gov/health/topics/amenorrhea/conditioninfo/causes" },
      { label: "British Journal of Sports Medicine — 2023 IOC consensus statement on REDs", href: "https://pubmed.ncbi.nlm.nih.gov/37752011/" },
      { label: "KidsHealth — Female athlete triad", href: "https://kidshealth.org/en/teens/triad.html" },
      { label: "NHS — Osteoporosis: causes", href: "https://www.nhs.uk/conditions/osteoporosis/causes/" },
      { label: "Office on Women's Health — Physical activity and your menstrual cycle", href: "https://www.womenshealth.gov/getting-active/physical-activity-menstrual-cycle" },
    ],
    related: ["exercise-and-periods", "eating-disorders", "missed-periods"],
    es: {
      title: "Déficit de energía y pérdida del periodo (RED-S)",
      summary: "Si no comes lo suficiente para cubrir la energía que gastas, tus periodos pueden volverse irregulares o detenerse. Perder el periodo es una señal de alarma que conviene consultar.",
      sections: [
        {
          heading: "Qué es la RED-S",
          body: "La deficiencia energética relativa en el deporte (RED-S, que también se escribe REDs) ocurre cuando, con el tiempo, no comes lo suficiente para cubrir la energía que usa tu cuerpo, incluida la del ejercicio. Afecta tanto a hombres como a mujeres. Un término relacionado y más antiguo, la tríada de la atleta femenina, describe tres problemas relacionados: no comer lo suficiente para tu actividad, la falta de periodos y los huesos débiles. La RED-S es una idea más amplia que abarca muchos efectos en la salud y en el rendimiento deportivo.",
        },
        {
          heading: "Cómo puede ocurrir",
          body: "La RED-S puede ocurrir sin que nadie lo pretenda. Puedes empezar a entrenar más sin comer más, o entrenar más y a la vez comer menos. Es más probable en deportes en los que la delgadez se ve como una ventaja, como las carreras de fondo, la gimnasia, el patinaje artístico, la danza y el remo. Entrenar mucho un solo deporte desde muy joven, o sentir presión para perder peso, puede aumentar el riesgo. A veces está relacionada con un trastorno alimentario, y a veces no.",
        },
        {
          heading: "Efectos en el periodo y los huesos",
          body: "Cuando la energía es baja, una parte del cerebro llamada hipotálamo puede frenar o detener una hormona de la que depende el ciclo. Los niveles de estrógeno bajan. Los ciclos pueden alargarse o volverse menos regulares, y los periodos pueden desaparecer por completo. El estrógeno bajo, una mala nutrición y muy poco calcio o vitamina D pueden causar pérdida de masa ósea. Esto hace más probables las fracturas por estrés (pequeñas grietas en un hueso). Con el tiempo, los huesos pueden debilitarse tanto que se rompan con facilidad (osteoporosis).",
        },
        {
          heading: "Otros efectos",
          body: "La RED-S puede afectar a tu salud y a tu rendimiento deportivo de muchas formas, no solo a tus periodos. Las fracturas y otras lesiones deportivas pueden volverse más frecuentes. El estado de ánimo también puede verse afectado, y el ánimo bajo, la ansiedad o la depresión pueden aparecer junto con la RED-S. Vale la pena tomarse en serio estas señales, aunque tus periodos no se hayan detenido.",
        },
        {
          heading: "Tratamiento y recuperación",
          body: "El tratamiento consiste en cerrar la brecha entre la energía que obtienes y la que gastas. Eso suele significar comer más, entrenar menos o ambas cosas. Tomar suficiente calcio y vitamina D también ayuda a proteger los huesos. La atención suele venir de un equipo, que puede incluir un médico, un nutricionista, un profesional de salud mental y un entrenador o preparador físico. Si hay problemas con la alimentación de por medio, el tratamiento también incluirá apoyo para eso. La recuperación lleva tiempo, así que ayuda empezar pronto.",
        },
        {
          heading: "Cuándo consultar a un médico o una enfermera",
          body: "Perder el periodo es una señal de alarma, no una parte normal del entrenamiento. Consulta a un médico o una enfermera si tus periodos se detienen o se vuelven irregulares mientras entrenas o comes menos. Consulta también si tienes 15 años o más y aún no te ha venido el primer periodo, o si tienes una fractura por estrés o te lesionas una y otra vez. Registrar tus periodos y tu actividad en Ciclo puede ayudarte a detectar cambios pronto y a mostrarle a un médico lo que ha pasado.",
        },
      ],
      notice: "Esto es información general, no un diagnóstico. Si tus periodos se han detenido, habla con un médico o una enfermera.",
    },
    en: {
      title: "Under-fuelling and lost periods (RED-S)",
      summary: "If you do not eat enough to cover the energy you use, your periods can become irregular or stop. Lost periods are a warning sign worth getting checked.",
      sections: [
        {
          heading: "What RED-S is",
          body: "Relative energy deficiency in sport (RED-S, also written REDs) happens when, over time, you do not eat enough to cover the energy your body uses, including for exercise. It affects men as well as women. A related, older term, the female athlete triad, describes three linked problems: not eating enough for your activity, missed periods and weak bones. RED-S is a broader idea that covers many effects on health and sports performance.",
        },
        {
          heading: "How it can happen",
          body: "RED-S can happen without anyone meaning it to. You might start training more without eating more, or train more while also eating less. It is more likely in sports where being thin is seen as an advantage, such as distance running, gymnastics, figure skating, dance and rowing. Training a lot in one sport from a young age, or feeling pressure to lose weight, can add to the risk. Sometimes it is linked to an eating disorder, and sometimes it is not.",
        },
        {
          heading: "Effects on periods and bones",
          body: "When energy is low, a part of the brain called the hypothalamus can slow or stop a hormone that the cycle depends on. Oestrogen levels drop. Cycles may get longer or less regular, and periods may stop altogether. Low oestrogen, poor nutrition and too little calcium or vitamin D can cause bone loss. This makes stress fractures (tiny cracks in a bone) more likely. Over time, bones can become weak enough to break easily (osteoporosis).",
        },
        {
          heading: "Other effects",
          body: "RED-S can affect your health and your sports performance in many ways, not only your periods. Broken bones and other sports injuries can become more common. Mood can be affected too, and low mood, anxiety or depression can come with RED-S. These signs are worth taking seriously, even if your periods have not stopped.",
        },
        {
          heading: "Treatment and recovery",
          body: "Treatment means closing the gap between the energy you take in and the energy you use. That usually means eating more, training less, or both. Getting enough calcium and vitamin D also helps protect your bones. Care often comes from a team, which may include a doctor, a dietitian, a mental health professional and a coach or trainer. If disordered eating is part of the picture, treatment will include support for that too. Recovery takes time, so it helps to start early.",
        },
        {
          heading: "When to see a doctor or nurse",
          body: "Losing your periods is a warning sign, not a normal part of training. See a doctor or nurse if your periods stop or become irregular while you are training or eating less. Also go if you are 15 or older and your periods have not started, or if you have a stress fracture or keep getting injured. Logging your periods and activity in Ciclo can help you spot changes early and show a doctor what has happened.",
        },
      ],
      notice: "This is general information, not a diagnosis. If your periods have stopped, talk to a doctor or nurse.",
    },
  },
  {
    slug: "sleep",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "CDC — About sleep", href: "https://www.cdc.gov/sleep/about/index.html" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      { label: "NHS — Generalised anxiety disorder (GAD)", href: "https://www.nhs.uk/mental-health/conditions/generalised-anxiety-disorder/overview/" },
      { label: "NHS — Postnatal depression", href: "https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/" },
    ],
    related: ["fatigue-sleep", "pms", "stress-and-cycle"],
    es: {
      title: "Dormir bien",
      summary: "La mayoría de las personas adultas necesitan 7 horas de sueño o más cada noche. Aquí verás por qué importa el sueño, qué hábitos ayudan y cómo tu ciclo y tu estado de ánimo pueden afectar a tu sueño.",
      sections: [
        {
          heading: "Cuánto sueño necesitas",
          body: "Las necesidades de sueño cambian con la edad. Los Centros para el Control y la Prevención de Enfermedades de Estados Unidos (CDC) recomiendan al menos 7 horas por noche para adultos de 18 a 60 años. Recomiendan de 7 a 9 horas de los 61 a los 64 años, y de 7 a 8 horas a partir de los 65. Los adolescentes de 13 a 17 años necesitan más, unas 8 a 10 horas por noche. Dormir menos de lo que necesitas de forma habitual puede afectar tanto a tu cuerpo como a tu estado de ánimo.",
        },
        {
          heading: "Por qué importa el sueño",
          body: "Dormir lo suficiente te ayuda a enfermar menos, a manejar el estrés y a mejorar tu estado de ánimo. Con el tiempo, también reduce el riesgo de enfermedades de larga duración como la diabetes tipo 2, las enfermedades del corazón, la presión arterial alta y el accidente cerebrovascular. Descansar bien también hace menos probables los accidentes de tráfico.",
        },
        {
          heading: "Hábitos que ayudan",
          body: "Mantén horarios regulares para acostarte y levantarte, incluso los fines de semana. Un dormitorio silencioso, fresco y tranquilo ayuda. Apaga las pantallas y los dispositivos al menos 30 minutos antes de acostarte. Evita las comidas abundantes y el alcohol cerca de la hora de dormir, y evita la cafeína por la tarde y por la noche. Hacer actividad física durante el día y llevar una alimentación sana también pueden ayudarte a dormir mejor.",
        },
        {
          heading: "El sueño, tu ciclo y tu estado de ánimo",
          body: "El cansancio y los problemas para dormir son síntomas frecuentes del síndrome premenstrual (SPM) antes del periodo. Dormir mal también puede ir unido a la ansiedad y la depresión. Después de tener un bebé, no poder dormir aunque tengas la oportunidad de descansar puede ser una señal de depresión posparto. Añadir una nota o un tag en Ciclo las noches que duermes mal puede mostrar si sigue el ritmo de tu ciclo.",
        },
        {
          heading: "Cuándo hablar con un médico o una enfermera",
          body: "Habla con un médico o una enfermera si tienes problemas para dormir de forma habitual o notas señales de un trastorno del sueño. Pide ayuda también si dormir mal va acompañado de ánimo bajo, pérdida de interés por las cosas o preocupaciones difíciles de controlar, porque pueden ser señales de depresión o ansiedad.",
        },
      ],
      notice: "Esto es información general. Si a menudo te cuesta dormir, habla con un médico o una enfermera.",
    },
    en: {
      title: "Sleep well",
      summary: "Most adults need 7 or more hours of sleep a night. Here is why sleep matters, habits that help, and how your cycle and mood can affect your sleep.",
      sections: [
        {
          heading: "How much sleep you need",
          body: "Sleep needs change with age. The US Centers for Disease Control and Prevention (CDC) advises at least 7 hours a night for adults aged 18 to 60. It advises 7 to 9 hours from 61 to 64, and 7 to 8 hours from 65. Teens aged 13 to 17 need more, about 8 to 10 hours a night. Regularly getting less than you need can affect both your body and your mood.",
        },
        {
          heading: "Why sleep matters",
          body: "Enough sleep helps you get ill less often, manage stress and improve your mood. Over time, it also lowers the risk of long-term conditions such as type 2 diabetes, heart disease, high blood pressure and stroke. Being well rested also makes road accidents less likely.",
        },
        {
          heading: "Habits that help",
          body: "Keep regular times for going to bed and waking up, even at weekends. A quiet, cool and calm bedroom helps. Turn off screens and devices at least 30 minutes before bed. Avoid large meals and alcohol close to bedtime, and avoid caffeine in the afternoon and evening. Being active during the day and eating a healthy diet can help you sleep better too.",
        },
        {
          heading: "Sleep, your cycle and your mood",
          body: "Tiredness and trouble sleeping are common symptoms of PMS before a period. Poor sleep can also come with anxiety and depression. After having a baby, being unable to sleep even when you get the chance to rest can be a sign of postnatal depression. Adding a note or tag in Ciclo on nights you sleep badly can show whether it follows your cycle.",
        },
        {
          heading: "When to talk to a doctor or nurse",
          body: "Talk to a doctor or nurse if you regularly have problems sleeping or notice signs of a sleep disorder. Also get help if poor sleep comes with low mood, loss of interest in things, or worry that is hard to control, as these can be signs of depression or anxiety.",
        },
      ],
      notice: "This is general information. If you often struggle to sleep, talk to a doctor or nurse.",
    },
  },
  {
    slug: "alcohol-smoking",
    category: "lifestyle",
    reviewedAt: "2026-10-04",
    sources: [
      { label: "CDC — Health effects of cigarettes: reproductive health", href: "https://www.cdc.gov/tobacco/about/cigarettes-and-reproductive-health.html" },
      { label: "NHS — Drinking alcohol while pregnant", href: "https://www.nhs.uk/pregnancy/keeping-well/drinking-alcohol-while-pregnant/" },
      { label: "NHS — Period pain", href: "https://www.nhs.uk/conditions/period-pain/" },
      { label: "NHS — PMS (premenstrual syndrome)", href: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      { label: "WHO — Alcohol", href: "https://www.who.int/news-room/fact-sheets/detail/alcohol" },
    ],
    related: ["preconception-health", "trying-to-conceive", "healthy-pregnancy"],
    es: {
      title: "Alcohol, tabaco y salud reproductiva",
      summary: "Fumar y beber alcohol pueden afectar al dolor menstrual, a tus probabilidades de embarazo y a la salud del bebé. Nunca es tarde para dejarlo o reducirlo.",
      sections: [
        {
          heading: "Periodos, SPM y salud a largo plazo",
          body: "Beber menos alcohol y no fumar puede ayudar a aliviar el dolor menstrual. No fumar y no beber demasiado alcohol también están entre las medidas de autocuidado que se recomiendan para el síndrome premenstrual (SPM). El SPM puede traer cambios de humor, cansancio y problemas para dormir en las semanas antes del periodo. Reducir el consumo también puede ayudarte a sentirte mejor en esos días. El alcohol también afecta a tu salud fuera del embarazo. La Organización Mundial de la Salud (OMS) dice que ninguna cantidad de alcohol está completamente libre de riesgo. El alcohol aumenta el riesgo de varios tipos de cáncer, entre ellos el cáncer de mama.",
        },
        {
          heading: "Tabaco y fertilidad",
          body: "Fumar puede hacer más difícil conseguir un embarazo y aumenta la probabilidad de no conseguirlo nunca. En los hombres, fumar daña los espermatozoides y puede causar problemas para tener o mantener una erección (disfunción eréctil). Así que, si estás buscando un bebé, ayuda que las dos personas de la pareja dejen de fumar. Dejar de fumar también puede reducir el riesgo de una menopausia temprana (antes de los 45 años).",
        },
        {
          heading: "Fumar durante el embarazo",
          body: "Fumar durante el embarazo aumenta el riesgo de problemas con la placenta, de que la bolsa de las aguas se rompa antes de tiempo y de un embarazo ectópico (un embarazo que crece fuera del útero). Es más probable que los bebés nazcan antes de tiempo, antes de las 37 semanas, o que nazcan pequeños. Fumar también aumenta el riesgo de labio leporino o paladar hendido y de síndrome de muerte súbita del lactante (SMSL). Respirar el humo de otras personas durante el embarazo puede reducir el peso del bebé al nacer. Dejar de fumar en cualquier momento del embarazo ayuda.",
        },
        {
          heading: "Alcohol y embarazo",
          body: "Si estás embarazada o buscando un bebé, lo más seguro es no beber nada de alcohol. Si das el pecho, pregunta a un médico, una enfermera o una matrona (partera) sobre el alcohol. El alcohol pasa a través de la placenta al bebé, cuyo hígado todavía no puede procesarlo. Beber durante el embarazo aumenta el riesgo de aborto espontáneo, parto prematuro y bajo peso al nacer. También puede causar un trastorno del espectro alcohólico fetal (TEAF), una afección que dura toda la vida. Cuanto más bebas, mayor es el riesgo.",
        },
        {
          heading: "Si bebiste antes de saberlo",
          body: "Si bebiste alcohol antes de saber que estabas embarazada, evita el alcohol el resto del embarazo. Intenta no preocuparte demasiado, ya que es probable que el riesgo para el bebé sea bajo. Si quieres dejar de fumar o beber menos, un médico, una enfermera, una matrona (partera) o un farmacéutico o farmacéutica pueden ayudarte a encontrar apoyo. No tienes que hacerlo a solas.",
        },
      ],
      notice: "Esto es información general. Si quieres ayuda para dejar de fumar o de beber, habla con un médico, una enfermera o un farmacéutico o farmacéutica.",
    },
    en: {
      title: "Alcohol, smoking and reproductive health",
      summary: "Smoking and alcohol can affect period pain, your chances of getting pregnant and a baby's health. It is never too late to stop or cut down.",
      sections: [
        {
          heading: "Periods, PMS and long-term health",
          body: "Cutting down on alcohol and not smoking may help ease period pain. Not smoking and not drinking too much alcohol are also among the self-help steps suggested for premenstrual syndrome (PMS). PMS can bring mood swings, tiredness and trouble sleeping in the weeks before a period. Cutting down may help you feel better then too. Alcohol affects your health outside pregnancy as well. The WHO says no amount of drinking is completely free of risk. Alcohol raises the risk of several cancers, including breast cancer.",
        },
        {
          heading: "Smoking and fertility",
          body: "Smoking can make it harder to get pregnant and raises the chance of never becoming pregnant. In men, smoking damages sperm and can lead to problems getting or keeping an erection (erectile dysfunction). So if you are trying for a baby, it helps if both partners stop. Stopping smoking may also lower the risk of an early menopause (before age 45).",
        },
        {
          heading: "Smoking in pregnancy",
          body: "Smoking in pregnancy raises the risk of problems with the placenta, the waters breaking too early, and an ectopic pregnancy (a pregnancy that grows outside the womb). Babies are more likely to be born early, before 37 weeks, or to be born small. Smoking also raises the risk of cleft lip or palate and of sudden infant death syndrome (SIDS). Breathing in other people's smoke in pregnancy can lower a baby's birth weight. Stopping at any point in pregnancy helps.",
        },
        {
          heading: "Alcohol and pregnancy",
          body: "If you are pregnant or trying for a baby, the safest choice is not to drink alcohol at all. If you are breastfeeding, ask a doctor, nurse or midwife about alcohol. Alcohol passes through the placenta to the baby, whose liver cannot yet process it. Drinking in pregnancy raises the risk of miscarriage, premature birth and low birth weight. It can also cause fetal alcohol spectrum disorder (FASD), a lifelong condition. The more you drink, the greater the risk.",
        },
        {
          heading: "If you drank before you knew",
          body: "If you drank alcohol before you knew you were pregnant, avoid alcohol for the rest of the pregnancy. Try not to worry too much, as the risk to the baby is likely to be low. If you want to stop smoking or cut down on drinking, a doctor, nurse, midwife or pharmacist can help you find support. You do not have to do it alone.",
        },
      ],
      notice: "This is general information. For help to stop smoking or drinking, talk to a doctor, nurse or pharmacist.",
    },
  },
];
