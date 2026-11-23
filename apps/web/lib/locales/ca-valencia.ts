// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import ca from "./ca";
import { MARKETING_LINKS } from "@/lib/marketing/links";
import type { LocaleModule } from "@/lib/locales/registry";

// Valencian (ca-valencia): the app, the landing and the code email.
// Built on top of the Catalan file (ca.ts): only the strings that the Valencian
// standard (AVL) writes differently are overridden here; everything else is Catalan.
// Machine-assisted translation; needs a native review before release.

const locale: LocaleModule = {
  messages: {
    ...ca.messages,
    moonToday: "Hui, {phase} · {percent} %",
    patternsIntroToday: "Hui · dia {day} del teu cicle",
    patternsIntroNext: "La regla t'arribarà cap al {date}, d'ací a {days}.",
    patternsIntroDue: "La regla s'espera per estos dies.",
    patternsIntroRegular: "Els teus cicles duren {length} i són prou regulars.",
    patternsIntroSomewhat: "Els teus cicles duren {length} i varien un poc d'un a l'altre.",
    patternsIntroVariable: "Els teus cicles duren {length} i varien prou d'un a l'altre.",
    patternsCyclesTitle: "Els teus cicles, un davall de l'altre",
    patternsCyclesHint: "Tots comencen a l'esquerra, el dia 1. El que cau en la mateixa columna es repetix.",
    patternsInDays: "d'ací a {days}",
    patternsForecastLikely: "El més probable és que comence entre el {start} i el {end} (8 de cada 10 vegades).",
    patternsSymptomsOne: "1 símptoma torna cicle rere cicle.",
    patternsNotesLabel: "En dies com hui",
    patternsNotesTitle: "Altres vegades, cap al dia {day}, vas escriure:",
    friendsNoteYours: "La teua nota",
    friendsNoteUntilToday: "es veu fins hui",
    friendsLoggedToday: "registrat hui",
    createWithEmailHint:
      "Entra des de qualsevol dispositiu amb el mateix correu i la mateixa contrasenya. En crear el compte, confirmes la bústia amb un codi. El diari es xifra al navegador; nosaltres no podem llegir-lo ni restablir la teua contrasenya.",
    createWithEmailHintAndroid:
      "Entra des de qualsevol dispositiu amb el mateix correu i la mateixa contrasenya. En crear el compte, confirmes la bústia amb un codi. El diari es xifra en este mòbil; nosaltres no podem llegir-lo ni restablir la teua contrasenya.",
    superPrivateHint:
      "Sense correu. Guardes 12 paraules. Màxima privacitat. Si les perds, no hi ha manera de recuperar-les — exporta'n una còpia de seguretat.",
    chooseModeIntro:
      "Tria com vols entrar. En els dos casos, les teues dates es xifren ací abans de guardar-se. Ciclo no pot recuperar la teua contrasenya ni la teua frase.",
    privacyBanner:
      "Les teues dates es xifren en este dispositiu. Ciclo no pot restablir la teua contrasenya ni la teua frase. Si les perds, només et salva una exportació prèvia. Així ningú — ni tan sols nosaltres — pot llegir el teu diari al servidor.",
    signupConsentHosted:
      "El teu diari pot contindre dades de salut i de la teua vida sexual: períodes, símptomes, salut mental, activitat sexual, proves d'embaràs i d'ovulació, dates d'embaràs, pastilles anticonceptives i altres medicaments, i notes. Ciclo el xifra en este dispositiu abans de guardar-lo. En el núvol de Ciclo, el nostre servidor només en guarda la còpia xifrada i no la pot llegir. Amb correu, també guarda una empremta codificada de la teua adreça, mai l'adreça.",
    signupConsentDevice: "Amb «Només en este dispositiu», el diari no ix mai d'este mòbil.",
    signupConsentAgree:
      "Accepte que Ciclo guarde i tracte les meues dades de salut tal com s'explica ací i en la política de privacitat.",
    signupConsentRequired: "Marca la casella per a triar com crear el teu diari.",
    noResetHint:
      "Si oblides la contrasenya o la frase, el diari del núvol es perd. És intencionat: protegix la teua privacitat. Exporta en JSON/CSV mentres pugues.",
    back: "Arrere",
    save: "Guarda",
    privacy: "Privacitat",
    privacyPolicy: "Política de privacitat",
    licensesIntro:
      "Ciclo utilitza estos tipus de lletra i paquets de programari de codi obert. Les seues llicències demanen mostrar estos avisos. Els textos de les llicències estan en anglés.",
    visualSeasonsHint:
      "Ambienta la targeta del cicle segons la seua estació: hivern, primavera, estiu o tardor. Les animacions respecten la preferència de moviment reduït del dispositiu.",
    timeZoneHint:
      "Decidix a quina hora comença «hui» al calendari. Automàtic usa el fus horari d'este dispositiu. Només es guarda en este dispositiu.",
    onboardingTitle: "La teua frase de 12 paraules",
    onboardingBody:
      "Estes 12 paraules són la clau del teu diari. Guarda-les al navegador o en un lloc segur. Ciclo no les pot recuperar.",
    onboardingBodyAndroid:
      "Estes 12 paraules són la clau del teu diari. Apunta-les o guarda-les en un lloc segur. Ciclo no les pot recuperar.",
    emailAccountBody:
      "Tria un correu i una contrasenya (mín. 8 caràcters). T'enviarem un codi de 6 xifres a esta bústia per a confirmar que és teua. No és un enllaç de restabliment. Ciclo xifra el diari ací. La contrasenya no ix mai del teu dispositiu sense xifrar.",
    verifyEmailBody:
      "Hem enviat un codi de 6 xifres a {email}. Usa'l una vegada per a demostrar que la bústia és teua. No restablix la contrasenya ni obri el diari.",
    mailNotConfigured:
      "Ara mateix este servidor no pot enviar correus. Torna-ho a provar més tard o usa el mode superprivat.",
    verifyEmailInvalid: "Este codi no és vàlid o ha caducat. Sol·licita'n un de nou.",
    tooManySignups: "S'han creat massa comptes des d'esta xarxa. Torna-ho a provar més tard. Si ja tens un diari, entra amb la teua frase de 12 paraules.",
    tooManySignupsDevice: "També pots triar «Només en este dispositiu», que no necessita compte.",
    codeDelayedSignup: "El codi no arriba al cap d'uns minuts? Torna arrere i tria «Mode superprivat»: només necessites la teua frase de 12 paraules.",
    codeDelayedAddEmail: "El codi no arriba al cap d'uns minuts? Pots continuar entrant amb la teua frase de 12 paraules.",
    confirmTitle: "Confirma que l'has guardada",
    unlockBody: "Correu i contrasenya, o la teua frase de 12 paraules si vas triar el mode superprivat.",
    passwordHint: "Mínim 8 caràcters. El navegador la pot guardar com qualsevol altra contrasenya.",
    passwordHintAndroid: "Mínim 8 caràcters. El gestor de contrasenyes la pot guardar com qualsevol altra.",
    keepLoggedInHint:
      "En este navegador el diari queda obert fins que tanques la sessió. Qualsevol persona amb accés a este perfil el pot obrir.",
    keepLoggedInHintAndroid:
      "En este mòbil el diari queda obert fins que tanques la sessió. Qualsevol persona que use este mòbil desbloquejat el pot obrir.",
    saveInBrowser: "Guarda al navegador",
    savedInBrowser: "És possible que el navegador et demane guardar-ho. Si apareix l'avís, accepta'l.",
    savePhraseInBrowserHint:
      "Escriu un nom i polsa guardar. És possible que el navegador et demane guardar la frase. Si no apareix l'avís, torna a polsar.",
    backupPhraseHint: "Només per al mode superprivat o per a una còpia manual. No cal si uses correu i contrasenya.",
    backupQrHint:
      "Este QR és la mateixa frase de 12 paraules. En un altre dispositiu, ves a Entra → Mode superprivat → Escaneja el QR per a obrir el compte sense escriure-la. No el mostres en una pantalla compartida: una foto obri el compte.",
    backupQrLabel: "Codi QR de la teua frase de 12 paraules",
    qrCameraDenied: "No hi ha permís de càmera. Pots enganxar la frase més avall.",
    qrCameraUnavailable: "Este dispositiu no té càmera. Enganxa la frase més avall.",
    qrNotAPhrase: "Este QR no és una frase de Ciclo.",
    passwordMismatch: "Les contrasenyes no coincidixen.",
    passwordTooShort: "La contrasenya ha de tindre almenys 8 caràcters.",
    addStart: "Obri el diari",
    noDates: "Encara no hi ha dies de sagnat. Obri el diari i marca la teua última regla.",
    deleteDate: "Lleva",
    flowPeriodHint:
      "Marca ací només els dies de la regla. El sagnat entre regles no compta com a inici ni com a durada.",
    today: "Hui",
    clearDayConfirm: "Vols traure tot el que has registrat este dia?",
    nextStart: "Pròxim inici més probable",
    expectedToStart: "S'esperava que la regla començara...",
    withinDaysOne: "En el pròxim dia",
    withinDaysOther: "En els pròxims {n} dies",
    fromToday: "A partir de hui",
    interval80Hint: "Ací es concentra el 80% de la probabilitat.",
    forecastChartHint:
      "L'alçada és la probabilitat que la regla comence aquell dia. La barra destacada és la data més probable.",
    forecastChartHintInitial:
      "Estes barres són el càlcul inicial. La barra destacada és el dia que tenia més probabilitat.",
    importHint:
      "JSON o CSV exportat des de Ciclo. Es fusiona amb este compte. Recupera les dades, no el compte antic.",
    deleteConfirm:
      "Açò esborra les dades xifrades del servidor i les d'este dispositiu. Les aportacions al recull de recerca anònim no es poden desfer. Vols continuar?",
    researchTitle: "Contribuïx al recull anònim",
    researchBenefit:
      "Si compartixes durades anònimes, ajudes a millorar el model de previsió de codi obert d'OpenCiclo, que pot beneficiar milers de dones de tot el món.",
    researchBody:
      "Només s'envien durades del cicle (nombres enters, p. ex. 28 o 30), calculades a partir dels teus inicis de regla. No s'envien símptomes del diari (sagnat, còlics, moc, etc.), notes ni la teua clau pública. El servidor no guarda cap correspondència compte → recull.",
    researchMonthly:
      "Amb l'opció activada, Ciclo envia un resum actualitzat com a màxim una vegada al mes. Si corregixes dates al diari, el següent enviament substituïx l'anterior (mitjançant una clau anònima guardada només al teu dispositiu).",
    researchConsent:
      "Entenc que no és una còpia de seguretat. Si ho desactive, Ciclo deixa d'enviar dades noves. El que ja s'ha enviat es queda al recull, anònim, i no s'esborra.",
    poolOptInLabel: "Contribuïx automàticament (1 vegada al mes)",
    poolNeedCycle: "Necessites almenys un cicle complet (dos inicis de regla) per a contribuir.",
    logout: "Tanca la sessió en este dispositiu",
    screenErrorTitle: "Alguna cosa ha fallat en esta pantalla",
    noAccountForPhrase: "No hi ha cap compte amb esta frase. Revisa les 12 paraules o crea un compte nou.",
    wordMismatch: "Esta paraula no coincidix.",
    welcomeCta: "Comença al navegador. Les dates es xifren abans d'eixir del dispositiu.",
    welcomeCtaAndroid: "Comença ací. Les dates es xifren abans d'eixir d'este mòbil.",
    restoreFailedBody:
      "Pot ser la connexió o el servidor. El teu accés continua guardat en este dispositiu i les teues dades no s'han tocat.",
    restoreShowPhrase: "Mostra la frase guardada en este dispositiu",
    restoreForget: "Oblida l'inici de sessió guardat",
    restoreForgetConfirm: "Açò esborra d'este dispositiu la frase guardada. Sense estes 12 paraules no podràs tornar a obrir este diari, així que apunta-les abans. Vols oblidar-la?",
    restoreSavedSignInBlocks: "Este dispositiu guarda un inici de sessió que no s'ha pogut obrir. Torna a la pantalla d'inici per a tornar-ho a provar, o oblida'l abans d'entrar amb un altre compte.",
    restoreUnreadableBody: "Ciclo no ha pogut obrir l'inici de sessió guardat en este dispositiu. No s'ha esborrat res. Torna-ho a provar; si continua fallant, oblida'l i entra amb el teu correu o les teues 12 paraules.",
    signOutPendingNote: "Has tancat la sessió en este dispositiu. La sessió del servidor acaba quan este navegador torne a tindre connexió.",
    vaultUnreadable: "No s'ha pogut obrir el diari guardat en este compte. No s'ha canviat res al servidor.",
    vaultTooLarge: "El teu diari és massa gran per al núvol de Ciclo, així que no s'hi ha guardat. Fes abans una exportació; les notes més curtes ocupen menys.",
    accountMismatch: "No s'ha guardat ni canviat res: en aquell moment este dispositiu tenia obert un altre compte de Ciclo. Torna-ho a provar.",
    offlineBody:
      "Estàs veient la còpia guardada en este mòbil ({date}). Pots consultar-la, però no podràs guardar canvis fins que tornes a tindre connexió.",
    offlineDayHint: "Sense connexió: pots veure este dia, però no canviar-lo.",
    updateBodyNewer: "Una versió més nova de Ciclo ha guardat este diari, així que esta no pot guardar canvis i potser no mostra totes les entrades. Actualitza Ciclo des de Google Play per a continuar editant.",
    updateBodyOutdated: "Esta versió de Ciclo és massa antiga per a guardar canvis. Actualitza-la des de Google Play per a continuar editant. Encara pots llegir el teu diari.",
    updateOpenStore: "Obri Google Play",
    updateBodyWeb: "El teu diari s'ha guardat amb una versió més nova de Ciclo. Torna a carregar la pàgina per a continuar editant.",
    updateSignInBody: "Esta versió de Ciclo és massa antiga per a obrir el teu compte. Actualitza-la des de Google Play.",
    updateBodyCopy: "Esta versió de Ciclo és massa antiga per al servidor, així que veus la còpia guardada en este mòbil ({date}). Actualitza-la des de Google Play per a veure les entrades més noves i continuar editant.",
    updateSignInBodyWeb: "Torna a carregar la pàgina per a tindre la versió més nova de Ciclo i torna a iniciar la sessió.",
    updateDayHint: "Actualitza Ciclo per a canviar este dia.",
    updateNeededAction: "Actualitza Ciclo per a fer això.",
    importNewerFile: "Este fitxer ve d'una versió més nova de Ciclo. Actualitza l'aplicació per a importar-lo.",
    moveToDeviceUnconfirmed: "El teu diari ara està en este mòbil. No hem pogut confirmar que s'haja esborrat la còpia del servidor de Ciclo. Per a assegurar-te'n, inicia la sessió en {site} i elimina-hi el compte.",
    restoreNoAccountTitle: "La frase guardada no obri cap compte",
    restoreNoAccountBody:
      "Este dispositiu té guardada una frase que ja no té compte, potser perquè el vas esborrar des d'un altre dispositiu. Entra amb una altra frase o crea un compte nou.",
    deviceMode: "Només en este dispositiu",
    deviceModeHint:
      "Sense compte ni servidor. El diari es guarda xifrat en este mòbil i no n'ix. Guardes 12 paraules per si l'app no el pot obrir sola. Si perds el mòbil, només et salva una exportació.",
    deviceModeBody:
      "Estes 12 paraules obrin el teu diari si l'app no ho pot fer sola. Ciclo les guarda xifrades en este mòbil, però apunta-les en un lloc segur.",
    deviceStorageHint:
      "El teu diari només està en este mòbil, xifrat. No n'hi ha cap còpia en cap servidor. Si perds el mòbil o desinstal·les l'app, es perd llevat que tingues una exportació. Exporta'l de tant en tant.",
    storageTitle: "On es guarda el teu diari",
    storageOptionDevice: "Només en este dispositiu",
    moveToHostedHint:
      "Puja el teu diari xifrat. Després l'obris des de qualsevol dispositiu amb la teua frase de 12 paraules, i s'esborra la còpia d'este mòbil.",
    moveToHostedConfirm:
      "El teu diari es pujarà xifrat al núvol i s'esborrarà la còpia d'este mòbil. A partir d'aleshores entraràs amb la teua frase de 12 paraules. Vols continuar?",
    moveToHostedDone:
      "El teu diari ja està al núvol. Si també vols entrar amb correu i contrasenya, afig-los a «Afig correu i contrasenya».",
    addEmailTitle: "Afig correu i contrasenya",
    addEmailHint:
      "Per a entrar des de qualsevol dispositiu amb correu i contrasenya, a més de fer-ho amb la teua frase. T'enviarem un codi per a confirmar el correu. La contrasenya xifra la teua frase ací: no la podem restablir.",
    addEmailDone: "Fet: ara ja pots entrar amb el teu correu i la teua contrasenya.",
    moveToDeviceHint:
      "Guarda el teu diari xifrat en este mòbil i esborra el teu compte del servidor, inclòs l'accés amb correu i contrasenya.",
    moveToDeviceConfirm:
      "El teu diari es guardarà només en este mòbil i s'esborrarà el teu compte del servidor, inclòs l'accés amb correu i contrasenya. Abans, apunta la teua frase de 12 paraules (La teua frase de 12 paraules → Mostra el QR de la frase) i fes una exportació. Vols continuar?",
    moveToDeviceDone: "El teu diari ara només està en este mòbil.",
    appLockUnavailable: "Configura una empremta o un bloqueig de pantalla a Android per a usar-ho.",
    appLockPromptTitle: "Obri Ciclo",
    appLockPromptSubtitle: "Confirma que eres tu per a veure el teu diari.",
    deleteDeviceDiary: "Esborra el diari d'este dispositiu",
    deleteDeviceConfirm:
      "Açò esborra per sempre el diari d'este mòbil. No n'hi ha cap còpia en cap servidor. Les aportacions al recull de recerca anònim no es poden desfer. Vols continuar?",
    deviceLockedBody:
      "El teu diari està guardat en este dispositiu. Desbloqueja'l amb la teua empremta o el bloqueig de pantalla, o escriu la teua frase de 12 paraules.",
    deviceUsePhrase: "Usa la meua frase",
    deviceUnlockHint: "Este diari només està guardat en este dispositiu. Obri'l amb la seua frase de 12 paraules.",
    deviceLockedKeyInvalidated: "El bloqueig de pantalla o les empremtes d'este mòbil han canviat, així que Ciclo ja no pot obrir el teu diari a soles. Obri'l amb la teua frase de 12 paraules.",
    deviceLockedNoKey: "Ciclo no troba en este mòbil la clau que obri el teu diari. Obri'l amb la teua frase de 12 paraules.",
    deviceLockedKeyError: "Ciclo no ha pogut utilitzar la clau del teu diari. Torna-ho a provar o escriu la teua frase de 12 paraules.",
    deviceLockedUnreadable: "Ciclo no pot llegir el fitxer del teu diari en este mòbil. Torna-ho a provar.",
    deviceStatusFailedBody: "Ciclo no ha pogut llegir què hi ha guardat en este mòbil. No s'ha tocat res. Torna-ho a provar.",
    deviceDeleteLockedConfirm: "Sense la seua frase de 12 paraules, este diari no es pot obrir. Esborrar-lo és per a sempre: no hi ha cap còpia en cap servidor. Per a esborrar-lo, escriu {word}.",
    installTitle: "Afig-la a la pantalla d'inici",
    // Browser menu items below stay as the browsers' own Catalan labels (there is no Valencian Chrome/Samsung/Edge UI).
    installIosChrome:
      "Chrome a l'iPhone no la pot instal·lar. Obri-la a Safari, toca Compartir i després Afegir a la pantalla d'inici.",
    installIosFirefox:
      "Firefox a l'iPhone no la pot instal·lar. Obri-la a Safari, toca Compartir i després Afegir a la pantalla d'inici.",
    installIosEdge:
      "Edge a l'iPhone no la pot instal·lar. Obri-la a Safari, toca Compartir i després Afegir a la pantalla d'inici.",
    installIosOther:
      "A l'iPhone només Safari la pot afegir a la pantalla d'inici. Obri-la allí, toca Compartir i després Afegir a la pantalla d'inici.",
    installAndroidChrome:
      "A Chrome, toca Instal·la. Si no apareix, obri el menú i tria Instal·la l'aplicació o Afegeix a la pantalla d'inici.",
    installAndroidSamsung:
      "A Samsung Internet, obri el menú, tria Afegeix la pàgina a i després Pantalla d'inici.",
    installAndroidFirefox: "A Firefox, obri el menú i tria Instal·la o Afegeix a la pantalla d'inici.",
    installAndroidEdge: "A Edge, obri el menú i tria Afegeix a la pantalla d'inici o Instal·la l'aplicació.",
    installAndroidOther: "Obri el menú del navegador i busca Afegeix a la pantalla d'inici o Instal·la l'aplicació.",
    nextPeriodIn: "Pròxima regla d'ací a {days} dies",
    nextPeriodToday: "La regla podria començar hui",
    initialProbabilityToday: "El càlcul inicial donava un {percent}% de probabilitat per a hui.",
    initialProbabilityTodayUnderOne: "El càlcul inicial donava menys d'un 1% de probabilitat per a hui.",
    tapToLog: "Toca un dia per a registrar com et sents",
    clickToLog: "Fes clic en un dia per a registrar com et sents",
    futureDayHint: "Podràs anotar este dia quan arribe.",
    periodDueTitle: "La regla t'hauria d'arribar prompte",
    periodDueBody:
      "El dia més probable ja ha arribat o ha passat, i encara no hi ha sagnat registrat. El gràfic mostra la probabilitat diària. És una estimació; no confirma que la regla haja començat.",
    dayNotePlaceholder: "Alguna cosa breu que vullgues recordar…",
    notesHistory: "Les meues notes",
    notesHistoryHint: "Les teues notes privades, lligades a cada dia del cicle.",
    notesSearchPlaceholder: "Busca a les meues notes",
    notesEmpty: "Encara no hi ha notes. Toca un dia al calendari per a escriure'n una.",
    notesEmptySearch: "Cap nota no coincidix amb esta cerca.",
    notesSimilarHint: "Notes teues de la mateixa fase o al voltant del mateix dia del cicle.",
    notesSimilarEmpty:
      "Quan tingues notes de cicles anteriors en dies semblants, apareixeran ací. Mentrestant, consulta totes les teues notes.",
    notesViewAll: "Mostra totes les meues notes",
    notesDayLogEmpty: "Este dia només té una nota; no hi ha sagnat, moc ni símptomes registrats.",
    clearFilters: "Lleva els filtres",
    saving: "S'està guardant…",
    noPatternsYet: "Registra almenys un inici de regla per a veure patrons.",
    saveEntry: "Guarda",
    discardDraftConfirm: "Vols descartar els canvis d'este dia?",
    favoriteSymptom: "Afig als preferits",
    unfavoriteSymptom: "Lleva dels preferits",
    customSymptomRequired: "Escriu un nom per a crear l'etiqueta.",
    customSymptomDuplicate: "Ja existix una etiqueta amb este nom.",
    addPill: "Afig una píndola",
    pillNamePlaceholder: "P. ex. Ibuprofén",
    symptomSexToys: "Joguets sexuals",
    symptomStress: "Estrés",
    forecastInfoPrior:
      "Amb pocs cicles complets, o cap, Ciclo partix d'una durada típica de 29 dies, presa de grans estudis publicats amb cicles reals (més de 750.000 cicles, sobretot d'Europa i els Estats Units). No és una mitjana de totes les dones del món.",
    forecastInfoPersonal:
      "Cada cicle complet que registres pesa més. Amb pocs, l'estudi encara pesa molt. Amb diversos, compta més la teua durada habitual. Els símptomes no entren en este càlcul.",
    seasonGuideNotice:
      "Les estacions interiors són una metàfora educativa. No confirmen l'ovulació ni servixen com a anticonceptiu.",
    phaseFollicularBody: "L'energia sol pujar mentres el cos es prepara.",
    phaseOvulationBody:
      "Els dies al voltant de l'ovulació, comptats cap arrere des de la pròxima regla. No la confirma ni servix com a anticonceptiu.",
    phaseLutealBody: "Fase de baixada. Poden aparéixer símptomes premenstruals.",
    phaseCardOpen: "Mostra les teues fases",
    periodInShort: "Regla d'ací a {days} dies",
    phaseMenstrualInside: "L'estrogen i la progesterona estan al punt més baix i l'úter expulsa el seu revestiment.",
    phaseOvulationNote: "Estimada amb el calendari: no confirma l'ovulació ni servix com a anticonceptiu.",
    phaseLutealInside:
      "Domina la progesterona, que puja una mica la temperatura i alentix la digestió. Al final, les hormones baixen.",
    phaseLutealTip:
      "acabar tasques i fer faena tranquil·la i de detall. Els menjars amb proteïna i fibra poden suavitzar els antulls.",
    nextPeriodLabel: "Pròxima regla",
    inDays: "d'ací a {days} dies",
    phaseDetailsNotice:
      "Fases estimades amb el calendari i els teus registres. No confirmen l'ovulació ni servixen com a anticonceptiu.",
    swipeUpToClose: "Llisca cap amunt per a tancar",
    dueTitleToday: "Podria començar hui",
    dueChartTitle: "Probabilitat que comence cada dia",
    dueTipStrong: "Quan comence, marca-ho al calendari.",
    dueTipRest: "La previsió del cicle següent s'ajusta sola amb les teues dades.",
    dueNotice: "És una estimació; no confirma que la regla haja començat.",
    todayLower: "hui",
    untilNextPeriod: "Fins a la pròxima regla",
    tipsDisclaimer: "Ciclo oferix orientació general de benestar. No substituïx el consell mèdic.",
    learnSearchPlaceholder: "Busca articles",
    learnDesktopTitle: "Informació clara, per a llegir i compartir.",
    learnDesktopSubtitle:
      "Educació general sobre el cicle, els símptomes i quan cal demanar ajuda, amb les seues fonts. Pública i sense necessitat de compte.",
    learnNoResults: "Cap article no coincidix amb la teua cerca.",
    learnEnglishOnly: "De moment, només en anglés",
    learnCategoryIntimateHealthDescription: "Flux, infeccions i com tindre cura de la zona.",
    learnCategoryMindDescription: "La salut mental i la seua relació amb el cicle.",
    learnCategoryPubertyDescription: "Per a adolescents i les seues famílies.",
    learnCategoryCareDescription: "Cribratges, revisions i els senyals que requerixen atenció.",
    tipPeriodSoonBody:
      "Amb un cicle mitjà de {length} dies, la regla podria arribar d'ací a uns {days} dies. Tin a mà el que necessites i reserva't estones de descans. És una estimació.",
    tipFertileBody:
      "Segons els teus inicis de regla, l'ovulació podria caure per estos dies. Els dies fèrtils comencen uns cinc dies abans d'ovular. El moc com de clara d'ou de vegades hi coincidix, però un calendari no confirma l'ovulació. Ciclo no és un anticonceptiu.",
    pregnancyNotice: "Ciclo no substituïx el seguiment mèdic. Les dates són estimacions.",
    pregnancyStartIntro:
      "Ciclo deixarà de predir regles i et mostrarà les setmanes. El pots tancar quan vulgues. Només es guarda al teu diari xifrat.",
    pregnancyEndKeep: "Guarda'l en el meu diari",
    pregnancyFriendsNoNewsHint:
      "Voran el mateix que si deixares d'apuntar: uns dies «regla esperada» i després «sense novetats recents».",
    pregnancyFriendsSimulatedHint:
      "Les teues amigues voran fases que no són reals. Una amiga que s'hi fixe pot notar que mai no apareix «registrat hui».",
    pregnancyFriendsTitle: "Què voran les teues amigues",
    pregnancyFriendsNote: "Res de l'embaràs arriba a les teues amigues.",
    pregnancyLmpLabel: "Primer dia de la teua última regla",
    pregnancyOptionDue: "Sé la meua data probable de part",
    pregnancyOptionLmp: "Per la meua última regla",
    pregnancyMistakeHint: "S'esborra tot el de l'embaràs, com si no l'hagueres activat mai.",
    resumingBirthAsk:
      "Davant de qualsevol dubte sobre el sagnat o la teua recuperació, consulta la teua llevadora o el teu metge.",
    resumingTitle: "El teu cicle es reprendrà quan apuntes la pròxima regla.",
    settingsPregnancyStartHint: "Dates i setmanes en lloc de prediccions. Només es guarda al teu diari xifrat.",
    settingsPregnancyDeleteConfirm: "S'esborrarà este embaràs del teu diari. No es pot desfer.",
    pregnancyStillGoingTitle: "Continua en curs este embaràs?",
    pregnancyPastNotice: "Amb estes dates, l'embaràs ja hauria acabat. El pots afegir com un embaràs anterior.",
    ovulationWideNote:
      "Els teus cicles varien prou, així que la finestra és àmplia. Una prova d'ovulació la pot reduir.",
    pregnancyTestAfterEnd: "Una prova pot continuar eixint positiva unes setmanes després que acabe un embaràs.",
    pregnancyLearnLink: "Llig sobre l'embaràs a Aprendre",
    importPregnancies: "Afig també els embarassos guardats al fitxer ({count}).",
    settingsPregnancyEditEnd: "Corregix el final",
    pregnancyEndBirth: "Va nàixer el meu nadó",
    pregnancyStillGoingBody:
      "Han passat més de dues setmanes des de la data probable de part. Si ja ha acabat, el pots tancar ací.",
    resumingBirthOvulation: "Es pot ovular abans d'esta primera regla. Ciclo no és un anticonceptiu.",
    resumingOvulation:
      "Es pot ovular abans d'esta primera regla, de vegades a les dues setmanes. Ciclo no és un anticonceptiu.",
    resumingBirthPeriod: "Després d'un part, la regla pot tardar setmanes o mesos a tornar.",
    pregnancyImplausible: "Estes dates no encaixen amb un embaràs en curs. Revisa-les.",
    tipAdviceHeadache:
      "Els mals de cap de vegades coincidixen amb canvis hormonals. Hidratar-te i menjar a hores regulars pot ajudar. Nombre de registres: {count}.",
    tipAdviceMoodSwings:
      "Els canvis d'humor solen aparéixer abans de la regla. Unes rutines suaus i dormir bé poden ajudar. Nombre de registres: {count}.",
    tipAdviceCravings:
      "Els antulls sovint augmenten abans de la regla. Els menjars amb proteïna i fibra els poden suavitzar. Nombre de registres: {count}.",
    tipAdviceHighLibido:
      "Un desig sexual més alt de vegades coincidix amb els dies pròxims a l'ovulació. Nombre de registres: {count}.",
    tipRegularTitle: "Els teus cicles pareixen regulars",
  },
  marketing: {
    ...ca.marketing,
    nav: [
      { label: "Com funciona", href: "#como-funciona" },
      { label: "Privacitat", href: "#privacidad" },
      { label: "Aprendre", href: "/learn" },
      { label: "Documentació", href: "/help" },
      { label: "GitHub", href: MARKETING_LINKS.github, external: true },
      { label: "Contacte", href: "/contact" },
    ],
    openApp: "Obri l'app",
    menu: { ...ca.marketing.menu, open: "Obri el menú" },
    hero: {
      ...ca.marketing.hero,
      subtitle:
        "OpenCiclo registra i preveu el teu cicle menstrual mentres xifra el teu diari al teu propi navegador. Sense anuncis, sense rastreig, sense vendre les teues dades.",
      ctaPrimary: "Obri l'app",
    },
    preview: {
      ...ca.marketing.preview,
      nextPeriod: "Pròxima regla d'ací a ~14 dies",
      caption: "Una estimació amb el seu interval, mai una data falsament exacta.",
    },
    why: {
      ...ca.marketing.why,
      eyebrow: "Per què existix",
      title: "Privacitat de veritat, no com a eslògan.",
      subtitle:
        "La majoria d'apps de cicle viuen de les teues dades. OpenCiclo fa el contrari: les dades de salut no ixen mai llegibles del teu dispositiu.",
      features: [
        {
          icon: "lock",
          title: "Diari xifrat",
          body: "Les teues dates i notes es xifren al navegador amb AES-256. Ni tan sols nosaltres les podem llegir al servidor.",
        },
        {
          icon: "eye-off",
          title: "Sense rastreig",
          body: "Res d'analítiques, píxels publicitaris ni SDK de tercers que puguen rebre dades de salut.",
        },
        {
          icon: "key-round",
          title: "Mode superprivat",
          body: "Entra amb correu i contrasenya, o sense correu amb una frase de 12 paraules. Tu tries.",
        },
        {
          icon: "github",
          title: "Codi obert",
          body: "Tot el codi i el model de previsió es poden auditar sota la llicència Apache 2.0.",
        },
        {
          icon: "cpu",
          title: "Es calcula al teu dispositiu",
          body: "La previsió s'executa al navegador. El teu historial no viatja a cap servidor per a fer prediccions.",
        },
        {
          icon: "download",
          title: "Exporta quan vullgues",
          body: "Baixa el teu diari en JSON o CSV, o esborra'l del tot quan ho decidisques.",
        },
      ],
    },
    how: {
      ...ca.marketing.how,
      steps: [
        {
          title: "Marca la regla",
          body: "Registra els dies de sagnat i, si vols, símptomes i notes privades.",
        },
        {
          title: "La previsió es calcula ací",
          body: "Ciclo estima la teua pròxima regla i les teues fases al dispositiu, sempre amb la seua incertesa.",
        },
        {
          title: "Aprén sobre el teu cicle",
          body: "Articles clars i amb fonts sobre biologia, símptomes i quan cal consultar.",
        },
        {
          title: "Compartix-lo",
          body: "És gratuït i obert. Compartix-lo amb qui el puga necessitar.",
        },
      ],
    },
    science: {
      ...ca.marketing.science,
      body: "OpenCiclo usa un model estadístic de contracció (shrinkage) que combina el teu historial amb una durada típica de grans estudis publicats. Sempre mostra un interval d'incertesa en lloc d'una data falsament exacta. Sense aprenentatge profund ni caixes negres: el model és obert i està documentat.",
      docsLink: "Llig la documentació",
    },
    learn: {
      ...ca.marketing.learn,
      title: "Informació clara, per a llegir i compartir.",
      subtitle:
        "Educació general sobre el cicle, els símptomes i quan cal demanar ajuda, amb les seues fonts. Pública i sense necessitat de compte.",
    },
    finalCta: {
      ...ca.marketing.finalCta,
      body: "Les teues dates es xifren abans d'eixir del dispositiu. Sense compte obligatori, sense cost.",
      button: "Obri l'app",
    },
    footer: {
      ...ca.marketing.footer,
      disclaimer:
        "OpenCiclo oferix previsions del cicle. Les previsions poden fallar. No és un dispositiu mèdic, ni un diagnòstic, ni un mètode anticonceptiu.",
      links: [
        { label: "Aprendre", href: "/learn" },
        { label: "Documentació", href: "/help" },
        { label: "Privacitat", href: "/privacy" },
        { label: "GitHub", href: MARKETING_LINKS.github, external: true },
        { label: "Contacte", href: "/contact" },
      ],
    },
    contact: {
      ...ca.marketing.contact,
      body: "De moment ho gestionem tot a través de GitHub. Obri una incidència i et respondrem allí. És públic, així que altres persones també hi poden contribuir.",
      cards: [
        {
          icon: "message-circle",
          title: "Obri una incidència",
          body: "Informa d'un error o proposa una millora. És la via més ràpida per a arribar a l'equip.",
          action: "Ves a GitHub Issues",
          href: MARKETING_LINKS.issues,
        },
        {
          icon: "github",
          title: "Mira el codi",
          body: "Explora el projecte, la documentació d'enginyeria i el model de previsió.",
          action: "Obri el repositori",
          href: MARKETING_LINKS.github,
        },
      ],
      privacyNote:
        "Per la teua privacitat, no inclogues dates del teu cicle, notes del diari ni dades personals de salut a les incidències públiques.",
      otherLinks: [
        { label: "Llig la documentació", href: "/help" },
        { label: "Política de privacitat", href: "/privacy" },
        { label: "Aprén sobre el cicle", href: "/learn" },
      ],
    },
    demo: {
      ...ca.marketing.demo,
      read: "Llig",
      settingsNote: "El teu diari es xifra al teu dispositiu. Exporta o importa les teues dades quan vullgues.",
    },
  },
  mail: {
    ...ca.mail,
    paragraphs: [
      "El teu codi per a confirmar que este correu és teu: {code}",
      "Caduca d'ací a 15 minuts.",
      "Este missatge només comprova que l'adreça és teua abans de guardar-la al teu compte. No obri el diari.",
      "No usem este correu per a rastrejar-te, per a publicitat ni per a mesurar com uses Ciclo. El codi no és un enllaç i no inicia la sessió.",
      "Si oblides la contrasenya, no es pot recuperar. Este correu no la restablix ni te l'envia. Si a més perds la frase de 12 paraules, el diari no es pot obrir. És així a propòsit: ni tan sols nosaltres el podem llegir.",
      "Si no has demanat este codi a OpenCiclo, pots ignorar este missatge.",
    ],
  },
};

export default locale;
