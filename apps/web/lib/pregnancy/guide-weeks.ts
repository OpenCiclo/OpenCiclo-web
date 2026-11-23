// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Week-by-week data for lib/pregnancy/guide.ts: the texts, the size tables and
// their sources. Weeks are completed weeks counted from zero ("week 14" is
// 14+0 to 14+6). The NHS and Mayo Clinic week pages count the same way; ACOG
// writes in four-week blocks and MedlinePlus counts one ahead, so a fact can
// sit a week either side of where another source puts it: the texts say
// "around now" where that matters. Checked against the sources on 2026-11-23;
// no clinician has reviewed them (PREGNANCY_WEEKS_AVAILABLE, lib/features.ts).

import type { BaseLocale } from "@/lib/i18n";

export type WeekText = {
  /** The card's headline in the weeks with no size to give. */
  babyTitle: string;
  /** Two or three facts about development, one sentence each. */
  baby: string[];
  /** What the body commonly does around this week, one or two short paragraphs. */
  body: string[];
};

/**
 * Crown–rump length in millimetres at the middle of each week (n+3 days),
 * from the published dating equations: Robinson & Fleming 1975 for weeks 6 to
 * 8, INTERGROWTH-21st (Papageorghiou et al. 2014; valid from day 58) for
 * weeks 9 to 13. Rounded to the millimetre.
 */
export const CROWN_RUMP_MM: Record<number, number> = {
  6: 7,
  7: 12,
  8: 19,
  9: 27,
  10: 37,
  11: 49,
  12: 61,
  13: 73,
};

/**
 * Estimated fetal weight in grams, 50th percentile, weeks 14 to 40: the WHO
 * fetal growth charts (Kiserud et al. 2017, Table 11, both sexes). The 10th
 * and 90th percentiles sit about 13% either side.
 */
export const WEIGHT_GRAMS: Record<number, number> = {
  14: 90,
  15: 114,
  16: 144,
  17: 179,
  18: 222,
  19: 272,
  20: 330,
  21: 398,
  22: 476,
  23: 565,
  24: 665,
  25: 778,
  26: 902,
  27: 1039,
  28: 1189,
  29: 1350,
  30: 1523,
  31: 1707,
  32: 1901,
  33: 2103,
  34: 2312,
  35: 2527,
  36: 2745,
  37: 2966,
  38: 3186,
  39: 3403,
  40: 3617,
};

