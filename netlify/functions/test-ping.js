exports.handler = async (event) => {
  console.log('PING called, method:', event.httpMethod)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pong: true, time: new Date().toISOString() }),
  }
}
