"use client"

const UserCursors = ({ cursors }) => {
  return (
    <div className="user-cursors">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="user-cursor"
          style={{ left: cursor.x, top: cursor.y, borderColor: cursor.color }}
        >
          <div className="cursor-dot" style={{ backgroundColor: cursor.color }} />
        </div>
      ))}
    </div>
  )
}

export default UserCursors