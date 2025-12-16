const debug = false;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

async function testGETEndpoint() {
  try {
    if (debug) console.log('Testing GET endpoint');
    const res = await fetch('/api/locations', { method: 'GET', cache: 'no-store' });
    if (debug) console.log('Response:', res);

    if (!res.ok) {
      throw new Error(`GET request failed with status: ${res.status}`);
    }
    const data = await res.json();

    if (debug) console.log('API Response:', data);
  } catch (err) {
    console.error(err);
    setError(err.message || 'Something went wrong.');
  }
}

async function testPOSTEndpoint() {
  let locationId = null;

  try {
    console.log('POSTing to API');
    const res = await fetch('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        userId: HARDCODED_USER_ID,
        location: 'Mexico City',
        state_code: 'DF',
        country_code: 'MX',
        time_zone_abbreviation: 'CST',
        latitude: 19.4326,
        longitude: -99.1332,
      }),
    });
    console.log('POST Response:', res);
    const data = await res.json();
    console.log('POST API Response:', data);
    locationId = data.location_id;
  } catch (err) {
    console.error(err);
    setError(err.message || 'Something went wrong.');
  } finally {
    return locationId;
  }
}

async function testDELETEEndpoint(locationId) {
  try {
    console.log('DELETING location with ID:', locationId);
    const res = await fetch(`/api/locations/${locationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: HARDCODED_USER_ID }),
    });
    console.log('DELETE Response:', res);
    const data = await res.json();
    console.log('DELETE API Response:', data);
  } catch (err) {
    console.error(err);
  }
}

export async function testEndpoints() {
  console.log('--------------------------------');
  await testGETEndpoint();
  const locationId = await testPOSTEndpoint();
  await testDELETEEndpoint(locationId);
}
