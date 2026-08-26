exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    const users = {
      'admin@apix.sn': { nom: 'Administrateur', role: 'admin', password: 'password' },
      'chef@apix.sn': { nom: 'Chef Projet', role: 'chef_projet', password: 'password' },
      'agent@apix.sn': { nom: 'Agent Terrain', role: 'agent_terrain', password: 'password' }
    };

    const user = users[email];
    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Identifiants incorrects' })
      };
    }

    const payload = { email, nom: user.nom, role: user.role };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: { email, nom: user.nom, role: user.role }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
