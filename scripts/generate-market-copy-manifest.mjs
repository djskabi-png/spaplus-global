import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const sourcePath = path.resolve("app/market-launch/MarketLaunchPage.tsx");
const outputPath = path.resolve("app/market-launch/generated-market-copy.json");
const sourceText = await readFile(sourcePath, "utf8");
const sourceFile = ts.createSourceFile(
  sourcePath,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

function fieldKey(source) {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `copy${(hash >>> 0).toString(36)}`;
}

function literalValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function isInsideManagedCall(node) {
  let current = node.parent;
  while (current && !ts.isJsxElement(current) && !ts.isJsxSelfClosingElement(current)) {
    if (
      ts.isCallExpression(current) &&
      (current.expression.getText(sourceFile) === "managed" ||
        current.expression.getText(sourceFile) === "dynamicCopy")
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function groupForLine(line) {
  if (line < 504) return "Navigation and accessibility";
  if (line < 599) return "Hero and launch status";
  if (line < 707) return "Growth and founding partner offer";
  if (line < 853) return "Platform preview";
  if (line < 969) return "Proof and guest experiences";
  if (line < 1048) return "Partner fit and launch areas";
  if (line < 1173) return "Commercial model and process";
  if (line < 1410) return "Registration form";
  if (line < 1470) return "Frequently asked questions";
  if (line < 1611) return "Final call to action and footer";
  return "Messages, cookies and page controls";
}

const entries = new Map();

function visit(node) {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(sourceFile) === "tr" &&
    node.arguments.length >= 2 &&
    !isInsideManagedCall(node)
  ) {
    const english = literalValue(node.arguments[0]);
    const french = literalValue(node.arguments[1]);
    if (english !== null && french !== null) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const field = fieldKey(english);
      entries.set(field, {
        field,
        label: english,
        group: groupForLine(line),
        en: english,
        fr: french,
      });
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

const manualEntries = [
  ["heroEyebrow", "Hero eyebrow", "Hero and launch status", "ONTARIO, YOU’RE NEXT", "ONTARIO, À VOUS DE JOUER"],
  ["heroTitle", "Hero headline", "Hero and launch status", "SpaPlus is coming to Ontario.", "SpaPlus arrive en Ontario."],
  ["heroLead", "Hero introduction", "Hero and launch status", "We are preparing a better way for people in Toronto and across Ontario to discover, compare and book memorable spa experiences.", "Nous préparons une meilleure façon de découvrir, comparer et réserver des expériences spa mémorables à Toronto et partout en Ontario."],
  ["formTitle", "Registration form headline", "Registration form", "Tell us about your spa.", "Parlez-nous de votre spa."],
  ["formIntro", "Registration form introduction", "Registration form", "Complete the form once. We will review it personally and contact you within 72 hours.", "Remplissez le formulaire une seule fois. Nous l’examinerons personnellement et communiquerons avec vous dans un délai de 72 heures."],
  ["finalTitle", "Final call to action headline", "Final call to action and footer", "Your spa could help shape the first SpaPlus experience in Ontario.", "Votre spa pourrait contribuer à façonner la première expérience SpaPlus en Ontario."],
  ["seoTitle", "Browser and search title", "Search and sharing", "SpaPlus is coming to Ontario | Founding spa partners", "SpaPlus arrive en Ontario | Spas partenaires fondateurs"],
  ["seoDescription", "Search description", "Search and sharing", "SpaPlus is preparing to launch in Ontario. Established spas can join the founding partner list with no fee, no commitment and no credit card.", "SpaPlus prépare son lancement en Ontario. Les spas établis peuvent s’inscrire à la liste des partenaires fondateurs, gratuitement, sans engagement et sans carte de crédit."],
  ["seoImageAlt", "Social sharing image description", "Search and sharing", "Illustrative SpaPlus Ontario launch artwork. It does not depict an Ontario partner.", "Concept visuel illustratif du lancement de SpaPlus en Ontario. Il ne représente pas un partenaire ontarien."],
  ["heroDisclosure", "Hero image disclosure", "Hero and launch status", "Illustrative launch concept. It does not depict an Ontario spa or partner.", "Concept visuel de lancement. Il ne représente pas un spa ou un partenaire de l’Ontario."],
  ["referenceMarketName", "Current live market name", "Hero and launch status", "Québec", "Québec"],
  ["marketDisplayName", "Coming next market name", "Hero and launch status", "Ontario", "Ontario"],
  ["navAria", "Navigation accessible title", "Navigation and accessibility", "Ontario launch navigation", "Navigation du lancement en Ontario"],
  ["languageLink1Label", "English language button", "Navigation and accessibility", "EN CA", "EN CA"],
  ["languageLink1Aria", "English language button description", "Navigation and accessibility", "English, Canada", "Anglais, Canada"],
  ["languageLink2Label", "French language button", "Navigation and accessibility", "FR CA", "FR CA"],
  ["languageLink2Aria", "French language button description", "Navigation and accessibility", "Canadian French", "Français canadien"],
  ["growthCardOneBody", "First growth card description", "Growth and founding partner offer", "Tell us about your business now and be among the first Ontario spas considered for onboarding.", "Parlez-nous de votre entreprise dès maintenant et faites partie des premiers spas ontariens considérés pour l’intégration."],
  ["platformPreviewTitle", "Platform preview title", "Platform preview", "Spa experiences across Ontario", "Expériences spa partout en Ontario"],
  ["previewDayPassLabel", "Preview day pass label", "Platform preview", "DAY PASS", "ACCÈS JOURNÉE"],
  ["platformDisclosure", "Platform preview disclosure", "Platform preview", "Interface previews are illustrative. Ontario inventory is not live and the final partner tools may evolve before launch.", "Les aperçus d’interface sont illustratifs. L’offre ontarienne n’est pas encore en ligne et les outils partenaires peuvent évoluer avant le lancement."],
  ["proofTitle", "Current market proof title", "Proof and guest experiences", "Already helping guests discover spas in Québec.", "Nous aidons déjà les clients à découvrir des spas au Québec."],
  ["proofIntro", "Current market proof introduction", "Proof and guest experiences", "These are current experiences presented on the live SpaPlus Canada platform. Ontario listings are not live yet.", "Voici des expériences actuellement présentées sur la plateforme SpaPlus Canada. Les fiches de l’Ontario ne sont pas encore en ligne."],
  ["proofDisclosure", "Current market image disclosure", "Proof and guest experiences", "Images are sourced from current spa listings on the official SpaPlus Canada website. They illustrate the existing Québec platform in Canada and do not depict future Ontario partners.", "Les images proviennent de fiches de spas actuellement publiées sur le site officiel de SpaPlus Canada. Elles illustrent la plateforme existante au Québec et ne représentent pas de futurs partenaires ontariens."],
  ["partnerFitTitle", "Partner fit headline", "Partner fit and launch areas", "Established Ontario spas that care about the guest experience.", "Des spas ontariens établis qui accordent de l’importance à l’expérience client."],
  ["formEyebrow", "Registration form eyebrow", "Registration form", "ONTARIO FOUNDING SPA LIST", "LISTE DES SPAS FONDATEURS DE L’ONTARIO"],
  ["formCityLabel", "Registration city field label", "Registration form", "Ontario city", "Ville en Ontario"],
  ["formRegionPlaceholder", "Province or territory placeholder", "Registration form", "Select a province or territory", "Choisir une province ou un territoire"],
  ["formSpaTypePlaceholder", "Spa type placeholder", "Registration form", "Select a spa type", "Choisir un type de spa"],
  ["formLocationsPlaceholder", "Number of locations placeholder", "Registration form", "Select the number of locations", "Choisir le nombre d’établissements"],
  ["formPreferredContactPlaceholder", "Preferred contact placeholder", "Registration form", "Select a contact method", "Choisir une méthode de contact"],
  ["websitePlaceholder", "Website field placeholder", "Registration form", "https://", "https://"],
  ["formSubmitButton", "Registration submit button", "Registration form", "Join the Ontario Founding Spa List", "Rejoindre la liste des spas fondateurs de l’Ontario"],
  ["spaTypeDaySpa", "Spa type option: day spa", "Registration form", "Day spa", "Spa urbain ou spa de jour"],
  ["spaTypeHotelResort", "Spa type option: hotel or resort", "Registration form", "Hotel or resort spa", "Spa d’hôtel ou de centre de villégiature"],
  ["spaTypeNordicThermal", "Spa type option: Nordic or thermal", "Registration form", "Nordic or thermal spa", "Spa nordique ou thermal"],
  ["spaTypeMedicalWellness", "Spa type option: medical or wellness", "Registration form", "Medical or wellness spa", "Médico-spa ou centre mieux-être"],
  ["spaTypeMultiLocation", "Spa type option: multi-location", "Registration form", "Multi-location spa group", "Groupe de spas multisites"],
  ["spaTypeOtherEstablished", "Spa type option: other established venue", "Registration form", "Other established spa venue", "Autre établissement de spa reconnu"],
  ["serviceMassage", "Service option: massage", "Registration form", "Massage", "Massothérapie"],
  ["serviceFacials", "Service option: facials", "Registration form", "Facials and skincare", "Soins du visage et de la peau"],
  ["serviceBodyTreatments", "Service option: body treatments", "Registration form", "Body treatments", "Soins du corps"],
  ["serviceThermalNordic", "Service option: thermal or Nordic", "Registration form", "Thermal or Nordic experience", "Expérience thermale ou nordique"],
  ["serviceCouples", "Service option: couples", "Registration form", "Couples experiences", "Expériences en couple"],
  ["serviceGroups", "Service option: groups", "Registration form", "Group experiences", "Expériences de groupe"],
  ["serviceDayPasses", "Service option: day passes", "Registration form", "Day passes", "Accès à la journée"],
  ["serviceSpaStays", "Service option: spa stays", "Registration form", "Spa stays", "Séjours spa"],
  ["reviewStepBody", "Review timing description", "Commercial model and process", "Our team reviews every complete enquiry within 72 hours.", "Notre équipe examine chaque demande complète dans un délai de 72 heures."],
  ["faqCostAnswer", "Registration cost answer", "Frequently asked questions", "No. Joining the Ontario early-access list is free. We do not ask for payment or credit card details.", "Non. L’inscription à la liste prioritaire de l’Ontario est gratuite. Nous ne demandons aucun paiement ni renseignement de carte de crédit."],
  ["faqLaunchQuestion", "Launch timing question", "Frequently asked questions", "When will SpaPlus launch in Ontario?", "Quand SpaPlus sera-t-il lancé en Ontario?"],
  ["finalEyebrow", "Final call to action eyebrow", "Final call to action and footer", "TORONTO. ONTARIO. LET’S BUILD THIS WELL.", "TORONTO. ONTARIO. BÂTISSONS CELA COMME IL FAUT."],
  ["footerIntro", "Footer market description", "Final call to action and footer", "SpaPlus is preparing the Ontario market in Canada. No Ontario spa listings or booking inventory are currently represented on this page.", "SpaPlus prépare le marché de l’Ontario, au Canada. Cette page ne présente actuellement aucune fiche ni disponibilité de réservation de spa en Ontario."],
  ["priorityArea1Label", "Launch area: Toronto", "Partner fit and launch areas", "Toronto", "Toronto"],
  ["priorityArea2Label", "Launch area: Greater Toronto Area", "Partner fit and launch areas", "Greater Toronto Area", "Grand Toronto"],
  ["priorityArea3Label", "Launch area: Niagara", "Partner fit and launch areas", "Niagara", "Niagara"],
  ["priorityArea4Label", "Launch area: Ottawa", "Partner fit and launch areas", "Ottawa", "Ottawa"],
  ["priorityArea5Label", "Launch area: Muskoka", "Partner fit and launch areas", "Muskoka", "Muskoka"],
  ["priorityArea6Label", "Launch area: Hamilton", "Partner fit and launch areas", "Hamilton", "Hamilton"],
  ["referenceSpa1Name", "Reference spa 1 name", "Proof and guest experiences", "BALNEA Spa", "BALNEA Spa"],
  ["referenceSpa1Location", "Reference spa 1 location", "Proof and guest experiences", "Bromont, Québec", "Bromont, Québec"],
  ["referenceSpa1Alt", "Reference spa 1 image description", "Proof and guest experiences", "Balnea Spa in Bromont, currently presented on SpaPlus Canada", "Le BALNEA Spa à Bromont, actuellement présenté sur SpaPlus Canada"],
  ["referenceSpa2Name", "Reference spa 2 name", "Proof and guest experiences", "Infinima Spa", "Infinima Spa"],
  ["referenceSpa2Location", "Reference spa 2 location", "Proof and guest experiences", "Québec City, Québec", "Québec, Québec"],
  ["referenceSpa2Alt", "Reference spa 2 image description", "Proof and guest experiences", "Infinima Spa in Québec City, currently presented on SpaPlus Canada", "Infinima Spa à Québec, actuellement présenté sur SpaPlus Canada"],
  ["referenceSpa3Name", "Reference spa 3 name", "Proof and guest experiences", "Deauville Salon & Spa", "Deauville Salon & Spa"],
  ["referenceSpa3Location", "Reference spa 3 location", "Proof and guest experiences", "Montréal, Québec", "Montréal, Québec"],
  ["referenceSpa3Alt", "Reference spa 3 image description", "Proof and guest experiences", "Deauville Salon and Spa in Montréal, currently presented on SpaPlus Canada", "Le Deauville Salon & Spa à Montréal, actuellement présenté sur SpaPlus Canada"],
  ["successBody", "Successful registration message", "Messages, cookies and page controls", "A confirmation is on its way to your email. Our team will review the information and contact you within 72 hours.", "Un courriel de confirmation est en route. Notre équipe examinera les renseignements et communiquera avec vous dans un délai de 72 heures."],
  ["formFieldOrganizationVisible", "Show spa or business name", "Registration form settings", "true", "true"],
  ["formFieldOrganizationRequired", "Require spa or business name", "Registration form settings", "true", "true"],
  ["formFieldWebsiteVisible", "Show website or social profile", "Registration form settings", "true", "true"],
  ["formFieldWebsiteRequired", "Require website or social profile", "Registration form settings", "true", "true"],
  ["formFieldCityVisible", "Show city", "Registration form settings", "true", "true"],
  ["formFieldCityRequired", "Require city", "Registration form settings", "true", "true"],
  ["formFieldPostalCodeVisible", "Show postal code", "Registration form settings", "true", "true"],
  ["formFieldPostalCodeRequired", "Require postal code", "Registration form settings", "true", "true"],
  ["formFieldSpaTypeVisible", "Show spa type", "Registration form settings", "true", "true"],
  ["formFieldSpaTypeRequired", "Require spa type", "Registration form settings", "true", "true"],
  ["formFieldLocationsVisible", "Show number of locations", "Registration form settings", "true", "true"],
  ["formFieldLocationsRequired", "Require number of locations", "Registration form settings", "true", "true"],
  ["formFieldServicesVisible", "Show main services", "Registration form settings", "true", "true"],
  ["formFieldServicesRequired", "Require a main service", "Registration form settings", "true", "true"],
  ["formFieldNameVisible", "Show contact name", "Registration form settings", "true", "true"],
  ["formFieldNameRequired", "Require contact name", "Registration form settings", "true", "true"],
  ["formFieldRoleVisible", "Show contact role", "Registration form settings", "true", "true"],
  ["formFieldRoleRequired", "Require contact role", "Registration form settings", "true", "true"],
  ["formFieldEmailVisible", "Show business email", "Registration form settings", "true", "true"],
  ["formFieldEmailRequired", "Require business email", "Registration form settings", "true", "true"],
  ["formFieldPhoneVisible", "Show phone", "Registration form settings", "true", "true"],
  ["formFieldPhoneRequired", "Require phone", "Registration form settings", "true", "true"],
  ["formFieldPreferredContactVisible", "Show preferred contact method", "Registration form settings", "true", "true"],
  ["formFieldPreferredContactRequired", "Require preferred contact method", "Registration form settings", "true", "true"],
  ["formFieldBookingSystemVisible", "Show current booking system", "Registration form settings", "true", "true"],
  ["formFieldBookingSystemRequired", "Require current booking system", "Registration form settings", "false", "false"],
  ["formFieldMessageVisible", "Show additional message", "Registration form settings", "true", "true"],
  ["formFieldMessageRequired", "Require additional message", "Registration form settings", "false", "false"],
  ["spaTypeHotelResortEnabled", "Show spa type option: hotel or resort spa", "Registration form settings", "true", "true"],
  ["spaTypeDaySpaEnabled", "Show spa type option: day spa", "Registration form settings", "true", "true"],
  ["spaTypeNordicThermalEnabled", "Show spa type option: thermal or Nordic spa", "Registration form settings", "true", "true"],
  ["spaTypeMedicalWellnessEnabled", "Show spa type option: medical or wellness spa", "Registration form settings", "true", "true"],
  ["spaTypeMultiLocationEnabled", "Show spa type option: multi-location spa group", "Registration form settings", "true", "true"],
  ["spaTypeOtherEstablishedEnabled", "Show spa type option: other established spa", "Registration form settings", "true", "true"],
  ["serviceMassageEnabled", "Show service option: massage", "Registration form settings", "true", "true"],
  ["serviceFacialsEnabled", "Show service option: facials and skincare", "Registration form settings", "true", "true"],
  ["serviceBodyTreatmentsEnabled", "Show service option: body treatments", "Registration form settings", "true", "true"],
  ["serviceThermalNordicEnabled", "Show service option: thermal or Nordic experience", "Registration form settings", "true", "true"],
  ["serviceCouplesEnabled", "Show service option: couples experiences", "Registration form settings", "true", "true"],
  ["serviceGroupsEnabled", "Show service option: group experiences", "Registration form settings", "true", "true"],
  ["serviceDayPassesEnabled", "Show service option: day passes", "Registration form settings", "true", "true"],
  ["serviceSpaStaysEnabled", "Show service option: spa stays", "Registration form settings", "true", "true"],
  ["notificationRecipients", "Internal notification recipients, separated by commas", "Email messages and delivery", "", ""],
  ["emailCompanyName", "Email footer company name", "Email messages and delivery", "Global Spa Management Ltd.", "Global Spa Management Ltd."],
  ["emailOwnerSubject", "Internal email subject", "Email messages and delivery", "Ontario spa lead: {{organization}} | SpaPlus", "Nouveau prospect spa Ontario : {{organization}} | SpaPlus"],
  ["emailOwnerEyebrow", "Internal email eyebrow", "Email messages and delivery", "NEW ONTARIO SPA LEAD", "NOUVEAU PROSPECT SPA ONTARIO"],
  ["emailOwnerIntro", "Internal email introduction", "Email messages and delivery", "A spa has joined the Ontario founding partner list. The full enquiry is ready for review.", "Un spa s'est inscrit à la liste des partenaires fondateurs de l'Ontario. La demande complète est prête à être examinée."],
  ["emailOwnerButton", "Internal email page button", "Email messages and delivery", "Open the Ontario page", "Ouvrir la page Ontario"],
  ["emailOwnerReplyButton", "Internal email reply button", "Email messages and delivery", "Reply to spa", "Répondre au spa"],
  ["emailOwnerReplySubject", "Prepared reply email subject", "Email messages and delivery", "SpaPlus Ontario | Your registration", "SpaPlus Ontario | Votre inscription"],
  ["emailOwnerReplyBody", "Prepared reply email message", "Email messages and delivery", "Hello {{name}},\n\nThank you for registering {{organization}} for SpaPlus Ontario. We have received your details and will be in touch shortly.\n\nBest regards,\nSpaPlus Ontario", "Bonjour {{name}},\n\nMerci d'avoir inscrit {{organization}} à SpaPlus Ontario. Nous avons reçu vos renseignements et nous communiquerons avec vous sous peu.\n\nCordialement,\nSpaPlus Ontario"],
  ["emailOwnerFooter", "Internal email footer", "Email messages and delivery", "A better way to discover, book and enjoy spa experiences.", "Une meilleure façon de découvrir, réserver et vivre des expériences spa."],
  ["emailVisitorSubject", "Spa confirmation email subject", "Email messages and delivery", "Your spa is on the Ontario early list | SpaPlus", "Votre spa est sur la liste prioritaire de l'Ontario | SpaPlus"],
  ["emailVisitorEyebrow", "Spa confirmation email eyebrow", "Email messages and delivery", "ONTARIO EARLY ACCESS", "ACCÈS PRIORITAIRE ONTARIO"],
  ["emailVisitorTitle", "Spa confirmation email title", "Email messages and delivery", "Thank you, {{name}}.", "Merci, {{name}}."],
  ["emailVisitorIntro", "Spa confirmation email introduction", "Email messages and delivery", "{{organization}} is now on the SpaPlus Ontario early-access list.", "{{organization}} est maintenant sur la liste prioritaire SpaPlus pour l'Ontario."],
  ["emailVisitorNextTitle", "Spa confirmation next steps title", "Email messages and delivery", "What happens next", "La suite"],
  ["emailVisitorNextBody", "Spa confirmation next steps text", "Email messages and delivery", "We will review your spa, location and services. A member of the SpaPlus team will contact you within {{hours}} hours using your preferred contact method.", "Nous examinerons votre spa, son emplacement et ses services. Un membre de l'équipe SpaPlus communiquera avec vous dans un délai de {{hours}} heures selon votre méthode de contact préférée."],
  ["emailVisitorButton", "Spa confirmation email button", "Email messages and delivery", "Return to SpaPlus Ontario", "Retourner à SpaPlus Ontario"],
  ["emailVisitorFooter", "Spa confirmation email footer", "Email messages and delivery", "A better way to discover, book and enjoy spa experiences.", "Une meilleure façon de découvrir, réserver et vivre des expériences spa."],
];

for (const [field, label, group, en, fr] of manualEntries) {
  entries.set(field, { field, label, group, en, fr });
}

await writeFile(
  outputPath,
  `${JSON.stringify([...entries.values()], null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${entries.size} editable Ontario fields.`);