const en: Record<number, WeekText> = {
  0: {
    babyTitle: "Pregnancy is counted from your last period.",
    baby: [
      "Weeks are counted from the first day of your last period, so in the first two there is no pregnancy yet.",
      "Ovulation and fertilisation happen around week 2, and the embryo implants in the womb during week 3.",
    ],
    body: ["In these weeks most people notice nothing different from an ordinary cycle."],
  },
  4: {
    babyTitle: "The embryo has implanted in the womb.",
    baby: [
      "The embryo is about 2 mm long, inside a fluid-filled sac, and is fed by a yolk sac until the placenta takes over.",
      "Its inner cells will become the baby; the outer layer becomes part of the placenta.",
    ],
    body: ["A missed period is often the first sign. Some people already have sore breasts, tiredness, nausea or light spotting; many notice nothing yet."],
  },
  5: {
    babyTitle: "The brain, the spinal cord and the heart begin to form.",
    baby: [
      "The embryo has three layers of cells, and every organ will grow from them.",
      "The brain, the spinal cord and the rest of the nervous system are forming, and the heart starts to form and to beat around now.",
    ],
    body: ["Strong tiredness is common in the first trimester."],
  },
  6: {
    babyTitle: "",
    baby: [
      "Small buds appear where the arms and legs will grow, and small dents where the ears will be.",
      "The neural tube, which becomes the brain and the spinal cord, closes around now.",
      "A heartbeat can usually be seen on a vaginal ultrasound in weeks 6 to 7.",
    ],
    body: ["Nausea usually starts before week 9, and it can come at any time of day. Tiredness is typical too."],
  },
  7: {
    babyTitle: "",
    baby: [
      "The head is large compared with the body, and the eyelids and nostrils start to form.",
      "The arm buds look like paddles, and the limbs begin to form the cartilage that later becomes bone.",
    ],
    body: ["The amount of blood in your body is rising, by up to half over the whole pregnancy. It can make you thirstier."],
  },
  8: {
    babyTitle: "",
    baby: ["Fingers begin to form, and the hands and feet take shape.", "The upper lip and the nose have formed."],
    body: ["Bloating and fuller, tender breasts are common."],
  },
  9: {
    babyTitle: "",
    baby: ["Elbows appear, and the toes can be seen.", "The eyelids are forming."],
    body: ["Pregnancy hormones are near their highest, which can bring mood swings. Your breasts are larger and your waist may start to thicken."],
  },
  10: {
    babyTitle: "",
    baby: [
      "Fingers and toes lose their webbing, and the elbows bend.",
      "The heart beats about 180 times a minute, and jerky movements can be seen on a scan.",
      "From about now doctors say fetus instead of embryo.",
    ],
    body: ["The hormone progesterone relaxes the gut, so bloating, burping and heartburn are common."],
  },
  11: {
    babyTitle: "",
    baby: [
      "Fingers and toes are separate, and tiny nails are starting.",
      "The eyelids are closed, tooth buds appear, and the liver is making red blood cells.",
    ],
    body: ["Ligaments stretching as the womb grows can cause twinges in your tummy. Having more blood can make you feel hot or dizzy."],
  },
  12: {
    babyTitle: "",
    baby: ["The intestines have moved into the abdomen, and fingernails are forming.", "The kidneys begin to make urine between weeks 9 and 12."],
    body: ["Nausea often starts to ease and appetite comes back. For most people it has gone by week 14; for some it lasts until weeks 16 to 20."],
  },
  13: {
    babyTitle: "",
    baby: [
      "The ovaries or the testes have formed inside the body.",
      "Movements are more deliberate, and the baby may suck a thumb.",
      "Bones begin to harden, the skull and the long bones first.",
    ],
    body: ["A small bump may start to show. The urge to pee often eases for a while as the womb rises out of the pelvis."],
  },
  14: {
    babyTitle: "",
    baby: ["The baby starts passing urine into the amniotic fluid.", "The neck is more defined, and the spleen is making red blood cells."],
    body: [
      "Twinges at the sides of your lower tummy (round ligament pain) are common as the womb grows. A midwife may now be able to hear the heartbeat with a handheld monitor.",
    ],
  },
  15: {
    babyTitle: "",
    baby: ["Fine hair (lanugo), eyebrows and eyelashes begin to grow.", "The eyes are sensitive to light, and hearing is starting to develop."],
    body: ["Your balance may be a little less steady. Itchy skin and more vaginal discharge are common."],
  },
  16: {
    babyTitle: "",
    baby: [
      "The head is held upright, and the eyes can move slowly.",
      "Arm and leg movements are coordinated and show on a scan, though they are usually still too small to feel.",
    ],
    body: ["If you have been pregnant before, you may start to feel movements from about now. In a first pregnancy it is usually later."],
  },
  17: {
    babyTitle: "",
    baby: ["The baby rolls and turns, and may react to a loud noise.", "Toenails start to grow."],
    body: ["Your waist is disappearing as the womb rises out of the pelvis. Some people feel the first movements about now."],
  },
  18: {
    babyTitle: "",
    baby: ["The swallowing and sucking reflexes are developing.", "The digestive system has started to work, and the baby may begin to hear."],
    body: ["First movements feel like bubbling or fluttering. Most people notice them between weeks 16 and 24, often after week 20 in a first pregnancy."],
  },
  19: {
    babyTitle: "",
    baby: ["A waxy coating (vernix) starts to cover and protect the skin.", "Buds for the adult teeth form behind the first set."],
    body: ["The hormone relaxin loosens your ligaments, so exercise and some movements may feel different."],
  },
  20: {
    babyTitle: "",
    baby: [
      "The baby has regular cycles of sleeping and waking, and a noise can wake them.",
      "From now on length is usually given from head to heel: about 25 cm.",
    ],
    body: ["This is the halfway point. Calf cramps at night are common."],
  },
  21: {
    babyTitle: "",
    baby: ["The baby now weighs more than the placenta.", "The body is covered in fine hair (lanugo), and the baby may suck a thumb."],
    body: ["Your centre of gravity is shifting and your joints are looser, so you may feel less steady on your feet."],
  },
  22: {
    babyTitle: "",
    baby: ["The baby practises breathing movements and swallows amniotic fluid.", "Taste buds are forming, and eyebrows and hair can be seen."],
    body: ["Stretch marks may appear, and piles (haemorrhoids) are common."],
  },
  23: {
    babyTitle: "",
    baby: ["The lungs begin to make surfactant, the substance that will let them fill with air.", "Rapid eye movements begin."],
    body: ["The growing womb can press on your ribs and leave you short of breath. Your breasts may leak a little colostrum, the first milk."],
  },
  24: {
    babyTitle: "",
    baby: ["The skin is still thin and wrinkled.", "About 30 cm from head to heel."],
    body: [
      "From week 24, get to know the baby's own pattern of movements. If they slow down or stop, call your midwife or maternity unit the same day: do not wait until tomorrow.",
      "If you have felt no movement at all by week 24, tell your midwife.",
    ],
  },
  25: {
    babyTitle: "",
    baby: ["The baby may jump at a loud noise and move at a familiar voice.", "You may feel hiccups as small, regular jerks."],
    body: [
      "Heartburn and indigestion are common. So is mild swelling of the feet and ankles; sudden puffiness of the face, hands or feet should be checked the same day.",
    ],
  },
  26: {
    babyTitle: "",
    baby: ["The eyes open around weeks 26 to 28.", "The lungs keep making surfactant, getting ready to breathe air."],
    body: ["Leg cramps at night are common, and you may feel clumsier than usual."],
  },
  27: {
    babyTitle: "",
    baby: ["The baby is getting plumper as fat builds up under the skin.", "The nervous system keeps maturing."],
    body: ["Bloating, constipation and snoring are common. This is the last week of the second trimester."],
  },
  28: {
    babyTitle: "",
    baby: [
      "The eyelids can open and close.",
      "The brain can now help control body temperature and set off breathing movements.",
      "The heart beats about 140 times a minute.",
    ],
    body: ["Heartburn, backache and swelling are common. From week 28 the advice is to go to sleep on your side, not on your back."],
  },
  29: {
    babyTitle: "",
    baby: ["The baby can kick, stretch and grasp.", "About 39 cm from head to heel."],
    body: ["Breathlessness, leg cramps and getting up at night to pee are common."],
  },
  30: {
    babyTitle: "",
    baby: ["The eyes can focus.", "Red blood cells are now made in the bone marrow."],
    body: ["Sleep is often lighter, with vivid dreams."],
  },
  31: {
    babyTitle: "",
    baby: ["Most of the major development is done: from here the baby mainly puts on weight.", "The baby is starting to recognise voices."],
    body: [
      "You may feel Braxton Hicks tightenings: the womb goes hard for 20 to 30 seconds and then relaxes. Call your midwife if they are painful or come regularly.",
    ],
  },
  32: {
    babyTitle: "",
    baby: ["Many babies are head down by now.", "The fine hair (lanugo) starts to fall off."],
    body: ["Movements build up until about week 32 and then stay about the same. They do not slow down before labour: if they do, call the same day."],
  },
  33: {
    babyTitle: "",
    baby: ["The bones are hardening, except the skull, which stays soft for the birth.", "The pupils react to light."],
    body: ["Braxton Hicks tightenings and a feeling of heaviness in the pelvis are common."],
  },
  34: {
    babyTitle: "",
    baby: ["The baby is curled up, with the legs bent.", "The fingernails reach the fingertips."],
    body: ["If the baby drops lower into the pelvis, breathlessness and heartburn may ease, and you may need to pee more often."],
  },
  35: {
    babyTitle: "",
    baby: ["The baby fills most of the space in the womb but still moves as often as before.", "About 46 cm from head to heel."],
    body: ["Sore ribs are common. Pain just below the ribs should be checked the same day."],
  },
  36: {
    babyTitle: "",
    baby: ["Most babies are head down.", "The lungs, the brain and the nervous system keep maturing until the birth."],
    body: ["Leaking a little urine when you cough or laugh is common now."],
  },
  37: {
    babyTitle: "",
    baby: ["About 95 in 100 babies are head down.", "This is early term: the lungs and the brain are still finishing their development."],
    body: ["The bump may drop lower. More discharge and Braxton Hicks tightenings are common."],
  },
  38: {
    babyTitle: "",
    baby: ["Most of the fine hair (lanugo) has gone.", "The head and the tummy measure about the same around."],
    body: ["Tightenings that are painless and irregular are common while you wait."],
  },
  39: {
    babyTitle: "",
    baby: ["From week 39 the pregnancy is full term.", "The skin is still coated with vernix."],
    body: [
      "A plug of mucus (a \"show\"), backache and pressure low in the pelvis can come before labour. Many maternity units say to call when contractions last about 60 seconds and come every 5 minutes: follow what yours told you.",
    ],
  },
  40: {
    babyTitle: "",
    baby: [
      "At birth babies typically measure about 49 to 50 cm and weigh about 3.2 to 3.3 kg, with a wide healthy range either side.",
      "Only about 1 in 20 babies are born on their due date.",
    ],
    body: ["Your waters may break as a trickle, not a gush. Call your maternity unit if you think they have."],
  },
  41: {
    babyTitle: "The pregnancy is now late term.",
    baby: ["From week 41 the pregnancy is called late term.", "Babies born after their due date may have dry, peeling skin."],
    body: ["Past the due date extra checks are usually offered, and you will be asked about a membrane sweep and about inducing labour, usually during week 41."],
  },
};

