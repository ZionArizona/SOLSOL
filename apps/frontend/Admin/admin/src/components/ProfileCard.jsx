// src/components/ProfileCard.jsx
export default function ProfileCard({name, email, school, role}){
  const initials = name ? name[0] : 'U'
  return (
    <section className="card">
      <div className="pf">
        <div className="avatar">{initials}</div>
        <div className="info">
          <div className="name">{name}</div>
          <div className="meta">{email}</div>
          <div className="meta">{school} · {role}</div>
        </div>
      </div>
    </section>
  )
}
