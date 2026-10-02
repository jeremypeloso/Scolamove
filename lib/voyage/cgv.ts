// -----------------------------------------------------------------------------
// Conditions de vente jointes au devis.
//
// Le texte se modifie depuis l'administration (Devis et dossiers > Conditions
// de vente) et s'enregistre en base. Celui ci-dessous est le texte d'origine :
// il sert tant qu'aucune version n'a été enregistrée, et pour « Rétablir ».
//
// Mise en forme, une ligne par élément :
//   # Titre        grande partie
//   ## Titre       article
//   - texte        puce
//     - texte      sous-puce (deux espaces devant le tiret)
//   autre ligne    paragraphe
// -----------------------------------------------------------------------------

export type BlocCgv = { type: "partie" | "article" | "texte" | "puce" | "souspuce"; texte: string };

export function analyserCgv(texte: string): BlocCgv[] {
  const blocs: BlocCgv[] = [];
  texte.split("\n").forEach((brute) => {
    const ligne = brute.replace(/\s+$/, "");
    if (!ligne.trim()) return;
    let m: RegExpMatchArray | null;
    if ((m = ligne.match(/^##\s*(.+)$/))) blocs.push({ type: "article", texte: m[1].trim() });
    else if ((m = ligne.match(/^#\s*(.+)$/))) blocs.push({ type: "partie", texte: m[1].trim() });
    else if ((m = ligne.match(/^(?:\s{2,}|\t+)[-•o]\s+(.+)$/))) blocs.push({ type: "souspuce", texte: m[1].trim() });
    else if ((m = ligne.match(/^[-•]\s+(.+)$/))) blocs.push({ type: "puce", texte: m[1].trim() });
    else blocs.push({ type: "texte", texte: ligne.trim() });
  });
  return blocs;
}

export const CGV_DEFAUT = `# CONDITIONS GÉNÉRALES

## Information relative aux forfaits touristiques
(Directive (UE) 2015/2302 – Article L.211-2 II du Code du tourisme)
La combinaison de services de voyage qui vous est proposée constitue un forfait touristique au sens de la directive (UE) 2015/2302 et de l’article L.211-2 II du Code du tourisme.
À ce titre, vous bénéficiez de l’ensemble des droits accordés aux voyageurs par la réglementation européenne, tels que transposés en droit français.
Scolamove, en sa qualité d’organisateur, est entièrement responsable de la bonne exécution de l’ensemble des services de voyage compris dans le forfait.
Conformément aux dispositions légales, Scolamove dispose d’une garantie financière destinée à assurer le remboursement des paiements effectués par les voyageurs et, lorsque le transport est inclus dans le forfait, leur rapatriement en cas d’insolvabilité.

## Droits essentiels du voyageur
(Directive (UE) 2015/2302 transposée dans le Code du tourisme)
Avant la conclusion du contrat de voyage à forfait, les voyageurs reçoivent toutes les informations essentielles relatives au forfait.
L’organisateur et le cas échéant le détaillant sont responsables de la bonne exécution de tous les services de voyage prévus au contrat.
Les voyageurs disposent d’un numéro de téléphone d’urgence ou des coordonnées d’un point de contact leur permettant de joindre l’organisateur ou le détaillant à tout moment.
Les voyageurs peuvent céder leur forfait à une autre personne, sous réserve d’un préavis raisonnable et, le cas échéant, du paiement de frais supplémentaires justifiés.
Le prix du forfait ne peut être augmenté que si :
- cette possibilité est expressément prévue au contrat ;
- l’augmentation résulte de coûts spécifiques (ex. carburant, taxes, taux de change) ;
- la modification intervient au plus tard 20 jours avant le début du forfait.
Si l’augmentation du prix dépasse 8 % du prix total du forfait, le voyageur peut résoudre le contrat sans frais.
En cas de baisse des coûts correspondants, le voyageur a droit à une réduction de prix.
Les voyageurs peuvent résoudre le contrat sans frais de résolution et obtenir le remboursement intégral des sommes versées si :
- un élément essentiel du forfait (autre que le prix) subit une modification importante ;
- l’organisateur annule le forfait avant son commencement.
Un dédommagement peut être dû le cas échéant.
Les voyageurs peuvent également résoudre le contrat sans frais avant le début du forfait en cas de circonstances exceptionnelles et inévitables, notamment lorsque des problèmes graves de sécurité au lieu de destination sont susceptibles d’affecter le voyage.
À tout moment avant le début du forfait, le voyageur peut résoudre le contrat moyennant le paiement de frais de résolution appropriés et justifiables.
Si, après le début du forfait, des services essentiels ne peuvent être fournis comme prévu, des prestations de remplacement appropriées doivent être proposées sans supplément de prix.
Les voyageurs peuvent résoudre le contrat sans frais lorsque :
- les services ne sont pas exécutés conformément au contrat ;
- cette inexécution perturbe considérablement le déroulement du forfait ;
- l’organisateur ne remédie pas à la situation dans un délai raisonnable.
Les voyageurs ont droit, le cas échéant, à une réduction de prix et/ou à un dédommagement en cas d’inexécution ou de mauvaise exécution des services.
L’organisateur ou le détaillant est tenu d’apporter une aide appropriée au voyageur en difficulté.

# CONDITIONS PARTICULIÈRES

## Identification de l’organisateur
Scolamove est une marque commerciale exploitée par une agence de voyages immatriculée au registre des opérateurs de voyages et de séjours tenu par Atout France, conformément aux dispositions du Code du tourisme.
IM092130023
Scolamove est couverte par une assurance de responsabilité civile professionnelle, souscrite auprès d’un assureur habilité.
La garantie financière est assurée par AXA IARD, conformément aux exigences légales.

## Inscription
Une proposition de voyage est adressée à l’enseignant ou au responsable pédagogique organisateur.
Elle précise notamment les tarifs, dates, prestations incluses et l’ensemble des éléments constitutifs du voyage, conformément à l’article L.211-8 du Code du tourisme.
Après acceptation de la proposition, un contrat de voyage à forfait est établi entre les parties.
L’inscription devient définitive à réception :
- du contrat de réservation dûment complété et signé par le chef d’établissement et le responsable du voyage ;
- du versement de l’acompte prévu.
Les prestations de voyage ne sont réservées qu’à compter de la réception du contrat signé et de l’acompte correspondant.

## Conditions de paiement
Sauf stipulation contraire au contrat, les modalités de paiement sont les suivantes :
- 30 % à la signature du contrat (70 % en cas d’inscription tardive) ;
- 40 % à 10 semaines avant le départ ;
- Solde de 30 % à réception des documents permettant l’exécution du voyage.

## Tarifs
Les tarifs sont établis selon les conditions économiques en vigueur au 1er septembre 2026, valables jusqu’au 30 juin 2027.
Ils sont indiqués toutes taxes comprises (TTC) et payables en euros.

## Révision du prix
Conformément aux articles L.211-12, R.211-8 et R.211-9 du Code du tourisme, le prix du forfait peut être révisé à la hausse ou à la baisse afin de tenir compte des variations :
- du coût des transports (carburant / énergie) ;
- des redevances et taxes afférentes aux prestations de voyage.
Le prix peut également évoluer en fonction des variations des taux de change, lorsque celles-ci sont directement liées au contrat.
Toutefois, afin de sécuriser les tarifs et de protéger le client, Scolamove se couvre sur le marché des changes.
En conséquence, aucune révision de prix (à la hausse ou à la baisse) liée aux variations de taux de change ne sera appliquée.
En cas de révision de prix liée aux autres facteurs autorisés par la loi, le client sera informé sur un support durable au plus tard 20 jours avant le départ.
Pour toute hausse supérieure à 8 % du prix total du forfait, le client recevra :
- le détail de la variation ;
- ses conséquences sur le prix du voyage ;
- le choix d’accepter ou de refuser cette modification dans un délai raisonnable ;
- les conséquences d’une absence de réponse.

## Assurances
Une prestation d’assistance et de rapatriement en cas d’accident grave couvre l’ensemble du groupe pendant la durée du voyage.

## Garantie annulation (optionnelle)
Une assurance annulation peut être proposée en option.
Elle doit être souscrite pour l’ensemble du groupe, avec paiement de la cotisation dès la signature du contrat.
Cette garantie permet, sous conditions, le remboursement des sommes retenues par Scolamove en cas d’annulation individuelle ou collective, sous réserve que le motif d’annulation figure parmi les garanties prévues au contrat d’assurance.
Les remboursements sont effectués déduction faite de la franchise contractuelle, telle que définie dans le contrat d’assurance, communiqué sur simple demande.
La cotisation d’assurance n’est jamais remboursable.

## Conditions d’annulation
Conformément à l’article L.221-28 du Code de la consommation, le présent contrat ne bénéficie pas du droit de rétractation.
1) Annulation totale du voyage
- Du fait du groupe, retenue :
  - de 10 % du montant total du séjour,
  - des sommes engagées auprès des prestataires ou des frais d’annulation exigés par ceux-ci.
- Du fait de Scolamove :
  - Application de l’article R.211-10 du Code du tourisme.
  - Un accord amiable peut être trouvé si l’acheteur accepte un voyage de substitution proposé par Scolamove.
2) Annulation d’un ou plusieurs participants
- De l’inscription jusqu’à 30 jours avant le départ :
  - jusqu’à 3 annulations : retenue de 25 % du montant du voyage ;
  - au-delà de 3 annulations : réajustement du coût global du voyage.
- Entre 30 et 21 jours avant le départ : retenue de 50 %.
- Entre 20 et 8 jours avant le départ : retenue de 75 %.
- Moins de 8 jours avant le départ : retenue de 100 % du montant du voyage.
Toute annulation doit être notifiée par écrit (courriel), et sera prise en compte à la date de réception par Scolamove.
Le montant de la retenue dépend de cette date.
En cas de souscription d’une assurance annulation, la procédure de déclaration auprès de l’assureur sera annexée au contrat de réservation.
Un remplaçant est toujours admis.
Toutefois, pour les voyages comprenant un transport aérien, des frais de modification ou de changement de nom peuvent être facturés par les transporteurs.

## Formalités administratives
Le franchissement des frontières implique que chaque participant soit en possession des documents obligatoires :
- carte nationale d’identité ou passeport en cours de validité ;
- autorisation de sortie de territoire pour les mineurs, le cas échéant ;
- visa lorsque requis.
La responsabilité de Scolamove ne saurait être engagée en cas de refus d’embarquement ou d’entrée sur le territoire résultant de documents non conformes ou manquants.

## Transport en autocar
Le transport est assuré en autocar de tourisme de moins de 10 ans, équipé de sièges inclinables, d’un système de sonorisation (micro), de matériel vidéo et, selon les véhicules, de sanitaires, dans le strict respect de la réglementation en vigueur.
Dans le cadre des programmes à thématique développement durable, Scolamove exige de ses transporteurs l’utilisation d’autocars répondant au minimum à la norme Euro 6 et, dans la mesure du possible, l’adhésion à la charte CO2 ou à un label environnemental équivalent.
Le transport est réalisé conformément à la législation sociale et routière applicable, avec un, deux ou trois conducteurs selon la durée et les contraintes du trajet, chacun étant tenu au respect strict des temps de conduite et de repos réglementaires.
En cas de modification du programme imputable au groupe, effectuée sans accord préalable de Scolamove (une permanence téléphonique est assurée 24 h/24 pendant le voyage) et nécessitant la mobilisation d’un conducteur supplémentaire, les frais correspondants pourront être facturés.
L’autocar est utilisé exclusivement selon le programme et l’itinéraire contractuels.
Toute modification décidée sans accord préalable de Scolamove pourra entraîner la facturation du kilométrage supplémentaire généré.

## Disposition des groupes et attribution des places
Scolamove dépend des contraintes imposées par les transporteurs ferroviaires et aériens concernant :
- la disposition des groupes à bord,
- la répartition dans plusieurs voitures (train),
- l’attribution des sièges dans l’avion,
- ainsi que le nombre de places disponibles dans la catégorie tarifaire demandée.
En cas de refus ou de contrainte imposée par les compagnies, une solution de remplacement sera proposée, avec ou sans supplément de prix selon les conditions applicables.

## Autocar sur place
Lorsque le programme prévoit la mise à disposition d’un autocar sur place, les prestations sont assurées conformément aux normes et usages locaux du pays de destination.

## Hébergement
Selon les programmes, l’hébergement est assuré en :
- familles hôtesses,
- hôtels,
- auberges ou structures assimilées.
Lorsque cela est possible, les hébergements éco-responsables sont privilégiés.
Hébergement en famille :
Les élèves sont hébergés en fonction de la capacité d’accueil des familles hôtesses.
Toute disposition particulière est précisée dans le contrat de réservation.
Les familles sont généralement situées dans un périmètre permettant :
- soit un ramassage en autocar,
- soit un déplacement à pied depuis le point de rendez-vous.
Les trajets avec les familles hôtesses ont lieu uniquement le premier et le dernier jour.
Les autres jours, les déplacements s’effectuent selon l’organisation prévue au programme.
Dans certains centres, l’utilisation des transports en commun peut être nécessaire. Cette éventualité est alors expressément mentionnée au contrat.
Dans certains pays (notamment Grande-Bretagne, Allemagne, Italie), les élèves de moins de 12 ans sont accompagnés par les familles hôtesses jusqu’aux points de rendez-vous définis.
Un accompagnement des élèves de plus de 12 ans peut être exigé dans certains centres, avec supplément.

## Hébergement en auberge
Les auberges sont sélectionnées selon leur niveau de confort et leur situation géographique par rapport au programme.
En cas d’indisponibilité aux dates prévues, l’ordre des visites peut être modifié afin de garantir un hébergement conforme aux critères retenus.
Les draps sont fournis et inclus dans les prestations.

## Hébergement en hôtel
Les hôtels sont situés en centre-ville ou en périphérie selon le budget et les choix du groupe.
La catégorie indiquée correspond aux normes locales du pays de destination.
Les types d’hébergement et de pension sont précisés dans le devis et confirmés au contrat.

## Bagages
Les bagages et effets personnels (téléphones, appareils électroniques, objets de valeur, vêtements, etc.) restent sous la responsabilité exclusive de leurs propriétaires, en tout lieu et à tout moment.
En cas de transport en autocar, les bagages à main conservés à l’intérieur du véhicule ne sont pas couverts par l’assurance, y compris en cas d’effraction.

## Sorties le soir
Pour des raisons de sécurité, les sorties le soir sont strictement interdites sans accompagnement, sauf autorisation expresse donnée avant le départ par le responsable du groupe, avec décharge parentale.
Il appartient aux organisateurs d’informer les élèves et leurs représentants légaux.
En cas de non-respect de cette consigne, les parents ou tuteurs légaux demeurent pleinement responsables des dommages causés ou subis.

## Réalisation du programme
Afin d’assurer la bonne exécution du séjour, le responsable du groupe doit transmettre dans les meilleurs délais les documents demandés, notamment :
- listes nominatives des participants,
- courriers administratifs nécessaires,
- informations médicales utiles (allergies, pathologies déclarées).
À défaut, Scolamove ne saurait garantir la parfaite exécution des prestations ni les délais de transmission des informations (familles, hôtels, etc.).
Le responsable du voyage garantit avoir obtenu le consentement des représentants légaux, y compris pour le droit à l’image.
Les données collectées sont traitées de manière sécurisée, exclusivement pour l’organisation du séjour, conformément à la réglementation en vigueur.

## Sur place
Les horaires figurant au programme doivent être strictement respectés.
En cas de force majeure (conditions météorologiques, circulation, événements imprévus), Scolamove ne saurait être tenue responsable de la non-exécution de certaines prestations.
Chaque situation sera examinée au cas par cas afin, lorsque cela est possible, de limiter les frais ou d’obtenir une non-facturation.

## Interruption de voyage
Scolamove se réserve le droit d’abréger le séjour de tout participant dont le comportement serait incompatible avec le bon déroulement du voyage ou le respect des structures d’accueil.
Aucun remboursement ne sera effectué en cas de retour anticipé, quel qu’en soit le motif.
Les frais liés à un retour anticipé pour convenance personnelle ou disciplinaire sont à la charge du participant concerné, de sa famille ou de l’établissement et ne peuvent en aucun cas être imputés à Scolamove.
En cas de rapatriement pour raisons médicales, les frais sont pris en charge par l’assurance, sur décision du médecin conseil.

## Réclamations – Litiges
Toute non-conformité constatée sur place doit être signalée immédiatement à Scolamove (permanence téléphonique 24 h/24).
L’absence de signalement immédiat peut limiter le droit à indemnisation si le dommage aurait pu être évité ou réduit.
Toute réclamation doit être adressée par écrit dans un délai maximal de 15 jours après le retour, accompagnée des justificatifs nécessaires.
À défaut de réponse satisfaisante sous 60 jours, le client peut saisir le Médiateur du Tourisme et du Voyage.
En cas de litige, une tentative de règlement amiable sera recherchée avant toute action judiciaire.
À défaut, le tribunal compétent sera celui du siège social de Scolamove.
`;