const es: Record<number, WeekText> = {
  0: {
    babyTitle: "El embarazo se cuenta desde tu última regla.",
    baby: [
      "Las semanas se cuentan desde el primer día de la última regla, así que en las dos primeras todavía no hay embarazo.",
      "La ovulación y la fecundación ocurren hacia la semana 2, y el embrión se implanta en el útero durante la semana 3.",
    ],
    body: ["En estas semanas lo habitual es no notar nada distinto de un ciclo normal."],
  },
  4: {
    babyTitle: "El embrión se ha implantado en el útero.",
    baby: [
      "El embrión mide unos 2 mm, está dentro de una bolsa llena de líquido y se alimenta de un saco vitelino hasta que la placenta toma el relevo.",
      "Sus células internas serán el bebé; la capa externa formará parte de la placenta.",
    ],
    body: [
      "La falta de la regla suele ser la primera señal. Algunas personas ya notan los pechos sensibles, cansancio, náuseas o un manchado ligero; muchas aún no notan nada.",
    ],
  },
  5: {
    babyTitle: "Empiezan a formarse el cerebro, la médula espinal y el corazón.",
    baby: [
      "El embrión tiene tres capas de células, y de ellas saldrán todos los órganos.",
      "Se están formando el cerebro, la médula espinal y el resto del sistema nervioso, y el corazón empieza a formarse y a latir por estas fechas.",
    ],
    body: ["Un cansancio intenso es frecuente en el primer trimestre."],
  },
  6: {
    babyTitle: "",
    baby: [
      "Aparecen unos pequeños brotes donde crecerán los brazos y las piernas, y unas hendiduras donde estarán las orejas.",
      "El tubo neural, que será el cerebro y la médula espinal, se cierra por estas fechas.",
      "El latido suele verse en una ecografía vaginal entre las semanas 6 y 7.",
    ],
    body: ["Las náuseas suelen empezar antes de la semana 9 y pueden venir a cualquier hora del día. El cansancio también es habitual."],
  },
  7: {
    babyTitle: "",
    baby: [
      "La cabeza es grande en comparación con el cuerpo, y empiezan a formarse los párpados y los orificios de la nariz.",
      "Los brotes de los brazos tienen forma de pala, y en las extremidades empieza a formarse el cartílago que luego será hueso.",
    ],
    body: ["La cantidad de sangre de tu cuerpo va en aumento, hasta la mitad más a lo largo del embarazo. Puede darte más sed."],
  },
  8: {
    babyTitle: "",
    baby: ["Empiezan a formarse los dedos, y las manos y los pies toman forma.", "Ya se han formado el labio superior y la nariz."],
    body: ["La hinchazón de vientre y los pechos más llenos y sensibles son frecuentes."],
  },
  9: {
    babyTitle: "",
    baby: ["Aparecen los codos y ya se ven los dedos de los pies.", "Se están formando los párpados."],
    body: [
      "Las hormonas del embarazo están cerca de su punto más alto, lo que puede traer cambios de humor. Los pechos han crecido y la cintura puede empezar a ensancharse.",
    ],
  },
  10: {
    babyTitle: "",
    baby: [
      "Los dedos de manos y pies pierden la membrana que los unía, y los codos se doblan.",
      "El corazón late unas 180 veces por minuto, y en una ecografía se ven movimientos bruscos.",
      "Más o menos desde ahora se habla de feto en lugar de embrión.",
    ],
    body: ["La progesterona relaja el intestino, así que la hinchazón, los eructos y el ardor de estómago son frecuentes."],
  },
  11: {
    babyTitle: "",
    baby: [
      "Los dedos de manos y pies están separados y empiezan a tener unas uñas diminutas.",
      "Los párpados están cerrados, aparecen los brotes de los dientes y el hígado fabrica glóbulos rojos.",
    ],
    body: ["Los ligamentos que se estiran al crecer el útero pueden dar pinchazos en el vientre. Tener más sangre puede darte calor o mareo."],
  },
  12: {
    babyTitle: "",
    baby: ["Los intestinos ya están dentro del abdomen y se están formando las uñas.", "Los riñones empiezan a producir orina entre las semanas 9 y 12."],
    body: [
      "Las náuseas suelen empezar a ceder y vuelve el apetito. En la mayoría han desaparecido hacia la semana 14; en algunas personas duran hasta las semanas 16 a 20.",
    ],
  },
  13: {
    babyTitle: "",
    baby: [
      "Los ovarios o los testículos ya se han formado dentro del cuerpo.",
      "Los movimientos son más intencionados, y el bebé puede chuparse el pulgar.",
      "Los huesos empiezan a endurecerse, primero el cráneo y los huesos largos.",
    ],
    body: ["Puede empezar a notarse una pequeña barriga. Las ganas de orinar suelen calmarse un tiempo cuando el útero sube y sale de la pelvis."],
  },
  14: {
    babyTitle: "",
    baby: ["El bebé empieza a orinar en el líquido amniótico.", "El cuello está más definido, y el bazo fabrica glóbulos rojos."],
    body: [
      "Los pinchazos a los lados de la parte baja del vientre (dolor del ligamento redondo) son frecuentes al crecer el útero. La matrona quizá pueda oír ya el latido con un aparato de mano.",
    ],
  },
  15: {
    babyTitle: "",
    baby: ["Empiezan a crecer un vello fino (lanugo), las cejas y las pestañas.", "Los ojos son sensibles a la luz, y el oído empieza a desarrollarse."],
    body: ["Tu equilibrio puede ser algo menos firme. El picor de piel y un flujo vaginal más abundante son frecuentes."],
  },
  16: {
    babyTitle: "",
    baby: [
      "Mantiene la cabeza erguida, y los ojos pueden moverse despacio.",
      "Los movimientos de brazos y piernas son coordinados y se ven en la ecografía, aunque suelen ser aún demasiado pequeños para notarlos.",
    ],
    body: ["Si ya has estado embarazada, puedes empezar a notar movimientos por estas fechas. En un primer embarazo suele ser más tarde."],
  },
  17: {
    babyTitle: "",
    baby: ["El bebé gira y da vueltas, y puede reaccionar a un ruido fuerte.", "Empiezan a crecer las uñas de los pies."],
    body: ["La cintura va desapareciendo a medida que el útero sale de la pelvis. Algunas personas notan los primeros movimientos por ahora."],
  },
  18: {
    babyTitle: "",
    baby: ["Se desarrollan los reflejos de tragar y de succionar.", "El aparato digestivo ha empezado a funcionar, y el bebé puede empezar a oír."],
    body: [
      "Los primeros movimientos se notan como burbujas o un aleteo. La mayoría los nota entre las semanas 16 y 24, a menudo después de la 20 en un primer embarazo.",
    ],
  },
  19: {
    babyTitle: "",
    baby: [
      "Una capa cerosa (vérnix) empieza a cubrir y proteger la piel.",
      "Detrás de los primeros dientes se forman los brotes de los dientes definitivos.",
    ],
    body: ["La hormona relaxina afloja los ligamentos, así que el ejercicio y algunos movimientos pueden sentirse distintos."],
  },
  20: {
    babyTitle: "",
    baby: [
      "El bebé tiene ciclos regulares de sueño y vigilia, y un ruido puede despertarlo.",
      "Desde ahora la longitud suele darse de la cabeza a los talones: unos 25 cm.",
    ],
    body: ["Es la mitad del camino. Los calambres en las pantorrillas por la noche son frecuentes."],
  },
  21: {
    babyTitle: "",
    baby: ["El bebé ya pesa más que la placenta.", "El cuerpo está cubierto de vello fino (lanugo), y el bebé puede chuparse el pulgar."],
    body: ["Tu centro de gravedad cambia y las articulaciones están más laxas, así que puedes sentirte menos estable al andar."],
  },
  22: {
    babyTitle: "",
    baby: ["El bebé ensaya movimientos de respiración y traga líquido amniótico.", "Se forman las papilas gustativas, y ya se ven las cejas y el pelo."],
    body: ["Pueden aparecer estrías, y las hemorroides son frecuentes."],
  },
  23: {
    babyTitle: "",
    baby: [
      "Los pulmones empiezan a producir surfactante, la sustancia que les permitirá llenarse de aire.",
      "Empiezan los movimientos rápidos de los ojos.",
    ],
    body: ["El útero, al crecer, puede presionar las costillas y dejarte sin aliento. Los pechos pueden soltar un poco de calostro, la primera leche."],
  },
  24: {
    babyTitle: "",
    baby: ["La piel todavía es fina y arrugada.", "Mide unos 30 cm de la cabeza a los talones."],
    body: [
      "Desde la semana 24, aprende cómo se mueve tu bebé. Si se mueve menos o deja de moverse, llama a tu matrona o a tu maternidad ese mismo día: no esperes a mañana.",
      "Si en la semana 24 aún no has notado ningún movimiento, díselo a tu matrona.",
    ],
  },
  25: {
    babyTitle: "",
    baby: ["El bebé puede sobresaltarse con un ruido fuerte y moverse al oír una voz conocida.", "Puedes notar su hipo como pequeñas sacudidas regulares."],
    body: [
      "El ardor de estómago y la indigestión son frecuentes. También una hinchazón leve de pies y tobillos; si la cara, las manos o los pies se hinchan de repente, hay que consultarlo ese mismo día.",
    ],
  },
  26: {
    babyTitle: "",
    baby: ["Los ojos se abren hacia las semanas 26 a 28.", "Los pulmones siguen produciendo surfactante, preparándose para respirar aire."],
    body: ["Los calambres en las piernas por la noche son frecuentes, y puedes sentirte más torpe de lo habitual."],
  },
  27: {
    babyTitle: "",
    baby: ["El bebé va engordando a medida que acumula grasa bajo la piel.", "El sistema nervioso sigue madurando."],
    body: ["La hinchazón, el estreñimiento y los ronquidos son frecuentes. Es la última semana del segundo trimestre."],
  },
  28: {
    babyTitle: "",
    baby: [
      "Los párpados pueden abrirse y cerrarse.",
      "El cerebro ya ayuda a regular la temperatura del cuerpo y a poner en marcha los movimientos de respiración.",
      "El corazón late unas 140 veces por minuto.",
    ],
    body: [
      "El ardor de estómago, el dolor de espalda y la hinchazón son frecuentes. Desde la semana 28 se aconseja dormirse de lado y no boca arriba.",
    ],
  },
  29: {
    babyTitle: "",
    baby: ["El bebé puede dar patadas, estirarse y agarrar.", "Mide unos 39 cm de la cabeza a los talones."],
    body: ["La falta de aliento, los calambres en las piernas y levantarse de noche a orinar son frecuentes."],
  },
  30: {
    babyTitle: "",
    baby: ["Los ojos pueden enfocar.", "Los glóbulos rojos se fabrican ya en la médula ósea."],
    body: ["El sueño suele ser más ligero, con sueños muy vívidos."],
  },
  31: {
    babyTitle: "",
    baby: ["Lo principal del desarrollo está hecho: desde ahora el bebé sobre todo gana peso.", "El bebé empieza a reconocer voces."],
    body: [
      "Puedes notar contracciones de Braxton Hicks: el útero se pone duro entre 20 y 30 segundos y luego se relaja. Llama a tu matrona si duelen o vienen con regularidad.",
    ],
  },
  32: {
    babyTitle: "",
    baby: ["Muchos bebés ya están cabeza abajo.", "El vello fino (lanugo) empieza a caerse."],
    body: [
      "Los movimientos van a más hasta la semana 32, más o menos, y luego se mantienen. No disminuyen antes del parto: si lo hacen, llama ese mismo día.",
    ],
  },
  33: {
    babyTitle: "",
    baby: ["Los huesos se endurecen, salvo el cráneo, que sigue blando para el parto.", "Las pupilas reaccionan a la luz."],
    body: ["Las contracciones de Braxton Hicks y una sensación de peso en la pelvis son frecuentes."],
  },
  34: {
    babyTitle: "",
    baby: ["El bebé está acurrucado, con las piernas dobladas.", "Las uñas llegan a la punta de los dedos."],
    body: ["Si el bebé baja y se encaja en la pelvis, la falta de aliento y el ardor pueden aliviarse, y puede que tengas que orinar más a menudo."],
  },
  35: {
    babyTitle: "",
    baby: ["El bebé ocupa casi todo el espacio del útero, pero se mueve tanto como antes.", "Mide unos 46 cm de la cabeza a los talones."],
    body: ["El dolor de costillas es frecuente. Un dolor justo debajo de las costillas hay que consultarlo ese mismo día."],
  },
  36: {
    babyTitle: "",
    baby: ["La mayoría de los bebés están cabeza abajo.", "Los pulmones, el cerebro y el sistema nervioso siguen madurando hasta el nacimiento."],
    body: ["Que se escape un poco de orina al toser o al reír es frecuente ahora."],
  },
  37: {
    babyTitle: "",
    baby: [
      "Unos 95 de cada 100 bebés están cabeza abajo.",
      "Es el término temprano: los pulmones y el cerebro aún están terminando de desarrollarse.",
    ],
    body: ["La barriga puede bajar. Más flujo y las contracciones de Braxton Hicks son frecuentes."],
  },
  38: {
    babyTitle: "",
    baby: ["Ha desaparecido casi todo el vello fino (lanugo).", "La cabeza y la barriga miden más o menos lo mismo de contorno."],
    body: ["Las contracciones indoloras e irregulares son frecuentes mientras esperas."],
  },
  39: {
    babyTitle: "",
    baby: ["Desde la semana 39 el embarazo está a término completo.", "La piel sigue cubierta de vérnix."],
    body: [
      "La expulsión del tapón mucoso, el dolor de espalda y la presión en la parte baja de la pelvis pueden llegar antes del parto. Muchas maternidades piden llamar cuando las contracciones duran unos 60 segundos y vienen cada 5 minutos: sigue lo que te haya dicho la tuya.",
    ],
  },
  40: {
    babyTitle: "",
    baby: [
      "Al nacer, los bebés suelen medir entre 49 y 50 cm y pesar entre 3,2 y 3,3 kg, con un margen amplio a cada lado dentro de lo sano.",
      "Solo 1 de cada 20 bebés nace en su fecha probable de parto.",
    ],
    body: ["La bolsa puede romperse como un goteo, no como un chorro. Llama a tu maternidad si crees que se ha roto."],
  },
  41: {
    babyTitle: "El embarazo es ahora a término tardío.",
    baby: [
      "Desde la semana 41 se habla de embarazo a término tardío.",
      "Los bebés que nacen después de su fecha pueden tener la piel seca y descamada.",
    ],
    body: [
      "Pasada la fecha suelen ofrecerse más controles, y te hablarán de la maniobra de Hamilton (despegar las membranas) y de inducir el parto, normalmente durante la semana 41.",
    ],
  },
};

