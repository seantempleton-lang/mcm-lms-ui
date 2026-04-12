export default function RequireRole({me,roles,children}){ if(!me) return null; if(!roles.includes(me.role)) return <p className='small'>Access denied.</p>; return children; }
