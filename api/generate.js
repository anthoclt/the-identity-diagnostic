export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { answers } = req.body;
  const answersText = answers.map((a, i) => `Q${i+1}: ${a.q}\nRéponse: ${a.a}`).join('\n\n');

  const prompt = `Tu es expert en psychologie identitaire et transformation personnelle. Analyse ces réponses et génère un profil ULTRA PERSONNALISÉ.

RÉPONSES:
${answersText}

INSTRUCTIONS CRITIQUES pour les trajectoires :
- Utilise OBLIGATOIREMENT les réponses sur l'univers (sport/créativité/business/connexion), la vision (vivre de sa passion/créer/liberté/impact) et ce qui drive la personne pour rendre les trajectoires CONCRÈTES et SPÉCIFIQUES.
- Les échéances sont : 3 mois / 6 mois / 1 an.
- trajectoryNow = ce qui se confirme négativement à ces échéances si rien ne change.
- trajectoryWith = ce qui devient réel à ces échéances avec une structure identitaire ancrée.
- JAMAIS de phrases génériques — toujours ancré dans leurs réponses réelles.

Génère UNIQUEMENT un JSON valide (aucun markdown, aucun backtick) avec cette structure EXACTE:
{
  "profileName": "Nom du profil 3-4 mots spécifique à leur univers et vision",
  "transformabilityScore": 78,
  "paragraph1": "3-4 phrases décrivant leur situation et pattern exact. Si précis que ça fait mal. Commence par Tu.",
  "paragraph2": "2-3 phrases sur pourquoi ça bloque et ce que ça révèle sur leur blocage identitaire profond.",
  "visionProjection": "2-3 phrases qui projettent concrètement ce qui devient possible pour CETTE personne — en nommant son univers et sa vision spécifique — si le blocage est réglé.",
  "trajectoryNow": ["Dans 3 mois: phrase concrète liée à LEUR situation", "Dans 6 mois: stagnation dans LEUR domaine spécifique", "Dans 1 an: ce qu'ils ratent concrètement dans LEUR univers"],
  "trajectoryWith": ["Dans 3 mois: premier changement visible ancré dans LEUR univers", "Dans 6 mois: traction concrète liée à ce qu'ils veulent construire", "Dans 1 an: réalité construite spécifique à leur vision déclarée"],
  "urgenceLine": "Une phrase courte et froide sur ce que chaque semaine d'inaction coûte à CETTE personne spécifiquement."
}

Règles: transformabilityScore TOUJOURS entre 71 et 89. Langage direct, pas motivationnel.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
