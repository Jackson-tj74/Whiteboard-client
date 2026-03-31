"use client"

const Toolbar = ({ tool, onToolChange, onClearCanvas }) => {
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#ff0000" },
    { name: "Blue", value: "#0000ff" },
    { name: "Green", value: "#00ff00" },
  ]

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <label>Color:</label>
        <div className="color-palette">
          {colors.map((c) => (
            <button
              key={c.value}
              style={{ backgroundColor: c.value }}
              className={tool.color === c.value ? "active" : ""}
              onClick={() => onToolChange({ ...tool, color: c.value })}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <label>Width: {tool.width}px</label>
        <input
          type="range"
          min="1"
          max="20"
          value={tool.width}
          onChange={(e) => onToolChange({ ...tool, width: Number(e.target.value) })}
        />
      </div>

      <div className="toolbar-section">
        <button onClick={onClearCanvas}>🗑️ Clear</button>
      </div>
    </div>
  )
}

export default Toolbar