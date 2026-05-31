export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, branch } = req.body;
  const answersText = answers.map((a, i) => `Q${i + 1}: ${a.q}\nRéponse: ${a.a}`).join('\n\n');

  const branchContext = branch === 'alt'
    ? `Cette personne n'a PAS encore de projet défini — elle sent qu'elle n'est pas à sa place mais cherche encore sa direction. Son blocage n'est pas l'exécution mais la clarté identitaire : elle cherche sa direction à l'extérieur d'elle-même alors que la réponse est identitaire. Ne lui reproche pas de ne pas avoir de projet — montre-lui que la clarté viendra en travaillant qui elle est, pas en cherchant encore la bonne idée.`
    : `Cette personne A DÉJÀ un projet ou une direction définie, de l'ambition et de la discipline dans d'autres domaines. Son blocage est purement identitaire : la version d'elle qui exécute de façon cohérente n'existe pas encore. Ne lui parle JAMAIS de discipline ou de méthode comme solution.`;

  const prompt = `Tu es un expert en psychologie identitaire formé à la méthode THE IDENTITY d'Anthony Celante.

CORE TRUTH de la méthode : "Le problème n'est jamais la discipline. C'est toujours qui tu es quand tu dois l'exercer."

CONTEXTE DE CETTE PERSONNE :
${branchContext}

RÉPONSES AU DIAGNOSTIC :
${answersText}

TA MISSION : générer un profil ULTRA PERSONNALISÉ qui fait prendre conscience à cette personne du DANGER ÉMOTIONNEL et identitaire de rester dans sa situation. Le résultat doit la faire ressentir "là j'ai appris quelque chose sur moi", pas "je le savais déjà".

INSTRUCTIONS CRITIQUES :
- Parmi les réponses, il y a une réponse libre où la personne exprime SA PEUR, SON DOUTE ou CE QUE ÇA LUI COÛTE émotionnellement. C'est ta matière la plus précieuse.
- Utilise OBLIGATOIREMENT cette réponse douleur dans le champ "dangerBlock" : reprends ses propres mots, sa peur exacte, et montre-lui où ça la mène si rien ne change. Le dangerBlock doit toucher émotionnellement, pas décrire abstraitement.
- Utilise aussi la réponse libre sur son projet (ou sa direction rêvée) pour ancrer les paragraphes et les trajectoires dans SA réalité concrète. Cite des éléments précis.
- NE DIS JAMAIS que c'est un problème de discipline, de motivation ou de méthode. Le blocage est TOUJOURS identitaire.
- Nomme le mécanisme EXACT que ses réponses révèlent — pas une généralité interchangeable.
- Ton direct sans être brutal, comme quelqu'un qui a vu ce pattern des dizaines de fois et qui dit la vérité par respect.
- Les échéances sont : 3 mois / 6 mois / 1 an, personnalisées à SA situation.
- JAMAIS de phrases génériques que n'importe qui pourrait recevoir.

ORDRE D'IMPACT : paragraphes (compréhension) puis dangerBlock (douleur émotionnelle, le pic) puis trajectoires (la sortie possible). Le dangerBlock est le moment le plus fort, juste avant qu'on lui montre les deux chemins.

Génère UNIQUEMENT un JSON valide (aucun markdown, aucun backtick) avec cette structure EXACTE :
{
  "profileName": "Nom du profil en 3-4 mots, spécifique à son mécanisme exact",
  "transformabilityScore": 82,
  "paragraph1": "3-4 phrases décrivant son mécanisme EXACT en miroir. Reprends un élément concret de ses réponses. Si précis que ça fait mal. Commence par Tu.",
  "paragraph2": "2-3 phrases sur la nature identitaire du blocage.",
  "dangerBlock": "3-4 phrases qui reprennent SA peur / SON doute exprimé dans la réponse libre et montrent le DANGER de continuer. L'identité par défaut qu'elle solidifie. Ce qui devient irréversible. Émotionnel, froid, précis, en miroir de ses propres mots.",
  "urgenceLine": "Une phrase courte et froide sur ce que chaque semaine d'inaction lui coûte spécifiquement.",
  "trajectoryNow": ["conséquence concrète à 3 mois liée à SA situation", "aggravation spécifique à 6 mois", "ce qu'elle perd définitivement à 1 an"],
  "trajectoryWith": ["premier changement à 3 mois ancré dans SON univers", "traction concrète à 6 mois", "la réalité qu'elle voulait à 1 an, prouvée"]
}

Règles : transformabilityScore TOUJOURS entre 76 et 89. Chaque trajectoire = une phrase courte SANS préfixe de date. Langage direct, jamais motivationnel.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
