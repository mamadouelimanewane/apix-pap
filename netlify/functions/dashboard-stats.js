exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const stats = {
      totalPap: 156,
      totalPaye: 125,
      totalValide: 150,
      totalReclames: 8,
      montantValide: 625000000,
      montantPaye: 580000000,
      enReclamation: 5,
      enConciliation: 3,
      tauxCompletion: 82
    };

    return {
      statusCode: 200,
      body: JSON.stringify(stats)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