export const WEEK_TEXTS: Record<BaseLocale, Record<number, WeekText>> = { es, en };

/** What the texts, the size tables and the care windows were checked against (2026-11-23). */
export const GUIDE_SOURCES: { label: string; href: string }[] = [
  {
    label: "Kiserud et al., PLoS Medicine 2017 — The World Health Organization Fetal Growth Charts",
    href: "https://doi.org/10.1371/journal.pmed.1002220",
  },
  {
    label: "Papageorghiou et al., Ultrasound Obstet Gynecol 2014 — International standards for early fetal size and pregnancy dating (INTERGROWTH-21st)",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4286014/",
  },
  {
    label: "Robinson & Fleming, Br J Obstet Gynaecol 1975 — A critical evaluation of sonar crown-rump length measurements",
    href: "https://pubmed.ncbi.nlm.nih.gov/1182090/",
  },
  { label: "WHO Child Growth Standards — weight and length at birth", href: "https://www.who.int/tools/child-growth-standards/standards/weight-for-age" },
  {
    label: "Khambalia et al., Int J Gynaecol Obstet 2013 — Predicting date of birth and examining the best time to date a pregnancy",
    href: "https://pubmed.ncbi.nlm.nih.gov/23932061/",
  },
  { label: "ACOG — How your fetus grows during pregnancy", href: "https://www.acog.org/womens-health/faqs/how-your-fetus-grows-during-pregnancy" },
  {
    label: "ACOG and SMFM, Committee Opinion 579 — Definition of term pregnancy",
    href: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2013/11/definition-of-term-pregnancy",
  },
  { label: "ACOG — Routine tests during pregnancy", href: "https://www.acog.org/womens-health/faqs/routine-tests-during-pregnancy" },
  {
    label: "ACOG — Morning sickness: nausea and vomiting of pregnancy",
    href: "https://www.acog.org/womens-health/faqs/morning-sickness-nausea-and-vomiting-of-pregnancy",
  },
  { label: "ACOG — When pregnancy goes past your due date", href: "https://www.acog.org/womens-health/faqs/when-pregnancy-goes-past-your-due-date" },
  { label: "NICE guideline NG201 — Antenatal care", href: "https://www.nice.org.uk/guidance/ng201/chapter/Recommendations" },
  { label: "NICE guideline NG207 — Inducing labour", href: "https://www.nice.org.uk/guidance/ng207/chapter/Recommendations" },
  {
    label: "NHS Best Start in Life — Week-by-week guide to pregnancy",
    href: "https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/",
  },
  { label: "NHS — Your baby's movements", href: "https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/" },
  { label: "NHS — Vaccinations in pregnancy", href: "https://www.nhs.uk/pregnancy/keeping-well/vaccinations/" },
  {
    label: "RCOG — Your baby's movements in pregnancy",
    href: "https://www.rcog.org.uk/for-the-public/browse-our-patient-information/your-babys-movements-in-pregnancy/",
  },
  {
    label: "Mayo Clinic — Fetal development: the first trimester (and the second and third)",
    href: "https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302",
  },
  { label: "MedlinePlus — Fetal development", href: "https://medlineplus.gov/ency/article/002398.htm" },
  {
    label: "SEGO 2017 — Control prenatal del embarazo normal",
    href: "https://bibliotecavirtual.sego.es/uploads/app/1297/elements/file/file1681394356.pdf",
  },
  {
    label: "Ministerio de Sanidad — Calendario de vacunación a lo largo de toda la vida 2026",
    href: "https://www.sanidad.gob.es/areas/promocionPrevencion/vacunaciones/calendario/docs/CalendarioVacunacion_Todalavida.pdf",
  },
  { label: "CDC — Vaccines recommended during pregnancy", href: "https://www.cdc.gov/vaccines-pregnancy/recommended-vaccines/index.html" },
  { label: "CDC — RSV: protecting infants", href: "https://www.cdc.gov/rsv/vaccines/protect-infants.html" },
  { label: "CDC — Group B strep: testing", href: "https://www.cdc.gov/group-b-strep/testing/index.html" },
  { label: "CDC Hear Her — Urgent maternal warning signs", href: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html" },
  {
    label: "WHO 2016 — Recommendations on antenatal care for a positive pregnancy experience",
    href: "https://www.ncbi.nlm.nih.gov/books/NBK409108/",
  },
];
