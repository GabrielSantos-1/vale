export async function getPlans() {

  const res = await fetch('http://localhost:3001/api/plans')

  const json = await res.json()

  return json.data
}