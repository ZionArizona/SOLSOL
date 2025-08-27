export default function Badge({status}){
  const map = {
    '승인': 'green',
    '반려': 'red',
    '반려 대기': 'amber',
  }
  const tone = map[status] || 'amber'
  return <span className={`badge ${tone}`}>{status}</span>
}
