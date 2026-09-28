function onClick() {
  console.warn('click')
}

export function Button() {
  return (
    <div>
      <button onClick={onClick}>Click</button>
    </div>
  )
}
